import { RESOURCE_URL, DEFAULT } from '../../constants/index'
import { ago } from '../../utils/util'
import { getUserConversations } from '../../model/user'

const app = getApp()

Page({
  data: {
    conversations: [],
  },
  async onShow() {
    const { user } = app.globalData
    const conversations = await getUserConversations(user.id)
    
    this.setData({
      conversations: conversations.map(v => ({
        ...v,
        user_avatar: v.user_avatar && v.user_avatar.length > 0 ? RESOURCE_URL + v.user_avatar : DEFAULT.AVATAR_URL,
        note: ago(v.send_time)
      }))
    })
  },
  tapConversation(e) {
    const { participant } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/chat/conversation/index?participant=${participant}` })
  }
});