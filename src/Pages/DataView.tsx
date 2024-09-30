// import React, { FC, useEffect, useState } from "react";
// import { SUBSCRIBE_DATA_STREAM } from "../graphql/queries";
// import { useSubscription } from "@apollo/client";
// import '../App.css';
// import DataNavigator from "../Components/data/DataNavigator";
//
// const DataView: FC = () => {
//     const [newData, setNewData] = useState<any[]>([]);
//     const stream = "stream";
//
//     // Subscription hook for real-time data
//     const { loading, error, data } = useSubscription(SUBSCRIBE_DATA_STREAM, {
//         variables: { stream },
//         notifyOnNetworkStatusChange: true,
//     });
//
//     // Use effect to update newData state when new data is received
//     useEffect(() => {
//         if (data && data.subscriberToDataStream) {
//             setNewData((prevData) => [...prevData, data.subscriberToDataStream]);
//         }
//     }, [data]);
//
//     // Handle loading and error states
//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>Error: {error.message}</p>;
//
//     return (
//         <React.Fragment>
//             <div>
//                 <h1>Data View</h1>
//                 <div className="csv-table">
//                     <table>
//                         <thead>
//                         <tr>
//                             <th>Data Stream</th>
//                             <DataNavigator data={newData} loadNext={()=>console.log("reload")}/>
//                         </tr>
//                         </thead>
//                         <tbody>
//                         {newData.map((item, index) => (
//                             <tr key={index}>
//                                 <td>{JSON.stringify(item)}</td>
//                             </tr>
//                         ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </React.Fragment>
//     );
// };
//
// export default DataView;
