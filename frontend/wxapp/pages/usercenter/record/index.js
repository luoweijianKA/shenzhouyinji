
import { RESOURCE_URL, DEFAULT } from '../../../constants/index';
const { userRecordByUserId, userRecordByTweetUserId } = require('../../../model/tweet');

Page({
  data: {
    likeRecords: [],
    tabPanelstyle: 'display:flex;justify-content:center;align-items:center;min-height: 120px',
    avatarUrl: DEFAULT.AVATAR_URL,
    nickname: DEFAULT.NICKNAME,
    resourceUrl: RESOURCE_URL,
    hideMyLikeRecords: true,
    myLikeRecords: [],
    hideLikeMyRecords: true,
    likeMyRecords: [],
    hideMyShareRecords: true,
    myShareRecords: [],
    hideShareMyRecords: true,
    shareMyRecords: [],
    hideMyViewRecords: true,
    myViewRecords: [],
    hideViewMyRecords: true,
    viewMyRecords: [],
    loading: false,
    noRecord: false,
  },

  onLoad() {
    this.myLikes()
  },

  onTabsChange(event) {
    const value = event.detail.value
    switch (value) {
      case "0": {
        this.myLikes()
        break
      }
      case "1": {
        this.myShares()
        break
      }
      case "2": {
        this.myView()
        break
      }
    }
  },

  goTweet(e) {
    const { value } = e.currentTarget.dataset
    const url = `/pages/share/index?id=${value}`

    if (url) {
      wx.navigateTo({ url })
    }
  },
  async myLikes() {
    this.setData({
      hideMyLikeRecords: false,
      hideLikeMyRecords: true,
      loading: true,
      noRecord: false,
      myLikeRecords: [],
    });

    const userId = wx.getStorageSync('userId')
    var records = await userRecordByUserId(userId, "Like")
    records.sort((a, b) => b.time - a.time)

    this.setData({
      loading: false,
      noRecord: records.length == 0,
      myLikeRecords: records.map(r => ({
        ...r,
        user_avatar: r.user_avatar && r.user_avatar.length > 0 ? RESOURCE_URL + r.user_avatar : DEFAULT.AVATAR_URL,
        tweet_user_avatar: r.tweet_user_avatar && r.tweet_user_avatar.length > 0 ? RESOURCE_URL + r.tweet_user_avatar : DEFAULT.AVATAR_URL,
      }))
    });
  },
  async likeMy() {
    this.setData({
      hideMyLikeRecords: true,
      hideLikeMyRecords: false,
      loading: true,
      noRecord: false,
      likeMyRecords: [],
    })

    const userId = wx.getStorageSync('userId')
    var records = await userRecordByTweetUserId(userId, "Like")
    records.sort((a, b) => b.time - a.time)

    this.setData({
      loading: false,
      noRecord: records.length == 0,
      likeMyRecords: records.map(r => ({
        ...r,
        user_avatar: r.user_avatar && r.user_avatar.length > 0 ? RESOURCE_URL + r.user_avatar : DEFAULT.AVATAR_URL,
        tweet_user_avatar: r.tweet_user_avatar && r.tweet_user_avatar.length > 0 ? RESOURCE_URL + r.tweet_user_avatar : DEFAULT.AVATAR_URL,
      }))
    });
  },
  async myShares() {
    this.setData({
      hideMyShareRecords: false,
      hideShareMyRecords: true,
      loading: true,
      noRecord: false,
      myShareRecords: [],
    });

    const userId = wx.getStorageSync('userId')
    var records = await userRecordByUserId(userId, "Share")
    records.sort((a, b) => b.time - a.time)

    this.setData({
      loading: false,
      noRecord: records.length == 0,
      myShareRecords: records.map(r => ({
        ...r,
        user_avatar: r.user_avatar && r.user_avatar.length > 0 ? RESOURCE_URL + r.user_avatar : DEFAULT.AVATAR_URL,
        tweet_user_avatar: r.tweet_user_avatar && r.tweet_user_avatar.length > 0 ? RESOURCE_URL + r.tweet_user_avatar : DEFAULT.AVATAR_URL,
      }))
    });
  },
  async shareMy() {
    this.setData({
      hideMyShareRecords: true,
      hideShareMyRecords: false,
      loading: true,
      noRecord: false,
      shareMyRecords: [],
    });

    const userId = wx.getStorageSync('userId')
    var records = await userRecordByTweetUserId(userId, "Share")
    records.sort((a, b) => b.time - a.time)

    this.setData({
      loading: false,
      noRecord: records.length == 0,
      shareMyRecords: records.map(r => ({
        ...r,
        user_avatar: r.user_avatar && r.user_avatar.length > 0 ? RESOURCE_URL + r.user_avatar : DEFAULT.AVATAR_URL,
        tweet_user_avatar: r.tweet_user_avatar && r.tweet_user_avatar.length > 0 ? RESOURCE_URL + r.tweet_user_avatar : DEFAULT.AVATAR_URL,
      }))
    });
  },
  async myView() {
    this.setData({
      hideMyViewRecords: false,
      hideViewMyRecords: true,
      loading: true,
      noRecord: false,
      myViewRecords: [],
    });

    const userId = wx.getStorageSync('userId')
    var records = await userRecordByUserId(userId, "View")
    records.sort((a, b) => b.time - a.time)

    this.setData({
      loading: false,
      noRecord: records.length == 0,
      myViewRecords: records.map(r => ({
        ...r,
        user_avatar: r.user_avatar && r.user_avatar.length > 0 ? RESOURCE_URL + r.user_avatar : DEFAULT.AVATAR_URL,
        tweet_user_avatar: r.tweet_user_avatar && r.tweet_user_avatar.length > 0 ? RESOURCE_URL + r.tweet_user_avatar : DEFAULT.AVATAR_URL,
      }))
    });
  },
  async viewMy() {
    this.setData({
      hideMyViewRecords: true,
      hideViewMyRecords: false,
      loading: true,
      noRecord: false,
      viewMyRecords: [],
    });

    const userId = wx.getStorageSync('userId')
    var records = await userRecordByTweetUserId(userId, "View")
    records.sort((a, b) => b.time - a.time)

    this.setData({
      loading: false,
      noRecord: records.length == 0,
      viewMyRecords: records.map(r => ({
        ...r,
        user_avatar: r.user_avatar && r.user_avatar.length > 0 ? RESOURCE_URL + r.user_avatar : DEFAULT.AVATAR_URL,
        tweet_user_avatar: r.tweet_user_avatar && r.tweet_user_avatar.length > 0 ? RESOURCE_URL + r.tweet_user_avatar : DEFAULT.AVATAR_URL,
      }))
    });
  },
})