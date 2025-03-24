import React, { FC, useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SUBSCRIBERS, DELETE_SUBSCRIBER } from "../graphql/queries";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import { ISubscriber } from "../interface/data";
import AppHeader from "../Components/header/AppHeader";
import { Messages } from "primereact/messages";
import { ConfirmDialog } from "primereact/confirmdialog";

const ViewSubscribers: FC = () => {
  const navigate = useNavigate();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [subscriberToDelete, setSubscriberToDelete] =
    useState<ISubscriber | null>(null); // Store selected subscriber
  const toast = useRef<any>(null);
  const [deleteSubscriberSuccess, setDeleteSubscriberSuccess] = useState<
    boolean | null
  >(null);

  const page = Math.floor(first / rows) + 1;
  const size = rows;

  const {
    loading,
    error,
    data,
    refetch: refetchSubscriber,
  } = useQuery(GET_SUBSCRIBERS, {
    variables: { page, size },
    notifyOnNetworkStatusChange: true,
  });

  const [deleteSubscriber] = useMutation(DELETE_SUBSCRIBER, {
    onCompleted: () => {
      setDeleteSubscriberSuccess(true);
      refetchSubscriber(); // Refetch subscribers after deletion
    },
    onError: (error) => {
      console.error("Error deleting subscriber:", error.message);
      setDeleteSubscriberSuccess(false);
    },
  });

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  useEffect(() => {
    refetchSubscriber();
  }, []);

  const handleEdit = (subscriber: ISubscriber) => {
    navigate(
      `/manage-subscriber?subscriber=${subscriber.subscriberId}&mode=edit`,
      { replace: false }
    );
  };

 
  const handleViewDetails = (subscriber: ISubscriber) => {
    navigate(
      `/subscriber-details/${subscriber.subscriberId}`,
      { replace: false }
    );
  };

  const confirmDelete = (subscriber: ISubscriber) => {
    setSubscriberToDelete(subscriber); 
  };

  const handleDelete = () => {
    if (subscriberToDelete) {
      deleteSubscriber({
        variables: { subscriberId: subscriberToDelete.subscriberId },
      }); 
      setSubscriberToDelete(null);
      console.log(deleteSubscriberSuccess); 
    }
  };

  const cancelDelete = () => {
    setSubscriberToDelete(null); 
  };

  const ActionButtons = (rowData: any) => {
    return (
      <div className="flex items-center gap-2">
        {/* New Details Button */}
        <Button
          icon="pi pi-eye"
          aria-label="View Details"
          onClick={() => handleViewDetails(rowData)}
          className="p-button-rounded p-button-info"
          tooltip="View Details"
        />
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
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <React.Fragment>
      <div className="card justify-content-center w-full h-full">
        <AppHeader title={"View Subscriber"} />
        <div
          style={{
            marginTop: 100,
            justifyContent: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          className={"absolute"}
        >
          <DataTable
            style={{ width: "100%" }}
            value={data?.getSubscribersByPage?.content ?? []}
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column
              field="subscriberId"
              header="ID"
              body={loading && <Skeleton />}
            />
            <Column
              field="username"
              header="Username"
              body={loading && <Skeleton />}
            />
            <Column
              field="email"
              header="Email"
              body={loading && <Skeleton />}
            />
            <Column
              field="status"
              header="Status"
              body={loading && <Skeleton />}
            />
            <Column
              field="extId"
              header="Ext ID"
              body={loading && <Skeleton />}
            />
            <Column
              field="createdDate"
              header="Created Time"
              body={loading && <Skeleton />}
            />
            <Column
              field="updatedTime"
              header="Updated Time"
              body={loading && <Skeleton />}
            />
            <Column body={ActionButtons} header="Actions" />
          </DataTable>
          <div className="card">
            <Paginator
              first={first}
              rows={rows}
              totalRecords={data?.getSubscribersByPage?.totalElements}
              rowsPerPageOptions={[3, 8, 10]}
              onPageChange={onPageChange}
            />
          </div>
        </div>

        <Messages ref={toast} />

        {subscriberToDelete && (
          <ConfirmDialog
            visible
            header="Confirm Deletion"
            message="Do you want to delete this subscriber?"
            icon="pi pi-exclamation-triangle"
            accept={handleDelete}
            reject={cancelDelete}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default ViewSubscribers;