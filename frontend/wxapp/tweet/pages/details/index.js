import { getTweet, likeTweet, unlikeTweet, viewTweet, shareTweet } from '../../../model/tweet'
const app = getApp();

Page({
  data: {
    userInfo: [],
    images: [],
    tweet: undefined,
    current: 0,
    autoplay: false,
    duration: 1000,
    interval: 5000,
    navigation: { type: 'dots-bar' },
    goHome: false
  },

  onLoad: async function (options) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    const { id, goHome } = options
    if (typeof goHome != 'undefined') {
      this.setData({ goHome: goHome })
    }

    const tweet = await getTweet(id)
    viewTweet(id)

    this.setData({
      userInfo: app.globalData.user,
      tweet: {
        ...tweet,
        content: JSON.parse(tweet.content),
        hasLike: false,
      },
    });
  },

  goBack: function () {
    wx.navigateBack();
  },
  goHome: function () {
    wx.reLaunch({
      url: `/pages/home/home`
    });
  },
  tapLike: async function (e) {
    const { user } = app.globalData
    const { tweet } = this.data
    const input = { userId: user.id, tweetId: tweet.id }
    if (tweet.hasLike) {
      this.unlike(input)
    } else {
      this.like(input)
    }
  },
  like: async function (input) {
    const result = await likeTweet(input)
    if (result.succed) {
      const { tweet } = this.data
      this.setData({
        tweet: {
          ...tweet,
          hasLike: true,
          like_count: tweet.like_count + 1,
        }
      });
    }
  },
  unlike: async function (input) {
    const result = await unlikeTweet(input)
    if (result.succed) {
      const { tweet } = this.data
      this.setData({
        tweet: {
          ...tweet,
          hasLike: false,
          like_count: tweet.like_count - 1,
        }
      })
    }
  },
  onShareAppMessage: function (e) {
    // console.log({ onShareAppMessage: e })
    const { tweet } = this.data
    if (tweet) {
      shareTweet(tweet.id)
      return {
        title: `印迹分享`,
        path: '/pages/start/index?redirectUrl=' + encodeURIComponent(`/pages/share/index?id=${tweet.id}&goHome=true`),
      }
    }
  },
  onShareTimeline: function (e) {
    const { tweet } = this.data
    if (tweet) {
      shareTweet(tweet.id)
      return {
        title: `印迹分享`,
        path: '/pages/start/index?redirectUrl=' + encodeURIComponent(`/pages/share/index?id=${tweet.id}&goHome=true`),
      }
    }
  },
});