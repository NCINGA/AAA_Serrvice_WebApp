import React, { useRef, useState, useEffect } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Stepper, StepperChangeEvent, StepperRefAttributes } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Messages } from "primereact/messages";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "../Components/header/AppHeader";
import {
  CREATE_PLANS,
  UPDATE_PLANS,
  GET_PLAN_TYPES,
  UPDATE_PLAN_PARAMETERS,
} from "../graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import PlanProfile from "../Components/planComponents/PlanProfile";
import { IPlanProfile, IParameterMapping, IPlan } from "../interface/data";
import ParameterDetails from "../Components/planComponents/PlanParameters";




const ManagePlan = () => {
  // Refs for components
  const toast = useRef<Toast | null>(null);
  const messages = useRef(null);
  const stepperRef = useRef<StepperRefAttributes | null>(null);
  

  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const {
    planData,
    selectedProfiles: initialProfiles,
    selectedParameters: initialParameters,
  } = location.state || {};
  const [selectedProfiles, setSelectedProfiles] = useState(
    initialProfiles || []
  );
  const [selectedParameters, setSelectedParameters] = useState<
    IParameterMapping[]
  >(initialParameters || []);

  // State for form fields
  const [formData, setFormData] = useState<IPlan>({
    planId: null,
    typeId: null,
    planName: "",
    description: "",
    planProfiles: [],
    planParameters: [],
  });

  useEffect(() => {}, [formData]);

  const [isEditing, setIsEditing] = useState(false);
  const [activeStep, setActiveStep] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState<number | null>(null);

  // const planData = location.state?.

  // GraphQL Queries
  const {
    data: planTypesData,
    loading: planTypesLoading,
    error: planTypesError,
  } = useQuery(GET_PLAN_TYPES);

  // GraphQL Mutations
  const [createPlan, { loading: creating }] = useMutation(CREATE_PLANS, {
    onCompleted: () => {
      // toast.current.show({
      //   severity: "success",
      //   summary: "Success",
      //   detail: "Plan created successfully!",
      // });
      // navigate("/view-plans");
    },
    onError: (error) => {
      console.error("Error creating plan:", error);
      setErrorMsg(error.message);
    },
  });

  const [createPlanProfile] = useMutation(UPDATE_PLAN_PARAMETERS);

  const [createPlanParameter] = useMutation(UPDATE_PLAN_PARAMETERS);

  const [updatePlan, { loading: updating }] = useMutation(UPDATE_PLANS, {
    onCompleted: () => {},
    onError: (error) => {
      console.error("Error updating plan:", error);
      setErrorMsg(error.message);
    },
  });

  // Load plan data into the form if editing
  useEffect(() => {
    if (planData) {
      const updatedFormData = {
        planId: planData.planId,
        type: planData.typeId,
        planName: planData.planName,
        description: planData.description,
        planProfiles: selectedProfiles,
        planParameters: selectedParameters,
      };

      setFormData(updatedFormData);
      console.log("Existing FormData:", updatedFormData);

      setPlanId(planData.planId);
      console.log(planId);
      
      setIsEditing(true);
    }
  }, [planData]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDropdownChange = (e: any) => {
    setFormData({ ...formData, type: e.value });
  };

  const handleStepper = (event: StepperChangeEvent) => {
    console.log("event 001");
    if (event.index === 1) {
      // const planId = localStorage.getItem("planId") ?? "";

      // const profileMapping: IPlan = {
      //   planId: Number.parseInt(planId),
      //   planProfiles: selectedProfiles.map((profile: any) => ({
      //     profileId: profile.profileId,
      //     status: profile.state,
      //   })),
      // };
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (step === 1) {
      const variables = {
        typeId: formData.type,
        planName: formData.planName ? formData.planName.trim() : "",
        description: formData.description ? formData.description.trim() : "",
      };

      if (!variables.typeId) {
        setErrorMsg("Please select a type.");
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Type is required.",
        });
        return;
    }
    

      try {
        if (isEditing) {
          await updatePlan({
            variables: { planId: planData.planId, ...variables },
          });
        } else {
          const { data: createdPlan } = await createPlan({ variables });
          const createdPlanId = createdPlan?.createPlan?.planId;

          if (!createdPlanId) throw new Error("Failed to create the plan.");

          setFormData((prevState) => ({
            ...prevState,
            planId: createdPlanId,
          }));

          localStorage.setItem("planId", createdPlanId);
        }

        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: isEditing
            ? "Plan updated successfully! Proceed to update profiles"
            : "Plan created successfully! Proceed to add profiles",
        });

        setStep(2);

      } catch (error) {
        console.error("Error creating/updating plan:", error);
      
        if (error instanceof Error) {
          setErrorMsg(error.message);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
        } else {
          setErrorMsg("An unknown error occurred.");
        }
      
        
      }
      
    } else if (step === 2) {
      const storedPlanId = formData.planId;

      if (!storedPlanId) {
        setErrorMsg("Plan ID not found. Please complete the first step.");
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Plan ID is missing.",
        });
        return;
      }

      try {
        const profileMapping = {
          planId: storedPlanId,
          profiles: formData.planProfiles?.map((profile: any) => ({
            profileId: profile.profileId,
            status: profile.state,
          })),
        };

        const data = {
          planId: storedPlanId,
          plan: { planProfile: [profileMapping] },
        };

        if (isEditing) {
          await createPlanProfile({ variables: data });
        } else {
          await createPlanProfile({ variables: data });
        }

        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail:
            "Plan profile created/updated successfully! Proceed to add parameter details",
        });
        setStep(3);
      } catch (error) {
        console.error("Error creating/updating plan profile:", error);
      
        if (error instanceof Error) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "An unknown error occurred.",
          });
        }
      }
      
    } else if (step === 3) {
      const storedPlanId = formData.planId;

      const planParameter = {
        planId: storedPlanId,
        parameters: selectedParameters.map((parameter) => ({
          parameterName: parameter.parameter,
          parameterValue: parameter.value,
        })),
      };

      const data = {
        planId: storedPlanId,
        plan: { planParameter: [planParameter] },
      };

      setFormData((prevState) => {
        const updatedFormData = {
          ...prevState,
          planParameters: [planParameter],
        };
        console.log("Updated formData: ", updatedFormData);
        return updatedFormData;
      });

      try {
        if (isEditing) {
          console.log("Data", data);

          await createPlanParameter({ variables: data });
        } else {
          await createPlanParameter({ variables: data });
        }

        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Plan parameters created/updated successfully!",
        });

        setTimeout(() => {
          navigate("/view-plans");
        }, 1000);
      } catch (error) {
        console.error("Error creating/updating plan parameters:", error);
      
        if (error instanceof Error) {
          
          setErrorMsg(errorMsg);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
        } else {
          
          setErrorMsg("An unknown error occurred.");
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "An unknown error occurred.",
          });
        }
      }
      
    }
  };

  const handleNext = () => {
    if (stepperRef.current) {
      const nextIndex = activeIndex + 1;
      if (nextIndex <= 2) {
        // Assuming 3 steps (0, 1, 2)
        setActiveIndex(nextIndex);
        stepperRef.current.nextCallback();
      }
    }
  };

  // Check if plan types are still loading or there was an error fetching
  if (planTypesLoading) return <ProgressSpinner />;
  if (planTypesError) {
    if (toast.current) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error fetching plan types.",
      });
    }
    return null;
  }

  const planTypes = planTypesData?.getPlanTypes || [];

  const assignedProfiles = (profiles: IPlanProfile[]) => {
    let { planProfiles } = formData;
    planProfiles = profiles;
    setFormData({ ...formData, planProfiles });
  };

  return (
    <React.Fragment>
      <div className="card justify-content-center w-full h-full">
        <Toast ref={toast} appendTo={"self"} />
        <ConfirmDialog />
        <AppHeader title={"Manage Plan"} />

        <div
          style={{
            marginTop: 150,
            top: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            height: "100%",
            left: 0,
            right: 0,
          }}
          className={"absolute"}
        >
          <div style={{ width: "80%" }}>
            <Messages ref={messages} />
            <Stepper
              ref={stepperRef}
              // activeIndex={activeIndex}
              onChangeStep={(e) => {
                setActiveIndex(e.index);
                handleStepper(e);
              }}
            >
              <StepperPanel header="Basic Details">
                <div style={{ marginTop: "20px" }}>
                  <div className="p-field mb-4">
                    <label htmlFor="type">Type Name</label>
                    <Dropdown
                      id="type"
                      name="type"
                      value={formData.type}
                      options={planTypes.map((type: any) => ({
                        label: type.typeName,
                        value: type.typeId,
                      }))}
                      onChange={handleDropdownChange}
                      placeholder="Select type"
                      className="w-full"
                    />
                  </div>

                  <div className="p-field mb-4">
                    <label htmlFor="planName">Plan Name</label>
                    <InputText
                      id="planName"
                      name="planName"
                      value={formData.planName}
                      onChange={handleInputChange}
                      placeholder="Enter plan name"
                      className="w-full"
                    />
                  </div>

                  <div className="p-field mb-4">
                    <label htmlFor="description">Description</label>
                    <InputTextarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter description"
                      rows={1}
                      className="w-full"
                    />
                  </div>

                  {(creating || updating) && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                      <ProgressSpinner
                        style={{ width: "50px", height: "50px" }}
                        strokeWidth="2"
                        animationDuration=".5s"
                      />
                    </div>
                  )}
                </div>
              </StepperPanel>

              <StepperPanel header="Profile Details">
                <PlanProfile
                  fetchProfilesStatus={formData}
                  onSelectedProfiles={assignedProfiles}
                  selectedProfiles={selectedProfiles}
                  setSelectedProfiles={setSelectedProfiles}
                />
              </StepperPanel>

              <StepperPanel header="Parameter Details">
                <ParameterDetails
                  selectedParameters={selectedParameters}
                  setSelectedParameters={setSelectedParameters}
                />
              </StepperPanel>
            </Stepper>

            {/* Buttons */}
            <div
              className="flex pt-4 "
              style={{
                bottom: 0,
                left: 0,
                right: 0,
                position: "fixed",
                width: "100%",
                height: 80,
                backdropFilter: "blur(10px)",
                background:
                  "linear-gradient(139deg, rgba(255,255,255,1) 12%, rgba(175,223,255,0.1) 90%)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                borderTop: "solid 1px #8dd1ff",
                justifyContent: "space-between",
              }}
            >
              {/* Left Section */}
              <div
                style={{
                  width: "100%",
                  gap: "10px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "80px",
                  justifyContent: "start",
                  paddingBottom: "20px",
                }}
              >
                <p
                  style={{ fontSize: 12, color: "gray", fontFamily: "ubuntu" }}
                >
                  3A Web console | Copyright 2024
                </p>
              </div>

              {/* Right Section with Buttons */}
              <div
                style={{
                  alignItems: "center",
                  width: "100%",
                  gap: "10px",
                  display: "flex",
                  paddingRight: "80px",
                  paddingBottom: "20px",
                  justifyContent: "end",
                }}
              >
                <Button
                  label="Back"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => {
                    setActiveStep(true);
                    if (stepperRef.current?.getActiveStep() === 0) {
                      console.log(activeStep);
                      
                      navigate("/view-plans", { replace: true });
                    } else {
                      stepperRef.current?.prevCallback();
                    }
                  }}
                />

                <Button
                  label="Next"
                  icon="pi pi-arrow-right"
                  severity="secondary"
                  iconPos="right"
                  onClick={handleNext}
                />

                <Button
                  label={
                    step === 1
                      ? "Save Plan"
                      : step === 2
                      ? "Save Profile"
                      : "Save Parameters"
                  }
                  severity="secondary"
                  icon="pi pi-save"
                  onClick={handleSubmit}
                  disabled={creating || updating}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ManagePlan;
