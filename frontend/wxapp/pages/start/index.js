import { DEFAULT } from '../../constants/index'
import { apiServer } from '../../config/index';
import { getConfigs } from '../../model/user';
import { getUserInfo, updateAccount } from '../../model/usercenter';
import { uploadFile } from '../../model/uploadFile';
import { genEventList } from '../../model/event';
import { genNotifyList } from '../../model/notify';
import { validateNickname } from '../../utils/util';

const { getUserPhoneNumber } = require('../../model/user');

const app = getApp();

function wxLogin() {
  return new Promise(function (reslove, reject) {
    wx.login({
      success(res) {
        wx.setStorageSync('wxcode', res.code);
        reslove(res.code);
      },
    });
  });
}

Page({
  data: {
    loading: true,
    visibleUserInfo: false,
    avatarUrl: DEFAULT.AVATAR_URL,
    nickname: undefined,
    redirectUrl: undefined,
    phoneNumber: undefined, // 是否授权了手机号
  },
  async onLoad(options) {
    const redirectUrl = decodeURIComponent(
      options.redirectUrl || '/pages/home/home',
    );
    const code = await wxLogin();
    const { id, accessToken } = await this.login(code);
    const configs = await getConfigs();
    const user = await getUserInfo(id);
    const events = await genEventList();
    const notifys = await genNotifyList();

    app.globalData = {
      ...app.globalData,
      configs,
      user,
      events,
      currentEvent: events.length > 0 ? events[0] : null,
      notifys,
    };

    console.log({ app, options, redirectUrl });

    this.setData({ phoneNumber: user.profile?.phone ?? '' });

    if (user.wechat_name.length === 0) {
      this.setData({ loading: false, redirectUrl, visibleUserInfo: true });
    } else {
      this.setData({ loading: false, redirectUrl });

      setTimeout(() => {
        wx.reLaunch({ url: redirectUrl });
      }, 300);
    }
  },

  // 授权手机号
  async getPhoneNumber(e) {
    console.log('授权手机号', e);
    const { code } = e.detail;
    if (code && code.length > 0) {
      const { user } = app.globalData;
      const { phoneNumber } = await getUserPhoneNumber(user.id, code);
      if (phoneNumber && phoneNumber.length > 0) {
        const userInfo = await getUserInfo(app.globalData.user.id);
        app.globalData.user = userInfo;
        this.setData({ phoneNumber });
      }
    }
  },
  onChooseAvatar(e) {
    this.setData({ avatarUrl: e.detail.avatarUrl });
  },
  async login(code) {
    wx.removeStorageSync('userId');
    wx.removeStorageSync('accessToken');
    console.log({ login: { code } });
    return new Promise(function (reslove, reject) {
      wx.request({
        url: apiServer.gqlUri,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data: JSON.stringify({
          query: `mutation login($code:String!){
            loginWithWechat(code:$code){
              id
              accessToken
            }
          }`,
          variables: {
            code: code,
          },
        }),
        success(res) {
          console.log({ logged: res.data.data });
          wx.setStorageSync('userId', res.data.data.loginWithWechat.id);
          wx.setStorageSync(
            'accessToken',
            res.data.data.loginWithWechat.accessToken,
          );
          reslove(res.data.data.loginWithWechat);
        },
      });
    });
  },
  async saveUserInfoEdit(e) {
    const token = wx.getStorageSync('accessToken');
    const { avatarUrl, redirectUrl } = this.data;
    const { nickname } = e.detail.value;

    // 优先校验是否授权了手机号
    if (!this.data.phoneNumber) {
      return;
    }

    if (!nickname || nickname.length === 0) {
      wx.showModal({
        title: '请输入用户昵称',
        showCancel: false,
      });
      return;
    }

    if (!validateNickname(nickname)) {
      wx.showModal({ title: '昵称无效，请重新输入', showCancel: false });
      return;
    }

    const { user } = app.globalData;
    let input = {
      id: user.id,
      wechat_name: nickname,
      wechat_avatar: user.wechat_avatar,
      status: user.status,
      role: user.role,
    };

    if (avatarUrl !== DEFAULT.AVATAR_URL) {
      var upload = await uploadFile(avatarUrl, 'file', 'true', 'avatar');
      var fileInfo = JSON.parse(upload).file;
      input.wechat_avatar = fileInfo.previewUri;
    }

    let result = await updateAccount(input, token);
    if (result.succed) {
      app.globalData.user = {
        ...user,
        wechat_name: input.wechat_name,
        wechat_avatar: input.wechat_avatar,
      };
      this.setData({ visibleUserInfo: false });
      setTimeout(() => wx.reLaunch({ url: redirectUrl }), 300);
    }
  },
});