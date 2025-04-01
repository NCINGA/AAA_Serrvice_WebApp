import React, { FC, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_PLANS_BY_PAGE,
  DELETE_PLANS,
  GET_PLAN_BY_ID,
  GET_PLAN_PROFILES,
  GET_PLAN_DETAILS_BY_ID,
} from "../graphql/queries";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import { IPlan } from "../interface/data";
import AppHeader from "../Components/header/AppHeader";
import { Messages } from "primereact/messages";
import { ConfirmDialog } from "primereact/confirmdialog";

// Define interfaces for the data structure
interface IAttribute {
  id: string | null;
  attributeName: string;
  attributeValue: string;
}

interface IParameterAction {
  id: string | null;
  actionId: string;
  actionPhase: string;
  parameterName: string;
  actionSequence: number;
  matchReturn: string;
  entity: string;
}

interface IParameterPhase {
  id: string | null;
  parameterName: string;
  phase: string;
  status: string;
  entityState: string;
  entity: string;
}

const ViewPlans: FC = () => {
  const navigate = useNavigate();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [planToDelete, setPlanToDelete] = useState<IPlan | null>(null);
  const toast = useRef<any>(null);

  // Calculate page number for GraphQL query
  const page = Math.floor(first / rows) + 1;
  const size = rows;

  const { loading, error, data, refetch } = useQuery(GET_PLANS_BY_PAGE, {
    variables: { page, size },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      // Update total records when data is received
      if (data?.getPlansByPage?.totalElements) {
        setTotalRecords(data.getPlansByPage.totalElements);
      }
    },
  });

  const [deletePlan] = useMutation(DELETE_PLANS, {
    onCompleted: () => {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Plan deleted successfully!",
      });
      refetch();
      setPlanToDelete(null);
    },
    onError: (error) => {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
    },
  });

  const [
    getPlansById,
    { data: selectedPlanData, loading: selectedPlanLoading },
  ] = useLazyQuery(GET_PLAN_BY_ID);

  const [getPlanProfiles, { data: planProfilesData }] =
    useLazyQuery(GET_PLAN_PROFILES);

  const [getPlanDetailById, { data: planDetails, loading: loadingPlanDetail }] =
    useLazyQuery(GET_PLAN_DETAILS_BY_ID);

  const [
    getPlanAttributesById,
    { data: planAttributesData, loading: loadingPlanAttributes },
  ] = useLazyQuery(GET_PLAN_DETAILS_BY_ID);

  const [
    getPlanParameterActionsById,
    { data: planParameterActionsData, loading: loadingPlanParameterActions },
  ] = useLazyQuery(GET_PLAN_DETAILS_BY_ID);

  const [
    getPlanParameterPhasesById,
    { data: planParameterPhasesData, loading: loadingPlanParameterPhases },
  ] = useLazyQuery(GET_PLAN_DETAILS_BY_ID);

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  // Refetch plans when pagination parameters change
  useEffect(() => {
    refetch({ page, size });
  }, [page, size, refetch]);

  // Modified useEffect to include parameter phases data
  useEffect(() => {
    if (
      selectedPlanData &&
      !selectedPlanLoading &&
      planDetails &&
      !loadingPlanDetail &&
      planAttributesData &&
      !loadingPlanAttributes &&
      planParameterActionsData &&
      !loadingPlanParameterActions &&
      planParameterPhasesData &&
      !loadingPlanParameterPhases
    ) {
      const selectedParameters =
        planDetails?.getPlanDetailsById?.parameters ?? [];
      const selectedProfiles = planProfilesData?.getPlanProfiles || [];

      const selectedAttributes = (
        planAttributesData?.getPlanDetailsById?.attributes || []
      ).map((attr: IAttribute) => ({
        id: attr.id || null,
        attribute: attr.attributeName,
        value: attr.attributeValue,
        attributeName: attr.attributeName,
        attributeValue: attr.attributeValue,
        isExisting: true,
      }));

      const selectedParameterActions = (
        planParameterActionsData?.getPlanDetailsById?.parameterActions || []
      ).map((action: IParameterAction) => ({
        id: action.id || null,
        actionId: action.actionId,
        actionPhase: action.actionPhase,
        parameterName: action.parameterName,
        actionSequence: action.actionSequence,
        matchReturn: action.matchReturn,
        entity: action.entity,
        isExisting: true,
      }));

      const selectedParameterPhases = (
        planParameterPhasesData?.getPlanDetailsById?.parameterPhases || []
      ).map((phase: IParameterPhase) => ({
        id: phase.id || null,
        parameterName: phase.parameterName,
        phase: phase.phase,
        status: phase.status,
        entityState: phase.entityState,
        entity: phase.entity,
        isExisting: true,
      }));

      console.log("Normalized Selected Attributes:", selectedAttributes);
      console.log(
        "Normalized Selected Parameter Phases:",
        selectedParameterPhases
      );

      navigate(`/manage-plan`, {
        state: {
          planData: selectedPlanData.getPlansById,
          selectedProfiles,
          selectedParameters,
          selectedAttributes,
          selectedParameterActions,
          selectedParameterPhases,
        },
      });
    }
  }, [
    selectedPlanData,
    selectedPlanLoading,
    planProfilesData,
    planDetails,
    loadingPlanDetail,
    planAttributesData,
    loadingPlanAttributes,
    planParameterActionsData,
    loadingPlanParameterActions,
    planParameterPhasesData,
    loadingPlanParameterPhases,
    navigate,
  ]);

  const handleEdit = (plan: IPlan) => {
    localStorage.setItem("planId", plan?.planId?.toString() ?? "");

    getPlansById({ variables: { planId: plan.planId } });
    getPlanProfiles({ variables: { planId: plan.planId } });
    getPlanDetailById({ variables: { planId: plan.planId } });
    getPlanAttributesById({ variables: { planId: plan.planId } });
    getPlanParameterActionsById({ variables: { planId: plan.planId } });
    getPlanParameterPhasesById({ variables: { planId: plan.planId } });
  };

  const confirmDelete = (plan: IPlan) => {
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

  const ActionButtons = (rowData: IPlan) => (
    <div className="flex items-center gap-2">
      <Button
        icon="pi pi-file-edit"
        aria-label="Edit"
        onClick={() => handleEdit(rowData)}
        className="p-button-rounded p-button-info"
        tooltip="Edit"
      />
      <Button
        icon="pi pi-trash"
        aria-label="Delete"
        onClick={() => confirmDelete(rowData)}
        className="p-button-rounded p-button-danger"
        tooltip="Delete"
      />
    </div>
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Get the plans data from the paginated response
  const plans = data?.getPlansByPage?.content || [];

  return (
    <React.Fragment>
      <div className="card justify-content-center w-full h-full">
        <AppHeader title={"View Plans"} />
        <div
          style={{
            marginTop: 100,
            justifyContent: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          className="absolute"
        >
          <DataTable
            style={{ width: "100%" }}
            value={plans}
            tableStyle={{ minWidth: "50rem" }}
          >
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
              totalRecords={totalRecords}
              rowsPerPageOptions={[3, 8, 10]}
              onPageChange={onPageChange}
            />
          </div>
        </div>

        <Messages ref={toast} />

        {planToDelete && (
          <ConfirmDialog
            visible
            header="Confirm Deletion"
            message="Do you want to delete this plan?"
            icon="pi pi-exclamation-triangle"
            accept={handleDelete}
            reject={cancelDelete}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default ViewPlans;
