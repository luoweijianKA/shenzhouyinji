import { gql } from '@apollo/client'

export const SERVER_TIME = gql`
  query ServerTime {
    serverTime
  }
`

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(input: { token: $token }) {
      accessToken
    }
  }
`

export const LOGIN = gql`
  mutation Login($loginId: String!, $password: String!, $timestamp: Int!) {
    login(input: { loginId: $loginId, password: $password, timestamp: $timestamp }) {
      id
      loginId
      role
      status
      accessToken
    }
  }
`

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($id: ID!, $password: String!, $newPassword: String!) {
    updatePassword(
      input: {id: $id, oldPassword: $password, newPassword: $newPassword}
    ) {
      succed
      message
    }
  }
`

export const USER = gql`
  query User{
    user{
      id
      loginId
      name
      status
      role
      permission
      parentId
      nickname
      profile {
        paymentTransfer
        game
        market
        package
      }
    }
  }
`

export const GET_ACCOUNT = gql`
  query Account($id: String!) {
    account(id: $id) {
      id
      loginId
      password
      wechat
      role
      status
      create_time
    }
  }
`

export const CREATE_SUB_ACCOUNT = gql`
  mutation CraeteSubAccount(
    $loginId: String!
    $name: String!
    $password: String!
    $status: Status!
    $lock: Boolean!
    $permission: Int!
  ) {
    createSubAccount(input: {
      loginId: $loginId
      name: $name
      password: $password
      status: $status
      lock: $lock
      permission: $permission
    })
  }
`

export const UPDATE_SUB_ACCOUNT = gql`
  mutation UpdateSubAccount(
    $id: ID!
    $loginId: String!
    $name: String!
    $status: Status!
    $lock: Boolean!
    $permission: Int!
  ) {
    updateSubAccount(
      id: $id,
      input: {
        loginId: $loginId
        name: $name
        password: ""
        status: $status
        lock: $lock
        permission: $permission
      }
    )
  }
`

export const GET_SUB_ACCOUNTS = gql`
  query GetSubAccounts($status: Status){
    subaccounts(status: $status) {
      id
      loginId
      name
      status
      lock
      lastLogin {
        ip
        region
        loginTime
      }
    }
  }
`

export const UPDATE_NICKNAME = gql`
  mutation UpdateNickname($input: String!) {
    updateNickname(input: $input)
  }
`

export const SET_PASSWORD = gql`
  mutation SetPassword($id: ID!, $input: String!) {
    setPassword(id: $id, input: $input)
  }
`

export const SET_STATUS = gql`
  mutation SetStatus($id: ID!, $input: Status!) {
    setStatus(id: $id, input: $input)
  }
`

export const LOCK_ACCOUNT = gql`
  mutation LockAccount($id: ID!) {
    lockAccount(id: $id)
  }
`

export const UNLOCK_ACCOUNT = gql`
  mutation UnlockAccount($id: ID!) {
    unlockAccount(id: $id)
  }
`

export const GET_ANNOUNCEMENTS = gql`
  query GetAnnouncements {
    announcements {
      title
      message
      timestamp
    }
  }
`

export const GET_ANNOUNCEMENT = gql`
  query GetAnnouncement($id: ID) {
    announcement(id: $id) {
      id,
      title
      message
      timestamp
    }
  }
`

export const UPLOAD_FILES = gql`
  mutation UploadFiles($files: [UploadFile!]!) {
    uploadWithPayload(payload: $files) {
      id
      name
      contentType
      rawURI
      previewURI
    }
  }
`

export const GET_CATEGORIES = gql`
  query GetCategories($parentId: String!) {
    categoriesByParentID(id: $parentId) {
      id
      name
      parent_id
      has_subclass
      status
      sort
    }
  }
`