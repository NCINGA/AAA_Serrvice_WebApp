// import React, {FC, useEffect, useState} from "react";
// import {useSubscription} from "@apollo/client";
// import {SUBSCRIBE_DB} from "../graphql/queries";
// import {InputText} from "primereact/inputtext";
// import {Button} from "primereact/button";
//
// // Define the User type to match your GraphQL schema
// type User = {
//     id: string;
//     username: string;
//     email: string;
//     roles: string[];
//     createAt: string;
// };
//
// const Test: FC = () => {
//     const [input, setInput] = useState<any>();
//     const [subjectKey, setSubjectKey] = useState("");
//     const [frequency, setFrequency] = useState(5);
//     const [isSubscribed, setIsSubscribed] = useState(false);
//
//     const {data, loading, error} = useSubscription(SUBSCRIBE_DB, {
//         variables: {subjectKey, frequency},
//         skip: !isSubscribed,
//         notifyOnNetworkStatusChange: true,
//     });
//
//     useEffect(() => {
//         if (data) {
//             console.log(data?.getDashboardUpdate?.tbl);
//             setInput(data);
//         }
//     }, [data]);
//
//     const handleSubscribe = () => {
//         setIsSubscribed(true);
//     };
//
//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>Error: {error.message}</p>;
//
//     return (
//         <React.Fragment>
//             <InputText value={subjectKey} onChange={(e) => setSubjectKey(e.target.value)} placeholder="Subject Key"/>
//             <InputText type="number" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} placeholder="Frequency (seconds)"/>
//             <Button label="Subscribe" onClick={handleSubscribe} />
//
//             {input?.getDashboardUpdate?.name ?? ""}
//             {input?.getDashboardUpdate?.tbl?.map((tbl: any) => (
//                 <p key={tbl?.id}>ID {tbl?.id} : Subject {tbl.subjectKey ?? ""} : Start Time {tbl?.startTime} : End Time {tbl?.endTime}</p>
//             ))}
//         </React.Fragment>
//     );
// };
//
// export default Test;
