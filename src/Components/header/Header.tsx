import React, {FC} from "react";
import './header.css'
import {Menubar} from 'primereact/menubar';
import {Avatar} from 'primereact/avatar';

const Header: FC = () => {
    // const itemRenderer = (item: any) => (
    //     <a className="flex align-items-center p-menuitem-link">
    //         <span className={item.icon}/>
    //         <span className="mx-2">{item.label}</span>
    //         {item.badge && <Badge className="ml-auto" value={item.badge}/>}
    //         {item.shortcut && <span
    //             className="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">{item.shortcut}</span>}
    //     </a>
    // );
    // const items: any = [
    //     {
    //         label: 'Profile',
    //         icon: 'pi pi-users',
    //         items: [
    //             {
    //                 label: 'Components',
    //                 icon: 'pi pi-bolt'
    //             },
    //             {
    //                 label: 'Blocks',
    //                 icon: 'pi pi-server'
    //             },
    //             {
    //                 label: 'UI Kit',
    //                 icon: 'pi pi-pencil'
    //             },
    //             {
    //                 label: 'Templates',
    //                 icon: 'pi pi-palette',
    //                 items: [
    //                     {
    //                         label: 'Apollo',
    //                         icon: 'pi pi-palette'
    //                     },
    //                     {
    //                         label: 'Ultima',
    //                         icon: 'pi pi-palette'
    //                     }
    //                 ]
    //             }
    //         ]
    //     }
    // ];


    // const start = <img alt="logo" src="https://primefaces.org/cdn/primereact/images/logo.png" height="40"
    //                    className="mr-2"></img>;
    const end = (
        <div className="flex align-items-center gap-2">
            <div className="flex items-center gap-2">
                <Avatar image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" shape="circle" />

                <div className="flex flex-col">
                    <div className="flex items-center">
                        <span className="p-2 text-white">shehan.salinda92@gmail.com</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (<React.Fragment>
        <div className="bg-blue-800 fixed w-full h-4rem z-3">

            <Menubar className={"bg-blue-800 h-4rem border-none rounded-none"} model={[]} start={<span className={'text-white'}>Web Console</span>} end={end}/>
        </div>


    </React.Fragment>)

}
export default Header
