import { RESOURCE_URL, DEFAULT, YIN_ICON } from '../../constants/index';
const {
  getUserUnreadMessage,
  clearUserUnreadMessage,
} = require('../../model/usercenter');
import Toast from 'tdesign-miniprogram/toast/index';
const app = getApp();
let interval = null;

const tweetMenu = [
  {
    title: '关注',
    iconName: 'star',
    notifyNum: 0,
  },
  {
    title: '粉丝',
    iconName: 'member',
    notifyNum: 0,
  },
  {
    title: '印迹',
    iconName: 'copy',
    notifyNum: 0,
  },
];

const pageMenu = [
  [
    {
      title: '个人信息',
      note: '',
      url: '',
      type: 'profile',
    },
    {
      title: '我的活动',
      note: '',
      url: '',
      type: 'event',
    },
    {
      title: '我的积分',
      note: '',
      url: '',
      type: 'points',
    },
    {
      title: '我的相册',
      note: '',
      url: '../../../tweet/pages/list/index',
      type: 'tweet',
    },
    {
      title: '印迹地图',
      note: '',
      url: '',
      type: 'map',
    },
    {
      title: '印迹荣耀',
      note: '',
      tit: '',
      type: 'honour',
    },
    {
      title: '竞技打榜',
      note: '',
      url: '',
      type: 'ranking',
    },
    {
      title: '徽章交换',
      note: '',
      url: '',
      type: 'badge-exchange',
    },
  ],
  [
    {
      title: '护照发放',
      note: '',
      url: '',
      type: 'distribute-passport',
      role: 'OPERATOR',
    },
    {
      title: '发放记录',
      note: '',
      url: '',
      type: 'distribute-history',
      role: 'OPERATOR',
    },
  ],
];

Page({
  data: {
    userInfo: [],
    tweetMenu: tweetMenu,
    pageMenu: pageMenu.map((v) =>
      v.filter((m) => !m.role || m.role === 'USER'),
    ),
    avatarUrl: DEFAULT.AVATAR_URL,
    nickname: DEFAULT.NICKNAME,
    resourceUrl: RESOURCE_URL,
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.user,
    });
    this.loadUnreadMessage();
  },
  onHide: function () {
    clearInterval(interval);
  },
  onUnload: function () {
    clearInterval(interval);
  },
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 4,
        yinIcon: YIN_ICON,
      });
    }
    const { user } = app.globalData;
    if (user) {
      this.setData({
        pageMenu: pageMenu.map((v) =>
          v.filter((m) => !m.role || m.role === 'USER' || m.role === user.role),
        ),
      });
    }

    var _this = this;
    interval = setInterval(async () => {
      _this.loadUnreadMessage();
    }, 10 * 1000);
  },

  async loadUnreadMessage() {
    var result = await getUserUnreadMessage();
    tweetMenu[1].notifyNum = result.followers;
    // tweetMenu[2].notifyNum = result.like;

    this.setData({
      tweetMenu: tweetMenu,
    });

    // const total = parseInt(result.conversation) + parseInt(result.notification);
    // this.getTabBar().setData({ total: total });
  },

  onClickItem(e) {
    var type = e.currentTarget.dataset.item.title;
    switch (type) {
      case '关注': {
        wx.navigateTo({ url: '/pages/usercenter/following/index' });
        break;
      }
      case '粉丝': {
        this.clearMessage('Followers');
        tweetMenu[1].notifyNum = 0;

        this.setData({
          tweetMenu: tweetMenu,
        });
        wx.navigateTo({ url: '/pages/usercenter/followers/index' });
        break;
      }
      case '印迹': {
        // this.clearMessage("Like");
        // tweetMenu[2].notifyNum = 0;

        this.setData({
          tweetMenu: tweetMenu,
        });
        wx.navigateTo({ url: '/pages/usercenter/record/index' });
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  onClickCell(e) {
    const { type } = e.currentTarget.dataset;

    switch (type) {
      case 'event': {
        wx.navigateTo({ url: './myevent/index' });
        break;
      }
      case 'profile': {
        wx.navigateTo({ url: '/pages/usercenter/profile/index' });
        break;
      }
      case 'tweet': {
        wx.navigateTo({ url: '../../tweet/pages/list/index' });
        break;
      }
      case 'map': {
        wx.navigateTo({ url: './map/index' });
        break;
      }
      case 'honour': {
        wx.navigateTo({ url: './honour/index' });
        break;
      }
      case 'ranking': {
        wx.navigateTo({ url: './ranking/index' });
        break;
      }
      case 'points': {
        wx.navigateTo({ url: './points/index' });
        break;
      }
      case 'badge-exchange': {
        wx.navigateTo({ url: '/pages/badge/exchange' });
        break;
      }
      case 'distribute-passport': {
        wx.navigateTo({ url: '/pages/passport/distribute/index' });
        break;
      }
      case 'distribute-history': {
        wx.navigateTo({ url: '/pages/passport/distribute-history/index' });
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  async clearMessage(type) {
    var result = clearUserUnreadMessage(type);
    console.log(result);
  },
});
