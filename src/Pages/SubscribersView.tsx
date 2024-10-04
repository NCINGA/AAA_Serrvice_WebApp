import React, {FC, useState} from "react";
import {useQuery} from '@apollo/client';
import {GET_SUBSCRIBERS} from "../graphql/queries";
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Skeleton} from "primereact/skeleton";
import {Paginator} from "primereact/paginator";

const SubscribersView: FC = () => {
    const [first, setFirst] = useState(0); // 0-based index for the first item
    const [rows, setRows] = useState(10); // Default rows per page

    const page = Math.floor(first / rows) + 1; // Adjust to 1-based page
    const size = rows; // Rows to fetch

    const {loading, error, data} = useQuery(GET_SUBSCRIBERS, {
        variables: {page, size},
        notifyOnNetworkStatusChange: true,
    });

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const handleEdit = (id: string) => {
        console.log("Edit user with ID:", id);
    };

    const handleDelete = (id: string) => {
        console.log("Delete user with ID:", id);
    };

    const ActionButtons = (rowData: any) => {
        return (
            <div className="flex items-center gap-2">
                <Button icon="pi pi-file-edit" aria-label="Edit" onClick={() => handleEdit(rowData.id)}
                        className="p-button-rounded p-button-info"/>
                <Button icon="pi pi-trash" aria-label="Delete" onClick={() => handleDelete(rowData.id)}
                        className="p-button-rounded p-button-danger"/>
            </div>
        );
    };

    return (
        <React.Fragment>
            <div>
                <h1>Subscribers</h1>
                <DataTable value={data?.getSubscribersByPage?.content ?? []} tableStyle={{minWidth: '50rem'}}>
                    <Column field="subscriberId" header="ID" body={loading && <Skeleton/>}/>
                    <Column field="username" header="Username" body={loading && <Skeleton/>}/>
                    <Column field="email" header="Email" body={loading && <Skeleton/>}/>
                    <Column field="status" header="Status" body={loading && <Skeleton/>}/>
                    <Column field="extId" header="Ext ID" body={loading && <Skeleton/>}/>
                    <Column field="createdDate" header="Created Time"
                            body={loading && <Skeleton/>}/>
                    <Column field="updatedTime" header="Updated Time"
                            body={loading && <Skeleton/>}/>
                    <Column body={ActionButtons} header="Actions"/>
                </DataTable>
                <div className="card">
                    <Paginator
                        first={first}
                        rows={rows}
                        totalRecords={data?.getSubscribersByPage?.totalElements}
                        rowsPerPageOptions={[3, 8, 10]}
                        onPageChange={onPageChange}
                        // Adjust the paginator to reflect the 1-based page index
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export default SubscribersView;
