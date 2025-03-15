import { RESOURCE_URL, DEFAULT } from '../../../constants/index'
import { ago } from '../../../utils/util'
import { createConversation, getParticipantConversations } from '../../../model/user'

const app = getApp()

Page({
  data: {
    participant: null,
    to: null,
    content: '',
    conversations: [],
    allowReply: false,
  },
  async onLoad(options) {
    const { participant, from } = options
    const { user } = app.globalData
    const conversations = await getParticipantConversations(participant, from)

    let to = null
    for (var i = conversations.length - 1; i >= 0; i--) {
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
      })),
      allowReply: to != null && to.length > 0,
    })
  },
  onShow() {

  },
  onMessage(e) {
    const { user } = app.globalData
    const { participant, to, conversations } = this.data
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
  }
});