import React, { FC, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { GET_PLANS, DELETE_PLANS, GET_PLAN_BY_ID } from "../graphql/queries";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { useNavigate } from 'react-router-dom';
import { IPlan } from "../interface/data";
import AppHeader from "../Components/header/AppHeader";
import { Messages } from 'primereact/messages';
import { ConfirmDialog } from 'primereact/confirmdialog';

const ViewPlans: FC = () => {
    const navigate = useNavigate();
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [planToDelete, setPlanToDelete] = useState<IPlan | null>(null);
    const toast = useRef<any>(null);

    const page = Math.floor(first / rows) + 1;
    const size = rows;

    const { loading, error, data, refetch: refetchPlan } = useQuery(GET_PLANS, {
        variables: { page, size },
        notifyOnNetworkStatusChange: true,
    });

    const [deletePlan] = useMutation(DELETE_PLANS, {
        onCompleted: () => {
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Plan deleted successfully!' });
            refetchPlan();
            setPlanToDelete(null);
        },
        onError: (error) => {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
        },
    });

    const [getPlansById, { data: selectedPlanData, loading: selectedPlanLoading }] = useLazyQuery(GET_PLAN_BY_ID);

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    useEffect(() => {
        refetchPlan();
    }, []);

    const handleEdit = (plan) => {
        getPlansById({ variables: { planId: plan.planId } });
    };

    useEffect(() => {
        if (selectedPlanData && !selectedPlanLoading) {
            navigate(`/manage-plan`, {
                state: { planData: selectedPlanData.getPlansById }
            });
        }
    }, [selectedPlanData, selectedPlanLoading, navigate]);

    const confirmDelete = (plan) => {
        setPlanToDelete(plan);
    };

    const handleDelete = () => {
        if (planToDelete) {
            deletePlan({ variables: { planId: planToDelete.planId } });
        }
    };

    const cancelDelete = () => {
        setPlanToDelete(null);
    };

    const ActionButtons = (rowData) => (
        <div className="flex items-center gap-2">
            <Button icon="pi pi-file-edit" aria-label="Edit" onClick={() => handleEdit(rowData)}
                    className="p-button-rounded p-button-info" />
            <Button icon="pi pi-trash" aria-label="Delete" onClick={() => confirmDelete(rowData)}
                    className="p-button-rounded p-button-danger" />
        </div>
    );

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <React.Fragment>
            <div className="card justify-content-center w-full h-full">
                <AppHeader title={"View Plans"} />
                <div style={{ marginTop: 100, justifyContent: 'center', marginLeft: "auto", marginRight: "auto" }} className="absolute">
                    <DataTable style={{ width: "100%" }} value={data?.getPlans ?? []} tableStyle={{ minWidth: '50rem' }}>
                        <Column field="planId" header="Plan ID" />
                        <Column field="typeId" header="Type ID" />
                        <Column field="planName" header="Plan Name" />
                        <Column field="description" header="Description" />
                        <Column body={ActionButtons} header="Actions" />
                    </DataTable>
                    <div className="card">
                        <Paginator
                            first={first}
                            rows={rows}
                            totalRecords={data?.getPlans.length}
                            rowsPerPageOptions={[3, 8, 10]}
                            onPageChange={onPageChange}
                        />
                    </div>
                </div>

                <Messages ref={toast} />

                {planToDelete && (
                    <ConfirmDialog visible header="Confirm Deletion" message="Do you want to delete this plan?"
                                   icon="pi pi-exclamation-triangle" accept={handleDelete} reject={cancelDelete} />
                )}
            </div>
        </React.Fragment>
    );
};

export default ViewPlans;
