import { RESOURCE_URL } from '../../../constants/index'
import { formatTime } from '../../../utils/util'
import { getRanks, getUserEvents } from '../../../model/event'
import { mockUserRankings } from '../../../utils/mock'
const app = getApp()

Page({
  data: {
    user: undefined,
    event: undefined,
    campRanks: [],
    userRanks: [],
  },
  onLoad: async function (options) {
    const { user, currentEvent } = app.globalData
    const events = await getUserEvents(user.id, currentEvent.id)
    const { campRanks, userRanks } = await getRanks(currentEvent.id)

    this.setData({
      user: {
        id: user.id,
        name: user.wechat_name,
        avatar: user.wechat_avatar && user.wechat_avatar.length > 0 ? RESOURCE_URL + user.wechat_avatar : undefined,
      },
      event: events.length > 0 ? events.filter(v => v.status === 1).map(v => ({
        ...v,
        images: v.images.split(','),
        start_time: formatTime(new Date(v.start_time * 1000), 'YYYY/MM/DD'),
        end_time: formatTime(new Date(v.end_time * 1000), 'YYYY/MM/DD'),
      }))[0] : undefined,
      campRanks,
      userRanks,
    })
  },
  onSelectEvent: function () {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1].route;
    wx.navigateTo({ url: '/pages/event/list/index?redirectUrl=' + currentPage });
  },
  bindDetails: function (e) {
    const { id } = e.currentTarget
    wx.navigateTo({ url: `/pages/event/detail/index?eventId=${id}` });
  },
})