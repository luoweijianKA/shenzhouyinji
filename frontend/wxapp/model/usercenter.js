import { apiServer } from '../config/index';

export async function getUserInfo(uid) {
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
        query: `query getUserInfo($id:String!) {
          account(id: $id) {
            id
            wechat
            wechat_name
            wechat_avatar
            role
            scopes
            status
            profile{
              name
              gender
              age
              birthday
              email
              phone
              city
              authentication
            }
          }
        }`,
        variables: {
          "id": uid
        },
      }),
      success(res) {
        reslove(res.data.data.account);
      },
    });
  });
  return data;
}

export async function getSimpleUserInfo(uid) {
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
        query: `query getSimpleUserInfo($id:String!) {
          account(id: $id) {
            wechat_name
            wechat_avatar
          }
        }`,
        variables: {
          "id": uid
        },
      }),
      success(res) {
        reslove(res.data.data.account);
      },
    });
  });
  return data;
}

export async function getUserUnreadMessage() {
  var userId = wx.getStorageSync('userId')
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
        query: `query userUnreadMessage($userId: String!) {
          userUnreadMessage(user_id:$userId){
            user_id
            conversation
            notification
            followers
            like
            system
            customerService
            reward
            badge
          }
        }`,
        variables: {
          "userId": userId
        },
      }),
      success(res) {
        reslove(res.data.data.userUnreadMessage);
      },
    });
  });
  return data;
}

export async function updateAccount(user, token) {
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation updateAccount($input:UpdateAccount!){
          updateAccount(input:$input){
            succed
            message
          }
        }`,
        variables: {
          "input": user
        },
      }),
      success(res) {
        reslove(res.data.data.updateAccount);
      },
    });
  });
  return data;
}

export async function updateProfile(input) {
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
        query: `mutation updateProfile($input:UpdateProfile!){
          updateProfile(input:$input){
            succed
          }
        }`,
        variables: {
          "input": input
        },
      }),
      success(res) {
        reslove(res.data.data.updateProfile);
      },
    });
  });
  return data;
}

export async function clearUserUnreadMessage(type) {
  var userId = wx.getStorageSync('userId')
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
        query: `mutation clearUserUnreadMessage($userId:String!,$type:String!){
          clearUserUnreadMessage(userId:$userId,type:$type){
            succed
          }
        }`,
        variables: {
          "userId": userId,
          "type": type
        },
      }),
      success(res) {
        reslove(res.data.data.clearUserUnreadMessage);
      },
    });
  });
  return data;
}