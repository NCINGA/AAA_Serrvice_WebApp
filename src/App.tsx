import React, {useEffect, useState} from 'react';
import {PrimeReactProvider} from 'primereact/api';
import './App.css';
import SideMenu from "./Components/side-menu/SideMenu";
import Header from "./Components/header/Header";
import { createApolloClient } from "./graphql/apploClient";
import { ApolloProvider } from "@apollo/client";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import ViewPlans from "./Pages/ViewPlans";
import ManageSubscriber from "./Pages/ManageSubscriber";
import LoginPage from "./Pages/LoginPage";
import ViewSubscribers from "./Pages/ViewSubscribers.tsx";
import ManagePlan from "./Pages/ManagePlan.tsx";
import ManageProfile from "./Pages/ManageProfile.tsx";
import ViewProfileManagement from "./Pages/ViewProfileManagement.tsx";
import AvpAdd from "./Pages/AvpAdd.tsx";
import ViewSubscribers from "./Pages/ViewSubscribers";
import ViewNAS from "./Pages/ViewNAS";
import ManageNAS from "./Pages/ManageNAS";
import axios from "axios";

const isAuthenticated = async (): Promise<boolean> => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    return false;
  }

  try {
    const response = await axios.get("http://localhost:8080/auth/isExpired", {
      params: { token },
    });
    return !response.data;
  } catch (error) {
    console.error("Error during token validation:", error);
    return false;
  }
};

function App() {
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [client, setClient] = useState(createApolloClient());

  const handleMenuToggle = (isExpanded: boolean) => {
    setIsMenuExpanded(isExpanded);
  };

  const handleAuthStateChange = (isAuth: boolean) => {
    if (isAuth) {
      const newClient = createApolloClient();
      setClient(newClient);
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      handleAuthStateChange(authenticated);
    };

    checkAuth();
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
                                                <Route path="/view-nas" element={<ViewNAS />} />
                                                <Route path="/manage-subscriber" element={<ManageSubscriber/>}/>
                                                <Route path="/manage-plan" element={<ManagePlan/>}/>
                                                <Route path="/manage-nas" element={<ManageNAS />} />
                                                <Route path="*" element={<Navigate to="/view-subscribers" replace/>}/>
                                                <Route path="*" element={<Navigate to="/view-plans" replace/>}/>
                                            </Routes>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Routes>
                                <Route
                                    path="/login"
                                    element={<LoginPage state={handleAuthStateChange} />}
                                />
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
