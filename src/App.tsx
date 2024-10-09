import React, {useState} from 'react'
import {PrimeReactProvider} from 'primereact/api';
import './App.css'
import SideMenu from "./Components/side-menu/SideMenu";
import Header from "./Components/header/Header";
import client from "./graphql/apploClient";
import {ApolloProvider} from "@apollo/client";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import SubscribersView from "./Pages/SubscribersView";
import SubscriberCreate from "./Pages/SubscriberCreate";

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
                                        <Route path="/subscribers" element={<SubscribersView/>}/>
                                        <Route path="/subscriber-create" element={<SubscriberCreate/>}/>

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
