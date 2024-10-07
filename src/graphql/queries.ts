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
    mutation CreateSubscriber($username: String, $password: String, $email: String, $status: String, $contactNo: String, $extId: String, $realm: String, $type: String) {
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
            }
        )
    }
`;


export const GET_PLANS = gql`
    query GetPlans {
        getPlans
    }

`;

export const GET_PLAN_ATTRIBUTES = gql`
    query GetPlanAttribute($planId: Int!) {
        getPlanAttribute(planId: $planId) {
            id
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
    query GetPlanAttribute($planId: Int!) {
        getPlanParameter(planId: $planId) {
            parameterId
            planId
            parameterName
            parameterValue
            rejectOnFailure
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




