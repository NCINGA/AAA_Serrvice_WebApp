import { gql } from "@apollo/client";

export const GET_TYPES = gql`
  query GetTypes {
    getTypes
  }
`;

export const GET_PLANS_BY_PAGE = gql`
  query GetPlansByPage($page: Int!, $size: Int!) {
    getPlansByPage(page: $page, size: $size) {
      content {
        planId
        typeId
        planName
        description
      }
      page
      size
      totalElements
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
      attributes {
        attributeId
        attributeName
        attributeValue
      }
      parameterActions {
        actionId
        actionPhase
        parameterName
        actionSeq
        matchReturn
        entity
      }
      parameterPhases {
        parameterName
        phase
        status
        entityState
        entity
      }
    }
  }
`;

export const GET_ACTIONS = gql`
  query GetActions {
    getActions {
      actionId
      actionName
      description
    }
  }
`;

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

export const UPDATE_PLAN_PARAMETERS = gql`
  mutation updatePlanParameters($planId: Int, $plan: PlanInput2) {
    updatePlanParameters(planId: $planId, plan: $plan)
  }
`;
export const GET_SUBSCRIBERS = gql`
  query GetSubscribers($page: Int!, $size: Int!) {
    getSubscribersByPage(page: $page, size: $size) {
      page
      size
      totalElements
      content {
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
        subscriberSessions {
          sessionId
          subscriberId
          startTime
          nasIpv4
          nasIpv6
          userName
          nasPort
          nasPortType
          downloadBytes
          uploadBytes
          downloadGiga
          uploadGiga
        }
        dataRollovers {
          rolloverId
          subscriberId
          rolloverDate
          rolloverQuotaBytes
          validTill
        }
        dataUsages {
          usageId
          subscriberId
          username
          totalDownload
          totalUpload
          totalUsage
          obUsage
          reportDate
          lastReset
          nextReset
        }
        deviceWhitelist {
          id
          subscriberId
          MACAddress
          description
          status
          createAt
        }
        subscriberPlan {
          subscriberId
          planId
          planState
          statusDate
        }
        planParameterSubscriberOverRide {
          subscriberId
          planId
          parameterName
          parameterValue
        }
        profileAvpSubscriberOverRide {
          subscriberId
          planId
          overRideKey
          overRideValue
          overRideWhen
        }
      }
    }
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

export const APPLY_PLAN = gql`
  mutation applyPlan($subscriberId: Int!, $planId: Int!, $state: String!) {
    applyPlan(subscriberId: $subscriberId, planId: $planId, state: $state)
  }
`;

export const CREATE_PLANS = gql`
  mutation CreatePlan($typeId: Int, $planName: String, $description: String) {
    createPlan(
      plan: { typeId: $typeId, planName: $planName, description: $description }
    )
  }
`;

export const CREATE_NAS = gql`
  mutation CreateNAS(
    $nas_name: String
    $nas_type: String
    $nas_secret: String
    $coa_port: Int
    $nas_attrgroup: Int
  ) {
    createNAS(
      nas: {
        nas_name: $nas_name
        nas_type: $nas_type
        nas_secret: $nas_secret
        coa_port: $coa_port
        nas_attrgroup: $nas_attrgroup
      }
    )
  }
`;

export const GET_PLANS = gql`
  query GetPlans {
    getPlans
  }
`;

export const GET_NAS = gql`
  query GetNas {
    getNas
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
      subscriberSessions {
        sessionId
        subscriberId
        startTime
        nasIpv4
        nasIpv6
        userName
        nasPort
        nasPortType
        downloadBytes
        uploadBytes
        downloadGiga
        uploadGiga
      }
      dataRollovers {
        rolloverId
        subscriberId
        rolloverDate
        rolloverQuotaBytes
        validTill
      }
      dataUsages {
        usageId
        subscriberId
        username
        totalDownload
        totalUpload
        totalUsage
        obUsage
        reportDate
        lastReset
        nextReset
      }
      deviceWhitelist {
        id
        subscriberId
        MACAddress
        description
        status
        createAt
      }
      subscriberPlan {
        subscriberId
        planId
        planState
        statusDate
        planName
      }
      planParameterSubscriberOverRide {
        subscriberId
        planId
        parameterName
        parameterValue
      }
      profileAvpSubscriberOverRide {
        subscriberId
        planId
        overRideKey
        overRideValue
        overRideWhen
      }
      defaultParameters {
        planId
        parameters {
          parameterId
          parameterName
          parameterValue
        }
      }
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
export const DELETE_PROFILE = gql`
  mutation DeleteProfile($profileId: Int!) {
    deleteProfile(profileId: $profileId)
  }
`;

export const CREATE_PROFILE = gql`
  mutation CreateProfile(
    $attributeGroup: Int
    $profileKey: String
    $description: String
  ) {
    createProfile(
      profile: {
        attributeGroup: $attributeGroup
        profileKey: $profileKey
        description: $description
      }
    )
  }
`;

export const GET_PROFILE_BY_ID = gql`
  query GetProfileById($profileId: Int!) {
    getProfilesById(profileId: $profileId) {
      profileId
      attributeGroup
      profileKey
      description
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $profileId: Int!
    $attributeGroup: Int!
    $profileKey: String!
    $description: String!
  ) {
    updateProfile(
      profileId: $profileId
      profile: {
        attributeGroup: $attributeGroup
        profileKey: $profileKey
        description: $description
      }
    )
  }
`;

export const CREATE_AVP_PROFILE = gql`
  mutation CreateAvpProfile(
    $profileId: Int
    $avpName: String
    $avpValue: String
    $includeWhen: String
    $status: String
    $avpDefaultIfNull: String
    $overrideEnabled: Int
  ) {
    createAvpProfile(
      avpProfile: {
        profileId: $profileId
        avpName: $avpName
        avpValue: $avpValue
        includeWhen: $includeWhen
        status: $status
        avpDefaultIfNull: $avpDefaultIfNull
        overrideEnabled: $overrideEnabled
      }
    )
  }
`;

export const UPDATE_AVP_PROFILE = gql`
  mutation UpdateAvpProfile(
    $id: Int!
    #        $profileId:Int!
    $avpName: String!
    $avpValue: String!
    $includeWhen: String!
    $status: String!
    $avpDefaultIfNull: String
    $overrideEnabled: Int!
  ) {
    updateAvpProfile(
      id: $id
      avpProfile: {
        #                profileId: $profileId
        avpName: $avpName
        avpValue: $avpValue
        includeWhen: $includeWhen
        status: $status
        avpDefaultIfNull: $avpDefaultIfNull
        overrideEnabled: $overrideEnabled
      }
    )
  }
`;

export const GET_PROFILE_AVP_BY_ID = gql`
  query GetProfileAvpById($id: Int!) {
    getProfileAvpById(id: $id)
  }
`;

export const DELETE_AVP_PROFILE = gql`
  mutation DeleteAvpProfile($id: Int!) {
    deleteAvpProfile(id: $id)
  }
`;

export const GET_AVP_PROFILES = gql`
  query GetAvpProfiles {
    getAvpProfiles
  }
`;

export const GET_PROFILES = gql`
  query GetProfiles {
    getProfiles
  }
`;

export const UPDATE_NAS = gql`
  mutation UpdateNas(
    $nas_id: Int!
    $nas_name: String!
    $nas_type: String!
    $nas_secret: String!
    $coa_port: Int
    $nas_attrgroup: Int
  ) {
    updateNas(
      nas_id: $nas_id
      nas: {
        nas_name: $nas_name
        nas_type: $nas_type
        nas_secret: $nas_secret
        coa_port: $coa_port
        nas_attrgroup: $nas_attrgroup
      }
    )
  }
`;

export const DELETE_NAS = gql`
  mutation DeleteNas($nas_id: Int!) {
    deleteNas(nas_id: $nas_id)
  }
`;

export const GET_NAS_BY_ID = gql`
  query GetNasById($nas_id: Int!) {
    getNasById(nas_id: $nas_id) {
      nas_id
      nas_name
      nas_type
      nas_secret
      coa_port
      nas_attrgroup
    }
  }
`;
