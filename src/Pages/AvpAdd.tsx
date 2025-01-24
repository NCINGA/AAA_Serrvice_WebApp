import React, { FC, useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import "primereact/resources/themes/saga-blue/theme.css"; // Theme for styling
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { GET_STATE, CREATE_AVP_PROFILE, UPDATE_AVP_PROFILE } from "../graphql/queries";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
// import {IAVP} from "../interface/data.ts";

type Props = {
    profileId?: number;
    onAdd?: (avp: any) => void;
    onEdit?: (avp: any) => void;
    editingAvp?: {
        id: number;
        avpName: string;
        avpValue: string;
        overrideEnabled: number;
        status: string;
        includeWhen: string;
    } | null;
    onEditComplete?: (avp: any) => void;
};

const AvpAdd: FC<Props> = ({ profileId, onAdd, editingAvp, onEditComplete }) => {
    const [visible, setVisible] = useState(false);
    const [types, setTypes] = useState<{ label: string; value: string }[]>([]);
    const navigate = useNavigate();
    // const [] = useLocation();
    //  const profileData = location.state?.profileData || null;
    const [isEditing, setIsEditing] = useState(false);
    const toast = useRef<any>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [creating] = useState(false);
    const [formData, setFormData] = useState({
        avpName: "",
        avpValue: "",
        overrideEnabled: 0,
        status: "",
        includeWhen: "",
    });

    // Mutation to create a profile
    const [createAvpProfile] = useMutation(CREATE_AVP_PROFILE, {
        onCompleted: () => {
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Profile created successfully!",
            });
            setVisible(false);
        },
        onError: (error) => {
            console.error("Error creating profile:", error);
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            setErrorMsg(message);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: `Failed to create profile: ${message}`,
            });
        },
    });

    const [updateAvpProfile, { loading: updating }] = useMutation(UPDATE_AVP_PROFILE, {
        onCompleted: () => {
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Profile updated successfully!",
            });
            navigate("/view-profileManagement");
        },
        onError: (error) => {
            console.error("Error updating profile:", error);
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            setErrorMsg(message);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: `Failed to update profile: ${message}`,
            });
        },
    });

    console.log(errorMsg)

    useEffect(() => {
        if (editingAvp) {
            setFormData({
                avpName: editingAvp.avpName || "",
                avpValue: editingAvp.avpValue || "",
                overrideEnabled: editingAvp.overrideEnabled ? 1 : 0,
                status: editingAvp.status || "",
                includeWhen: editingAvp.includeWhen || "",
            });
            setVisible(true); // Open the dialog when editing
            setIsEditing(true); // Mark as editing
        } else {
            setIsEditing(false); // Mark as creating
        }
    }, [editingAvp]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { avpName, avpValue, overrideEnabled, status, includeWhen } = formData;

        try {
            if (isEditing) {
                // Update profile
                const { data } = await updateAvpProfile({
                    variables: {
                        id: editingAvp?.id ?? 0, // Ensure editingAvp has a valid ID
                        avpName,
                        avpValue,
                        overrideEnabled,
                        status,
                        includeWhen,
                    },
                });
                onEditComplete?.(data.updateAvpProfile.profile); // Pass updated profile back
            } else {
                // Create new profile
                const { data } = await createAvpProfile({
                    variables: { profileId, avpName, avpValue, overrideEnabled, status, includeWhen },
                });
                onAdd?.(data.createAvpProfile.profile); // Pass new profile back
            }
            setVisible(false);
        } catch (error) {
            console.error("Error saving profile:", error);
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: `Failed to save profile: ${message}`,
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (e: { value: string }) => {
        setFormData((prev) => ({ ...prev, includeWhen: e.value }));
    };

    const handleToggleChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, overrideEnabled: checked ? 1 : 0 }));
    };

    const handleStatusChange = (checked: boolean) =>
        setFormData((prev) => ({
            ...prev,
            status: checked ? "ACTIVE" : "INACTIVE",
        }));

    const [getState] = useLazyQuery(GET_STATE, {
        onCompleted: (data) => {
            const dropdownOptions =
                data?.getState?.map((state: { state: string }) => ({
                    label: state.state,
                    value: state.state,
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

    useEffect(() => {
        getState();
    }, [getState]);

    const showDialog = () => {
        setFormData({
            avpName: "",
            avpValue: "",
            overrideEnabled: 0,
            status: "",
            includeWhen: "",
        }); // Reset form data
        setIsEditing(false); // Ensure we are in "Add" mode
        setVisible(true); // Show the dialog
    };
    const hideDialog = () => setVisible(false);

    return (
        <div>
            <Button
                label="Add Avp"
                icon="pi pi-plus"
                className="p-button-rounded p-button-info"
                onClick={showDialog}
            />

            <Dialog
                header={<h4 style={{ margin: 0 }}>Add Avp Details</h4>}
                visible={visible}
                style={{ width: "30vw", borderRadius: "12px" }}
                onHide={hideDialog}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-fluid p-grid p-mt-3 p-px-2">
                        {/* AVP Name */}
                        <div className="p-field p-col-12">
                            <label htmlFor="avpName">AVP Name</label>
                            <InputText
                                id="avpName"
                                name="avpName"
                                value={formData.avpName}
                                onChange={handleInputChange}
                                placeholder="Enter AVP Name"
                            />
                        </div>

                        {/* AVP Value */}
                        <div className="p-field p-col-12">
                            <label htmlFor="avpValue">AVP Value</label>
                            <InputText
                                id="avpValue"
                                name="avpValue"
                                value={formData.avpValue}
                                onChange={handleInputChange}
                                placeholder="Enter AVP Value"
                            />
                        </div>

                        {/* Include When */}
                        <div className="p-field p-col-12">
                            <label htmlFor="includeWhen">Include When</label>
                            <Dropdown
                                id="includeWhen"
                                value={formData.includeWhen}
                                options={types}
                                onChange={handleDropdownChange}
                                placeholder="Select an Option"
                            />
                        </div>

                        {/* Status */}
                        <div className="field">
                            <label htmlFor="status" className="font-medium mb-2 block">
                                Status
                            </label>
                            <div className="flex items-center gap-4">
                                <InputText
                                    value={formData.status === "ACTIVE" ? "Active" : "Inactive"}
                                    readOnly
                                    className="w-full bg-gray-50"
                                />
                                <InputSwitch
                                    id="status"
                                    checked={formData.status === "ACTIVE"}
                                    onChange={(e) => handleStatusChange(e.value)}
                                    className="ml-2"
                                />
                            </div>
                        </div>

                        {/* Override Enabled */}
                        <div className="field">
                            <label htmlFor="overrideEnabled" className="font-medium mb-2 block">
                                Override Enabled
                            </label>
                            <div className="flex items-center gap-4">
                                <InputText
                                    value={formData.overrideEnabled === 1 ? "Enabled" : "Disabled"}
                                    readOnly
                                    className="w-full bg-gray-50"
                                />
                                <InputSwitch
                                    id="overrideEnabled"
                                    checked={formData.overrideEnabled === 1}
                                    onChange={(e) => handleToggleChange(e.value)}
                                    className="ml-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-d-flex p-jc-end p-mt-4">
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-text p-mr-2"
                            onClick={hideDialog}
                        />
                        <Button
                            label={isEditing ? "Update Profile" : "Save"}
                            icon="pi pi-check"
                            type="submit"
                            className="p-button-success"
                            onClick={handleSubmit}
                            disabled={creating || updating}
                        />
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default AvpAdd;
