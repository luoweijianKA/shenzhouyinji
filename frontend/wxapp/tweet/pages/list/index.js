import { RESOURCE_URL } from '../../../constants/index';
import { getTweets } from '../../../model/tweet';

const app = getApp();

Page({
  data: {
    userInfo: [],
    images: [],
    tweets: [],
    resourceUrl: RESOURCE_URL,
    current: 0,
    autoplay: false,
    duration: 1000,
    interval: 5000,
    navigation: { type: 'dots-bar' },
    backgroundImage: '../../../assets/blackboardImage.png',
    totalLike: 0,
    totalShare: 0,
    totalView: 0
  },

  onLoad: function () {
    this.setData({
      userInfo: app.globalData.user,
    });

    this.loadTweet();
  },

  async loadTweet() {
    var tweets = await getTweets();
    var totalLike = 0;
    var totalShare = 0;
    var totalView = 0;

    console.log(tweets)
    tweets.forEach(function (item) {
      item.content = JSON.parse(item.content);
      totalLike += item.like_count
      totalShare += item.share_count
      totalView += item.view_count
    });

    tweets.sort((a, b) => (a.create_time < b.create_time) ? 1 : -1);

    this.setData({
      tweets: tweets,
      totalLike,
      totalShare,
      totalView
    });
  },

  goBack: function () {
    wx.navigateBack();
  },

  goRecord: function () {
    var url = "../../../pages/usercenter/record/index"
    wx.navigateTo({ url: url });
  },

  createTweet: function () {
    var url = "../../../tweet/pages/create/index";
    wx.navigateTo({ url: url });
  },

  goDetail: function (e) {
    const { value } = e.currentTarget.dataset;
    var url = `../../../pages/share/index?id=${value}`;
    wx.navigateTo({ url: url });
  }
});