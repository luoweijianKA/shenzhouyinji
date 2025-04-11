import { RESOURCE_URL, DEFAULT } from '../../constants/index'
import { getConfigs, getUserConversations } from '../../model/user';
import {
  getUserInfo,
  getUserUnreadMessage,
  updateProfile,
} from '../../model/usercenter';
import { getUserSwaps } from '../../model/badge';
import { genNotifyList } from '../../model/notify';
import { decodeWeRunData } from '../../model/user';
const {
  genEventList,
  genEventSceneryspots,
  getRanks,
} = require('../../model/event');
const {
  getNewestTweets,
  following,
  followers,
  myFollowing,
  likeTweet,
  unlikeTweet,
  getTweetLikerIds,
} = require('../../model/tweet');
const {
  genSceneryspotsByIDs,
  getSceneryspot,
} = require('../../model/sceneryspot');
const { getWeRunData, getLocation, getRegion } = require('../../utils/wxapi');

const app = getApp();
let interval = null;

function getRandomColor() {
  return (
    '#' +
    Array.from(new Array(3).keys())
      .map(() =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

Page({
  data: {
    notifySrcs: [],
    eventSrcs: [],
    currentEvent: [],
    currentSceneryspot: [],
    currentSceneryspotImage: DEFAULT.BLACKBOARDIMAGE_URI,
    pageLoading: false,
    current: 1,
    autoplay: true,
    duration: 1000,
    interval: 5000,
    navigation: { type: 'dots-bar' },
    eventIndex: 0,
    eventLogo: '',
    eventBanner: '',
    tweets: [],
    resourceUrl: RESOURCE_URL,
    myFollowing: [],
    campRanks: [],
    userRanks: [],
    badge: {
      swaps: [],
    },
    badgeBackgroundUrl: '',
    toggle: true,
    bell: false,
    total: 0,
    services: [],
    tweetPageIndex: 1,
    tweetPageSize: 5,
    tweetTotal: 0,
    tweetBackgroundImage: '',
  },
  hasUpdateLocation: false, // 标记是否更新过位置
  hasUpdateWeRun: false, // 标记是否更新过微信运动数据

  onReady() {
    const { badge } = this.data;
    const { configs } = app.globalData;
    const barrageComp = this.selectComponent('.barrage');
    this.barrage = barrageComp.getBarrageInstance({
      font: `bold ${configs.barrageFont ?? 16}px sans-serif`,
      duration: configs.barrageDuration ?? 15,
      lineHeight: 2,
      mode: 'separate',
      padding: [12, 0, 24, 0],
      tunnelShow: false,
      enableTap: true,
    });
    this.barrage.addData(
      badge.swaps.map((v) => ({
        content: `${v.userName}：(出)${v.badges[0].name}-(入)${v.badges[1].name}`,
        color: getRandomColor(),
      })),
    );
    this.barrage.open();
    this.timer = setInterval(() => {
      const { badge } = this.data;
      this.barrage.addData(
        badge.swaps.map((v) => ({
          content: `${v.userName}：(出)${v.badges[0].name}-(入)${v.badges[1].name}`,
          color: getRandomColor(),
        })),
      );
    }, 3000);

    // var userId = wx.getStorageSync('userId');
    // var accessToken = wx.getStorageSync('accessToken');
    // console.log({ onReady: { userId, accessToken } })
  },

  onLoad(options) {
    this.setData({ pageLoading: true });
    const eventIndex = options?.eventIndex ?? 0;
    const { events, notifys, configs } = app.globalData;
    const currentEvent = events[eventIndex];
    const images = currentEvent.images.split(',');
    const eventLogo =
      RESOURCE_URL + (images && images.length > 0 ? images[0] : '');
    const eventBanner =
      RESOURCE_URL + (images && images.length > 1 ? images[1] : '');
    app.globalData.currentEvent = currentEvent;

    console.log({ eventIndex, configs });

    this.loadScenerySpots(currentEvent.id);
    this.setUserSwaps(currentEvent.id);
    this.setRanks(currentEvent.id);
    this.loadUnreadMessage();
    this.loadTweets(1);

    this.setData({
      eventSrcs: events,
      notifySrcs: notifys,
      currentEvent,
      eventIndex,
      eventLogo,
      eventBanner,
      badgeBackgroundUrl: RESOURCE_URL + images[3],
      pageLoading: false,
      services: JSON.parse(configs.services),
      tweetBackground:
        configs.tweetBackground && configs.tweetBackground.length > 0
          ? RESOURCE_URL + configs.tweetBackground
          : '',
    });

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
  },

  onHide: function () {
    clearInterval(interval);
  },

  onUnload: function () {
    clearInterval(interval);
  },

  onShow() {
    this.checkAuth();

    this.getTabBar().init();
    const { user } = app.globalData;
    this.setBell(user.id);

    // setInterval(async () => {
    //   const notifys = await genNotifyList();
    //   this.setData({
    //     notifySrcs: notifys,
    //   });
    // }, 10 * 1000);

    var _this = this;
    interval = setInterval(async () => {
      _this.loadUnreadMessage();
    }, 10 * 1000);
  },

  onReachBottom: function () {
    if (this.data.tweets.length < this.data.tweetTotal) {
      this.loadTweetsOnReachBottom();
    } else {
      wx.showToast({
        icon: 'none',
        title: '已加载完毕',
      });
    }
  },

  onShareTimeline: function () {
    return {
      title: '神州印迹',
      path: `/pages/start/index?redirectUrl=/pages/home/index`,
    };
  },

  onShareAppMessage() {
    return {
      title: '神州印迹',
      path: `/pages/start/index?redirectUrl=/pages/home/index`,
    };
  },

  // 每次进入小程序都检查是否授权了相关权限，没授权拉起授权弹窗，否则直接退出小程序
  checkAuth() {
    const that = this;
    const { openConfirm, exit, checkAuth, hasUpdateWeRun, hasUpdateLocation } =
      that;

    wx.getSetting({
      success(res) {
        console.log('授权res', res);

        // 没有询问过授权
        if (res.authSetting['scope.userLocation'] === undefined) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(res) {
              // 用户同意授权后的操作
              // TODO 上传信息给后台
              console.log('位置res', res);
              checkAuth();
            },
            fail() {
              // 用户拒绝授权后的操作
              exit();
            },
          });
        } else if (res.authSetting['scope.werun'] === undefined) {
          wx.authorize({
            scope: 'scope.werun',
            success(res) {
              // 用户同意授权后的操作
              // TODO 上传信息给后台
              console.log('微信运动res', res);
              checkAuth();
            },
            fail(res) {
              // 用户拒绝授权后的操作
              console.log('微信运动授权失败', res);
              exit();
            },
          });
        } else if (res.authSetting['scope.camera'] === undefined) {
          wx.authorize({
            scope: 'scope.camera',
            success(res) {
              // 用户同意授权后的操作
              // TODO 上传信息给后台
              console.log('摄像头res', res);
              checkAuth();
            },
            fail(res) {
              // 用户拒绝授权后的操作
              exit();
            },
          });
        } else if (res.authSetting['scope.writePhotosAlbum'] === undefined) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              // 用户同意授权后的操作
              // TODO 上传信息给后台
              console.log('写入相册res', res);
              checkAuth();
            },
            fail(res) {
              // 用户拒绝授权后的操作
              console.log('相册授权失败', res);
              exit();
            },
          });
        }
        // 以前拒绝了授权
        else if (
          res.authSetting['scope.userLocation'] === false ||
          res.authSetting['scope.werun'] === false ||
          res.authSetting['scope.camera'] === false ||
          res.authSetting['scope.writePhotosAlbum'] === false
        ) {
          openConfirm();
        } else {
          if (
            res.authSetting['scope.userLocation'] === true &&
            hasUpdateLocation === false
          ) {
            getLocation(null, ({ latitude, longitude }) => {
              getRegion(latitude, longitude).then(async ({ region }) => {
                console.log('location, region ', region, app.globalData.user);
                const user = {
                  ...app.globalData.user,
                  profile: {
                    ...app.globalData.user.profile,
                    city: region,
                  },
                };
                const result = await updateProfile(user);
                if (result.succed) {
                  // 标记只有在首页才能更新位置，不用每次onShow都发请求更新
                  that.hasUpdateLocation = true;
                }
              });
            });
          }
          if (
            res.authSetting['scope.werun'] === true &&
            hasUpdateWeRun === false
          ) {
            getWeRunData(({ encryptedData, iv }) => {
              decodeWeRunData(encryptedData, iv).then((data) => {
                console.log('运动data', data);
                const { stepInfoList } = data;
                if (stepInfoList && stepInfoList.length > 0) {
                  // TODO 上传微信运动步数
                }
              });
            });
          }
        }
      },
    });
  },

  //当用户第一次拒绝后，重新进小程序再次请求授权
  openConfirm() {
    const { exit } = this;
    wx.showModal({
      content: '需授权相关权限才能使用小程序，是否去设置打开？',
      confirmText: '确认',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确认');
          wx.openSetting({
            success: (res) => {},
          });
        } else {
          console.log('用户点击取消');
          exit();
        }
      },
    });
  },

  // 没有授权，退出小程序
  exit() {
    wx.exitMiniProgram({
      success() {
        console.log('用户拒绝授权，退出小程序');
      },
      fail() {
        console.log('退出小程序失败');
      },
    });
  },

  async loadUnreadMessage() {
    const messages = await getUserUnreadMessage();
    const total =
      parseInt(messages.conversation) + parseInt(messages.notification);
    this.setData({ total: total });
    this.getTabBar().setData({ total: total });
  },

  async onPullDownRefresh() {
    wx.stopPullDownRefresh();

    this.setData({ pageLoading: true });

    const {
      user: { id: userId },
    } = app.globalData;
    const { eventIndex } = this.data;
    const configs = await getConfigs();
    const user = await getUserInfo(userId);
    const events = await genEventList();
    const notifys = await genNotifyList();
    const currentEvent = events[eventIndex ?? 0];
    const images = currentEvent.images.split(',');
    const eventLogo =
      RESOURCE_URL + (images && images.length > 0 ? images[0] : '');
    const eventBanner =
      RESOURCE_URL + (images && images.length > 1 ? images[1] : '');

    app.globalData = {
      ...app.globalData,
      configs,
      user,
      events,
      currentEvent,
      notifys,
    };

    this.setData({
      eventSrcs: events,
      notifySrcs: notifys,
      currentEvent,
      eventIndex,
      eventLogo,
      eventBanner,
      badgeBackgroundUrl: RESOURCE_URL + images[3],
      pageLoading: false,
    });
    // console.log({ app, eventIndex, currentEvent })

    this.loadScenerySpots(currentEvent.id);
    this.setUserSwaps(currentEvent.id);
    this.setBell(user.id);
    this.setRanks(currentEvent.id);
    this.loadTweets(1);
  },

  async loadTweets(pageIndex) {
    var _mainThis = this;
    var userId = wx.getStorageSync('userId');
    var followings = await myFollowing();
    var input = {
      eId: app.globalData.currentEvent.id,
      sId: '',
      pageIndex: pageIndex,
      pageSize: this.data.tweetPageSize,
    };

    var result = await getNewestTweets(input);
    var tweets = result.tweets;
    if (tweets != null) {
      tweets.forEach(async function (item) {
        item.content = JSON.parse(item.content);
        if (item.user_id == userId) {
          item.isself = true;
        } else {
          item.isself = false;
        }

        if (followings && followings.length > 0) {
          followings.forEach(function (e) {
            if (e.following == item.user_id) {
              item.isFollowing = true;
            }
          });
        } else {
          item.isFollowing = false;
        }

        if (item.user_id != userId) {
          const liker = await getTweetLikerIds(item.id);
          const hasLike =
            liker &&
            liker.length > 0 &&
            liker.filter((like) => like.user_id === userId).length > 0;
          _mainThis.setData({
            tweets: _mainThis.data.tweets.map((t) => ({
              ...t,
              hasLike: t.id === item.id ? hasLike : t.hasLike,
            })),
          });
        }
      });
    }
    console.log({ tweets, pageIndex });
    this.setData({
      tweets: tweets,
      tweetTotal: result.total,
      tweetPageIndex: pageIndex,
    });
  },

  async loadTweetsOnReachBottom() {
    var userId = wx.getStorageSync('userId');
    var followings = await myFollowing();
    var curPageIndex = this.data.tweetPageIndex + 1;

    var input = {
      eId: app.globalData.currentEvent.id,
      sId: '',
      pageIndex: curPageIndex,
      pageSize: this.data.tweetPageSize,
    };

    var result = await getNewestTweets(input);
    console.log('result onReachBottom: ', result);

    var tweets = result.tweets;
    if (tweets != null) {
      tweets.forEach(async function (item) {
        item.content = JSON.parse(item.content);
        if (item.user_id == userId) {
          item.isself = true;
        } else {
          item.isself = false;
        }

        if (followings && followings.length > 0) {
          followings.forEach(function (e) {
            if (e.following == item.user_id) {
              item.isFollowing = true;
            }
          });
        } else {
          item.isFollowing = false;
        }

        if (item.user_id != userId) {
          var liker = await getTweetLikerIds(item.id);

          if (liker.length > 0) {
            liker.forEach(function (l) {
              if (l.user_id == userId) {
                item.hasLike = true;
              } else {
                item.hasLike = false;
              }
            });
          }
        }
      });
    }
    tweets = this.data.tweets.concat(tweets);

    setTimeout(() => {
      this.setData({
        tweets: tweets,
        tweetPageIndex: curPageIndex,
      });
    }, 500);
  },

  async loadScenerySpots(eventId) {
    let eventSceneryspots = await genEventSceneryspots(eventId);
    let ids = [];
    eventSceneryspots.forEach((e) => {
      ids.push(e.scenery_spot_id);
    });

    const sceneryspots = (await genSceneryspotsByIDs(ids))
      .map((v) => ({ ...v }))
      .sort((a, b) => parseInt(a.code) - parseInt(b.code));
    app.globalData.currentSceneryspots = sceneryspots;
    if (sceneryspots.length > 0) {
      this.loadScenerySpot(sceneryspots[0].id);
    }
    this.setData({
      tabList: sceneryspots,
    });
  },

  async setUserSwaps(eventId) {
    const { edges } = await getUserSwaps(50, null, null, null, { status: 1 });
    // console.log({ swaps: edges.map(v => v.node) })
    this.setData({
      badge: {
        swaps: edges.map((v) => v.node),
      },
    });
  },

  async setBell(userId) {
    const conversations = await getUserConversations(userId);
    // console.log({ conversations, bell: !!conversations.find(v => v.has_new === true) })
    this.setData({
      bell: !!conversations.find((v) => v.has_new === true),
    });
  },

  async setRanks(eventId) {
    const { campRanks, userRanks } = await getRanks(eventId);
    // console.log({ campRanks, userRanks })
    this.setData({
      campRanks: campRanks.map((v) => ({ ...v, logo: RESOURCE_URL + v.logo })),
      userRanks,
    });
  },

  async loadScenerySpot(ScenerySpotId) {
    const sceneryspot = await getSceneryspot(ScenerySpotId);
    app.globalData.sceneryspot = sceneryspot;
    var sceneryspotImage = sceneryspot.images;
    if (sceneryspot.images.length > 0) {
      var images = sceneryspot.images.split(',');
      if (images.length > 0) {
        sceneryspotImage = images[0];
      }
    }
    console.log(sceneryspotImage);
    const currentSceneryspotImage =
      sceneryspotImage && sceneryspotImage.length > 0
        ? RESOURCE_URL + sceneryspotImage
        : DEFAULT.BLACKBOARDIMAGE_URI;
    this.setData({
      currentSceneryspot: sceneryspot,
      currentSceneryspotImage,
    });
  },

  allEvent: function () {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1].route;
    wx.navigateTo({
      url: '/pages/event/list/index?redirectUrl=' + currentPage,
    });
  },

  eventDetail: function (e) {
    wx.navigateTo({
      url: '/pages/event/detail/index?eventId=' + e.currentTarget.id,
    });
  },

  sceneryspotDetail: function () {
    wx.reLaunch({ url: '/pages/map/index' });
  },

  messageDetail: function (e) {
    var url =
      '../../message/pages/detail/index?messageIndex=' + e.currentTarget.id;
    wx.navigateTo({ url: url });
  },

  tabChangeHandle: async function (e) {
    const { value } = e.detail;
    this.loadScenerySpot(app.globalData.currentSceneryspots[value].id);
  },

  go: function (e) {
    const { url } = e.currentTarget.dataset;
    console.log(url);
    if (url) {
      wx.navigateTo({ url });
    }
  },

  goService: function (e) {
    const { index, url } = e.currentTarget.dataset;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      wx.navigateTo({
        url: `/pages/passport/guides/index?idx=${index}`,
      });
    } else {
      wx.navigateTo({ url: url });
    }
  },

  goServiceItem: function (e) {
    var url =
      '../../sceneryspot/pages/serviceItem/index?type=' +
      e.currentTarget.dataset.type;
    wx.navigateTo({ url: url });
  },

  goHealthCode: function (e) {
    wx.navigateToMiniProgram({
      appId: 'wx82d43fee89cdc7df',
      extraData: {},
      envVersion: 'release',
    });
  },

  tapFollowing: async function (e) {
    var input = {
      user_id: wx.getStorageSync('userId'),
      following: e.currentTarget.id,
    };
    var result = await following(input);

    if (result.succed) {
      wx.showToast({
        title: '关注成功',
      });

      var tweets = this.data.tweets;
      tweets.forEach((i) => {
        if (i.user_id == e.currentTarget.id) {
          i.isFollowing = true;
        }
      });

      this.setData({
        tweets: tweets,
      });

      var followerInput = {
        user_id: e.currentTarget.id,
        follower: wx.getStorageSync('userId'),
      };

      followers(followerInput);
    }
  },

  tapLike: async function (e) {
    var input = {
      userId: wx.getStorageSync('userId'),
      tweetId: e.currentTarget.dataset.tweetid,
    };

    var result = await likeTweet(input);

    if (result.succed) {
      var tweets = this.data.tweets;
      tweets[e.currentTarget.dataset.index].hasLike = true;
      tweets[e.currentTarget.dataset.index].like_count += 1;

      this.setData({
        tweets: tweets,
      });
    }
  },

  tapUnlike: async function (e) {
    // var input = {
    //   "userId": wx.getStorageSync('userId'),
    //   "tweetId": e.currentTarget.dataset.tweetid,
    // }
    // var result = await unlikeTweet(input);
    // if (result.succed) {
    //   var tweets = this.data.tweets;
    //   tweets[e.currentTarget.dataset.index].hasLike = false;
    //   var like_count = tweets[e.currentTarget.dataset.index].like_count;
    //   like_count -= 1;
    //   like_count < 0 ? 0 : like_count;
    //   tweets[e.currentTarget.dataset.index].like_count = like_count;
    //   this.setData({
    //     tweets: tweets
    //   });
    // }
  },
  tapBarrage: function (e) {
    // console.log({ e })
    wx.navigateTo({ url: '/pages/badge/index' });
  },
  tapChat: function (e) {
    wx.reLaunch({ url: '/pages/conversation/index' });
  },
});
