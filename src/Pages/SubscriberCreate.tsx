import React, {FC, useCallback, useEffect, useState} from "react";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Divider} from "primereact/divider";
import {TabPanel, TabView} from "primereact/tabview";
import {
    CREATE_NEW_SUBSCRIBER,
    GET_DEVICE_WHITELIST,
    GET_NAS_ATTRIBUTE_GROUP,
    GET_NAS_WHITELIST,
    GET_PLAN_ATTRIBUTES,
    GET_PLAN_PARAMETERS,
    GET_PLANS,
    GET_STATE
} from "../graphql/queries";
import {useMutation, useQuery} from "@apollo/client";
import {InputIcon} from "primereact/inputicon";
import {IconField} from "primereact/iconfield";
import {ProgressSpinner} from "primereact/progressspinner";
import * as localForage from "localforage";
import {
    IAttributeGroup,
    IDeviceWhitelist,
    INasWhitelist,
    IPlan,
    IPlanAttribute,
    IPlanInfo,
    IPlanParameter,
    IProfileOverride,
    IState,
    ISubscriber,
    ISubscriberAVP,
    OperationEnum,
    StatusEnum,
    TypeEnum
} from "../interface/data";
import {DataTable} from "primereact/datatable";
import {Card} from "primereact/card";
import {Column} from "primereact/column";
import {InputSwitch} from "primereact/inputswitch";

const SubscriberCreate: FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [localNasWhitelist, setLocalNasWhitelist] = useState<INasWhitelist[]>([]);
    const [subscriberId, setSubscriberId] = useState<number>(0);
    const [localAttributes, setLocalAttributes] = useState<IPlanAttribute[]>([]);
    const [localParameters, setLocalParameters] = useState<IPlanParameter[]>([]);
    const [localProfileOverrides, setLocalProfileOverrides] = useState<IProfileOverride[]>([]);
    const [plan, setPlan] = useState<IPlan | null>(null);
    const [localDeviceWhitelist, setLocalDeviceWhitelist] = useState<IDeviceWhitelist[]>([]);
    const [localSubscriberAVP, setLocalSubscriberAVP] = useState<ISubscriberAVP[]>([]);
    const [formData, setFormData] = useState<ISubscriber>({
        username: "",
        password: "",
        status: null,
        contactNo: "",
        email: "",
        extId: "",
        realm: "",
        type: null,
        planId: null,
        planParameterOverrides: [],
        planAttributeOverrides: [],
        nasWhitelist: [],
        deviceWhitelist: [],
        subscriberAVPS: [],
        profileOverrides: []
    });

    const statusOptions = Object.values(StatusEnum).map((value: string) => ({
        label: value,
        value: value,
    }));

    const typeOptions = Object.values(TypeEnum).map((value: string) => ({
        label: value,
        value: value,
    }));

    //loading plan
    const {loading: loadingPlans, data: plans} = useQuery(GET_PLANS, {
        notifyOnNetworkStatusChange: true,
    });

    const planOptions = plans?.getPlans?.map((plan: IPlan) => ({
        label: plan?.planName,
        value: plan?.planId,
        description: plan?.description
    }));

    const {data: attributes} = useQuery(GET_PLAN_ATTRIBUTES, {
        skip: !formData.planId,
        variables: {planId: formData.planId},
        notifyOnNetworkStatusChange: true,
    });

    const {data: parameters} = useQuery(GET_PLAN_PARAMETERS, {
        skip: !formData.planId,
        variables: {planId: formData.planId},
        notifyOnNetworkStatusChange: true,
    });


    const {
        loading: loadingDeviceWhitelist,
        error: fetchDeviceWhitelistError,
        data: deviceWhitelist,
        refetch: refetchDeviceWhitelist,
    } = useQuery(GET_DEVICE_WHITELIST, {
        notifyOnNetworkStatusChange: true,
        variables: {subscriberId: 4},
    });

    //fetch NAS Whitlelist
    const {
        loading: loadingNasWhitelist,
        error: fetchNasWhitelistError,
        data: nasWhitelist,
        refetch: refetchNasWhitelist,
    } = useQuery(GET_NAS_WHITELIST, {
        notifyOnNetworkStatusChange: true,
        variables: {subscriberId: 1}
    });
//fetch attribute group
    const {
        loading: loadingNASAttributeGroup,
        error: fetchNasAttributeGroupError,
        data: nasAttributeGroup,
        refetch: refetchNASAttributeGroup
    } = useQuery(GET_NAS_ATTRIBUTE_GROUP, {
        notifyOnNetworkStatusChange: true
    });
//fetchState
    const {
        loading: loadingState,
        error: fetchStateError,
        data: state,
    } = useQuery(GET_STATE, {
        notifyOnNetworkStatusChange: true
    });


    const stateOptions = state?.getState?.map((state: IState) => ({
        label: state.state,
        value: state.state
    }));


    const nasAttributeGroupOption = nasAttributeGroup?.getNasAttributeGroup?.map((group: IAttributeGroup) => ({
        label: group.name,
        value: group.id
    }));

    const operationOption = Object.values(OperationEnum).map((value: string) => ({
        label: value,
        value: value
    }));


    //set local state


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


    useEffect(() => {
        if (deviceWhitelist?.getDeviceWhitelist) {
            setLocalDeviceWhitelist(deviceWhitelist?.getDeviceWhitelist);
        }
    }, [deviceWhitelist])


    const onUpdateNasPattern = (value: any, editNasPattern: INasWhitelist) => {
        setLocalNasWhitelist((prevNas) => {
            const updateNasPattern = prevNas.map((nas) =>
                nas.id === editNasPattern.id
                    ? {...nas, nasIdPattern: value}
                    : nas
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                nasWhitelist: updateNasPattern,
            }));
            return updateNasPattern;
        });
    };


    const onUpdatePlanOverrideSubscriber = (value: any, editAttribute: IPlanAttribute, field: any) => {
        setLocalAttributes((prevAttributes) => {
            const updatePlanAttribute = prevAttributes.map((attribute) =>
                attribute.id === editAttribute.id
                    ? {...attribute, [field]: value}
                    : attribute
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                planAttributeOverrides: updatePlanAttribute,
            }));
            return updatePlanAttribute;
        });
    };

    const onUpdatePlanParameterSubscriber = (value: any, editParameter: IPlanParameter, field: any) => {
        setLocalParameters((prevParameters) => {
            const updatedParameters = prevParameters.map((parameter) =>
                parameter.parameterId === editParameter.parameterId
                    ? {...parameter, [field]: value}
                    : parameter
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                planParameterOverrides: updatedParameters,
            }));
            return updatedParameters;
        });
    };
    const AttributeOverrideValue = (data: IPlanAttribute) => (
        <InputText
            onChange={(e) => onUpdatePlanOverrideSubscriber(e.target.value, data, "attributeOverrideValue")}
            value={data?.attributeOverrideValue ?? ""}
            placeholder={"Value not set"}
            variant="outlined"
            size="small"
        />
    );

    const ParameterOverrideValue = (data: IPlanParameter) => (
        <InputText
            onChange={(e) => onUpdatePlanParameterSubscriber(e.target.value, data, "parameterOverrideValue")}
            value={data?.parameterOverrideValue ?? ""}
            placeholder={"Value not set"}
            variant="outlined"
            size="small"
        />
    );


    const NasIdPatternValue = (data: INasWhitelist) => (
        <InputText
            onChange={(e) => onUpdateNasPattern(e.target.value, data)}
            value={data.nasIdPattern}
            placeholder={"Pattern"}
            variant="outlined"
            size="small"
        />
    );

    const NasActionButtons = (rowData: INasWhitelist) => {
        return (
            <div className="flex items-center gap-2">
                <Button
                    icon="pi pi-trash"
                    aria-label="Delete"
                    onClick={() => {
                        setLocalNasWhitelist((prevNas) => {
                            const updatedNasList = prevNas.filter((nas) => nas.id !== rowData.id);
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                nasWhitelist: updatedNasList,
                            }));
                            return updatedNasList;
                        });
                    }}
                    className="p-button-rounded p-button-danger"
                />
            </div>
        );
    };

    const [createSubscriber, {
        loading: createSubscriberLoader,
        error: createSubscriberError,
        data: createSubscriberSuccess
    }] = useMutation(
        CREATE_NEW_SUBSCRIBER,
        {
            notifyOnNetworkStatusChange: true,
            onCompleted: async (data) => {
                const subscriberId = data.createSubscriber.subscriberId;
                setSubscriberId(subscriberId);
                try {
                    await localForage.setItem("subscriberId", subscriberId);
                } catch (error) {
                    console.error("Error saving to localForage:", error);
                }
            },
        }
    );

    const handleInputChange = useCallback((e, field) => {
        const value = e.target ? e.target.value : e.value;
        setFormData((prevData) => ({...prevData, [field]: value}));
    }, []);

    const handlePlanInfoChange = useCallback((planInfo: IPlanInfo) => {
        setFormData((prevData) => ({
            ...prevData,
            planId: planInfo.planId,
            planAttributeOverrides: planInfo.planAttributes,
            planParameterOverrides: planInfo.planParameter,
        }));

    }, []);

    const handleSubmit = useCallback(() => {
        formData.planAttributeOverrides = localAttributes;
        formData.planParameterOverrides = localParameters;
        formData.subscriberAVPS = localSubscriberAVP;
        formData.nasWhitelist = localNasWhitelist;
        formData.profileOverrides = localProfileOverrides;
        console.log(formData)


        // createSubscriber({
        //     variables: formData,
        // })
        //     .then((response) => {
        //         console.log("Subscriber created successfully:", response.data);
        //     })
        //     .catch((err) => {
        //         console.error("Error creating subscriber:", err);
        //     });
    }, [createSubscriber, formData]);

    const handleTabChange = useCallback(
        async (e) => {
            setActiveIndex(e.index);
        },
        []
    );

    const generateID = (): number => {
        return Math.random() * 10;
    }

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prevState) => !prevState);
    }, []);


    const handleAddNas = () => {
        setLocalNasWhitelist((nas) => [...nas, {id: generateID()}])
    }

    const handleAddDevice = () => {
        setLocalDeviceWhitelist((device) => [...device, {id: generateID(), status: "ACTIVE"}])
    }

    const DeviceStatus = (data) => (
        <InputSwitch checked={data?.status === "ACTIVE" ? true : false}
                     onChange={(e) => onUpdateDevice(e.value === true ? "ACTIVE" : "INACTIVE", data, "status")}/>
    );

    const onUpdateDevice = (value: any, editDevice: IDeviceWhitelist, field: any) => {
        setLocalDeviceWhitelist((prevDevices) => {
            const updateDevice = prevDevices.map((device) =>
                device.id === editDevice.id
                    ? {...device, [field]: value}
                    : device
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                deviceWhitelist: updateDevice,
            }));
            return updateDevice;
        });

    };

    const handleAddAVP = () => {
        setLocalSubscriberAVP((avp) => [...avp, {id: generateID()}]);
    };

    const onUpdateAVPs = (value: any, editAvp: ISubscriberAVP, field: string) => {
        setLocalSubscriberAVP((prevAvps) => {
            const updateAvps = prevAvps.map((avp) =>
                avp.id === editAvp.id
                    ? {...avp, [field]: value}
                    : avp
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                subscriberAVPS: updateAvps,
            }));
            return updateAvps;
        });

    };

    const DeviceActionButtons = (rowData: IDeviceWhitelist) => {
        return (
            <div className="flex items-center gap-2">
                <Button
                    icon="pi pi-trash"
                    aria-label="Delete"
                    onClick={() => {
                        setLocalDeviceWhitelist((prevDevice) => {
                            const updatedDeviceList = prevDevice.filter((device) => device.id !== rowData.id);
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                deviceWhitelist: updatedDeviceList,
                            }));
                            return updatedDeviceList;
                        });

                    }}
                    className="p-button-rounded p-button-danger"
                />
            </div>
        );
    };

    const DeviceDescription = (data: IDeviceWhitelist) => (
        <InputText
            onChange={(e) => onUpdateDevice(e.target.value, data, "description")}
            value={data.description}
            placeholder={"Value not set"}
            variant="outlined"
            size="small"
        />
    );

    const DeviceMacAddress = (data: IDeviceWhitelist) => (
        <InputText
            onChange={(e) => onUpdateDevice(e.target.value, data, "MACAddress")}
            value={data.MACAddress}
            placeholder={"Value not set"}
            variant="outlined"
            size="small"
        />
    );

    const Operation = (rowData: ISubscriberAVP) => (
        <Dropdown
            id="operation"
            value={rowData.operation}
            options={operationOption}
            onChange={(e) => {
                onUpdateAVPs(e.value, rowData, "operation");
            }}
            placeholder="Select Operation"
        />
    );

    const Attribute = (data: ISubscriberAVP) => (
        <InputText
            onChange={(e) => onUpdateAVPs(e.target.value, data, "attribute")}
            value={data.attribute}
            placeholder={"Attribute"}
            size="small"
        />
    );

    const NasAttributeGroup = (rowData: ISubscriberAVP) => (
        <Dropdown
            loading={loadingNASAttributeGroup}
            id="attributeGroup"
            value={rowData.attributeGroupId}
            options={nasAttributeGroupOption}
            onChange={(e) => {
                onUpdateAVPs(e.value, rowData, "attributeGroupId");
            }}
            placeholder="Select Attribute Group"
        />
    );

    const Value = (data: ISubscriberAVP) => (
        <InputText
            onChange={(e) => onUpdateAVPs(e.target.value, data, "value")}
            value={data.value}
            placeholder={"Value"}
            size="small"
        />
    );

    const ActionAVPsButtons = (rowData: IDeviceWhitelist) => {
        return (
            <div className="flex items-center gap-2">
                <Button
                    icon="pi pi-trash"
                    aria-label="Delete"
                    onClick={() => {
                        setLocalSubscriberAVP((prevAvp) => {
                            const updatedAvpList = prevAvp.filter((device) => device.id !== rowData.id);
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                subscriberAVPS: updatedAvpList,
                            }));
                            return updatedAvpList;
                        });
                    }}
                    className="p-button-rounded p-button-danger"
                />
            </div>
        );
    };


    const ActionProfileOverrideButtons = (rowData: IProfileOverride) => {
        return (
            <div className="flex items-center gap-2">
                <Button
                    icon="pi pi-trash"
                    aria-label="Delete"
                    onClick={() => {
                        setLocalProfileOverrides((prevProfileOverride) => {
                            const updatedProfileList = prevProfileOverride.filter((profile) => profile.overrideId !== rowData.overrideId);
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                profileOverrides: updatedProfileList,
                            }));
                            return updatedProfileList;
                        });
                    }}
                    className="p-button-rounded p-button-danger"
                />
            </div>
        );
    };

    const addProfileOverride = () => {
        setLocalProfileOverrides((override) => [...override, {
            overrideId: localProfileOverrides.length + 1,
            subscriberId: "",
            planId: "",
            overrideKey: "",
            overrideValue: "",
            overrideWhen: ""
        }]);
    };

    const onUpdateProfileOverride = (value: any, editProfileOverride: IProfileOverride, field: string) => {
        setLocalProfileOverrides((prevOverride) => {
            const updateProfileOverrideKey = prevOverride.map((overrideProfile) =>
                overrideProfile.overrideId === editProfileOverride.overrideId
                    ? {...overrideProfile, [field]: value}
                    : overrideProfile
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                profileOverrides: updateProfileOverrideKey,
            }));
            return updateProfileOverrideKey;
        });

    };


    const OverrideKey = (data: IProfileOverride) => (
        <InputText
            onChange={(e) => onUpdateProfileOverride(e.target.value, data, "overrideKey")}
            value={data.overrideKey}
            placeholder={"Override Key"}
            size="small"
        />
    );

    const OverrideValue = (data: IProfileOverride) => (
        <InputText
            onChange={(e) => onUpdateProfileOverride(e.target.value, data, "overrideValue")}
            value={data.overrideValue ?? ""}
            placeholder={"Override Key"}
            size="small"
        />
    );

    const ProfileState = (rowData: IProfileOverride) => (
        <Dropdown
            loading={loadingState}
            id="state"
            value={rowData.overrideWhen ?? ""}
            options={stateOptions ?? []}
            onChange={(e) => {
                onUpdateProfileOverride(e.value, rowData, "overrideWhen");
            }}
            placeholder="Select State"
        />
    );


    return (
        <React.Fragment>
            {createSubscriberLoader && (
                <div
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.4)",
                        backdropFilter: "blur(5px)",
                        position: "absolute",
                        top: "0px",
                        bottom: "0px",
                        left: "0px",
                        right: "0px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <ProgressSpinner style={{width: "50px", height: "50px"}} strokeWidth="2" animationDuration=".5s"/>
                </div>
            )}
            <h1>Subscriber Create</h1>
            <div>
                <div
                    className="p-fluid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        columnGap: "2rem",
                        rowGap: "1.5rem",
                    }}
                >
                    <div className="p-field">
                        <label htmlFor="username">Username</label>
                        <InputText id="username" value={formData.username}
                                   onChange={(e) => handleInputChange(e, "username")}/>
                    </div>

                    <div className="p-field">
                        <label htmlFor="password">Password</label>
                        <IconField>
                            <InputIcon onClick={togglePasswordVisibility}
                                       className={`pi ${showPassword ? "pi-eye" : "pi-eye-slash"}`}></InputIcon>
                            <InputText
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange(e, "password")}
                            />
                        </IconField>
                    </div>

                    <div className="p-field">
                        <label htmlFor="status">Status</label>
                        <Dropdown
                            id="status"
                            value={formData.status}
                            options={statusOptions}
                            onChange={(e) => handleInputChange(e, "status")}
                            placeholder="Select a Status"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="contactNo">Contact No</label>
                        <InputText id="contactNo" value={formData.contactNo}
                                   onChange={(e) => handleInputChange(e, "contactNo")}/>
                    </div>
                    <div className="p-field">
                        <label htmlFor="email">Email</label>
                        <InputText id="email" type="email" value={formData.email}
                                   onChange={(e) => handleInputChange(e, "email")}/>
                    </div>
                    <div className="p-field">
                        <label htmlFor="extId">External ID</label>
                        <InputText id="extId" value={formData.extId} onChange={(e) => handleInputChange(e, "extId")}/>
                    </div>
                    <div className="p-field">
                        <label htmlFor="realm">Realm</label>
                        <InputText id="realm" value={formData.realm} onChange={(e) => handleInputChange(e, "realm")}/>
                    </div>
                    <div className="p-field">
                        <label htmlFor="type">Type</label>
                        <Dropdown id="type" value={formData.type} options={typeOptions}
                                  onChange={(e) => handleInputChange(e, "type")} placeholder="Select a Type"/>
                    </div>
                </div>
                <Divider/>

                <TabView onTabChange={handleTabChange} activeIndex={activeIndex}>
                    <TabPanel header="Plan Information">
                        <div>
                            <div className="p-fluid"
                                 style={{
                                     display: 'grid',
                                     gridTemplateColumns: '1fr 1fr',
                                     columnGap: '2rem',
                                     rowGap: '1.5rem'
                                 }}>
                                <div className="p-field">
                                    <label htmlFor="type">Plan</label>
                                    <Dropdown
                                        loading={loadingPlans}
                                        id="type"
                                        value={formData.planId ?? ""}
                                        options={planOptions}
                                        onChange={(e) => {
                                            handleInputChange(e, 'planId');
                                            const selectedPlan = plans?.getPlans.find((plan: IPlan) => plan.planId === e.value);
                                            setPlan(selectedPlan || null);
                                        }}
                                        placeholder="Select Plan"
                                    />
                                </div>
                            </div>

                            <Card title="Description">
                                <p className="m-0">{plan?.description ?? ""}</p>
                            </Card>

                            <Divider/>
                            <div style={{
                                display: 'flex',
                                gap: '2rem',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{flex: 1}}>
                                    <h4>Parameter Overrides</h4>
                                    <DataTable value={localParameters ?? []}>
                                        <Column field="parameterName" header="Parameter Name"></Column>
                                        <Column field="parameterValue" header="Parameter Value"></Column>
                                        <Column field="parameterOverrideValue" body={ParameterOverrideValue}
                                                header="Override Value"></Column>
                                        <Column field="rejectOnFailure" header="Reject On Failure"></Column>
                                    </DataTable>
                                </div>

                                <div style={{flex: 1}}>
                                    <h4>Attribute Overrides</h4>
                                    <DataTable value={localAttributes ?? []}>
                                        <Column field="attributeName" header="Attribute Name"></Column>
                                        <Column field="attributeValue" header="Attribute Value"></Column>
                                        <Column field="attributeOverrideValue" body={AttributeOverrideValue}
                                                header="Override Value"></Column>
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="Parameters & Attributes">
                        <div className="card"></div>
                    </TabPanel>
                    <TabPanel header="NAS Whitelist">
                        <div style={{flex: 1}}>
                            <div className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                <Button onClick={handleAddNas}>Add NAS</Button>
                            </div>

                            <DataTable value={localNasWhitelist ?? []}>
                                <Column field="nasIdPattern" header="NAS ID Pattern"
                                        body={NasIdPatternValue}></Column>
                                <Column header="Action"
                                        body={NasActionButtons}></Column>
                            </DataTable>
                        </div>

                    </TabPanel>
                    <TabPanel header="Device Whitelist">
                        <div style={{flex: 1}}>
                            <div className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                <Button onClick={handleAddDevice}>Add Device</Button>
                            </div>

                            <DataTable value={localDeviceWhitelist ?? []}>
                                <Column field="MACAddress" header="MAC Address"
                                        body={DeviceMacAddress}></Column>

                                <Column field="description" header="Description"
                                        body={DeviceDescription}></Column>

                                <Column field="status" header="Status"
                                        body={DeviceStatus}></Column>

                                <Column header="Action"
                                        body={DeviceActionButtons}></Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel header="Attribute Value Pair">
                        <div style={{flex: 1}}>
                            <div className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                <Button onClick={handleAddAVP}>Add AVP</Button>
                            </div>

                            <DataTable value={localSubscriberAVP ?? []}>
                                <Column field={"attribute"} header="Attribute" body={Attribute}></Column>
                                <Column field={"attributeGroup"} header="NAS Attribute Group"
                                        body={NasAttributeGroup}></Column>
                                <Column field={"operation"} header="Operation" body={Operation}></Column>
                                <Column field={"value"} header="Value" body={Value}></Column>
                                <Column header="Action" body={ActionAVPsButtons}></Column>
                            </DataTable>
                        </div>
                    </TabPanel>

                    <TabPanel header="Profile Overrides">
                        <div style={{flex: 1}}>
                            <div className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                <Button onClick={addProfileOverride}>Add Profile Override</Button>
                            </div>
                            <DataTable value={localProfileOverrides ?? []}>
                                <Column field={"overrideKey"} body={OverrideKey} header="Override Key"></Column>
                                <Column field={"overrideValue"} header="Override Value" body={OverrideValue}></Column>
                                <Column field={"overrideWhen"} header="Override When" body={ProfileState}></Column>
                                <Column header="Action" body={ActionProfileOverrideButtons}></Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel header="Links"></TabPanel>


                </TabView>

                <Button label="Save" icon="pi pi-check" onClick={handleSubmit} className="p-button-success"/>
            </div>
        </React.Fragment>
    );
};

export default SubscriberCreate;
