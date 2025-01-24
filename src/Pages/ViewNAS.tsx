import React, { FC, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_NAS,
  DELETE_NAS,
  GET_NAS_BY_ID,
  GET_NAS_ATTRIBUTE_GROUP,
} from "../graphql/queries";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import { INas } from "../interface/data";
import AppHeader from "../Components/header/AppHeader";
import { Messages } from "primereact/messages";
import { ConfirmDialog } from "primereact/confirmdialog";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";

const ViewNAS: FC = () => {
  const navigate = useNavigate();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [nasToDelete, setNasToDelete] = useState<INas | null>(null);
  const toast = useRef<Messages>(null);

  const page = Math.floor(first / rows) + 1;
  const size = rows;

  const {
    loading,
    error,
    data,
    refetch: refetchNas,
  } = useQuery(GET_NAS, {
    variables: { page, size },
    notifyOnNetworkStatusChange: true,
  });

  const { data: attributeGroupData } = useQuery(GET_NAS_ATTRIBUTE_GROUP);

  const [deleteNas] = useMutation(DELETE_NAS, {
    onCompleted: () => {
      console.log("Delete mutation completed");
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "NAS deleted successfully!",
      });
      setTimeout(() => {
        refetchNas();
        setNasToDelete(null);
      }, 3000);
    },
    onError: (error) => {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
    },
  });

  const [getNasById, { data: selectedNasData, loading: selectedNasLoading }] =
    useLazyQuery(GET_NAS_BY_ID);

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  useEffect(() => {
    refetchNas();
  }, []);

  const handleEdit = (nas: any) => {
    getNasById({ variables: { nas_id: nas.nas_id } });
  };

  useEffect(() => {
    if (selectedNasData && !selectedNasLoading) {
      navigate(`/manage-nas`, {
        state: { nasData: selectedNasData.getNasById },
      });
    }
  }, [selectedNasData, selectedNasLoading, navigate]);

  const confirmDelete = (nas: any) => {
    setNasToDelete(nas);
  };

  const handleDelete = () => {
    if (nasToDelete) {
      deleteNas({ variables: { nas_id: nasToDelete.nas_id } });
    }
  };

  const cancelDelete = () => {
    setNasToDelete(null);
  };

  const ActionButtons = (rowData: any) => (
    <div className="flex items-center gap-2">
      <Button
        icon="pi pi-file-edit"
        aria-label="Edit"
        onClick={() => handleEdit(rowData)}
        className="p-button-rounded p-button-info"
      />
      <Button
        icon="pi pi-trash"
        aria-label="Delete"
        onClick={() => confirmDelete(rowData)}
        className="p-button-rounded p-button-danger"
      />
    </div>
  );

  const getAttributeGroupName = (attrGroupId: any) => {
    if (!attributeGroupData) return "Loading...";
    const group = attributeGroupData.getNasAttributeGroup.find(
      (group: any) => group.id === attrGroupId
    );
    return group ? group.name : "Unknown";
  };

  const AttributeGroupTemplate = (rowData: any) => (
    <span>{getAttributeGroupName(rowData.nas_attrgroup)}</span>
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <React.Fragment>
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
      <div className="card justify-content-center w-full h-full">
        <AppHeader title={"View NAS"} />
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
            style={{ width: "100vw", height: "auto" }}
            value={data?.getNas ?? []}
            tableStyle={{ minWidth: "100%", tableLayout: "fixed" }}
          >
            <Column field="nas_id" header="NAS ID" style={{ width: "10%" }} />
            <Column
              field="nas_name"
              header="NAS Name"
              style={{ width: "20%" }}
            />
            <Column
              body={AttributeGroupTemplate}
              header="Attribute Group"
              style={{ width: "20%" }}
            />
            <Column
              field="nas_type"
              header="NAS Type"
              style={{ width: "10%" }}
            />
            <Column field="coa_port" header="Port" style={{ width: "10%" }} />
            <Column
              field="nas_secret"
              header="Secret"
              style={{ width: "10%" }}
            />
            <Column
              body={ActionButtons}
              header="Actions"
              style={{ width: "20%" }}
            />
          </DataTable>
          <div className="card">
            <Paginator
              first={first}
              rows={rows}
              totalRecords={data?.getNas.length}
              rowsPerPageOptions={[3, 8, 10]}
              onPageChange={onPageChange}
            />
          </div>
        </div>

        <Messages ref={toast} />

        {nasToDelete && (
          <ConfirmDialog
            visible
            header="Confirm Deletion"
            message="Do you want to delete this NAS?"
            icon="pi pi-exclamation-triangle"
            accept={handleDelete}
            reject={cancelDelete}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default ViewNAS;
