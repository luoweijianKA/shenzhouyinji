import { RESOURCE_URL, DEFAULT, YIN_ICON } from '../../constants/index'
import { ago } from '../../utils/util'
import { getUserConversations } from '../../model/user'
import { getUserUnreadMessage, clearUserUnreadMessage } from '../../model/usercenter';

const app = getApp()
let interval = null

Page({
  data: {
    hasMessage: true,
    systemMessage: "",
    customerServiceMessage: "",
    right: [
      {
        text: '删除',
        className: 't-swipe-cell-demo-btn delete-btn',
      },
    ],
    conversations: [],
    system: 0,
    customerServicem: 0,
    reward: 0,
    badge: 0,
  },
  onHide: function () {
    console.log("onHide")
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  },
  onUnload: function () {
    console.log("onUnload")
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  },
  onShow: function (params) {
    console.log("onShow")
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 3,
        yinIcon: YIN_ICON,
      })
    }

    this.loadUnreadMessage();

    var _this = this;
    interval = setInterval(async () => _this.loadUnreadMessage(), 5 * 1000);
  },
  openConversation(e) {
    const { value } = e.currentTarget.dataset;
    if (value == "01") {
      clearUserUnreadMessage("Conversation");
    }

    if (value == "00") {
      clearUserUnreadMessage("Notification");
    }

    switch (value) {
      case '0': {
        wx.navigateTo({ url: `/pages/conversation/details/index?participant=${value}&title=系统消息` })
      }
      case '1': {
        wx.navigateTo({ url: `/pages/conversation/details/index?participant=${value}&title=客服消息` })
      }
      case '2': {
        wx.navigateTo({ url: `/pages/conversation/details/index?participant=${value}&title=奖励消息` })
      }
      case '3': {
        wx.navigateTo({ url: '/pages/conversation/list/index?title=徽章交换' })
      }
    }
  },
  async loadUnreadMessage() {
    const messages = await getUserUnreadMessage();
    const total = parseInt(messages.conversation) + parseInt(messages.notification);

    // if (messages.conversation > 0) {
    //   let description = `[您有 ${messages.conversation} 条新消息]`;
    //   this.setData({
    //     customerServiceMessage: description,
    //   })
    // } else {
    //   this.setData({
    //     customerServiceMessage: "",
    //   })
    // }

    // if (messages.notification > 0) {
    //   let description = `[您有 ${messages.notification} 条新消息]`;
    //   this.setData({
    //     systemMessage: description,
    //   })
    // } else {
    //   this.setData({
    //     systemMessage: "",
    //   })
    // }

    if (total == 0) {
      this.setData({ hasMessage: false });
    } else {
      this.setData({ hasMessage: true });
    }

    const { user } = app.globalData
    const conversations = await getUserConversations(user.id)

    this.setData({
      ...messages,
      conversations: conversations.filter(v => v.participant !== "0" && v.participant !== "1").map(v => ({
        ...v,
        user_avatar: v.user_avatar && v.user_avatar.length > 0 ? RESOURCE_URL + v.user_avatar : DEFAULT.AVATAR_URL,
        note: ago(v.send_time)
      }))
    })
  },
  async clearUnreadMessage(e) {
    const { value } = e.currentTarget.dataset;
    clearUserUnreadMessage(value);

    if (value == "Conversation") {
      this.setData({
        customerServiceMessage: "",
      })
    }

    if (value == "Notification") {
      this.setData({
        systemMessage: "",
      })
    }
    this.loadUnreadMessage();
  },
  async clearAllMessage() {
    if (this.data.hasMessage) {
      clearUserUnreadMessage("");
      this.loadUnreadMessage();
      this.setData({
        systemMessage: "",
        customerServiceMessage: "",
      })
    }
  },
  tapConversation(e) {
    const { participant, title } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/conversation/details/index?participant=${participant}&title=` })
  },
  navigateTo(e) {
    const { url } = e.currentTarget.dataset
    wx.navigateTo({ url })
  }
});
