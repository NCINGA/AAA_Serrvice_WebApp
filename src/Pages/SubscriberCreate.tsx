import React, {FC, useEffect, useState} from "react";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Divider} from "primereact/divider";
import {TabPanel, TabView} from "primereact/tabview";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {
    CREATE_NEW_SUBSCRIBER,
    GET_NAS_WHITELIST,
    GET_PLAN_ATTRIBUTES,
    GET_PLAN_PARAMETERS,
    GET_PLANS
} from "../graphql/queries";
import {useMutation, useQuery} from "@apollo/client";
import {IPlan} from "../interface/plan";
import {InputIcon} from "primereact/inputicon";
import {IconField} from "primereact/iconfield";
import {Card} from "primereact/card";
import {ProgressSpinner} from "primereact/progressspinner";
import * as localForage from "localforage";

const SubscriberCreate: FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [plan, setPlan] = useState<any>(null);
    const [localAttributes, setLocalAttributes] = useState([]);
    const [localParameters, setLocalParameters] = useState([]);
    const [localNasWhitelist, setLocalNasWhitelist] = useState([]);
    const [localDeviceWhitelist, setLocalDeviceWhitelist] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [subscriberId, setSubscriberId] = useState<number>(0);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        status: 'INACTIVE',
        contactNo: '',
        email: '',
        extId: '',
        realm: '',
        type: '',
        planId: ''
    });

    const {loading: loadingPlans, error: fetchPlanError, data: plans} = useQuery(GET_PLANS, {
        notifyOnNetworkStatusChange: true,
    });

    const {
        loading: loadingAttribute,
        error: fetchAttributeError,
        data: attributes,
        refetch: refechAttribute
    } = useQuery(GET_PLAN_ATTRIBUTES, {
        notifyOnNetworkStatusChange: true,
        variables: {planId: formData.planId}
    });

    const {
        loading: loadingParameters,
        error: fetchParametersError,
        data: parameters,
        refetch: refechParameters
    } = useQuery(GET_PLAN_PARAMETERS, {
        notifyOnNetworkStatusChange: true,
        variables: {planId: formData.planId}
    });

    const {
        loading: loadingNasWhitelist,
        error: fetchNasWhitelistError,
        data: nasWhitelist,
        refetch: refetchNasWhitelist,
    } = useQuery(GET_NAS_WHITELIST, {
        notifyOnNetworkStatusChange: true,
        variables: {subscriberId: subscriberId}
    });

    const [createSubscriber, {
        loading: createSubscriberLoder,
        error: createSubscriberError,
        data: createSubscriberSuccess
    }] = useMutation(CREATE_NEW_SUBSCRIBER, {
        notifyOnNetworkStatusChange: true,
        onCompleted: async (data) => {
            const subscriberId = data.createSubscriber.subscriberId;
            setSubscriberId(subscriberId)
            try {
                await localForage.setItem('subscriberId', subscriberId);
            } catch (error) {
                console.error('Error saving to localForage:', error);
            }

        },
    });


    useEffect(() => {
        if (attributes?.getPlanAttribute) {
            setLocalAttributes(attributes.getPlanAttribute);
        }
    }, [attributes]);


    useEffect(() => {
        if (parameters?.getPlanParameter) {
            setLocalParameters(parameters.getPlanParameter);
        }
    }, [parameters]);

    useEffect(() => {
        if (nasWhitelist?.getNasWhiteList) {
            setLocalNasWhitelist(nasWhitelist.getNasWhiteList);
        }
    }, [nasWhitelist]);


    const onUpdatePlanOverrideSubscriber = (value, editAttribute) => {
        const updatedAttributes = localAttributes?.map((attribute) =>
            attribute.id === editAttribute.id
                ? {...attribute, attributeOverrideValue: value}
                : attribute
        );
        setLocalAttributes(updatedAttributes);
    };

    const onUpdatePlanParameterSubscriber = (value, editParameter) => {
        const updatedParameter = localParameters?.map((parameter) =>
            parameter.parameterId === editParameter.parameterId
                ? {...parameter, parameterOverrideValue: value}
                : parameter
        );
        setLocalParameters(updatedParameter);
    };

    const onUpdateNasPattern = (value, editNasPattern) => {
        const updateNasPattern = localNasWhitelist?.map((pattern) =>
            pattern.id === editNasPattern.id
                ? {...pattern, nasIdPattern: value}
                : pattern
        );
        setLocalNasWhitelist(updateNasPattern);
    };

    const planOptions = plans?.getPlans?.map((plan: IPlan) => ({
        label: plan?.planName,
        value: plan?.planId,
        decs: plan?.description
    }));


    const statusOptions = [
        {label: 'Active', value: 'ACTIVE'},
        {label: 'Inactive', value: 'INACTIVE'},
    ];
    const typeOptions = [
        {label: 'PPPoE', value: 'PPPoE'},
        {label: 'Other', value: 'Other'},
    ];

    const handleInputChange = (e, field) => {
        const value = e.target ? e.target.value : e.value;
        setFormData({...formData, [field]: value});
    };

    const handleSubmit = () => {
        console.log("Form Data: ", formData);
        createSubscriber({
            variables: formData,
        })
            .then(response => {
                console.log('Subscriber created successfully:', response.data);
            })
            .catch(err => {
                console.error('Error creating subscriber:', err);
            });
    };

    const handleTabChange = async (e) => {
        setActiveIndex(e.index);
        try {
            const subscriberId: number = await localForage.getItem("subscriberId");
            if (e.index === 2 && subscriberId) {
                setSubscriberId(subscriberId);
                refetchNasWhitelist();
            }
        } catch (error) {
            console.error('Error getting subscriber ID from localForage:', error);
        }

    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    const AttributeOverrideValue = (data) => (
        <InputText
            onChange={(e) => onUpdatePlanOverrideSubscriber(e.target.value, data)}
            value={data?.attributeOverrideValue}
            placeholder={"Value not set"}
            variant="outlined"
            size="small"
        />
    );


    const NasIdPatternValue = (data) => (
        <InputText
            onChange={(e) => onUpdateNasPattern(e.target.value, data)}
            value={data?.nasIdPattern}
            placeholder={"Pattern"}
            variant="outlined"
            size="small"
        />
    );


    const ParameterOverrideValue = (data) => (
        <InputText
            onChange={(e) => onUpdatePlanParameterSubscriber(e.target.value, data)}
            value={data?.parameterOverrideValue}
            placeholder={"Value not set"}
            variant="outlined"
            size="small"
        />
    );

    const handleAddNas = () => {
        setLocalNasWhitelist((nas) => [...nas, {id: localNasWhitelist.length + 1}])
    }


    const ActionButtons = (rowData: any) => {
        return (
            <div className="flex items-center gap-2">
                <Button
                    icon="pi pi-trash"
                    aria-label="Delete"
                    onClick={() => {
                        const nasList = [...localNasWhitelist];
                        const index = nasList.findIndex((nas) => nas.id === rowData.id);
                        if (index > -1) {
                            nasList.splice(index, 1);
                            setLocalNasWhitelist(nasList);
                        }
                    }}
                    className="p-button-rounded p-button-danger"
                />
            </div>
        );
    };

    return (
        <React.Fragment>
            <div>

                {createSubscriberLoder && <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(5px)',
                    position: 'absolute',
                    top: '0px',
                    bottom: '0px',
                    left: '0px',
                    right: '0px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="2" animationDuration=".5s"/>
                </div>}
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

                    <TabView onTabChange={handleTabChange} activeIndex={activeIndex}>
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
                                            loading={loadingPlans}
                                            id="type"
                                            value={formData.planId}
                                            options={planOptions}
                                            onChange={(e) => {
                                                handleInputChange(e, 'planId');
                                                const plan = plans?.getPlans?.filter((plan: IPlan) => plan.planId == e.target.value)?.[0];
                                                setPlan(plan);
                                                refechAttribute


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
                                        <DataTable value={localParameters ?? []}>
                                            <Column field="parameterName" header="Parameter Name"></Column>
                                            <Column field="parameterValue" header="Parameter Value"></Column>
                                            <Column field="OverrideValue" body={ParameterOverrideValue}
                                                    header="Override Value"></Column>
                                            <Column field="rejectOnFailure" header="Reject On Failure"></Column>
                                        </DataTable>
                                    </div>

                                    <div style={{flex: 1}}>
                                        <h4>Attribute Overrides</h4>
                                        <DataTable value={localAttributes ?? []}>
                                            <Column field="attributeName" header="Attribute Name"></Column>
                                            <Column field="attributeValue" header=" Attribute Value"></Column>
                                            <Column field="attributeOverrideValue" header="Override Value"
                                                    body={AttributeOverrideValue}></Column>
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
                            <div style={{flex: 1}}>
                                <div className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                    <Button onClick={handleAddNas}>Add NAS</Button>
                                </div>

                                <DataTable value={localNasWhitelist ?? []}>
                                    <Column field="nasIdPattern" header="NAS ID Pattern"
                                            body={NasIdPatternValue}></Column>
                                    <Column field="nasIdPattern" header="Action"
                                            body={ActionButtons}></Column>
                                </DataTable>
                            </div>
                        </TabPanel>
                        <TabPanel header="Device Whitelist">
                            <div style={{flex: 1}}>
                                <div className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                    <Button onClick={handleAddNas}>Add Device</Button>
                                </div>

                                <DataTable value={localDeviceWhitelist ?? []}>

                                    <Column field="nasIdPattern" header="Action"
                                            body={ActionButtons}></Column>
                                </DataTable>
                            </div>

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
