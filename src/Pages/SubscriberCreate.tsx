import React, {FC, useState} from "react";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Divider} from "primereact/divider";
import {TabPanel, TabView} from "primereact/tabview";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {GET_PLANS} from "../graphql/queries";
import {useQuery} from "@apollo/client";
import {IPlan} from "../interface/plan";
import {InputIcon} from "primereact/inputicon";
import {IconField} from "primereact/iconfield";
import {Card} from "primereact/card";

const SubscriberCreate: FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [plan, setPlan] = useState<any>(null);
    const [products, setProducts] = useState([
        {code: "001", name: "Test", category: "Test", quantity: 1455}
    ]);
    const {loading, error, data} = useQuery(GET_PLANS, {
        notifyOnNetworkStatusChange: true,
    });
    const planOptions = data?.getPlans?.map((plan: IPlan) => ({
        label: plan?.planName,
        value: plan?.planId,
        decs: plan?.description
    }));


    const [formData, setFormData] = useState({
        username: '',
        password: '',
        status: null,
        contactNo: '',
        email: '',
        extId: '',
        realm: '',
        type: '',
        planId: ''
    });

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
    ];
    const typeOptions = [
        { label: 'PPPoE', value: 'PPPoE' },
        { label: 'Other', value: 'Other' },
    ];

    const handleInputChange = (e, field) => {
        const value = e.target ? e.target.value : e.value;
        setFormData({...formData, [field]: value});
    };

    const handleSubmit = () => {
        console.log("Form Data: ", formData);
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    return (
        <React.Fragment>
            <div>
                <h1>Subscriber Create</h1>

                <div>
                    <div
                        className="p-fluid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            columnGap: '2rem',
                            rowGap: '1.5rem'
                        }}
                    >
                        <div className="p-field">
                            <label htmlFor="username">Username</label>
                            <InputText
                                id="username"
                                value={formData.username}
                                onChange={(e) => handleInputChange(e, 'username')}
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="password">Password</label>
                            <IconField>
                                <InputIcon onClick={togglePasswordVisibility}
                                           className={`pi ${showPassword ? 'pi-eye' : 'pi-eye-slash'}`}> </InputIcon>
                                <InputText
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange(e, 'password')}
                                />
                            </IconField>
                        </div>


                        <div className="p-field">
                            <label htmlFor="status">Status</label>
                            <Dropdown
                                id="status"
                                value={formData.status}
                                options={statusOptions}
                                onChange={(e) => handleInputChange(e, 'status')}
                                placeholder="Select a Status"
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="contactNo">Contact No</label>
                            <InputText
                                id="contactNo"
                                value={formData.contactNo}
                                onChange={(e) => handleInputChange(e, 'contactNo')}
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="email">Email</label>
                            <InputText
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange(e, 'email')}
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="extId">External ID</label>
                            <InputText
                                id="extId"
                                value={formData.extId}
                                onChange={(e) => handleInputChange(e, 'extId')}
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="realm">Realm</label>
                            <InputText
                                id="realm"
                                value={formData.realm}
                                onChange={(e) => handleInputChange(e, 'realm')}
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="type">Type</label>
                            <Dropdown
                                id="type"
                                value={formData.type}
                                options={typeOptions}
                                onChange={(e) => handleInputChange(e, 'type')}
                                placeholder="Select a Type"
                            />
                        </div>
                    </div>
                    <Divider />

                    <TabView>
                        <TabPanel header="Plan Information">
                            <div>
                                <div
                                    className="p-fluid"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        columnGap: '2rem',
                                        rowGap: '1.5rem'
                                    }}
                                >
                                    <div className="p-field">
                                        <label htmlFor="type">Plan</label>
                                        <Dropdown
                                            loading={loading}
                                            id="type"
                                            value={formData.planId}
                                            options={planOptions}
                                            onChange={(e) => {
                                                handleInputChange(e, 'planId');
                                                const plan = data?.getPlans?.filter((plan: IPlan) => plan.planId == e.target.value)?.[0];
                                                setPlan(plan);


                                            }}
                                            placeholder="Select Plan"
                                        />
                                    </div>

                                </div>

                                <Card title="Description">
                                    <p className="m-0">
                                        {plan?.description ?? ""}
                                    </p>
                                </Card>

                                <Divider/>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '2rem',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h4>Parameter Overrides</h4>
                                        <DataTable value={products} >
                                            <Column field="parameterName" header="Parameter Name"></Column>
                                            <Column field="value" header="Value"></Column>
                                            <Column field="OverrideValue" header="Override Value"></Column>
                                        </DataTable>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h4>Attribute Overrides</h4>
                                        <DataTable value={products}>
                                            <Column field="parameterName" header="Parameter Name"></Column>
                                            <Column field="value" header="Value"></Column>
                                            <Column field="OverrideValue" header="Override Value"></Column>
                                        </DataTable>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel header="Parameters & Attributes">
                            <div className="card">

                            </div>
                        </TabPanel>
                        <TabPanel header="NAS Whitelist">

                        </TabPanel>
                        <TabPanel header="Device Whitelist">

                        </TabPanel>
                        <TabPanel header="Attribute Value Pair">

                        </TabPanel>
                        <TabPanel header="Profile Overrides">

                        </TabPanel>
                        <TabPanel header="Links">

                        </TabPanel>
                    </TabView>





                    <Button
                        label="Save"
                        icon="pi pi-check"
                        onClick={handleSubmit}
                        className="p-button-success"
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export default SubscriberCreate;
