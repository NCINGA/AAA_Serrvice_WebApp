import React from 'react';
import {PanelMenu} from 'primereact/panelmenu';
import {Button} from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './side_menu.css';
import {Menubar} from "primereact/menubar";
import {useNavigate} from 'react-router-dom';

interface SideMenuProps {
    onToggle: (isExpanded: boolean) => void;
    isExpanded: boolean; 
}

const SideMenu: React.FC<SideMenuProps> = ({ onToggle, isExpanded }) => {
    const navigate = useNavigate();

    const items = [
        {
            label: 'Subscribers',
            icon: 'pi pi-fw pi pi-user',
            items: [
                {
                    label: 'Add',
                    icon: 'pi pi-fw pi-plus',
                    command: () => navigate('/manage-subscriber?mode=new')
                },
                {
                    label: 'View',
                    icon: 'pi pi-fw pi-list',
                    command: () => navigate('/view-subscribers')
                }
            ]
        },
        {
            label: 'Plans',
            icon: 'pi pi-fw pi-chart-pie',
            items: [
                {
                    label: 'Add',
                    icon: 'pi pi-fw pi-plus',
                    command: () => navigate('/manage-plan?mode=new')
                },
                {
                    label: 'View',
                    icon: 'pi pi-fw pi-list',
                    command: () => navigate('/view-plans')
                }
            ]
        },
        {
            label: "NAS Management",
            icon: "pi pi-fw pi-server",
            items: [
                {
                    label: "Add",
                    icon: "pi pi-fw pi-plus",
                    command: () => navigate("/manage-nas?mode=new"),
                },
                {
                    label: "View",
                    icon: "pi pi-fw pi-list",
                    command: () => navigate("/view-nas"),
                },
            ],
        },
        {
            label: 'Profile Management',
            icon: 'pi pi-fw pi-address-book',
            items: [
                {
                    label: 'Add',
                    icon: 'pi pi-fw pi-plus',
                    command: () => navigate('/manage-profile?mode=new')
                },
                {
                    label: 'View',
                    icon: 'pi pi-fw pi-list',
                    command: () => navigate('/view-profileManagement')
                }
            ]
        }
    ];

    const toggleMenu = () => {
        onToggle(!isExpanded);
    };

    const renderCollapsedMenu = (items: any[], isSubItem = false) => {
        return items.map((item, index) => (
            <div key={index} className={`collapsed-item ${isSubItem ? 'sub-item' : 'main-item'}`}>
                <i className={item.icon}></i>
                {isSubItem && <span className="menu-label">{item.label}</span>}
                {item.items && (
                    <div className="submenu">
                        <Menubar model={item.items} className="custom-menubar" />
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="side-menu" style={{zIndex: 99999}}>
            <Button onClick={toggleMenu} className="toggle-button" icon="pi pi-bars"/>
            <div className={`menu-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
                {isExpanded ? (
                    <PanelMenu model={items} style={{width: '100%'}}/>
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