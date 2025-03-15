import { getTweet, likeTweet, unlikeTweet, viewTweet, shareTweet, getTweetLikerIds, getTweetUserActionState } from '../../model/tweet'
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

    const userId = wx.getStorageSync('userId')
    const tweet = await getTweet(id)
    const liker = await getTweetLikerIds(id)

    tweet.hasLike = liker && liker.length > 0 && liker.filter(v => v.user_id === userId).length > 0
    tweet.isself = tweet.user_id === userId

    console.log({ userId, tweet, liker, options })

    if (!tweet.isself) {
      viewTweet(id)
    }

    this.setData({
      userInfo: app.globalData.user,
      tweet: {
        ...tweet,
        content: JSON.parse(tweet.content),
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
      // this.unlike(input)
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

      if (!this.data.goHome) {
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        var prevPageTweets = prevPage.data.tweets
        prevPageTweets.forEach(e => {
          if (e.id == tweet.id) {
            e.like_count += 1
            e.hasLike = true
          }
        });

        prevPage.setData({ tweets: prevPageTweets })

      }
    } else {
      wx.showToast({
        title: '您已经点过赞了',
      })
    }
  },
  unlike: async function (input) {
    const result = await unlikeTweet(input)
    if (result.succed) {
      const { tweet } = this.data
      var like_count = tweet.like_count;
      like_count -= 1;
      like_count < 0 ? 0 : like_count;

      this.setData({
        tweet: {
          ...tweet,
          hasLike: false,
          like_count: like_count,
        }
      })

      if (!this.data.goHome) {
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        var prevPageTweets = prevPage.data.tweets
        prevPageTweets.forEach(e => {
          if (e.id == tweet.id) {
            var like_count = e.like_count;
            like_count -= 1;
            like_count < 0 ? 0 : like_count;
            e.like_count = like_count;
            e.hasLike = false;
          }
        });

        prevPage.setData({ tweets: prevPageTweets })

      }
    }
  },
  onShareAppMessage: function (e) {
    // console.log({ onShareAppMessage: e })
    const { tweet } = this.data
    if (tweet) {
      const userId = wx.getStorageSync('userId')
      if (userId != tweet.user_id) {
        shareTweet(tweet.id)
      }
      return {
        title: `印迹分享`,
        path: '/pages/start/index?redirectUrl=' + encodeURIComponent(`/pages/share/index?id=${tweet.id}&goHome=true`),
      }
    }
  },
  onShareTimeline: function (e) {
    const { tweet } = this.data
    if (tweet) {
      const userId = wx.getStorageSync('userId')
      if (userId != tweet.user_id) {
        shareTweet(tweet.id)
      }
      return {
        title: `印迹分享`,
        path: '/pages/start/index?redirectUrl=' + encodeURIComponent(`/pages/share/index?id=${tweet.id}&goHome=true`),
      }
    }
  },
});