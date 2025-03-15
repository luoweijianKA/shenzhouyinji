
import { RESOURCE_URL, DEFAULT } from '../../../constants/index';
const { updateAccount, updateProfile } = require('../../../model/usercenter');
const { uploadFile } = require('../../../model/uploadFile');
import { validateNickname } from '../../../utils/util';

const app = getApp();

Page({
  data: {
    userInfo: [],
    avatarUrl: DEFAULT.AVATAR_URL,
    nickname: DEFAULT.NICKNAME,
    resourceUrl: RESOURCE_URL,
    visible: false,
    submit: '',
    editTitle: '',
    editType: '',
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.user,
    })
    console.log(app.globalData.user);
  },

  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl: avatarUrl,
    });

    var token = wx.getStorageSync('accessToken');
    var upload = await uploadFile(avatarUrl, "file", "true", "avatar");
    var fileInfo = JSON.parse(upload).file;

    var user = {
      id: this.data.userInfo.id,
      wechat_name: this.data.userInfo.wechat_name,
      wechat_avatar: fileInfo.previewUri,
      status: this.data.userInfo.status,
      role: this.data.userInfo.role
    };

    var result = await updateAccount(user, token);

    if (result.succed) {
      app.globalData.user.wechat_avatar = fileInfo.previewUri;

      this.setData({
        userInfo: app.globalData.user,
      })
    }
  },

  onClickCell(e) {
    const { type } = e.currentTarget.dataset;

    switch (type) {
      case 'nickname': {
        this.setData({
          visible: true,
          submit: "saveNickname",
          editTitle: "新的昵称",
          editType: "nickname",
        });
        break;
      }
      case 'phone': {
        this.setData({
          visible: true,
          submit: "savePhone",
          editTitle: "新的手机号码",
          editType: "phone",
        });
        break;
      }
      case 'email': {
        this.setData({
          visible: true,
          submit: "saveEmail",
          editTitle: "新的邮箱地址",
          editType: "email",
        });
        break;
      }
      case 'name': {
        break;
      }
      case 'gender': {
        break;
      }
      case 'birthday': {
        break;
      }
      default: {
        wx.showToast({
          icon: 'none',
          title: '未知跳转',
        })
        break;
      }
    }
  },

  cancelEdit() {
    this.setData({
      visible: false,
      submit: "",
      editTitle: "",
      editType: "",
    });
  },

  async saveNickname(e) {
    var token = wx.getStorageSync('accessToken');
    var nickname = e.detail.value.nickname;
    if (!validateNickname(nickname)) {
      wx.showModal({ title: '昵称无效，请重新输入', showCancel: false });
      return;
    }
    var user = {
      id: this.data.userInfo.id,
      wechat_name: nickname,
      wechat_avatar: this.data.userInfo.wechat_avatar,
      status: this.data.userInfo.status,
      role: this.data.userInfo.role
    };

    var result = await updateAccount(user, token);

    if (result.succed) {
      app.globalData.user.wechat_name = nickname;

      this.setData({
        visible: false,
        submit: "",
        editTitle: "",
        editType: "",
        userInfo: app.globalData.user,
      })
    }

  },
  async savePhone(e) {
    var phone = e.detail.value.phone;

    var input = {
      id: this.data.userInfo.id,
      name: "",
      gender: "",
      email: "",
      phone: phone,
      city: "",
      tags: "",
      nric: "",
      authentication: app.globalData.user.profile.authentication,
      profession: "",
      guardian_name: "",
      guardian_nric: "",
      guardian_phone: ""
    };

    var result = await updateProfile(input);

    if (result.succed) {
      app.globalData.user.profile.phone = phone;

      this.setData({
        visible: false,
        submit: "",
        editTitle: "",
        editType: "",
        userInfo: app.globalData.user,
      })
    }
  },
  async saveEmail(e) {
    var email = e.detail.value.email;

    var input = {
      id: this.data.userInfo.id,
      name: "",
      gender: "",
      email: email,
      phone: "",
      city: "",
      tags: "",
      nric: "",
      authentication: app.globalData.user.profile.authentication,
      profession: "",
      guardian_name: "",
      guardian_nric: "",
      guardian_phone: ""
    };

    var result = await updateProfile(input);

    if (result.succed) {
      app.globalData.user.profile.email = email;

      this.setData({
        visible: false,
        submit: "",
        editTitle: "",
        editType: "",
        userInfo: app.globalData.user,
      })
    }
  },
})