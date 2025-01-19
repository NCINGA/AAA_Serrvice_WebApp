import React, { useRef, useState, useEffect } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Messages } from "primereact/messages";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "../Components/header/AppHeader";
import {
  CREATE_NAS,
  UPDATE_NAS,
  GET_NAS_ATTRIBUTE_GROUP,
} from "../graphql/queries";
import { useMutation, useLazyQuery } from "@apollo/client";

const ManageNAS = () => {
  const toast = useRef<Toast>(null);
  const messages = useRef<Messages>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    nasName: "",
    nasType: "",
    nasSecret: "",
    nasPort: "",
    attributeGroup: null,
  });

  const [attributeGroups, setAttributeGroups] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const nasData = location.state?.nasData;

  const [getNasAttributeGroup, { loading: loadingAttributeGroups }] =
    useLazyQuery(GET_NAS_ATTRIBUTE_GROUP, {
      onCompleted: (data) => {
        const dropdownOptions =
          data?.getNasAttributeGroup?.map((attributeGroup: any) => ({
            label: attributeGroup.name,
            value: attributeGroup.id,
          })) || [];
        setAttributeGroups(dropdownOptions);
      },
      onError: (error) => {
        console.error("Error fetching attribute groups:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load attribute groups.",
        });
      },
    });

  const [createNAS, { loading: creating }] = useMutation(CREATE_NAS, {
    onCompleted: () => {
      console.log("Create Sucess");
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "NAS created successfully!",
      });

      setTimeout(() => {
        navigate("/view-nas");
      }, 1000);
    },
    onError: (error) => {
      console.error("Error creating NAS:", error);
      setErrorMsg(error.message);
    },
  });

  const [updateNas, { loading: updating }] = useMutation(UPDATE_NAS, {
    onCompleted: () => {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "NAS updated successfully!",
      });
      setTimeout(() => {
        navigate("/view-nas");
      }, 1000);
    },
    onError: (error) => {
      console.error("Error updating NAS:", error);
      setErrorMsg(error.message);
    },
  });

  useEffect(() => {
    if (nasData) {
      setFormData({
        nasName: nasData.nas_name,
        nasType: nasData.nas_type,
        nasSecret: nasData.nas_secret,
        nasPort: nasData.coa_port,
        attributeGroup: nasData.nas_attrgroup,
      });
      setIsEditing(true);
    }
  }, [nasData]);

  useEffect(() => {
    getNasAttributeGroup();
  }, [getNasAttributeGroup]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "nasPort") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 4) return; // Prevent more than 4 digits
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDropdownChange = (e: any) => {
    setFormData({ ...formData, attributeGroup: e.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const variables = {
      nas_name: formData.nasName.trim(),
      nas_type: formData.nasType.trim(),
      nas_secret: formData.nasSecret.trim(),
      coa_port: parseInt(formData.nasPort, 10),
      nas_attrgroup: formData.attributeGroup,
    };

    if (
      !variables.nas_attrgroup ||
      !variables.nas_name ||
      !variables.nas_type ||
      !variables.nas_secret ||
      !variables.coa_port
    ) {
      setErrorMsg("Please fill out all fields.");
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill out all fields.",
      });
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (isEditing) {
      if (!nasData?.nas_id) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "NAS ID is missing.",
        });
        setErrorMsg("NAS ID is missing!");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }
      updateNas({ variables: { ...variables, nas_id: nasData.nas_id } });
    } else {
      createNAS({ variables });
    }
  };
  return (
    <React.Fragment>
      <div className="card justify-content-center w-full h-full">
        <Toast ref={toast} appendTo={"self"} />
        <ConfirmDialog />
        <AppHeader title={"Manage NAS"} />

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

            <div style={{ marginTop: "20px" }}>
              {errorMsg && (
                <div
                  style={{
                    color: "red",
                    marginBottom: "20px",
                    textAlign: "center",
                  }}
                >
                  {errorMsg}
                </div>
              )}
              <div className="p-field mb-4">
                <label htmlFor="nas_name">NAS Name</label>
                <InputText
                  id="nas_name"
                  name="nasName"
                  value={formData.nasName}
                  style={{ width: "100%" }}
                  onChange={handleInputChange}
                  placeholder="Enter NAS name"
                  className="w-full"
                />
              </div>

              <div className="p-field mb-4">
                <label htmlFor="nas_type">NAS Type</label>
                <InputText
                  id="nas_type"
                  name="nasType"
                  value={formData.nasType}
                  onChange={handleInputChange}
                  placeholder="Enter NAS Type"
                  className="w-full"
                />
              </div>

              <div className="p-field mb-4">
                <label htmlFor="nas_secret">Secret</label>
                <InputText
                  id="nas_secret"
                  name="nasSecret"
                  value={formData.nasSecret}
                  onChange={handleInputChange}
                  placeholder="Enter Secret"
                  className="w-full"
                />
              </div>

              <div className="p-field mb-4">
                <label htmlFor="coa_port">NAS Port</label>
                <InputText
                  type="number"
                  id="coa_port"
                  name="nasPort"
                  value={formData.nasPort}
                  onChange={handleInputChange}
                  placeholder="Enter Port"
                  className="w-full"
                />
              </div>

              <div className="p-field mb-4">
                <label htmlFor="attributeGroup">Attribute Group</label>
                {loadingAttributeGroups ? (
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <ProgressSpinner
                      style={{ width: "30px", height: "30px" }}
                      strokeWidth="2"
                      animationDuration=".5s"
                    />
                  </div>
                ) : (
                  <Dropdown
                    id="attributeGroup"
                    name="attributeGroup"
                    value={formData.attributeGroup}
                    options={attributeGroups}
                    onChange={handleDropdownChange}
                    placeholder="Select attribute group"
                    className="w-full"
                  />
                )}
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

            {/* Footer */}
            <div
              className="flex pt-4"
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
                    navigate("/view-nas", { replace: true });
                  }}
                />

                <Button
                  label={isEditing ? "Update NAS" : "Save"}
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

export default ManageNAS;
