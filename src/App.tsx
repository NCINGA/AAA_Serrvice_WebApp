import React, { useEffect, useState, useRef } from "react";
import { PrimeReactProvider } from "primereact/api";
import "./App.css";
import SideMenu from "./Components/side-menu/SideMenu";
import Header from "./Components/header/Header";
import { createApolloClient } from "./graphql/apploClient";
import { ApolloProvider } from "@apollo/client";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ViewPlans from "./Pages/ViewPlans";
import ManageSubscriber from "./Pages/ManageSubscriber";
import LoginPage from "./Pages/LoginPage";
import ViewSubscribers from "./Pages/ViewSubscribers.tsx";
import ManagePlan from "./Pages/ManagePlan.tsx";
import ManageProfile from "./Pages/ManageProfile.tsx";
import ViewProfileManagement from "./Pages/ViewProfileManagement.tsx";
import AvpAdd from "./Pages/AvpAdd.tsx";
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

// Routes that don't need redirection
const validRoutes = [
  "/view-plans",
  "/view-subscribers",
  "/view-nas",
  "/manage-subscriber",
  "/manage-plan",
  "/manage-nas",
  "/manage-profile",
  "/avp-add",
  "/view-profileManagement"
];

function App() {
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState(createApolloClient());
  const sideMenuRef = useRef<HTMLDivElement>(null);

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
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const authenticated = await isAuthenticated();
      handleAuthStateChange(authenticated);
    };

    checkAuth();
  }, []);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sideMenuRef.current &&
        !sideMenuRef.current.contains(event.target as Node) &&
        isMenuExpanded
      ) {
        setIsMenuExpanded(false);
      }
    }

    
    document.addEventListener("mousedown", handleClickOutside);


    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuExpanded]); 

  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <React.Fragment>
      <PrimeReactProvider>
        <ApolloProvider client={client}>
          <Router>
            {loggedIn ? (
              <>
                <Header />
                <div className="app">
                  <div ref={sideMenuRef}>
                    <SideMenu
                      onToggle={handleMenuToggle}
                      isExpanded={isMenuExpanded}
                    />
                  </div>
                  <div
                    className={`main ${
                      isMenuExpanded ? "main-expanded" : "main-collapsed"
                    }`}
                  >
                    <div className="content">
                      <Routes>
                        <Route path="/view-plans" element={<ViewPlans />} />
                        <Route
                          path="/view-subscribers"
                          element={<ViewSubscribers />}
                        />
                        <Route path="/view-nas" element={<ViewNAS />} />
                        <Route
                          path="/manage-subscriber"
                          element={<ManageSubscriber />}
                        />
                        <Route path="/manage-plan" element={<ManagePlan />} />
                        <Route path="/manage-nas" element={<ManageNAS />} />
                        <Route
                          path="/manage-profile"
                          element={<ManageProfile />}
                        />
                        <Route path="/avp-add" element={<AvpAdd />} />
                        <Route
                          path="/view-profileManagement"
                          element={<ViewProfileManagement />}
                        />
                        <Route
                          path="/"
                          element={<Navigate to="/view-subscribers" replace />}
                        />
                        {/* Only redirect unknown routes */}
                        <Route
                          path="*"
                          element={<AuthenticatedRedirect />}
                        />
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
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
          </Router>
        </ApolloProvider>
      </PrimeReactProvider>
    </React.Fragment>
  );
}


function AuthenticatedRedirect() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  
  const isValidRoute = validRoutes.includes(currentPath);
  
 
  return isValidRoute ? null : <Navigate to="/view-subscribers" replace />;
}

export default App;