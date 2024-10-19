import React, {FC, useEffect, useState} from "react";
import {useQuery} from '@apollo/client';
import {GET_SUBSCRIBERS} from "../graphql/queries";
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Skeleton} from "primereact/skeleton";
import {Paginator} from "primereact/paginator";
import {useNavigate} from 'react-router-dom';
import {ISubscriber} from "../interface/data";
import AppHeader from "../Components/header/AppHeader";

const ViewSubscribers: FC = () => {
    const navigate = useNavigate();
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);

    const page = Math.floor(first / rows) + 1;
    const size = rows;

    const {loading, error, data, refetch: refetchSubscriber} = useQuery(GET_SUBSCRIBERS, {
        variables: {page, size},
        notifyOnNetworkStatusChange: true,
    });


    const onPageChange = (event: any) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    useEffect(()=>{
        refetchSubscriber();
    }, [])

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const handleEdit = (subscriber: ISubscriber) => {
        navigate(`/manage-subscriber?subscriber=${subscriber.subscriberId}&mode=edit`, {replace: false})
    };

    const handleDelete = (subscriber: ISubscriber) => {
        console.log("Delete user with ID:", subscriber.subscriberId);
    };

    const ActionButtons = (rowData: any) => {
        return (
            <div className="flex items-center gap-2">
                <Button icon="pi pi-file-edit" aria-label="Edit" onClick={() => handleEdit(rowData)}
                        className="p-button-rounded p-button-info"/>
                <Button icon="pi pi-trash" aria-label="Delete" onClick={() => handleDelete(rowData)}
                        className="p-button-rounded p-button-danger"/>
            </div>
        );
    };

    return (
        <React.Fragment>
            <div className="card justify-content-center w-full h-full">
                <AppHeader title={"View Subscriber"}/>
                <div style={{marginTop: 100, justifyContent:'center', left:0, right:0}} className={'absolute'}>
                    <DataTable style={{width:"100%"}} value={data?.getSubscribersByPage?.content ?? []} tableStyle={{minWidth: '50rem'}}>
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

            </div>
        </React.Fragment>
    );
};

export default ViewSubscribers;
