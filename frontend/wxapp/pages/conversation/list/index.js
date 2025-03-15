import { RESOURCE_URL, DEFAULT, YIN_ICON } from '../../../constants/index'
import { ago } from '../../../utils/util'
import { getUserConversations } from '../../../model/user'
import { getUserUnreadMessage, clearUserUnreadMessage } from '../../../model/usercenter'
import { getUserSwap } from '../../../model/badge'

const app = getApp()
let interval = null

Page({
  data: {
    title: "徽章交换",
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
    swaps: {}
  },
  onLoad: function () {
    const { title } = this.data
    wx.setNavigationBarTitle({ title })
    this.loadUnreadMessage();
  },
  onHide: function () {
    if (interval) {
      clearInterval(interval);
    }
  },
  onUnload: function () {
    if (interval) {
      clearInterval(interval);
    }
  },
  onShow: function (params) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 3,
        yinIcon: YIN_ICON,
      })
    }

    // var _this = this;
    // interval = setInterval(async () => {
    //   _this.loadUnreadMessage();
    // }, 10 * 1000);
  },
  async loadUnreadMessage() {
    const messages = await getUserUnreadMessage();
    const total = parseInt(messages.conversation) + parseInt(messages.notification);

    if (total == 0) {
      this.setData({ hasMessage: false });
    } else {
      this.setData({ hasMessage: true });
    }

    const { user } = app.globalData
    var { swaps } = this.data
    var conversations = await getUserConversations(user.id)

    for (const key in conversations) {
      if (Object.hasOwnProperty.call(conversations, key)) {
        const element = conversations[key];
        if (!swaps[element.participant] && element.participant !== "0" && element.participant !== "1" && element.participant !== "2") {
          const swap = await getUserSwap(element.participant)
          swaps = {
            ...swaps,
            [swap.id]: {
              ...swap,
              badges: swap.badges.map(badge => ({ ...badge, images: RESOURCE_URL + badge.images })),
              city: swap.city.split(','),
              expiresIn: ago(swap.createTime),
            }
          }
          conversations[key] = {
            ...element,
            user_id: swap.userId,
            user_name: swap.userName,
            user_avatar: swap.userAvatar,
          }
        }
      }
    }
    this.setData({
      conversations: conversations.filter(v => v.participant !== "0" && v.participant !== "1" && v.participant !== "2").map(v => ({
        ...v,
        user_avatar: v.user_avatar && v.user_avatar.length > 0 ? RESOURCE_URL + v.user_avatar : DEFAULT.AVATAR_URL,
        note: ago(v.send_time)
      })),
      swaps,
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
    const { participant, from, title } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/conversation/details/index?participant=${participant}&from=${from}&title=${title}` })
  }
});
