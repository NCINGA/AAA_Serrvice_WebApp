import  { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useLazyQuery, useMutation } from "@apollo/client";
import {CREATE_PROFILE, GET_NAS_ATTRIBUTE_GROUP, UPDATE_PROFILE} from "../graphql/queries";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';


const ManageProfile = () => {
    const toast = useRef<Toast>(null); // Correct way to initialize

    const navigate = useNavigate();
    const location = useLocation()

    const [formData, setFormData] = useState({
        profileKey: "",
        description: "",
        attributeGroup: null,
    });

    const [types, setTypes] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [creating, setCreating] = useState(false);
    const profileData = location.state?.profileData;
    const [isEditing, setIsEditing] = useState(false);

    console.log(errorMsg)

    const [getNasGroup] = useLazyQuery(GET_NAS_ATTRIBUTE_GROUP, {
        onCompleted: (data) => {
            const dropdownOptions =
                data?.getNasAttributeGroup?.map((type :any) => ({
                    label: type.name,
                    value: type.id,
                })) || [];
            setTypes(dropdownOptions);
        },
        onError: (error) => {
            console.error("Error fetching types:", error);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to load types.",
            });
        },
    });

    const [createProfile] = useMutation(CREATE_PROFILE, {
        onCompleted: () => {
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Profile created successfully!",
            });
            navigate("/view-profileManagement");
        },
        onError: (error) => {
            console.error("Error creating profile:", error);
            setErrorMsg(error.message);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: `Failed to create profile: ${error.message}`,
            });
        },
    });

    const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE, {
        onCompleted: () => {
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Plan updated successfully!",
            });
            navigate("/view-profileManagement");
        },
        onError: (error) => {
            console.error("Error updating profile:", error);
            setErrorMsg(error.message);
        },
    });

    useEffect(() => {
        if (profileData) {
            setFormData({
                attributeGroup: profileData.attributeGroup,
                profileKey: profileData.profileKey,
                description: profileData.description,
            });
            setIsEditing(true);
        }
    }, [profileData]);

    useEffect(() => {
        getNasGroup();
    }, [getNasGroup]);

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDropdownChange = (e: { value: any; }) => {
        setFormData({ ...formData, attributeGroup: e.value });
    };

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        const variables = {
            attributeGroup: parseInt(formData.attributeGroup || "0", 10),
            profileKey: formData.profileKey.trim(),
            description: formData.description.trim(),
        };

        if (!formData.attributeGroup) {
            setErrorMsg("Please select a type.");
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Type is required.",
            });
            return;
        }

        if (!formData.profileKey.trim() || !formData.description.trim()) {
            setErrorMsg("Please fill in all fields.");
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "All fields are required.",
            });
            return;
        }

        if (isEditing) {
            if (!profileData?.profileId) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Profile ID is missing.",
                });
                return;
            }
            updateProfile({ variables: { ...variables, profileId: profileData.profileId } });
        } else {
            setCreating(true);
            createProfile({ variables })
                .finally(() => {
                    setCreating(false);
                });
        }
    };

    return (
        <div>
            <div className="p-m-4" style={{ marginBottom: "100px" }}>
                <h2>Manage Profile</h2>
                <Toast ref={toast} />
                <div className="p-fluid p-formgrid p-grid">
                    <div className="p-field p-col-12 p-md-6">
                        <label htmlFor="profileKey">Plan Name</label>
                        <InputText
                            id="profileKey"
                            name="profileKey"
                            value={formData.profileKey}
                            onChange={handleInputChange}
                            placeholder="Enter Plan Name"
                        />
                    </div>

                    <div className="p-field p-col-12">
                        <label htmlFor="description">Description</label>
                        <InputTextarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter Description"
                            rows={5}
                            cols={30}
                        />
                    </div>

                    <div className="p-field p-col-12 p-md-6">
                        <label htmlFor="attributeGroup">NAS Attribute Group</label>
                        <Dropdown
                            id="attributeGroup"
                            name="attributeGroup"
                            value={formData.attributeGroup}
                            options={types}
                            onChange={handleDropdownChange}
                            placeholder="Select type"
                            className="w-full"
                        />
                    </div>
                </div>
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
                    background: "linear-gradient(139deg, rgba(255,255,255,1) 12%, rgba(175,223,255,0.1) 90%)",
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
                    <p style={{ fontSize: 12, color: "gray", fontFamily: "ubuntu" }}>
                        3A Web console | Copyright 2024
                    </p>
                </div>

                {/* Right Section with Button */}
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
                        label={isEditing ? "Update Profile" : "Save"}
                        severity="secondary"
                        icon="pi pi-save"
                        onClick={handleSubmit}
                        disabled={creating || updating}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManageProfile;