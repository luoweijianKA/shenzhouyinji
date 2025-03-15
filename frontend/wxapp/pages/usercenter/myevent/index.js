import { RESOURCE_URL } from '../../../constants/index'
import { getUserEvents } from '../../../model/event'
const app = getApp()

Page({
  data: {
    user: undefined,
    events: []
  },
  onLoad: async function (options) {
    const { user } = app.globalData
    console.log({ user })
    const events = await getUserEvents(user.id)
    this.setData({
      user: {
        id: user.id,
        name: user.wechat_name,
        avatar: user.wechat_avatar && user.wechat_avatar.length > 0 ? RESOURCE_URL + user.wechat_avatar : undefined,
      },
      events: events.filter(v => v.status === 1).map(v => ({ ...v, banner: v.images.split(',')[1] })),
    })
  },
  bindDetails: function (e) {
    const { id } = e.currentTarget
    wx.navigateTo({ url: `/pages/event/detail/index?eventId=${id}` });
  },
})