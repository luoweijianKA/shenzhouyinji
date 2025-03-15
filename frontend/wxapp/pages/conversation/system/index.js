import { RESOURCE_URL, DEFAULT } from '../../../constants/index'
import { ago } from '../../../utils/util'
import { createConversation, getParticipantConversations } from '../../../model/user'

const app = getApp()
let interval = null

Page({
  data: {
    participant: 0,
    from: null,
    title: "系统消息",
    to: null,
    content: '',
    conversations: [],
    onlyRead: true,
    allowReply: false,
  },
  async onLoad() {
    const { participant, from, title } = this.data
    wx.setNavigationBarTitle({ title })
    const { user } = app.globalData
    const conversations = await getParticipantConversations(participant, from)

    let to = null
    for (var i = 0; i < conversations.length; i++) {
      if (conversations[i].user_id !== user.id) {
        to = conversations[i].user_id
        break
      }
    }

    this.setData({
      participant,
      to,
      conversations: conversations.map(v => ({
        ...v,
        user_avatar: v.user_avatar && v.user_avatar.length > 0 ? RESOURCE_URL + v.user_avatar : DEFAULT.AVATAR_URL,
        title: `${v.user_name}, ${ago(v.send_time)}`,
        align_content: user.id === v.user_id ? 'right' : 'left'
      })).sort((a, b) => b.send_time - a.send_time),
      allowReply: to != null && to.length > 0,
    })
  },
  onUnload: function () {
    clearInterval(interval);
  },
  onShow: function () {
    var _this = this;
    interval = setInterval(async () => {
      _this.loadMessages();
    }, 5 * 1000);
  },
  onMessage(e) {
    const { user } = app.globalData
    const { participant, from, to, conversations } = this.data
    const content = e.detail.value
    const input = { participant, to, content }

    createConversation(input).then((data) => {
      console.log({ data })
      this.setData({
        content: '',
        conversations: [
          ...conversations,
          {
            ...data,
            user_avatar: data.user_avatar && data.user_avatar.length > 0 ? RESOURCE_URL + data.user_avatar : DEFAULT.AVATAR_URL,
            title: `${data.user_name}, ${ago(data.send_time)}`,
            align_content: user.id === data.user_id ? 'right' : 'left'
          }
        ]
      })
    })
      .catch(e => {
        wx.showModal({ title: e.message, showCancel: false })
      })
  },
  async loadMessages() {
    const { user } = app.globalData
    const { participant, from } = this.data
    const conversations = await getParticipantConversations(participant, from)

    let to = null
    for (var i = 0; i < conversations.length; i++) {
      if (conversations[i].user_id !== user.id) {
        to = conversations[i].user_id
        break
      }
    }

    this.setData({
      to,
      conversations: conversations.map(v => ({
        ...v,
        user_avatar: v.user_avatar && v.user_avatar.length > 0 ? RESOURCE_URL + v.user_avatar : DEFAULT.AVATAR_URL,
        title: `${v.user_name}, ${ago(v.send_time)}`,
        align_content: user.id === v.user_id ? 'right' : 'left'
      })).sort((a, b) => b.send_time - a.send_time),
    })
  },
});