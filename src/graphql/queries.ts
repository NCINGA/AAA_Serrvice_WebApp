import {gql} from '@apollo/client';


export const GET_SUBSCRIBERS = gql`
    query GetSubscribers($page: Int!, $size: Int!) {
        getSubscribersByPage(page: $page, size: $size) {
            page
            size
            totalElements
            content {
                subscriberId
                username
                status
                contactNo
                email
                extId
                createdDate
                updatedTime
                realm
                type
                password
            }
        }
    }
`;


export const CREATE_NEW_SUBSCRIBER = gql`
    mutation CreateSubscriber(
        $username: String
        $password: String
        $email: String
        $status: String
        $contactNo: String
        $extId: String
        $realm: String
        $type: String
        $planParameterOverrides: [PlanParameterInput]
        $planAttributeOverrides: [PlanAttributeInput]
        $nasWhitelist: [NasWhitelistInput]
        $deviceWhitelist: [DeviceWhitelistInput]
        $subscriberAVPs: [SubscriberAVPInput]
        $pofileOverrideSubscriberAVPs: [ProfileOverrideSubscriberAVPsInput]
    ) {
        createSubscriber(
            subscriber: {
                username: $username
                password: $password
                status: $status
                contactNo: $contactNo
                email: $email
                extId: $extId
                realm: $realm
                type: $type
                nasWhitelist: $nasWhitelist
                planParameterOverrides: $planParameterOverrides
                planAttributeOverrides: $planAttributeOverrides
                pofileOverrideSubscriberAVPs: $pofileOverrideSubscriberAVPs
                deviceWhitelist: $deviceWhitelist
                subscriberAVPs: $subscriberAVPs
            }
        )
    }
`;
export const UPDATE_SUBSCRIBER_PARAMETERS = gql`
    mutation updateSubscriberParameters(
        $subscriberId: Int!,
        $planId: Int!,
        $subscriber: SubscriberInput
    ) {
        updateSubscriberParameters(
            subscriberId: $subscriberId,
            planId: $planId,
            subscriber: $subscriber
        )
    }
`;

export const APPLY_PLAN = gql`
    mutation applyPlan(
        $subscriberId: Int!,
        $planId: Int!,
        $state: String!
    ) {
        applyPlan(subscriberId: $subscriberId, planId:  $planId, state: $state)
    }
`;


export const GET_PLANS = gql`
    query GetPlans {
        getPlans
    }

`;

export const GET_PLAN_ATTRIBUTES = gql`
    query GetPlanAttribute($subscriberId: Int!, $planId: Int!) {
        getPlanAttribute(subscriberId: $subscriberId, planId: $planId) {
            overrideId
            planId
            attributeName
            attributeValue
            attributeOverrideValue
        }
    }

`;

export const GET_NAS_WHITELIST = gql`
    query GetNasWhiteList($subscriberId : Int!) {
        getNasWhiteList(subscriberId: $subscriberId) {
            id
            subscriberId
            nasIdPattern
        }
    }

`;

export const GET_DEVICE_WHITELIST = gql`
    query GetDeviceWhitelist($subscriberId : Int!) {
        getDeviceWhitelist(subscriberId: $subscriberId) {
            id
            subscriberId
            MACAddress
            description
            status
            createAt
        }
    }

`;


export const GET_PLAN_PARAMETERS = gql`
    query GetPlanAttribute($subscriberId: Int!, $planId: Int!) {
        getPlanParameter(subscriberId: $subscriberId, planId: $planId) {
            overrideId
            planId
            parameterName
            parameterValue
            parameterOverrideValue
        }
    }

`;

export const GET_NAS_ATTRIBUTE_GROUP = gql`
    query GetNasAttributeGroup {
        getNasAttributeGroup {
            id
            name
            description
        }
    }
`;

export const GET_STATE = gql`
    query GetState {
        getState {
            state
            description
            isAuthorized
        }
    }
`;
export const GET_PROFILE_OVERRIDE_AVPS = gql`
    query GetPlanAttribute($subscriberId: Int!, $planId: Int!) {
        getProfileOverrideSubscriberAVPs(subscriberId: $subscriberId, planId: $planId) {
            overrideId
            subscriberId
            planId
            overrideKey
            overrideValue
            overrideWhen
        }
    }

`;




