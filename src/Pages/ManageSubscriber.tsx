import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Divider} from "primereact/divider";
import {TabPanel, TabView} from "primereact/tabview";
import {Stepper} from 'primereact/stepper';
import {useLocation, useNavigate} from "react-router-dom"
import {StepperPanel} from 'primereact/stepperpanel';
import {
    APPLY_PLAN,
    CREATE_NEW_SUBSCRIBER,
    GET_DEVICE_WHITELIST,
    GET_NAS_ATTRIBUTE_GROUP,
    GET_NAS_WHITELIST,
    GET_PLAN_ATTRIBUTES,
    GET_PLAN_PARAMETERS,
    GET_PLANS,
    GET_PROFILE_OVERRIDE_AVPs,
    GET_STATE,
    GET_SUBSCRIBER_BY_ID,
    UPDATE_SUBSCRIBER,
    UPDATE_SUBSCRIBER_PARAMETERS
} from "../graphql/queries";
import {useLazyQuery, useMutation} from "@apollo/client";
import {InputIcon} from "primereact/inputicon";
import {IconField} from "primereact/iconfield";
import {ProgressSpinner} from "primereact/progressspinner";
import {
    IAttributeGroup,
    IDeviceWhitelist,
    INasWhitelist,
    IPlan,
    IPlanAttribute,
    IPlanParameter,
    IProfileSubscribeOverrideAVP,
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
import {Messages} from "primereact/messages";

const ManageSubscriber: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const stepperRef: any = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [localNasWhitelist, setLocalNasWhitelist] = useState<INasWhitelist[]>([]);
    const [subscriberId, setSubscriberId] = useState<number>(0);
    const [localAttributes, setLocalAttributes] = useState<IPlanAttribute[]>([]);
    const [localParameters, setLocalParameters] = useState<IPlanParameter[]>([]);
    const [localProfileSubscriberOverrideAvps, setLocalProfileSubscriberOverrideAvps] = useState<IProfileSubscribeOverrideAVP[]>([]);
    const [planId, setPlanId] = useState<number>(0);
    const [localDeviceWhitelist, setLocalDeviceWhitelist] = useState<IDeviceWhitelist[]>([]);
    const [localSubscriberAVP, setLocalSubscriberAVP] = useState<ISubscriberAVP[]>([]);
    const [planData, setPlanData] = useState<IPlan>(null);
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
        subscriberAVPs: [],
        pofileOverrideSubscriberAVPs: []
    });
    const msgs: any = useRef(null);

    const getQueryParams = (search: any) => {
        return new URLSearchParams(search);
    };

    const queryParams = getQueryParams(location.search);
    const subId = queryParams.get('subscriber');
    const mode = queryParams.get('mode');

    const [getState, {loading: loadingState, data: state}] = useLazyQuery(GET_STATE, {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });

    const [getSubscriberById, {loading: loadingSubscriber, data: subscriber}] = useLazyQuery(GET_SUBSCRIBER_BY_ID, {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: "network-only",
        onCompleted: () => {

        },
        onError: (error) => {
            console.log(error)
        }
    });

    const [getPlan, {loading: loadingPlans, data: plans}] = useLazyQuery(GET_PLANS, {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: "network-only",
        onCompleted: () => {
            if (mode === "edit") {
                // getPlanParameter();
                // getPlanAttribute();
            }
        },
        onError: (error) => {
            console.log(error)
        }
    });

    const [getNasWhiteList, {data: nasWhitelist}] = useLazyQuery(GET_NAS_WHITELIST, {
        notifyOnNetworkStatusChange: true,
        variables: {subscriberId: subscriberId},
        fetchPolicy: 'network-only'
    });

    const [getDeviceWhitelist, {data: deviceWhitelist}] = useLazyQuery(GET_DEVICE_WHITELIST, {
        notifyOnNetworkStatusChange: true,
        variables: {subscriberId: subscriberId},
        fetchPolicy: 'network-only'
    });

    const [getPlanAttribute, {data: attributes, refetch: refetchPlanAttribute}] = useLazyQuery(GET_PLAN_ATTRIBUTES, {
        variables: {subscriberId: subscriberId, planId: formData.planId},
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });

    const [getPlanParameter, {data: parameters, refetch: refetchPlanParameter}] = useLazyQuery(GET_PLAN_PARAMETERS, {
        variables: {subscriberId: subscriberId, planId: formData.planId},
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });

    const [getNASAttribute, {
        loading: loadingNASAttributeGroup,
        data: nasAttributeGroup
    }] = useLazyQuery(GET_NAS_ATTRIBUTE_GROUP, {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });

    const [getProfileOverrideAVPs, {data: profileOverrideSubscriberAVPs}] = useLazyQuery(GET_PROFILE_OVERRIDE_AVPs, {
        notifyOnNetworkStatusChange: true,
        variables: {subscriberId: subscriberId, planId: formData.planId},
        fetchPolicy: 'network-only'
    });
    const [applyPlan, {data: applyPlanSuccess}] = useMutation(APPLY_PLAN, {
            notifyOnNetworkStatusChange: true,
        }
    );

    const [createSubscriber, {
        loading: createSubscriberLoader,
        error: createSubscriberError,
        data: createSubscriberSuccess
    }] = useMutation(
        CREATE_NEW_SUBSCRIBER,
        {
            notifyOnNetworkStatusChange: true,
        }
    );

    const [updateSubscriber, {
        loading: updateSubscriberLoader,
        error: updateSubscriberError,
        data: updateSubscriberSuccess
    }] = useMutation(
        UPDATE_SUBSCRIBER,
        {
            notifyOnNetworkStatusChange: true,
        }
    );


    const [updateSubscriberParameters, {
        loading: updateSubscriberParametersLoader
    }] = useMutation(
        UPDATE_SUBSCRIBER_PARAMETERS,
        {
            notifyOnNetworkStatusChange: true,
        }
    );


    useEffect(() => {
        getPlan();
        getState();
        getNASAttribute();
        getProfileOverrideAVPs()
    }, [getPlan, getState, getProfileOverrideAVPs]);

    useEffect(() => {
        if (subId) {
            const id = Number.parseInt(subId);
            setSubscriberId(id);
            getSubscriberById({variables: {subscriberId: id}}).then((response) => {
                getPlanParameter({
                    variables: {
                        subscriberId: id,
                        planId: response.data.getSubscriberById?.planId
                    }
                });
                getPlanAttribute({
                    variables: {
                        subscriberId: id,
                        planId: response.data.getSubscriberById?.planId
                    }
                });
            });
            getNasWhiteList({variables: {subscriberId: id}});
            getDeviceWhitelist({variables: {subscriberId: id}});
        }
    }, [subId, getSubscriberById, getNasWhiteList, getDeviceWhitelist]);


    useEffect(() => {
        setFormData({
            ...formData,
            username: subscriber?.getSubscriberById?.username,
            password: subscriber?.getSubscriberById?.password,
            status: subscriber?.getSubscriberById?.status,
            contactNo: subscriber?.getSubscriberById?.contactNo,
            email: subscriber?.getSubscriberById?.email,
            extId: subscriber?.getSubscriberById?.extId,
            realm: subscriber?.getSubscriberById?.realm,
            type: subscriber?.getSubscriberById?.type,
            planId: subscriber?.getSubscriberById?.planId
        });


    }, [subscriber]);

    const statusOptions = Object.values(StatusEnum).map((value: string) => ({
        label: value,
        value: value,
    }));

    const typeOptions = Object.values(TypeEnum).map((value: string) => ({
        label: value,
        value: value,
    }));



    const planOptions = plans?.getPlans?.map((plan: IPlan) => ({
        label: plan?.planName,
        value: plan?.planId,
        description: plan?.description
    }));


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


    useEffect(() => {
        if (profileOverrideSubscriberAVPs?.getProfileOverrideSubscriberAVPs) {
            setLocalProfileSubscriberOverrideAvps(profileOverrideSubscriberAVPs?.getProfileOverrideSubscriberAVPs);
        }
    }, [profileOverrideSubscriberAVPs])


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
                attribute.overrideId === editAttribute.overrideId
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
                parameter.overrideId === editParameter.overrideId
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
            key={data.parameterName}
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


    const handleChangePlan = (e: any) => {
        handleInputChange(e, 'planId');
        const selectedPlan: IPlan = plans?.getPlans.find((plan: IPlan) => plan.planId === e.value);
        setPlanId(selectedPlan.planId as Number);
        setPlanData(selectedPlan);
        applyPlan({
            variables: {subscriberId: subscriberId, planId: selectedPlan.planId, state: "ACTIVE"}
        }).then((response) => {
            getPlanParameter({subscriberId: subscriberId, planId: selectedPlan.planId});
            getPlanAttribute({subscriberId: subscriberId, planId: selectedPlan.planId});
        }).catch((error) => console.error(error));

    }

    const handlingSubscriberSave = useCallback(() => {
        msgs.current.clear();
        if (mode === "edit") {
            updateSubscriber({
                variables: {subscriberId: subscriberId, subscriber: formData},
            })
                .then((response) => {
                    console.log("Subscriber update successfully:", response);
                })
                .catch((err) => {
                    console.error("Error creating subscriber:", err);
                });
        } else {
            createSubscriber({
                variables: formData,
            })
                .then((response) => {
                    console.log("Subscriber created successfully:", response);
                })
                .catch((err) => {
                    console.error("Error creating subscriber:", err);
                });
        }
    }, [formData, createSubscriber, updateSubscriber]);


    useEffect(() => {
        if (createSubscriberError?.graphQLErrors?.[0]?.message !== undefined) {
            msgs.current.show([
                {
                    severity: 'error',
                    summary: 'Error',
                    detail: createSubscriberError?.graphQLErrors?.[0]?.message ?? "",
                    sticky: true,
                    closable: false
                }
            ]);
        }
    }, [createSubscriberError])

    useEffect(() => {
        if (createSubscriberSuccess !== undefined) {
            if (createSubscriberSuccess?.createSubscriber?.responseCode === 3) {
                msgs.current.show([
                    {
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Subscriber created successfully',
                        sticky: true,
                        closable: false
                    }
                ]);
                setSubscriberId(createSubscriberSuccess?.createSubscriber?.subscriberId)
                setTimeout(() => {
                    stepperRef.current.nextCallback()
                }, 2000)
            }
        }
    }, [createSubscriberSuccess])

    useEffect(() => {
        if (updateSubscriberSuccess !== undefined) {
            if (updateSubscriberSuccess?.updateSubscriber?.responseCode === 4) {
                msgs.current.show([
                    {
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Subscriber updated successfully',
                        sticky: true,
                        closable: false
                    }
                ]);
                setTimeout(() => {
                    stepperRef.current.nextCallback()
                }, 2000)
            }
        }
    }, [updateSubscriberSuccess])

    const handleInputChange = useCallback((e: any, field: any) => {
        const value = e.target ? e.target.value : e.value;
        setFormData((prevData) => ({...prevData, [field]: value}));
    }, []);


    const handleUpdateSubscriber = useCallback(() => {
        const updatedFormData = {
            ...formData,
            planAttributeOverrides: localAttributes,
            planParameterOverrides: localParameters,
            subscriberAVPs: localSubscriberAVP,
            nasWhitelist: localNasWhitelist,
            pofileOverrideSubscriberAVPs: localProfileSubscriberOverrideAvps,
            deviceWhitelist: localDeviceWhitelist,
        };

        updateSubscriberParameters({
            variables: {
                subscriberId: subscriberId,
                planId: formData.planId,
                subscriber: updatedFormData,
            },
        })
            .then(() => {
            })
            .catch((err) => {
                console.error("Error updating subscriber:", err);
            });

    }, [
        updateSubscriberParameters,
        formData,
        localAttributes,
        localParameters,
        localSubscriberAVP,
        localNasWhitelist,
        localProfileSubscriberOverrideAvps,
        localDeviceWhitelist,
        subscriberId
    ]);


    const handleTabChange = useCallback(
        async (e: any) => {
            setActiveIndex(e.index);
        },
        []
    );

    const generateID = (): number => {
        return Math.floor(Math.random() * 10000);
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

    const DeviceStatus = (data: any) => (
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
                subscriberAVPs: updateAvps,
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
                                subscriberAVPs: updatedAvpList,
                            }));
                            return updatedAvpList;
                        });
                    }}
                    className="p-button-rounded p-button-danger"
                />
            </div>
        );
    };


    const ActionProfileOverrideButtons = (rowData: IProfileSubscribeOverrideAVP) => {
        return (
            <div className="flex items-center gap-2">
                <Button
                    icon="pi pi-trash"
                    aria-label="Delete"
                    onClick={() => {
                        setLocalProfileSubscriberOverrideAvps((prevProfileOverride) => {
                            const updatedProfileList = prevProfileOverride.filter((profile) => profile.overrideId !== rowData.overrideId);
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                pofileOverrideSubscriberAVPs: updatedProfileList,
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
        setLocalProfileSubscriberOverrideAvps((override) => [...override, {
            overrideId: generateID(),
            subscriberId: subscriberId,
            planId: Number.parseInt(planId as string),
            overrideKey: "",
            overrideValue: "",
            overrideWhen: ""
        }]);
    };

    const onUpdateProfileOverride = (value: any, editProfileOverride: IProfileSubscribeOverrideAVP, field: string) => {
        setLocalProfileSubscriberOverrideAvps((prevOverride) => {
            const updateProfileOverrideKey = prevOverride.map((overrideProfile) =>
                overrideProfile.overrideId === editProfileOverride.overrideId
                    ? {...overrideProfile, [field]: value}
                    : overrideProfile
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                pofileOverrideSubscriberAVPs: updateProfileOverrideKey,
            }));
            return updateProfileOverrideKey;
        });

    };


    const OverrideKey = (data: IProfileSubscribeOverrideAVP) => (
        <InputText
            onChange={(e) => onUpdateProfileOverride(e.target.value, data, "overrideKey")}
            value={data.overrideKey}
            placeholder={"Override Key"}
            size="small"
        />
    );

    const OverrideValue = (data: IProfileSubscribeOverrideAVP) => (
        <InputText
            onChange={(e) => onUpdateProfileOverride(e.target.value, data, "overrideValue")}
            value={data.overrideValue ?? ""}
            placeholder={"Override Key"}
            size="small"
        />
    );

    const ProfileState = (rowData: IProfileSubscribeOverrideAVP) => (
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

    const SubscriberAVPState = (rowData: ISubscriberAVP) => (
        <Dropdown
            loading={loadingState}
            id="state"
            value={rowData.status ?? ""}
            options={stateOptions ?? []}
            onChange={(e) => {
                onUpdateAVPs(e.value, rowData, "status");
            }}
            placeholder="Select State"
        />
    );


    return (
        <React.Fragment>
            <div className="card justify-content-center w-full h-full mt-2">
                <h1>Subscriber Create</h1>
                <Messages ref={msgs}/>
                <div style={{ flexBasis: '100%' }}>
                <Stepper ref={stepperRef}>
                    <StepperPanel header="Basic Details">
                        {createSubscriberLoader || updateSubscriberParametersLoader || updateSubscriberLoader && (
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
                                <ProgressSpinner style={{width: "50px", height: "50px"}} strokeWidth="2"
                                                 animationDuration=".5s"/>
                            </div>
                        )}


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
                                    <InputText id="extId" value={formData.extId}
                                               onChange={(e) => handleInputChange(e, "extId")}/>
                                </div>
                                <div className="p-field">
                                    <label htmlFor="realm">Realm</label>
                                    <InputText id="realm" value={formData.realm}
                                               onChange={(e) => handleInputChange(e, "realm")}/>
                                </div>
                                <div className="p-field">
                                    <label htmlFor="type">Type</label>
                                    <Dropdown id="type" value={formData.type} options={typeOptions}
                                              onChange={(e) => handleInputChange(e, "type")}
                                              placeholder="Select a Type"/>
                                </div>
                            </div>
                        </div>

                        <div className="flex pt-4 justify-content-end">
                            <Button label="Next" icon="pi pi-arrow-right" iconPos="right"
                                    onClick={handlingSubscriberSave}/>
                        </div>
                    </StepperPanel>
                    <StepperPanel header="Parameter Details">
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
                                                onChange={handleChangePlan}
                                                placeholder="Select Plan"
                                            />
                                        </div>
                                        <Button label="Small" icon="pi pi-check" size="small" />
                                    </div>

                                    <Card title="Description">
                                        <p className="m-0">{planData?.description ?? ""}</p>
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
                                        <Column field={"status"} header="Status"
                                                body={SubscriberAVPState}></Column>
                                        <Column header="Action" body={ActionAVPsButtons}></Column>
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel header="Profile Overrides">
                                <div style={{flex: 1}}>
                                    <div className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                        <Button onClick={addProfileOverride}>Add Profile Override</Button>
                                    </div>
                                    <DataTable value={localProfileSubscriberOverrideAvps ?? []}>
                                        <Column field={"overrideKey"} body={OverrideKey} header="Override Key"></Column>
                                        <Column field={"overrideValue"} header="Override Value"
                                                body={OverrideValue}></Column>
                                        <Column field={"overrideWhen"} header="Override When"
                                                body={ProfileState}></Column>
                                        <Column header="Action" body={ActionProfileOverrideButtons}></Column>
                                    </DataTable>
                                </div>
                            </TabPanel>
                            <TabPanel header="Links"></TabPanel>


                        </TabView>


                        <div className="flex pt-4 justify-content-between">
                            <Button label="Back" severity="secondary" icon="pi pi-arrow-left"
                                    onClick={() => stepperRef.current.prevCallback()}/>
                            {/*<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={() => stepperRef.current.nextCallback()} />*/}
                            {activeIndex === 6 &&
                                <Button label="Save" icon="pi pi-check" onClick={handleUpdateSubscriber}
                                        className="p-button-success"/>}
                        </div>
                    </StepperPanel>
                </Stepper>
                </div>
            </div>

        </React.Fragment>
    );
};

export default ManageSubscriber;
