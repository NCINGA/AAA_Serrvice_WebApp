import React, { useState } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './side_menu.css';
import {Menubar} from "primereact/menubar";

interface SideMenuProps {
    onToggle: (isExpanded: boolean) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ onToggle }) => {
    const [expanded, setExpanded] = useState(false);

    const items = [
        {
            label: 'Connectors',
            icon: 'pi pi-fw pi-file',
            items: [
                {
                    label: 'Files',
                    icon: 'pi pi-fw pi-plus',
                    items: [
                        {
                            label: 'Bookmark',
                            icon: 'pi pi-fw pi-bookmark'
                        },
                        {
                            label: 'Video',
                            icon: 'pi pi-fw pi-video'
                        }
                    ]
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-fw pi-trash'
                },
                {
                    label: 'Export',
                    icon: 'pi pi-fw pi-external-link'
                }
            ]
        },
        {
            label: 'Edit',
            icon: 'pi pi-fw pi-pencil',
            items: [
                {
                    label: 'Left',
                    icon: 'pi pi-fw pi-align-left'
                },
                {
                    label: 'Right',
                    icon: 'pi pi-fw pi-align-right'
                },
                {
                    label: 'Center',
                    icon: 'pi pi-fw pi-align-center'
                },
                {
                    label: 'Justify',
                    icon: 'pi pi-fw pi-align-justify'
                }
            ]
        },
        {
            label: 'Users',
            icon: 'pi pi-fw pi-user',
            items: [
                {
                    label: 'New',
                    icon: 'pi pi-fw pi-user-plus'
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-fw pi-user-minus'
                },
                {
                    label: 'Search',
                    icon: 'pi pi-fw pi-users',
                    items: [
                        {
                            label: 'Filter',
                            icon: 'pi pi-fw pi-filter',
                            items: [
                                {
                                    label: 'Print',
                                    icon: 'pi pi-fw pi-print'
                                }
                            ]
                        },
                        {
                            label: 'List',
                            icon: 'pi pi-fw pi-bars'
                        }
                    ]
                }
            ]
        },
        {
            label: 'Events',
            icon: 'pi pi-fw pi-calendar',
            items: [
                {
                    label: 'Edit',
                    icon: 'pi pi-fw pi-pencil',
                    items: [
                        {
                            label: 'Save',
                            icon: 'pi pi-fw pi-calendar-plus'
                        },
                        {
                            label: 'Delete',
                            icon: 'pi pi-fw pi-calendar-minus'
                        }
                    ]
                },
                {
                    label: 'Archive',
                    icon: 'pi pi-fw pi-calendar-times',
                    items: [
                        {
                            label: 'Remove',
                            icon: 'pi pi-fw pi-calendar-minus'
                        }
                    ]
                }
            ]
        }
    ];

    const toggleMenu = () => {
        setExpanded(!expanded);
        onToggle(!expanded);
    };

    const renderCollapsedMenu = (items: any[], isSubItem = false) => {
        return items.map((item, index) => (
            <div key={index} className={`collapsed-item ${isSubItem ? 'sub-item' : 'main-item'}`}>
                <i className={item.icon}></i>
                {isSubItem && <span className="menu-label">{item.label}</span>}
                {item.items && (
                    <div className="submenu">
                        {/*{renderCollapsedMenu(item.items, true)}*/}
                        <Menubar model={item.items} className="custom-menubar" />
                    </div>
                )}
            </div>
        ));
    };



    return (
        <div className="side-menu">
            <Button onClick={toggleMenu} className="toggle-button" icon="pi pi-bars" />
            <div className={`menu-container ${expanded ? 'expanded' : 'collapsed'}`}>
                {expanded ? (
                    <PanelMenu model={items} style={{ width: '100%' }} />
                ) : (
                    <div className="collapsed-icons">
                        {renderCollapsedMenu(items)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SideMenu;
