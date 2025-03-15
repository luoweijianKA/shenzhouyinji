
import { RESOURCE_URL, DEFAULT } from '../../../constants/index';
const { myFollowers, removeFollowers } = require('../../../model/tweet');
const { getSimpleUserInfo } = require('../../../model/usercenter');

Page({
  data: {
    followers: [],
    thumbUp: [],
    avatarUrl: DEFAULT.AVATAR_URL,
    nickname: DEFAULT.NICKNAME,
    resourceUrl: RESOURCE_URL,
    tabPanelstyle: 'padding-top: 20rpx;',
  },

  onLoad() {
    this.loadMyFollowers();
  },

  async loadMyFollowers() {
    var result = await myFollowers();
    console.log({ result: result });
    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        let user = await this.getSimpleUserInfo(result[i].follower);
        result[i].avatar = user.wechat_avatar;
        result[i].nickname = user.wechat_name;
      }

      this.setData({
        followers: result
      });
    }

    console.log({ followers: result });
  },

  async getSimpleUserInfo(uid) {
    var result = await getSimpleUserInfo(uid);
    return result;
  },

  async removeMyFollowers(e) {
    const { value } = e.currentTarget.dataset;
    const input = {
      "user_id": wx.getStorageSync('userId'),
      "follower": value,
    }

    var result = await removeFollowers(input);

    if (result.succed) {
      const followers = this.data.followers.filter(function (i) {
        return i.follower !== value
      })

      this.setData({
        followers: followers
      });
    }
  },
});