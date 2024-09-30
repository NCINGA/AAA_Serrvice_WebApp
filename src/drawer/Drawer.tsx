import 'reactflow/dist/style.css';
import {Button} from "primereact/button";


export default function Drawer() {

    return (
        <div className="card flex justify-content-center">
            <Button icon="pi pi-check" />
            <Button label="Submit" icon="pi pi-check" />
            <Button label="Submit" icon="pi pi-check" iconPos="right" />
        </div>
    );
}
