
import { RESOURCE_URL, DEFAULT } from '../../../constants/index';
const { getUserLikeRecords } = require('../../../model/usercenter');

Page({

  data: {
    likeRecords: [],
    avatarUrl: DEFAULT.AVATAR_URL,
    nickname: DEFAULT.NICKNAME,
    resourceUrl: RESOURCE_URL,
  },

  onLoad() {
    this.loadUserLikeRecords();
  },

  async loadUserLikeRecords() {
    var result = await getUserLikeRecords();
    console.log({ result: result })
    this.setData({
      likeRecords: result
    })
  }

})