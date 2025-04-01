import React, { FC, useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { GET_STATE, CREATE_AVP_PROFILE, UPDATE_AVP_PROFILE } from "../graphql/queries";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

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

interface FormErrors {
    avpName?: string;
    avpValue?: string;
    includeWhen?: string;
}

const AvpAdd: FC<Props> = ({ profileId, onAdd, editingAvp, onEditComplete }) => {
    const [visible, setVisible] = useState(false);
    const [types, setTypes] = useState<{ label: string; value: string }[]>([]);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const toast = useRef<Toast>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [creating] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState({
        avpName: "",
        avpValue: "",
        overrideEnabled: 0,
        status: "INACTIVE",
        includeWhen: "",
    });

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
            console.log(errorMsg);
            
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

    const validateField = (name: string, value: string) => {
        let error = "";
        switch (name) {
            case "avpName":
                if (!value.trim()) {
                    error = "AVP Name is required";
                } else if (value.length < 2) {
                    error = "AVP Name must be at least 2 characters";
                }
                break;
            case "avpValue":
                if (!value.trim()) {
                    error = "AVP Value is required";
                }
                break;
            case "includeWhen":
                if (!value) {
                    error = "Include When is required";
                }
                break;
            default:
                break;
        }
        return error;
    };

    const validateForm = () => {
        const errors: FormErrors = {};
        Object.keys(formData).forEach((key) => {
            if (key === "avpName" || key === "avpValue" || key === "includeWhen") {
                const error = validateField(key, String(formData[key as keyof typeof formData]));
                if (error) {
                    errors[key as keyof FormErrors] = error;
                }
            }
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        if (editingAvp) {
            setFormData({
                avpName: editingAvp.avpName || "",
                avpValue: editingAvp.avpValue || "",
                overrideEnabled: editingAvp.overrideEnabled ? 1 : 0,
                status: editingAvp.status || "",
                includeWhen: editingAvp.includeWhen || "",
            });
            setVisible(true);
            setIsEditing(true);
        } else {
            setIsEditing(false);
        }
    }, [editingAvp]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => ({
            ...acc,
            [key]: true
        }), {});
        setTouched(allTouched);

        if (!validateForm()) {
            toast.current?.show({
                severity: "error",
                summary: "Validation Error",
                detail: "Please check all required fields",
            });
            return;
        }

        try {
            if (isEditing) {
                const { data } = await updateAvpProfile({
                    variables: {
                        id: editingAvp?.id ?? 0,
                        ...formData,
                    },
                });
                onEditComplete?.(data.updateAvpProfile.profile);
            } else {
                const { data } = await createAvpProfile({
                    variables: { profileId, ...formData },
                });
                onAdd?.(data.createAvpProfile.profile);
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
        
        // Mark field as touched
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate the field
        const error = validateField(name, value);
        setFormErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleDropdownChange = (e: { value: string }) => {
        setFormData((prev) => ({ ...prev, includeWhen: e.value }));
        setTouched(prev => ({ ...prev, includeWhen: true }));
        const error = validateField("includeWhen", e.value);
        setFormErrors(prev => ({
            ...prev,
            includeWhen: error
        }));
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
            status: "INACTIVE", 
            includeWhen: "",
        });
        setFormErrors({});
        setTouched({});
        setIsEditing(false);
        setVisible(true);
    };
    

    const hideDialog = () => {
        setVisible(false);
        setFormErrors({});
        setTouched({});
    };

    return (
        <div>
            <Toast ref={toast} />
            <Button
                label="Add Avp"
                icon="pi pi-plus"
                className="p-button-rounded p-button-info"
                onClick={showDialog}
            />

            <Dialog
                header={<h4 style={{ margin: 0 }}>{isEditing ? "Edit" : "Add"} Avp Details</h4>}
                visible={visible}
                style={{ width: "30vw", borderRadius: "12px" }}
                onHide={hideDialog}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-fluid p-grid p-mt-3 p-px-2">
                        {/* AVP Name */}
                        <div className="p-field p-col-12 mb-4">
                            <label htmlFor="avpName">AVP Name *</label>
                            <InputText
                                id="avpName"
                                name="avpName"
                                value={formData.avpName}
                                onChange={handleInputChange}
                                placeholder="Enter AVP Name"
                                className={touched.avpName && formErrors.avpName ? "p-invalid" : ""}
                            />
                            {touched.avpName && formErrors.avpName && (
                                <small className="p-error block">{formErrors.avpName}</small>
                            )}
                        </div>

                        {/* AVP Value */}
                        <div className="p-field p-col-12 mb-4">
                            <label htmlFor="avpValue">AVP Value *</label>
                            <InputText
                                id="avpValue"
                                name="avpValue"
                                value={formData.avpValue}
                                onChange={handleInputChange}
                                placeholder="Enter AVP Value"
                                className={touched.avpValue && formErrors.avpValue ? "p-invalid" : ""}
                            />
                            {touched.avpValue && formErrors.avpValue && (
                                <small className="p-error block">{formErrors.avpValue}</small>
                            )}
                        </div>

                        {/* Include When */}
                        <div className="p-field p-col-12 mb-4">
                            <label htmlFor="includeWhen">Include When *</label>
                            <Dropdown
                                id="includeWhen"
                                value={formData.includeWhen}
                                options={types}
                                onChange={handleDropdownChange}
                                placeholder="Select an Option"
                                className={touched.includeWhen && formErrors.includeWhen ? "p-invalid" : ""}
                            />
                            {touched.includeWhen && formErrors.includeWhen && (
                                <small className="p-error block">{formErrors.includeWhen}</small>
                            )}
                        </div>

                        {/* Status */}
                        <div className="field mb-4">
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
                        <div className="field mb-4">
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

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={hideDialog}
                            type="button"
                        />
                        <Button
                            label={isEditing ? "Update Profile" : "Save"}
                            icon="pi pi-check"
                            type="submit"
                            className="p-button-success"
                            disabled={creating || updating}
                        />
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default AvpAdd;