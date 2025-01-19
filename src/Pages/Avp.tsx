import React, { useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import {GET_PROFILES, DELETE_AVP_PROFILE, GET_PROFILE_AVP_BY_ID} from "../graphql/queries";

import {useLazyQuery, useMutation, useQuery} from "@apollo/client";
import AvpAdd from "./AvpAdd";
import { Messages } from "primereact/messages";
import { ConfirmDialog } from "primereact/confirmdialog";
import { IProfile } from "../interface/data";

interface AvpProps {
    profileId: number | undefined;
}

const AvpForm: React.FC<AvpProps> = ({ profileId }) => {
    const { loading, error, data, refetch: refetchAvpProfiles } = useQuery(GET_PROFILES);
    const [profiles, setProfiles] = useState<IProfile[]>([]);
    const [profileToDelete, setProfileToDelete] = useState<IProfile | null>(null);
    const [deleteAvpProfile] = useMutation(DELETE_AVP_PROFILE);
    const toast = useRef<any>(null);
    const [] = useLazyQuery(GET_PROFILE_AVP_BY_ID);
    const [editingAvp, setEditingAvp] = useState(null); // Add this state



    useEffect(() => {
        if (data?.getProfiles) {
            setProfiles(data.getProfiles);
        }
    }, [data]);

    const confirmDelete = (profile: any) => {
        setProfileToDelete(profile);
    };

    const handleDelete = async () => {
        if (profileToDelete) {
            try {
                const response = await deleteAvpProfile({
                    variables: { id: profileToDelete.id},
                });

                if (response.data?.deleteAvpProfile) {
                    toast.current.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Profile deleted successfully!",
                    });
                    await refetchAvpProfiles();
                } else {
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Failed to delete profile.",
                    });
                }
            } catch (error) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to delete profile. Please try again later.",
                });
            }
        }
        setProfileToDelete(null);
    };

    const handleEdit = (avp: any) => {
        setEditingAvp(avp); // Set the selected AVP for editing
    };

    const handleEditComplete = () => {
        setEditingAvp(null); // Clear editing state
        refetchAvpProfiles(); // Refetch profiles to reflect updates
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: "20px" }}>Loading profiles...</div>;
    }

    if (error) {
        return (
            <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
                Error fetching profiles: {error.message}
            </div>
        );
    }

    const filteredProfiles = profiles.filter(
        (profile) => profile.profileId === profileId && profile.avpProfile
    );

    return (
        <div className="p-mb-3">
            <Messages ref={toast} />
            <AvpAdd
                profileId={profileId}
                onAdd={() => refetchAvpProfiles()}
                editingAvp={editingAvp} // Pass the selected AVP for editing
                onEditComplete={handleEditComplete} // Reset editing state after update
            />

            {filteredProfiles.map((profile: any) => (
                <React.Fragment key={profile.id}>
                    {profile.avpProfile.map((avp: any) => (
                        <Card
                            key={avp.id}
                            className="p-shadow-3"
                            style={{ width: "80%", marginBottom: "1rem" }}
                        >
                            <div className="p-grid p-align-center p-justify-between">
                                <div className="p-col-12 p-md-8">
                                    <h3
                                        style={{
                                            fontWeight: "bold",
                                            margin: "0",
                                            color: "#495057",
                                        }}
                                    >
                                        {avp.avpName || "Unnamed AVP"}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-mt-2">
                                <p>
                                    <strong>Status:</strong> {avp.status || "null"}
                                </p>
                                <p>
                                    <strong>Override Enabled:</strong> {avp.overrideEnabled === 1 ? "ENABLED" : "DISABLED"}
                                </p>
                                <p>
                                    <strong>AVP Value:</strong> {avp.avpValue || "null"}
                                </p>
                                <p>
                                    <strong>Include When:</strong> {avp.includeWhen || "null"}
                                </p>
                            </div>


                            <div className="p-col-12 p-md-4 p-text-right">
                                <Button
                                    label="Edit"
                                    icon="pi pi-pencil"
                                    className="p-button-text p-button-secondary p-mr-2"
                                    onClick={() => handleEdit(avp)}
                                />

                                <Button
                                    label="Delete"
                                    icon="pi pi-trash"
                                    className="p-button-text p-button-danger"
                                    onClick={() => confirmDelete(avp)}
                                />
                            </div>
                        </Card>
                    ))}
                </React.Fragment>
            ))}

            <ConfirmDialog
                visible={!!profileToDelete}
                header="Confirm Deletion"
                message={`Are you sure you want to delete the AVP with key "${profileToDelete?.profileKey}"?`}
                icon="pi pi-exclamation-triangle"
                accept={handleDelete}
                reject={() => setProfileToDelete(null)}
            />
        </div>
    );
};

export default AvpForm;
