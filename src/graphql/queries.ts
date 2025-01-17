import { gql } from "@apollo/client";

export const GET_PLAN_PROFILES = gql`
  query GetPlanProfiles($planId: Int!) {
    getPlanProfiles(planId: $planId) {
      profileId
      attributeGroup
      profileKey
      description
      planId
      status
    }
  }
`;

export const GET_PLAN_DETAILS_BY_ID = gql`
  query getPlanDetailsById($planId: Int!) {
    getPlanDetailsById(planId: $planId) {
      planId
      profiles {
        profileId
        status
      }
      parameters {
        parameterId
        parameterName
        parameterValue
      }
    }
  }
`;



export const CREATE_PLAN_PROFILE = gql`
  mutation CreatePlanProfile($planProfilesInput: PlanProfilesInput!) {
    createPlanProfile(planProfilesInput: $planProfilesInput)
  }
`;

export const CREATE_PLAN_PARAMETER = gql`
  mutation CreatePlanParameter($planParametersInput: PlanParametersInput!) {
    createPlanParameter(planParametersInput: $planParametersInput)
  }
`;


export const GET_PROFILES = gql`
  query GetProfiles {
    getProfiles
  }
`;

export const GET_PLAN_TYPES = gql`
  query GetPlanTypes {
    getPlanTypes {
      typeId
      typeName
    }
  }
`;

export const GET_SUBSCRIBERS = gql`
  query GetSubscribers($page: Int!, $size: Int!) {
    getSubscribersByPage(page: $page, size: $size) {
      page
      size
      totalElements
      content {
        planId
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

export const UPDATE_SUBSCRIBER = gql`
  mutation UpdateSubscriber($subscriberId: Int!, $subscriber: SubscriberInput) {
    updateSubscriber(subscriberId: $subscriberId, subscriber: $subscriber)
  }
`;

export const DELETE_SUBSCRIBER = gql`
  mutation DeleteSubscriber($subscriberId: Int!) {
    deleteSubscriber(subscriberId: $subscriberId)
  }
`;

export const UPDATE_SUBSCRIBER_PARAMETERS = gql`
  mutation updateSubscriberParameters(
    $subscriberId: Int!
    $planId: Int!
    $subscriber: SubscriberInput
  ) {
    updateSubscriberParameters(
      subscriberId: $subscriberId
      planId: $planId
      subscriber: $subscriber
    )
  }
`;

export const UPDATE_PLAN_PARAMETERS = gql`
  mutation updatePlanParameters(
    
    $planId: Int
    $plan: PlanInput
  ) {
    updatePlanParameters(    
      planId: $planId
      plan: $plan
    )
  }
`;

export const APPLY_PLAN = gql`
  mutation applyPlan($subscriberId: Int!, $planId: Int!, $state: String!) {
    applyPlan(subscriberId: $subscriberId, planId: $planId, state: $state)
  }
`;



export const CREATE_PLANS = gql`
    mutation CreatePlan(
        $typeId: Int
        $planName: String
        $description: String
        $planProfile:[PlanProfilesInput]
        $planParameter:[PlanParametersInput]

    ) {
        createPlan(
            plan: {
                typeId: $typeId
                planName: $planName
                description: $description
                planProfile: $planProfile
                planParameter: $planParameter
            }
        )
    }
`;

export const GET_PLANS = gql`
  query GetPlans {
    getPlans
  }
`;

export const UPDATE_PLANS = gql`
  mutation UpdatePlan(
    $planId: Int!
    $typeId: Int
    $planName: String!
    $description: String!
  ) {
    updatePlan(
      planId: $planId
      plan: { typeId: $typeId, planName: $planName, description: $description }
    )
  }
`;
export const DELETE_PLANS = gql`
  mutation DeletePlan($planId: Int!) {
    deletePlan(planId: $planId)
  }
`;

export const GET_ATTRIBUTE_META = gql`
  query GetAttributeMeta {
    getAttributeMeta {
      id
      attribute
    }
  }
`;

export const GET_PLAN_ATTRIBUTE_META = gql`
  query GetPlanAttributeMeta {
    getPlanAttributeMeta {
      id
      attribute
    }
  }
`;

export const GET_PARAMETER_META = gql`
  query GetParameterMeta {
    getParameterMeta {
      id
      parameter
    }
  }
`;

export const GET_PROFILE_META = gql`
  query GetProfileMeta {
    getProfileMeta {
      id
      profile
    }
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
  query GetNasWhiteList($subscriberId: Int!) {
    getNasWhiteList(subscriberId: $subscriberId) {
      id
      subscriberId
      nasIdPattern
    }
  }
`;

export const GET_SUBSCRIBER_ATTRIBUTE = gql`
  query GetSubscriberAttribute($subscriberId: Int!) {
    getSubscriberAttribute(subscriberId: $subscriberId) {
      id
      subscriberId
      attributeName
      attributeValue
    }
  }
`;

export const GET_SUBSCRIBER_PARAMETER = gql`
  query GetSubscriberParameter($subscriberId: Int!) {
    getSubscriberParameter(subscriberId: $subscriberId) {
      id
      subscriberId
      parameterName
      parameterValue
      rejectOnFailure
    }
  }
`;

export const GET_SUBSCRIBER_AVPS = gql`
  query GetSubscriberAVPs($subscriberId: Int!) {
    getSubscriberAVPs(subscriberId: $subscriberId) {
      id
      subscriberId
      attributeGroupId
      attribute
      operation
      value
      status
    }
  }
`;

export const GET_DEVICE_WHITELIST = gql`
  query GetDeviceWhitelist($subscriberId: Int!) {
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
  query getPlanParameter($subscriberId: Int!, $planId: Int!) {
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
export const GET_PROFILE_OVERRIDE_AVPs = gql`
  query GetProfileOverrideSubscriberAVPs($subscriberId: Int!, $planId: Int!) {
    getProfileOverrideSubscriberAVPs(
      subscriberId: $subscriberId
      planId: $planId
    ) {
      overrideId
      subscriberId
      planId
      overrideKey
      overrideValue
      overrideWhen
    }
  }
`;

export const GET_SUBSCRIBER_BY_ID = gql`
  query GetSubscriberById($subscriberId: Int!) {
    getSubscriberById(subscriberId: $subscriberId) {
      subscriberId
      planId
      username
      password
      status
      contactNo
      email
      extId
      createdDate
      updatedTime
      realm
      type
    }
  }
`;

export const GET_PLAN_BY_ID = gql`
  query GetPlansById($planId: Int!) {
    getPlansById(planId: $planId) {
      planId
      typeId
      planName
      description
    }
  }
`;
export const GET_PROFILE_BY_ID = gql`
  query GetProfilesById {
    getProfilesById {
      profileId
      attributeGroup
      profileKey
      description
    }
  }
`;
