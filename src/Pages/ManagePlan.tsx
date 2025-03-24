import React, { useRef, useState, useEffect } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  Stepper,
  StepperChangeEvent,
  StepperRefAttributes,
} from "primereact/stepper";
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
import {
  IPlanProfile,
  IParameterMapping,
  IPlan,
  IAttributeMapping,
  IPlanParameterAction,
  IPlanParameterPhase,
} from "../interface/data";
import ParameterDetails from "../Components/planComponents/PlanParameters";
import AttributeDetails from "../Components/planComponents/PlanAttributes";
import ParameterActionDetails from "../Components/planComponents/ParameterActions";
import ParameterPhaseDetails from "../Components/planComponents/ParameterPhases";

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
    selectedAttributes: initialAttributes,
    selectedParameterActions: initialParameterActions,
    selectedParameterPhases: initialParameterPhases,
  } = location.state || {};

  const [selectedParameterActions, setSelectedParameterActions] = useState<
    IPlanParameterAction[]
  >(initialParameterActions || []);

  const [selectedParameterPhases, setSelectedParameterPhases] = useState<
    IPlanParameterPhase[]
  >(initialParameterPhases || []);

  const [selectedProfiles, setSelectedProfiles] = useState(
    initialProfiles || []
  );
  const [selectedParameters, setSelectedParameters] = useState<
    IParameterMapping[]
  >(initialParameters || []);
  const [selectedAttributes, setSelectedAttributes] = useState<
    IAttributeMapping[]
  >(initialAttributes || []);

  // State for form fields
  const [formData, setFormData] = useState<IPlan>({
    planId: null,
    typeId: null,
    planName: "",
    description: "",
    planProfiles: [],
    planParameters: [],
    planAttributes: [],
    parameterActions: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeStep, setActiveStep] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState<number | null>(null);

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
      console.log(errorMsg);

      console.error("Error creating plan:", error);
      setErrorMsg(error.message);
    },
  });

  const [createPlanProfile] = useMutation(UPDATE_PLAN_PARAMETERS);
  const [createPlanParameter] = useMutation(UPDATE_PLAN_PARAMETERS);
  const [createPlanAttribute] = useMutation(UPDATE_PLAN_PARAMETERS);
  const [createPlanParameterAction] = useMutation(UPDATE_PLAN_PARAMETERS);
  const [createPlanParameterPhase] = useMutation(UPDATE_PLAN_PARAMETERS);

  const [updatePlan, { loading: updating }] = useMutation(UPDATE_PLANS, {
    onCompleted: () => {},
    onError: (error) => {
      console.error("Error updating plan:", error);
      setErrorMsg(error.message);
    },
  });

  // Load plan data into the form if editing

  // In ManagePlan.tsx:
  useEffect(() => {
    if (planData) {
      const updatedFormData = {
        planId: planData.planId,
        type: planData.typeId,
        planName: planData.planName,
        description: planData.description,
        planProfiles: selectedProfiles,
        planParameters: selectedParameters,
        planAttributes: selectedAttributes,
        planParameterActions: selectedParameterActions,
        planParameterPhases: selectedParameterPhases,
      };

      setFormData(updatedFormData);
      setPlanId(planData.planId);
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

  const handleSaveBasicDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const variables = {
      typeId: formData.type,
      planName: formData.planName ? formData.planName.trim() : "",
      description: formData.description ? formData.description.trim() : "",
    };

    if (!variables.typeId || !variables.planName || !variables.description) {
      setErrorMsg("All fields are required.");
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill in all required fields.",
      });
      return;
    }

    try {
      if (isEditing) {
        await updatePlan({
          variables: { planId: formData.planId, ...variables },
        });
      } else {
        const { data: createdPlan } = await createPlan({ variables });
        const createdPlanId = createdPlan?.createPlan?.planId;
        if (!createdPlanId) throw new Error("Failed to create the plan.");

        setFormData((prevState) => ({ ...prevState, planId: createdPlanId }));
        localStorage.setItem("planId", createdPlanId);
      }

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: isEditing
          ? "Plan details updated successfully!"
          : "Plan created successfully! Proceed to add profiles.",
      });

      setStep(2);
    } catch (error) {
      console.error("Error creating/updating plan:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleSaveProfile = async () => {
    console.log(planId);

    const storedPlanId = formData.planId;
    if (!storedPlanId) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Plan ID is missing.",
      });
      return;
    }

    if (!formData.planProfiles || formData.planProfiles.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Please select at least one profile.",
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

      await createPlanProfile({ variables: data });

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Profiles updated successfully!",
      });

      setStep(3);
    } catch (error) {
      console.error("Error updating profiles:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleSaveParameters = async () => {
    const storedPlanId = formData.planId;
    if (!storedPlanId) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Plan ID is missing.",
      });
      return;
    }

    if (!selectedParameters || selectedParameters.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Please add at least one parameter.",
      });
      return;
    }

    // Check for null values in parameters
    const hasNullValues = selectedParameters.some(
      (param) =>
        !param.parameter ||
        param.value === null ||
        param.value === undefined ||
        param.value === ""
    );

    if (hasNullValues) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Parameters cannot contain empty values.",
      });
      return;
    }

    try {
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

      await createPlanParameter({ variables: data });

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Parameters updated successfully!",
      });

      setStep(4);
    } catch (error) {
      console.error("Error updating parameters:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleSaveAttributes = async () => {
    const storedPlanId = formData.planId;
    if (!storedPlanId) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Plan ID is missing.",
      });
      return;
    }

    // Validation check for attributes
    if (!selectedAttributes || selectedAttributes.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Please add at least one attribute.",
      });
      return;
    }

    // Check for null values in attributes
    const hasNullValues = selectedAttributes.some(
      (attr) =>
        !attr.attribute ||
        attr.value === null ||
        attr.value === undefined ||
        attr.value === ""
    );

    if (hasNullValues) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Attributes cannot contain empty values.",
      });
      return;
    }

    try {
      const planAttribute = {
        planId: storedPlanId,
        attributes: selectedAttributes.map((attribute) => ({
          attributeName: attribute.attribute,
          attributeValue: attribute.value,
        })),
      };

      const data = {
        planId: storedPlanId,
        plan: { planAttribute: [planAttribute] },
      };

      await createPlanAttribute({ variables: data });

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Attributes updated successfully!",
      });
    } catch (error) {
      console.error("Error updating attributes:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleSaveParameterActions = async () => {
    const storedPlanId = formData.planId;
    if (!storedPlanId) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Plan ID is missing.",
      });
      return;
    }

    // Validation check for parameter actions
    if (!selectedParameterActions || selectedParameterActions.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Please add at least one parameter action.",
      });
      return;
    }

    // Check for null values in parameter actions
    const hasNullValues = selectedParameterActions.some(
      (action) =>
        !action.actionId ||
        !action.parameterName ||
        !action.actionPhase ||
        !action.entity ||
        action.actionSequence === null ||
        action.actionSequence === undefined
    );

    if (hasNullValues) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Parameter actions cannot contain empty values.",
      });
      return;
    }

    try {
      const variables = {
        planId: storedPlanId,
        plan: {
          planParameterAction: [
            {
              planId: storedPlanId,
              parameterActions: selectedParameterActions.map((action) => ({
                actionId: action.actionId,
                actionPhase: action.actionPhase,
                parameterName: action.parameterName,
                actionSequence: action.actionSequence,
                matchReturn: Number(action.matchReturn) || 0,
                entity: action.entity,
              })),
            },
          ],
        },
      };

      await createPlanParameterAction({ variables });

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Parameter actions updated successfully!",
      });

      // Navigate to view plans after saving the last step
      setTimeout(() => {
        navigate("/view-plans");
      }, 1000);
    } catch (error) {
      console.error("Error updating parameter actions:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleSaveParameterPhases = async () => {
    const storedPlanId = formData.planId;
    if (!storedPlanId) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Plan ID is missing.",
      });
      return;
    }

    // Validation check for parameter phases
    if (!selectedParameterPhases || selectedParameterPhases.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Please add at least one parameter phase.",
      });
      return;
    }

    // Check for null values in parameter phases
    const hasNullValues = selectedParameterPhases.some(
      (phase) =>
        !phase.parameterName ||
        !phase.phase ||
        !phase.status ||
        !phase.entityState ||
        !phase.entity
    );

    if (hasNullValues) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Parameter phases cannot contain empty values.",
      });
      return;
    }

    try {
      const variables = {
        planId: storedPlanId,
        plan: {
          planParameterPhase: [
            {
              planId: storedPlanId,
              parameterPhases: selectedParameterPhases.map((phase) => ({
                parameterName: phase.parameterName,
                phase: phase.phase,
                status: phase.status,
                entityState: phase.entityState,
                entity: phase.entity,
              })),
            },
          ],
        },
      };

      await createPlanParameterPhase({ variables });

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Parameter phases updated successfully!",
      });

      setStep(5);
    } catch (error) {
      console.error("Error updating parameter phases:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleNext = () => {
    if (stepperRef.current) {
      const nextIndex = activeIndex + 1;
      if (nextIndex <= 5) {
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
        >
          <div style={{ width: "80%" }}>
            <Messages ref={messages} />
            <Stepper
              ref={stepperRef}
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

              <StepperPanel header="Attribute Details">
                <AttributeDetails
                  selectedAttributes={selectedAttributes}
                  setSelectedAttributes={setSelectedAttributes}
                />
              </StepperPanel>
              <StepperPanel header="Parameter Phases">
                <ParameterPhaseDetails
                  selectedParameterPhases={selectedParameterPhases}
                  setSelectedParameterPhases={setSelectedParameterPhases}
                />
              </StepperPanel>
              <StepperPanel header="Parameter Actions">
                <ParameterActionDetails
                  selectedParameterActions={selectedParameterActions}
                  setSelectedParameterActions={setSelectedParameterActions}
                />
              </StepperPanel>
            </Stepper>
          </div>
        </div>

        <div
          className="flex pt-4 "
          style={{
            marginTop: "20px",
            width: "100%",
            height: 80,
            backdropFilter: "blur(10px)",
            background:
              "linear-gradient(139deg, rgba(255,255,255,1) 12%, rgba(175,223,255,0.1) 90%)",
            display: "flex",
            borderTop: "solid 1px #8dd1ff",
            justifyContent: "flex-start",
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
            <p style={{ fontSize: 12, color: "gray", fontFamily: "ubuntu" }}>
              3A Web console | Copyright 2025
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
                  ? "Save "
                  : step === 2
                  ? "Save "
                  : step === 3
                  ? "Save "
                  : "Save "
              }
              severity="secondary"
              icon="pi pi-save"
              onClick={() => {
                const currentStep = stepperRef.current?.getActiveStep();

                if (currentStep === 0) {
                  handleSaveBasicDetails();
                } else if (currentStep === 1) {
                  handleSaveProfile();
                } else if (currentStep === 2) {
                  handleSaveParameters();
                } else if (currentStep === 3) {
                  handleSaveAttributes();
                } else if (currentStep === 4) {
                  handleSaveParameterPhases();
                } else if (currentStep === 5) {
                  handleSaveParameterActions();
                }
              }}
              disabled={creating || updating}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ManagePlan;
