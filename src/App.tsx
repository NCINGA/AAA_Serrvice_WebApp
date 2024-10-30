import React, {useEffect, useState} from 'react';
import {PrimeReactProvider} from 'primereact/api';
import './App.css';
import SideMenu from "./Components/side-menu/SideMenu";
import Header from "./Components/header/Header";
import client from "./graphql/apploClient";
import {ApolloProvider} from "@apollo/client";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import ViewPlans from "./Pages/ViewPlans";
import ManageSubscriber from "./Pages/ManageSubscriber";
import LoginPage from "./Pages/LoginPage";
import ViewSubscribers from "./Pages/ViewSubscribers.tsx";
import ManagePlan from "./Pages/ManagePlan.tsx";


const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};

function App() {
    const [isMenuExpanded, setIsMenuExpanded] = useState(true);
    const [loggedIn, setLoggedIn] = useState(isAuthenticated());

    const handleMenuToggle = (isExpanded: any) => {
        setIsMenuExpanded(isExpanded);
    };

    useEffect(() => {
        setLoggedIn(isAuthenticated());
    }, []);

    return (
        <React.Fragment>
            <PrimeReactProvider>
                <ApolloProvider client={client}>
                    <Router>
                        {loggedIn ? (
                            <>
                                <Header/>
                                <div className="app">
                                    <SideMenu onToggle={handleMenuToggle}/>
                                    <div className={`${isMenuExpanded ? 'expanded' : 'collapsed'}`}></div>
                                    <div className={"main"}>
                                        <div className={"content"}>
                                            <Routes>
                                                <Route path="/view-plans" element={<ViewPlans/>}/>
                                                <Route path="/view-subscribers" element={<ViewSubscribers/>}/>
                                                <Route path="/manage-subscriber" element={<ManageSubscriber/>}/>
                                                <Route path="/manage-plan" element={<ManagePlan/>}/>
                                                <Route path="*" element={<Navigate to="/view-subscribers" replace/>}/>
                                                <Route path="*" element={<Navigate to="/view-plans" replace/>}/>
                                            </Routes>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Routes>
                                <Route path="/login" element={<LoginPage state={(state) => {
                                    if (state) {
                                        setLoggedIn(true)
                                    } else {
                                        setLoggedIn(false);
                                    }
                                }}/>}/>
                                <Route path="*" element={<Navigate to="/login" replace/>}/>
                            </Routes>
                        )}
                    </Router>
                </ApolloProvider>
            </PrimeReactProvider>
        </React.Fragment>
    );
}

export default App;
