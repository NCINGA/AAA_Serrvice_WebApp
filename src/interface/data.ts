export interface IPlan {
    planId?: string;
    planType?: string;
    planName?: string;
    description?: string;
}

export interface IPlanAttribute {
    attributeName?: string;
    attributeOverrideValue?: string;
    attributeValue?: string;
    id?: number;
    planId?: number;
}

export interface IPlanParameter {
    parameterId?: number;
    parameterName?: string;
    parameterOverrideValue?: string;
    parameterValue?: string;
    id?: number;
    planId?: number;
    rejectOnFailure?: number;
}

export interface INasWhitelist {
    id?: number;
    subscriberId?: number;
    nasIdPattern?: string;
}

export interface IDeviceWhitelist {
    id?: number;
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
    id?: number;
    attribute?: string;
    subscriberId?: number;
    attributeGroupId?: number;
    operation?: OperationEnum;
    value?: string;
    status?: string;
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

export interface IProfileOverride {
    overrideId?: number | string
    subscriberId?: number | string
    planId?: number | string
    overrideKey?: string
    overrideValue?: string
    overrideWhen?: string
}

export interface ISubscriber {
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
    subscriberAVPS?: ISubscriberAVP[];
    profileOverrides?: IProfileOverride[];
}

export interface IPlanInfo {
    planId: number | null | undefined;
    planAttributes: IPlanAttribute[] | undefined;
    planParameter: IPlanParameter[] | undefined;
}

export interface IState {
    state?: string
    description?: string
    isAuthorized?: number
}
