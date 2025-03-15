import { RESOURCE_URL } from '../../../constants/index'
import { formatTime } from '../../../utils/util'
import { getUserEvents } from '../../../model/event'
const app = getApp()

Page({
  data: {
    user: undefined,
    events: [],
  },
  onLoad: async function (options) {
    const { user } = app.globalData
    const events = await getUserEvents(user.id)
    this.setData({
      user: {
        id: user.id,
        name: user.wechat_name,
        avatar: user.wechat_avatar && user.wechat_avatar.length > 0 ? RESOURCE_URL + user.wechat_avatar : undefined,
      },
      events: events.filter(v => v.status === 1).map(v => ({
        ...v,
        banner: v.images.split(',')[1],
        start_time: formatTime(new Date(v.start_time * 1000), 'YYYY/MM/DD'),
        end_time: formatTime(new Date(v.end_time * 1000), 'YYYY/MM/DD'),
      })),
    })
  },
  bindDetails: function (e) {
    const { id } = e.currentTarget
    wx.navigateTo({ url: `/pages/event/detail/index?eventId=${id}` });
  },
})