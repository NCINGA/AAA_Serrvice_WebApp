import React, {useState} from 'react'
import {PrimeReactProvider} from 'primereact/api';
import './App.css'
import SideMenu from "./Components/side-menu/SideMenu";
import Header from "./Components/header/Header";
import client from "./graphql/apploClient";
import {ApolloProvider} from "@apollo/client";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import ViewSubscribers from "./Pages/ViewSubscribers";
import ManageSubscriber from "./Pages/ManageSubscriber";

function App() {
    const [isMenuExpanded, setIsMenuExpanded] = useState(true);

    const handleMenuToggle = (isExpanded: any) => {
        setIsMenuExpanded(isExpanded);
    };

    return (
        <React.Fragment>
            <PrimeReactProvider>
                <ApolloProvider client={client}>
                    <Header/>
                    <div className="app">
                        <SideMenu onToggle={handleMenuToggle}/>
                        <div className={`${isMenuExpanded ? 'expanded' : 'collapsed'}`}>
                        </div>
                        <div className={"main"}>
                            <div className={"content"}>
                                <Router>
                                    <Routes>
                                        <Route path="/view-subscribers" element={<ViewSubscribers/>}/>
                                        <Route path="/manage-subscriber" element={<ManageSubscriber/>}/>

                                    </Routes>
                                </Router>
                            </div>
                        </div>
                    </div>
                </ApolloProvider>
            </PrimeReactProvider>
        </React.Fragment>
    )
}

export default App
