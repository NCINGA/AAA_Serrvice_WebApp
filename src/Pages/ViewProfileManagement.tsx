import  { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { GET_PROFILES, DELETE_PROFILE, GET_PROFILE_BY_ID } from '../graphql/queries';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css';
import { Messages } from 'primereact/messages';
import { useNavigate } from 'react-router-dom';
import "./viewManagement.css"
import {IProfile} from "../interface/data.ts";
import Avp from './Avp.tsx'; // Icons

const ViewManageProfile = () => {
    const [shouldRefetch, setShouldRefetch] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [profiles, setProfiles] = useState([]);

    const [profileToDelete, setProfileToDelete] = useState<IProfile | null>(null);

    const rowsPerPage = 1; // Display only 1 row per page
    const toast = useRef<any>(null);
    const navigate = useNavigate();
    const [getProfileById, { data: selectedProfileData, loading: selectedProfileLoading }] = useLazyQuery(GET_PROFILE_BY_ID);
    const [deleteProfile] = useMutation(DELETE_PROFILE);
    const { loading, error, data, refetch: refetchProfiles } = useQuery(GET_PROFILES);
    const [isInitialRender, setIsInitialRender] = useState(true);


    useEffect(() => {
        if (isInitialRender && selectedProfileData && !selectedProfileLoading) {
            navigate('/manage-profile', {
                state: { profileData: selectedProfileData.getProfilesById },
            });
            setIsInitialRender(false);
        }
    }, [selectedProfileData, selectedProfileLoading, navigate, isInitialRender]);

    useEffect(() => {
        if (data?.getProfiles) {
            setProfiles(data.getProfiles);
        }
    }, [data]);

    useEffect(() => {
        if (shouldRefetch) {
            refetchProfiles();
            setShouldRefetch(false); // Reset the flag
        }
    }, [shouldRefetch, refetchProfiles]);

    useEffect(() => {
        refetchProfiles();
        goToLastPage();
    }, [profiles.length]);

    const totalPages = Math.ceil(profiles.length / rowsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const goToLastPage = () => {
        setCurrentPage(currentPage);
    };

    const confirmDelete = (profile :any) => {
        setProfileToDelete(profile); // Set profile to delete
    };

    const handleDelete = async () => {
        if (profileToDelete) {
            try {
                const response = await deleteProfile({
                    variables: { profileId: profileToDelete.profileId },
                });



                if (response.data?.deleteProfile) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Profile deleted successfully!',
                    });
                    await refetchProfiles(); // Refetch the updated profiles list
                } else {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete profile.',
                    });
                }
            } catch (error) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete profile. Please try again later.',
                });
            }
        }
        setProfileToDelete(null); // Reset after delete attempt


    };



    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Loading profiles...</div>;
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                Error fetching profiles: {error.message}
            </div>
        );
    }

    const handleEdit = async (profile :any) => {
        try {
            await getProfileById({ variables: { profileId: profile.profileId } });
            await refetchProfiles();
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch profile data.',
            });
        }
    };

    const paginatedProfiles = profiles.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
    );

    const actionBodyTemplate = (rowData :any) => (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button
                label="Edit"
                icon="pi pi-pencil"
                className="p-button-sm p-button-text p-button-primary"
                onClick={() => handleEdit(rowData)}
            />
            <Button
                label="Delete"
                icon="pi pi-trash"
                className="p-button-sm p-button-text p-button-danger"
                onClick={() => confirmDelete(rowData)}
            />
        </div>
    );

    return (


        <div style={{ padding: '20px', width: '100%' }}>
            <h2 style={{ textAlign: 'left', marginBottom: '20px', marginTop: '200' }}>Manage Profiles</h2>
            <div className="data-table-container">
                <Messages
                    ref={toast}
                    style={{
                        position: "fixed",
                        top: "60px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 9999,
                        width: "50vw",
                    }}
                />
                <DataTable
                    value={paginatedProfiles}
                    tableStyle={{ width: '100%' }}
                    paginator={false}
                    // responsiveLayout="scroll"
                >
                    <Column field="profileKey" header="Profile Key" sortable></Column>
                    <Column field="description" header="Description" sortable></Column>
                    <Column field="groupName" header="NAS Attribute Group" sortable></Column>
                    <Column
                        field="avps"
                        header="AVPs"
                        body={(rowData) => (
                            <div
                                style={{
                                    maxHeight: '500px', // Adjust height based on your needs
                                    overflowY: 'auto',
                                    padding: '5px',
                                    border: '1px solid #ccc', // Optional: Add a border for better visibility
                                    borderRadius: '4px', // Optional: Add rounded corners
                                }}
                            >
                                <Avp profileId={rowData.profileId} />
                            </div>
                        )}
                    ></Column>

                    <Column header="Actions" body={actionBodyTemplate}></Column>
                </DataTable>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <Button
                    label="Previous"
                    icon="pi pi-chevron-left"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 0}
                    className="p-button-outlined"
                />
                <span>
                    Page {currentPage + 1} of {Math.ceil(profiles.length / rowsPerPage)}
                </span>
                <Button
                    label="Next"
                    icon="pi pi-chevron-right"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="p-button-outlined"
                />
            </div>
            {/*<Messages ref={toast} />*/}

            <ConfirmDialog
                visible={!!profileToDelete}
                header="Confirm Deletion"
                message={`Are you sure you want to delete the profile with key "${profileToDelete?.profileKey}"?`}
                icon="pi pi-exclamation-triangle"
                accept={handleDelete}
                reject={() => setProfileToDelete(null)}
            />
        </div>
    );
};

export default ViewManageProfile;
