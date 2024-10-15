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
    GET_ATTRIBUTE_META,
    GET_DEVICE_WHITELIST,
    GET_NAS_ATTRIBUTE_GROUP,
    GET_NAS_WHITELIST,
    GET_PARAMETER_META,
    GET_PLAN_ATTRIBUTES,
    GET_PLAN_PARAMETERS,
    GET_PLANS,
    GET_PROFILE_META,
    GET_PROFILE_OVERRIDE_AVPs,
    GET_STATE,
    GET_SUBSCRIBER_ATTRIBUTE,
    GET_SUBSCRIBER_AVPS,
    GET_SUBSCRIBER_BY_ID,
    GET_SUBSCRIBER_PARAMETER,
    UPDATE_SUBSCRIBER,
    UPDATE_SUBSCRIBER_PARAMETERS
} from "../graphql/queries";
import {useLazyQuery, useMutation} from "@apollo/client";
import {InputIcon} from "primereact/inputicon";
import {IconField} from "primereact/iconfield";
import {ProgressSpinner} from "primereact/progressspinner";
import {
    IAttributeGroup,
    IAttributeMeta,
    IDeviceWhitelist,
    INasWhitelist,
    IParameterMeta,
    IPlan,
    IPlanAttribute,
    IPlanParameter,
    IProfile,
    IProfileSubscribeOverrideAVP,
    IState,
    ISubscriber,
    ISubscriberAttribute,
    ISubscriberAVP,
    ISubscriberParameter,
    OperationEnum,
    StatusEnum,
    TypeEnum
} from "../interface/data";
import {DataTable} from "primereact/datatable";
import {Card} from "primereact/card";
import {Column} from "primereact/column";
import {InputSwitch} from "primereact/inputswitch";
import {Messages} from "primereact/messages";
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog';
import {Toast} from 'primereact/toast';
import AppHeader from "../Components/header/AppHeader";

const ManageSubscriber: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useRef<any>(null);
    const stepperRef: any = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeStep, setActiveStep] = useState<boolean>(true);
    const [localNasWhitelist, setLocalNasWhitelist] = useState<INasWhitelist[]>([]);
    const [subscriberId, setSubscriberId] = useState<number>(0);
    const [localAttributes, setLocalAttributes] = useState<IPlanAttribute[]>([]);
    const [localParameters, setLocalParameters] = useState<IPlanParameter[]>([]);
    const [localProfileSubscriberOverrideAvps, setLocalProfileSubscriberOverrideAvps] = useState<IProfileSubscribeOverrideAVP[]>([]);
    const [planId, setPlanId] = useState<number>(0);
    const [localDeviceWhitelist, setLocalDeviceWhitelist] = useState<IDeviceWhitelist[]>([]);
    const [localSubscriberAVP, setLocalSubscriberAVP] = useState<ISubscriberAVP[]>([]);
    const [localSubscriberAttribute, setLocalSubscriberAttribute] = useState<ISubscriberAttribute[]>([]);
    const [localSubscriberParameter, setLocalSubscriberParameter] = useState<ISubscriberParameter[]>([]);
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
        pofileOverrideSubscriberAVPs: [],
        subscriberAttributes: [],
        subscriberParameters: []
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

    const [getProfileMeta, {loading: loadingProfileMeta, data: profileMeta}] = useLazyQuery(GET_PROFILE_META, {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });

    const [getAttributeMeta, {loading: loadingAttributeMeta, data: attributeMeta}] = useLazyQuery(GET_ATTRIBUTE_META, {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });

    const [getParameterMeta, {loading: loadingParameterMeta, data: parameterMeta}] = useLazyQuery(GET_PARAMETER_META, {
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

    const [getSubscriberAVPs, {data: subscriberAVPs}] = useLazyQuery(GET_SUBSCRIBER_AVPS, {
        notifyOnNetworkStatusChange: true,
        variables: {subscriberId: subscriberId},
        fetchPolicy: 'network-only'
    });

    const [getDeviceWhitelist, {data: deviceWhitelist}] = useLazyQuery(GET_DEVICE_WHITELIST, {
        notifyOnNetworkStatusChange: true,
        variables: {subscriberId: subscriberId},
        fetchPolicy: 'network-only'
    });

    const [getPlanAttribute, {data: attributes}] = useLazyQuery(GET_PLAN_ATTRIBUTES, {
        variables: {subscriberId: subscriberId, planId: formData.planId},
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });

    const [getPlanParameter, {data: parameters}] = useLazyQuery(GET_PLAN_PARAMETERS, {
        variables: {subscriberId: subscriberId, planId: formData.planId},
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });

    const [getSubscriberAttribute, {data: subscriberAttribute}] = useLazyQuery(GET_SUBSCRIBER_ATTRIBUTE, {
        variables: {subscriberId: subscriberId},
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });

    const [getSubscriberParameter, {data: subscriberParameter}] = useLazyQuery(GET_SUBSCRIBER_PARAMETER, {
        variables: {subscriberId: subscriberId},
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

    const [getProfileOverrideAVPs, {data: profileOverrideSubscriberAVPs, refetch:refetchProfileAVPs}] = useLazyQuery(GET_PROFILE_OVERRIDE_AVPs, {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only'
    });
    const [applyPlan] = useMutation(APPLY_PLAN, {
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
        loading: updateSubscriberParametersLoader,
        data: updateSubscriberParametersSuccess
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
        getProfileMeta()
        getAttributeMeta();
        getParameterMeta();
    }, [getPlan, getState, getProfileMeta]);


    useEffect(() => {
        if (subId) {
            const id = Number.parseInt(subId);
            setSubscriberId(id);
            getSubscriberById({variables: {subscriberId: id}}).then((response) => {
                getProfileOverrideAVPs({
                    variables: {
                        subscriberId: id,
                        planId: response.data.getSubscriberById?.planId
                    }
                });
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
                getSubscriberAttribute({
                    variables: {
                        subscriberId: id
                    }
                });
                getSubscriberParameter({
                    variables: {
                        subscriberId: id
                    }
                });
            });
            getNasWhiteList({variables: {subscriberId: id}});
            getDeviceWhitelist({variables: {subscriberId: id}});
            getSubscriberAVPs({variables: {subscriberId: id}});

        }
    }, [subId, getSubscriberById, getNasWhiteList, getDeviceWhitelist, getSubscriberAttribute, getAttributeMeta, getParameterMeta, getSubscriberParameter, getSubscriberAVPs]);


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

    const attributeMetaOption = attributeMeta?.getAttributeMeta?.map((attribute: IAttributeMeta) => ({
        label: attribute.attribute,
        value: attribute.attribute
    }));

    const parameterMetaOption = parameterMeta?.getParameterMeta?.map((parameter: IParameterMeta) => ({
        label: parameter.parameter,
        value: parameter.parameter
    }));

    const profileMetaOption = profileMeta?.getProfileMeta?.map((profile: IProfile) => ({
        label: profile.profile,
        value: profile.profile
    }));

    const rejectOnFailureOptions = [{label: "True", value: 1}, {label: "False", value: 2}]

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
        if (subscriberAVPs?.getSubscriberAVPs) {
            setLocalSubscriberAVP(subscriberAVPs.getSubscriberAVPs);
        }
    }, [subscriberAVPs]);


    useEffect(() => {
        if (deviceWhitelist?.getDeviceWhitelist) {
            setLocalDeviceWhitelist(deviceWhitelist?.getDeviceWhitelist);
        }
    }, [deviceWhitelist])

    useEffect(() => {
        if (subscriberAttribute?.getSubscriberAttribute) {
            setLocalSubscriberAttribute(subscriberAttribute?.getSubscriberAttribute);
        }
    }, [subscriberAttribute])

    useEffect(() => {
        if (subscriberParameter?.getSubscriberParameter) {
            setLocalSubscriberParameter(subscriberParameter?.getSubscriberParameter);
        }
    }, [subscriberParameter])


    useEffect(() => {
        if (profileOverrideSubscriberAVPs?.getProfileOverrideSubscriberAVPs) {
            setLocalProfileSubscriberOverrideAvps(profileOverrideSubscriberAVPs?.getProfileOverrideSubscriberAVPs);
        }
    }, [profileOverrideSubscriberAVPs])

    useEffect(() => {
        if (subscriberAttribute?.getSubscriberAttribute) {
            setLocalSubscriberAttribute(subscriberAttribute?.getSubscriberAttribute);
        }
    }, [subscriberAttribute])


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

    const applySelectedPlan = (e: any) => {
        handleInputChange(e, 'planId');
        const selectedPlan: IPlan = plans?.getPlans.find((plan: IPlan) => plan.planId === e.value);
        if (selectedPlan) {
            setPlanId(selectedPlan.planId);
            applyPlan({
                variables: {subscriberId: subscriberId, planId: selectedPlan.planId, state: "ACTIVE"}
            }).then(() => {
                getPlanParameter({variables: {subscriberId: subscriberId, planId: selectedPlan.planId}});
                getPlanAttribute({variables: {subscriberId: subscriberId, planId: selectedPlan.planId}});
                refetchProfileAVPs();
            }).catch((error) => console.error(error));
        }
    };

    const accept = (e: any) => {
        toast.current.show({
            severity: 'info',
            summary: 'Apply',
            detail: `${plans?.getPlans?.filter((plan: IPlan) => plan.planId === formData.planId)?.[0]?.planName}`,
            life: 3000
        });
        applySelectedPlan(e);
    };

    const reject = () => {
    };

    const allowToPlanChange = (e: any) => {
        confirmDialog({
            message: 'Are you sure you want to proceed? \n When proceed, all plan related parameter will be reset',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept: () => accept(e),
            reject
        });
    };

    const handleChangePlan = (e: any) => {
        if (formData.planId !== undefined) {
            allowToPlanChange(e);
        } else {
            applySelectedPlan(e);
        }
    };


    const handlingSubscriberSave = useCallback(() => {
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
                    closable: false
                }
            ]);
        }
    }, [createSubscriberError])

    useEffect(() => {
        if (createSubscriberSuccess !== undefined) {
            if (createSubscriberSuccess?.createSubscriber?.responseCode === 3) {
                setActiveStep(false);
                toast.current.show({
                    severity: 'info',
                    summary: 'Success',
                    detail: `Subscriber has been created!!!`,
                    life: 3000
                });
                setSubscriberId(createSubscriberSuccess?.createSubscriber?.subscriberId)
                setTimeout(() => {
                    stepperRef.current.nextCallback()
                }, 1000)
            }
        }
    }, [createSubscriberSuccess])


    useEffect(() => {
        if (updateSubscriberParametersSuccess !== undefined) {
            if (updateSubscriberParametersSuccess?.updateSubscriberParameters?.responseCode === 11) {
                toast.current.show({
                    severity: 'info',
                    summary: 'Success',
                    detail: `Subscriber has been updated!!!`,
                    life: 3000
                });
                setTimeout(() => {
                    navigate("/view-subscribers", {replace: true})
                }, 2000)
            }
        }
    }, [updateSubscriberParametersSuccess])


    useEffect(() => {
        if (updateSubscriberError !== undefined) {

            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Failed operation !!!`,
                life: 3000
            });

        }
    }, [updateSubscriberError])


    useEffect(() => {
        if (updateSubscriberSuccess !== undefined) {
            if (updateSubscriberSuccess?.updateSubscriber?.responseCode === 4) {
                stepperRef.current.nextCallback();
                setActiveStep(false);
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
            subscriberAttributes: localSubscriberAttribute,
            subscriberParameters: localSubscriberParameter
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

    const handleAddSubscriberAttribute = () => {
        setLocalSubscriberAttribute((attribute) => [...attribute, {
            id: generateID(),
            attributeName: "",
            attributeValue: ""
        }])
        console.log(localSubscriberAttribute)
    }

    const handleAddSubscriberParameter = () => {
        setLocalSubscriberParameter((parameter) => [...parameter, {
            id: generateID(),
            parameterName: "",
            parameterValue: "",
            rejectOnFailure: 0
        }])
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

    const onUpdateSubscriberAttribute = (value: any, editAttribute: ISubscriberAttribute, field: any) => {
        setLocalSubscriberAttribute((pervAttr) => {
            const updateAttribute = pervAttr.map((attribute) =>
                attribute.id === editAttribute.id
                    ? {...attribute, [field]: value}
                    : attribute
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                subscriberAttributes: updateAttribute,
            }));
            return updateAttribute;
        });

    };

    const onUpdateSubscriberParameter = (value: any, editParameter: ISubscriberParameter, field: any) => {
        setLocalSubscriberParameter((pervPara) => {
            const updateParameter = pervPara.map((parameter) =>
                parameter.id === editParameter.id
                    ? {...parameter, [field]: value}
                    : parameter
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                subscriberParameters: updateParameter,
            }));
            return updateParameter;
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

    const SubscriberAttributeValue = (attribute: ISubscriberAttribute) => (
        <InputText
            onChange={(e) => onUpdateSubscriberAttribute(e.target.value, attribute, "attributeValue")}
            value={attribute.attributeValue}
            placeholder={"Value"}
            size="small"
        />
    );


    const SubscriberParameterValue = (parameter: ISubscriberParameter) => (
        <InputText
            onChange={(e) => onUpdateSubscriberParameter(e.target.value, parameter, "parameterValue")}
            value={parameter.parameterValue}
            placeholder={"Value"}
            size="small"
        />
    );

    const SubscriberAttributeName = (attribute: ISubscriberAttribute) => (
        <Dropdown
            id="attributeName"
            loading={loadingAttributeMeta}
            value={attribute.attributeName}
            options={attributeMetaOption}
            onChange={(e) => {
                onUpdateSubscriberAttribute(e.value, attribute, "attributeName");
            }}
            placeholder="Select Attribute"
        />
    );

    const SubscriberParameterRejectOnFailure = (parameter: ISubscriberParameter) => (
        <Dropdown
            id="rejectOnFailure"
            value={parameter.rejectOnFailure}
            options={rejectOnFailureOptions}
            onChange={(e) => {
                onUpdateSubscriberParameter(e.value, parameter, "rejectOnFailure");
            }}
            placeholder="Select Action"
        />
    );

    const SubscriberParameterName = (parameter: ISubscriberParameter) => (
        <Dropdown
            id="parameterName"
            loading={loadingParameterMeta}
            value={parameter.parameterName}
            options={parameterMetaOption}
            onChange={(e) => {
                onUpdateSubscriberParameter(e.value, parameter, "parameterName");
            }}
            placeholder="Select Parameter"
        />
    );


    const SubscriberAttributeButtons = (rowData: ISubscriberAttribute) => {
        return (
            <div className="flex items-center gap-2">
                <Button
                    icon="pi pi-trash"
                    aria-label="Delete"
                    onClick={() => {
                        setLocalSubscriberAttribute((prevAttribute) => {
                            const updatedAttributeList = prevAttribute.filter((att) => att.id !== rowData.id);
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                subscriberAttributes: updatedAttributeList,
                            }));
                            return updatedAttributeList;
                        });
                    }}
                    className="p-button-rounded p-button-danger"
                />
            </div>
        );
    };

    const SubscriberParameterButtons = (rowData: ISubscriberParameter) => {
        return (
            <div className="flex items-center gap-2">
                <Button
                    icon="pi pi-trash"
                    aria-label="Delete"
                    onClick={() => {
                        setLocalSubscriberParameter((prevParameter) => {
                            const updatedParameterList = prevParameter.filter((parameter) => parameter.id !== rowData.id);
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                subscriberParameters: updatedParameterList,
                            }));
                            return updatedParameterList;
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
            planId: planId,
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
        <Dropdown
            loading={loadingProfileMeta}
            id="overrideKey"
            value={data.overrideKey}
            options={profileMetaOption ?? []}
            onChange={(e) => {
                onUpdateProfileOverride(e.value, data, "overrideKey");
            }}
            placeholder="Select Override Key"
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
            <div className="card justify-content-center w-full h-full">
                <Toast ref={toast}  appendTo={"self"} />
                <ConfirmDialog/>
                <AppHeader title={"Manage Subscriber"}/>

                <div style={{
                    marginTop: 150,
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    justifyContent: 'center',
                    height: "100%",
                    left: 0,
                    right: 0
                }} className={'absolute'}>
                    <div style={{width: "80%"}}>
                        <Messages ref={msgs}/>
                        <Stepper ref={stepperRef}>
                            <StepperPanel header="Basic Details">
                                {createSubscriberLoader || updateSubscriberParametersLoader || updateSubscriberLoader || loadingSubscriber && (
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
                                                <div className="p-field" style={{marginRight: '1rem'}}>
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
                                            </div>

                                            <Card title="Description">
                                                <p className="m-0">{plans?.getPlans?.filter((plan: IPlan) => plan.planId === formData.planId)?.[0]?.description}</p>
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
                                                    <DataTable value={localParameters ?? []} scrollable
                                                               scrollHeight="300px">
                                                        <Column field="parameterName"
                                                                header="Parameter Name"></Column>
                                                        <Column field="parameterValue"
                                                                header="Parameter Value"></Column>
                                                        <Column field="parameterOverrideValue"
                                                                body={ParameterOverrideValue}
                                                                header="Override Value"></Column>
                                                    </DataTable>
                                                </div>

                                                <div style={{flex: 1}}>
                                                    <h4>Attribute Overrides</h4>
                                                    <DataTable value={localAttributes ?? []} scrollable
                                                               scrollHeight="300px">
                                                        <Column field="attributeName"
                                                                header="Attribute Name"></Column>
                                                        <Column field="attributeValue"
                                                                header="Attribute Value"></Column>
                                                        <Column field="attributeOverrideValue"
                                                                body={AttributeOverrideValue}
                                                                header="Override Value"></Column>
                                                    </DataTable>
                                                </div>
                                            </div>
                                        </div>
                                    </TabPanel>
                                    <TabPanel header="Parameters & Attributes">
                                        <div className="card">
                                            <div style={{
                                                display: 'flex',
                                                gap: '2rem',
                                                justifyContent: 'space-between',
                                                flexWrap: 'wrap'
                                            }}>
                                                <div style={{flex: 1}}>
                                                    <h4>Subscriber Attributes</h4>
                                                    <div
                                                        className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                                        <Button onClick={handleAddSubscriberAttribute}>Add
                                                            Attribute</Button>
                                                    </div>
                                                    <DataTable value={localSubscriberAttribute ?? []} scrollable
                                                               scrollHeight="300px">
                                                        <Column field="attributeName" body={SubscriberAttributeName}
                                                                header="Attribute Name"></Column>
                                                        <Column field="attributeValue" header="Attribute Value"
                                                                body={SubscriberAttributeValue}></Column>
                                                        <Column header="Actions"
                                                                body={SubscriberAttributeButtons}></Column>
                                                    </DataTable>
                                                </div>

                                                <div style={{flex: 1}}>
                                                    <h4>Subscriber Parameters</h4>
                                                    <div
                                                        className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                                        <Button onClick={handleAddSubscriberParameter}>Add
                                                            Parameter</Button>
                                                    </div>
                                                    <DataTable value={localSubscriberParameter ?? []} scrollable
                                                               scrollHeight="300px">
                                                        <Column field="parameterName" body={SubscriberParameterName}
                                                                header="Parameter Name"></Column>
                                                        <Column field="parameterValue" header="Parameter Value"
                                                                body={SubscriberParameterValue}></Column>

                                                        <Column field="rejectOnFailure" header="Reject On Failure"
                                                                body={SubscriberParameterRejectOnFailure}></Column>

                                                        <Column header="Actions"
                                                                body={SubscriberParameterButtons}></Column>
                                                    </DataTable>
                                                </div>


                                            </div>
                                        </div>
                                    </TabPanel>
                                    <TabPanel header="NAS Whitelist">
                                        <div style={{flex: 1}}>
                                            <div
                                                className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
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
                                            <div
                                                className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
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
                                            <div
                                                className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                                <Button onClick={handleAddAVP}>Add AVP</Button>
                                            </div>

                                            <DataTable value={localSubscriberAVP ?? []}>
                                                <Column field={"attribute"} header="Attribute"
                                                        body={Attribute}></Column>
                                                <Column field={"attributeGroup"} header="NAS Attribute Group"
                                                        body={NasAttributeGroup}></Column>
                                                <Column field={"operation"} header="Operation"
                                                        body={Operation}></Column>
                                                <Column field={"value"} header="Value" body={Value}></Column>
                                                <Column field={"status"} header="Status"
                                                        body={SubscriberAVPState}></Column>
                                                <Column header="Action" body={ActionAVPsButtons}></Column>
                                            </DataTable>
                                        </div>
                                    </TabPanel>

                                    <TabPanel header="Profile Overrides">
                                        <div style={{flex: 1}}>
                                            <div
                                                className={"flex w-full bg-gray-200 p-2 rounded-lg justify-content-end"}>
                                                <Button onClick={addProfileOverride}>Add Profile Override</Button>
                                            </div>
                                            <DataTable value={localProfileSubscriberOverrideAvps ?? []}>
                                                <Column field={"overrideKey"} body={OverrideKey}
                                                        header="Override Key"></Column>
                                                <Column field={"overrideValue"} header="Override Value"
                                                        body={OverrideValue}></Column>
                                                <Column field={"overrideWhen"} header="Override When"
                                                        body={ProfileState}></Column>
                                                <Column header="Action" body={ActionProfileOverrideButtons}></Column>
                                            </DataTable>
                                        </div>
                                    </TabPanel>
                                    {/*<TabPanel header="Links"></TabPanel>*/}


                                </TabView>
                            </StepperPanel>
                        </Stepper>
                        <div className="flex pt-4" style={{
                            bottom: 0,
                            left: 0,
                            right: 0,
                            position: 'fixed',
                            width: '100%',
                            height: 80,
                            backdropFilter: 'blur(10px)',
                            background: 'linear-gradient(139deg, rgba(255,255,255,1) 12%, rgba(175,223,255,0.1) 90%)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            borderTop: 'solid 1px #8dd1ff',
                            justifyContent: 'space-between'
                        }}>

                            <div style={{
                                width: '100%',
                                gap: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: '80px',
                                justifyContent: 'start',
                                paddingBottom: '20px',
                            }}>
                                <p style={{fontSize:12, color: "gray", fontFamily:'ubuntu'}}>3A Web console | Copyright 2024</p>
                            </div>
                            <div style={{
                                alignItems: 'center',
                                width: '100%',
                                gap: '10px',
                                display: 'flex',
                                paddingRight: '80px',
                                paddingBottom: '20px',
                                justifyContent: 'end'

                            }}>
                                <Button label="Back" severity="secondary" icon="pi pi-arrow-left"
                                        onClick={() => {
                                            setActiveStep(true);
                                            if (stepperRef.current?.getActiveStep() === 0) {
                                                navigate("/view-subscribers", {replace: true});
                                            } else {
                                                stepperRef.current.prevCallback()
                                            }
                                        }}/>
                                {activeStep &&
                                    <Button label="Next" icon="pi pi-arrow-right" severity="secondary" iconPos="right"
                                            onClick={handlingSubscriberSave}/>}

                                <Button label="Save" severity="secondary" icon="pi pi-save"
                                        onClick={() => {
                                            if (stepperRef.current?.getActiveStep() === 0) {
                                                handlingSubscriberSave();
                                            } else {
                                                    handleUpdateSubscriber();
                                            }
                                        }}/>
                            </div>
                        </div>
                    </div>

                </div>


            </div>

        </React.Fragment>
    );
};

export default ManageSubscriber;
