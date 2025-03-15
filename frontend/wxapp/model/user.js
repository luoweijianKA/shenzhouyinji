import { apiServer, useQuery, useMutation } from '../config/index';

export async function getConfigs() {
  const data = await useQuery({
    query: `query GetConfigs {
      configs
    }`,
  })

  return data.configs
}

export async function getTags(categoryId) {
  const data = await useQuery({
    query: `query GetTags($categoryId: String!) {
      tagByCategory(category: $categoryId) {
        id
        name
      }
    }`,
    variables: { categoryId },
  })

  return data.tagByCategory
}

export async function getUser(id) {
  const data = await useQuery({
    query: `query GetAccount($id: String!) {
      account(id: $id) {
        id
        wechat
        wechat_name
        wechat_avatar
      }
    }`,
    variables: { id },
  })

  return data.account
}

export async function getUserPhoneNumber(userId, code) {
  const data = await useQuery({
    query: `query GetPhoneNumber($userId: String!, $code: String!) {
      userPhoneNumber(userId: $userId, code: $code) {
        phoneNumber
      }
    }`,
    variables: { userId, code },
  })

  return data.userPhoneNumber
}

export async function getUserIndivIdentity(userId, name, idNumber, phoneNumber, email) {
  const data = await useQuery({
    query: `query GetUserIndivIdentity($userId: String!, $name: String!, $idNumber: String!, $phoneNumber: String!, $email: String!) {
      userIndivIdentity(
        userId: $userId
        name: $name
        idNumber: $idNumber
        phoneNumber: $phoneNumber
        email: $email
      ) {
        flowId
        accountId
      }
    }`,
    variables: { userId, name, idNumber, phoneNumber, email },
  })

  return data.userIndivIdentity
}

export async function getUserIdentityAuthDetail(flowId) {
  const data = await useQuery({
    query: `query GetUserIdentityAuthDetail($flowId: String!) {
      userIdentityAuthDetail(flowId: $flowId)
    }`,
    variables: { flowId },
  })

  return data.userIdentityAuthDetail
}

export async function getUserShare(user_id, event_id, sceneryspot_id) {
  const data = await useQuery({
    query: `query GetUserShare($user_id: ID!, $event_id: ID!, $sceneryspot_id: ID!) {
      userShare(
        user_id: $user_id
        event_id: $event_id
        sceneryspot_id: $sceneryspot_id
      ) {
        id
        content
      }
    }`,
    variables: { user_id, event_id, sceneryspot_id },
  })

  return data.userShare
}

export async function getUserStamp(user_id, event_id, sceneryspot_id) {
  const data = await useQuery({
    query: `query GetUserStamp($user_id: ID!, $event_id: ID!, $sceneryspot_id: ID!) {
      userStamp(
        user_id: $user_id
        event_id: $event_id
        sceneryspot_id: $sceneryspot_id
      ) {
        user_id
        event_id
        sceneryspot_id
        code
        location
        status
        create_time
      }
    }`,
    variables: { user_id, event_id, sceneryspot_id },
  })

  return data.userStamp
}

export async function createUserStamp(input) {
  const data = await useMutation({
    mutation: `mutation CreateUserStamp($input: NewUserStamp!) {
      createUserStamp(input: $input) {
        user_id
        event_id
        sceneryspot_id
        code
        location
        status
        create_time
      }
    }`,
    variables: { input },
  })

  return data.createUserStamp
}

export async function updateUserStamp(input) {
  const data = await useMutation({
    mutation: `mutation UpdateUserStamp($input: UserStampInput!) {
      updateUserStamp(input: $input) {
        user_id
        event_id
        sceneryspot_id
        code
        location
        status
        create_time
      }
    }`,
    variables: { input },
  })

  return data.updateUserStamp
}

export async function getUserEventAward(input) {
  const data = await useQuery({
    query: `query GetUserEventAward($input: EventAwardInput!) {
      userEventAward(input: $input) {
        id
        eventId
        code
        createTime
        userId
        userName
        userAvatar
        sceneryspotId
        location
        awardTime
      }
    }`,
    variables: { input },
  })

  return data.userEventAward
}

export async function getClaimPassports(eventId) {
  const data = await useQuery({
    query: `query GetClaimPassports($first: Int = 20, $after: ID, $last: Int=20, $before:ID, $eventId: ID) {
      claimPassports(first: $first, after: $after, last: $last, before:$before, eventId: $eventId) {
        totalCount
        edges {
          node {
            id
            userId
            userName
            userAvatar
            eventId
            passportCode
            claimBy
            claimTime
            status
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
    }`,
    variables: { eventId },
  })

  return data.claimPassports
}

export async function getUserPoints(userId, eventId) {
  const data = await useQuery({
    query: `query GetUserPoints($first: Int, $after: ID, $last: Int, $before: ID, $userId: ID!, $eventId: ID, $timestamp: Int) {
      userPoints(
        first: $first
        after: $after
        last: $last
        before: $before
        userId: $userId
        eventId: $eventId
        timestamp: $timestamp
      ) {
        totalCount
        edges {
          node {
            id
            userId
            content
            op
            points
            createTime
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
    }`,
    variables: { first: 500, userId, eventId },
  })

  return data.userPoints
}

export async function getUserSceneryspots(userId) {
  const data = await useQuery({
    query: `query GetUserSceneryspots($userId: String!) {
      userSceneryspots(userId: $userId) {
        id
        name
        address
        images
        coordinate
        introduction
      }
    }`,
    variables: { userId },
  })

  return data.userSceneryspots
}

export async function decodeWeRunData(encryptedData, iv) {
  const data = await useQuery({
    query: `query DecodeWeRunData($encryptedData: String!, $iv: String!) {
      weRunData(encryptedData: $encryptedData, iv: $iv)
    }`,
    variables: { encryptedData, iv },
  })

  return data.weRunData
}

export async function getUserConversations(userId) {
  const data = await useQuery({
    query: `query GetUserConversations($userId: String!) {
      userConversations(user_id: $userId) {
        id
        participant
        from
        user_id
        user_name
        user_avatar
        content
        send_time
        read_time
        has_new
      }
    }`,
    variables: { userId },
  })

  return data.userConversations
}

export async function getParticipantConversations(participant, from) {
  const data = await useQuery({
    query: `query GetParticipantConversations($participant: String!, $from: String) {
      conversationByParticipant(participant: $participant, from: $from) {
        id
        participant
        from
        user_id
        user_name
        user_avatar
        content
        send_time
        read_time
        has_new
      }
    }`,
    variables: { participant, from: from ?? '' },
  })

  return data.conversationByParticipant
}

export async function createConversation(input) {
  const data = await useMutation({
    mutation: `mutation CreateConversation($input: NewConversation!) {
      createConversation(input: $input) {
        id
        participant
        user_id
        user_name
        user_avatar
        content
        send_time
        read_time
        has_new
      }
    }`,
    variables: { input },
  })

  return data.createConversation
}

export async function getUserStampByUserID(id) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query UserStampByUserID($id: String!) {
          userStampByUserID(id: $id) {
            user_id
            event_id
            sceneryspot_id
            sceneryspot_name
            sceneryspot_images
            sceneryspot_address
            sceneryspot_coordinate
            status
            like_count
            share_count
            view_count
          }
        }`,
        variables: {
          "id": id
        },
      }),
      success(res) {
        reslove(res.data.data.userStampByUserID);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function getUserStampPointsRecord(input) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query userStampPointsRecord($input: NewUserStampPointsRecord!) {
          userStampPointsRecord(input: $input) {
            id
            user_id
            user_name
            user_avatar
            event_id
            sceneryspot_id
            action_user_id
            action_user_name
            action_user_avatar
            like
            share
            view
          }
        }`,
        variables: {
          "input": {
            "user_id": input.user_id,
            "event_id": input.event_id,
            "sceneryspot_id": input.sceneryspot_id,
            "action_user_id": input.action_user_id
          }
        },
      }),
      success(res) {
        reslove(res.data.data.userStampPointsRecord);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function updateUserStampRecord(input) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation updateUserStampRecord($input:NewUserStampRecord!){
          updateUserStampRecord(input:$input){
            succed
            message
          }
        }`,
        variables: {
          "input": {
            "user_id": input.user_id,
            "event_id": input.event_id,
            "sceneryspot_id": input.sceneryspot_id,
            "action_user_id": input.action_user_id,
            "action_type": input.action_type
          }
        },
      }),
      success(res) {
        reslove(res.data.data.updateUserStampRecord);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}