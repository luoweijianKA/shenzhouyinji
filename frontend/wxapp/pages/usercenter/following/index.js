
import { RESOURCE_URL, DEFAULT } from '../../../constants/index';
const { myFollowing, removeFollowing } = require('../../../model/tweet');
const { getSimpleUserInfo } = require('../../../model/usercenter');

Page({
  data: {
    following: [],
    avatarUrl: DEFAULT.AVATAR_URL,
    nickname: DEFAULT.NICKNAME,
    resourceUrl: RESOURCE_URL,
  },

  onLoad() {
    this.loadMyFollowing();
  },

  async loadMyFollowing() {
    var result = await myFollowing();

    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        let user = await this.getSimpleUserInfo(result[i].following);
        result[i].avatar = user.wechat_avatar;
        result[i].nickname = user.wechat_name;
      }

      this.setData({
        following: result
      });
    }

    console.log({ following: result });
  },

  async getSimpleUserInfo(uid) {
    var result = await getSimpleUserInfo(uid);
    return result;
  },
  async removeMyFollowing(e) {
    const { value } = e.currentTarget.dataset;
    const input = {
      "user_id": wx.getStorageSync('userId'),
      "following": value,
    }

    var result = await removeFollowing(input);

    if (result.succed) {
      const following = this.data.following.filter(function (i) {
        return i.following !== value
      })

      this.setData({
        following: following
      });
    }
  },
});