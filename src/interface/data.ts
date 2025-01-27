export interface IAVP {
    id: number;
    avpName: string;
    status: string;
    overrideEnabled: number;
    avpValue: string;
    includeWhen: string;
}

export interface IProfile {
    id: number;
    profile: string;
    profileId: number;
    avpProfile: IAVP[];
    description: string;
    profileKey: string; // Optional, if applicable
}




export interface IProfilenas{
    profileId?: number | null | undefined;
    attributeGroup?: number | null | undefined;
    profileKey?: number | null | undefined;
    description?: number | null | undefined;
    groupname?: number | null | undefined;
}

// export interface IProfile {
//     profileId?: number | null | undefined;
//     profileKey?: number | null ;
//     description?: string;
//     attributeGroup?: number | null;
// }


export interface IPlanProfile {

    profileId: number;
    attributeGroup?: number;
    profileKey?: string;
    description?: string;
    state?: string;
  }


export interface IPlan {
    planId?: number | null | undefined;
    typeId?: number | null;
    type?: string;
    planName?: string;
    description?: string;
    planProfiles?: IPlanProfile[];
    planParameters?: IPlanParameter[] | any;
}

export interface INas {
    nas_id?: number | null | undefined;
    nas_name?: string;
    nas_type?: string;
    nas_secret?: string;
    coa_port?: number | null;
    nas_attrgroup?: number | null;
}

export interface IPlanAttribute {
    overrideId: number;
    attributeName?: string;
    attributeOverrideValue?: string;
    attributeValue?: string;
    id?: number;
    planId?: number;
}

export interface IPlanParameter {
    overrideId: number;
    parameterName?: string;
    parameterOverrideValue?: string;
    parameterValue?: string;
    id?: number;
    planId?: number;
}

export interface INasWhitelist {
    id: number;
    subscriberId?: number;
    nasIdPattern?: string;
}

export interface IDeviceWhitelist {
    id: number;
    subscriberId?: number;
    MACAddress?: string;
    description?: string;
    status?: string;
    createAt?: string;
}

export interface IAttributeGroup {
    id?: number;
    name?: string;
    description?: string;
}

export interface ISubscriberAVP {
    id: number;
    attribute?: string;
    subscriberId?: number;
    attributeGroupId?: number;
    operation?: OperationEnum;
    value?: string;
    status?: string;
}

export interface IPlanProfile {
    id: number;
    plan_id: number;
    profile_id: number;
    status: string;
}

export enum OperationEnum {
    CHECK = 'CHECK',
    REPLY = 'REPLY'
}

export enum StatusEnum {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export enum TypeEnum {
    PoPEE = 'PoPEE',
    OTHER = 'OTHER'
}

export interface IProfileSubscribeOverrideAVP {
    overrideId: number;
    subscriberId?: number
    planId?: number
    overrideKey?: string
    overrideValue?: string
    overrideWhen?: string
}

export interface ISubscriber {
    subscriberId?: number | null | undefined;
    username?: string;
    password?: string;
    status?: StatusEnum | null;
    contactNo?: string;
    email?: string;
    extId?: string;
    realm?: string;
    type?: TypeEnum | null;
    planId?: number | null;
    planParameterOverrides?: IPlanParameter[];
    planAttributeOverrides?: IPlanAttribute[];
    nasWhitelist?: INasWhitelist[];
    deviceWhitelist?: IDeviceWhitelist[];
    subscriberAVPs?: ISubscriberAVP[];
    pofileOverrideSubscriberAVPs?: IProfileSubscribeOverrideAVP[];
    subscriberAttributes?: ISubscriberAttribute[];
    subscriberParameters?: ISubscriberParameter[];
}

export interface IPlanInfo {
    planId: number;
    planAttributes: IPlanAttribute[] | undefined;
    planParameter: IPlanParameter[] | undefined;
}

export interface IState {
    state?: string
    description?: string
    isAuthorized?: number
}

export interface ISubscriberAttribute {
    id: number;
    subscriberId?: number;
    attributeName?: string
    attributeValue?: string
}

export interface ISubscriberParameter {
    id: number;
    subscriberId?: number;
    parameterName?: string
    parameterValue?: string
    rejectOnFailure?: number
}


export interface IAttributeMeta {
    id?: number
    attribute?: string
}

export interface IParameterMeta {
    id?: number
    parameter?: string
}
// export interface IProfile {
//     id?: number
//     profile?: string
// }

export interface IProfileMapping {
    profileId?: number;
    status: String;
}


export interface IPlanMappingProfile{
    planId: number;
    profiles: IProfileMapping[]
}

export interface IParameterMapping{
    parameterName?: String;
    parameterValue?: String;
    value: string;
    parameter: string;
}

export interface IPlanMappingParameter{
    planId: number;
    parameters: IParameterMapping[]
}

