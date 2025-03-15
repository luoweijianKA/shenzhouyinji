import { RESOURCE_URL } from '../../../constants/index'
import { formatTime } from '../../../utils/util'
import { getUserEvents } from '../../../model/event'
import { getUserPoints } from '../../../model/user'
const app = getApp()

Page({
  data: {
    user: undefined,
    event: undefined,
    points: [],
  },
  onLoad: async function (options) {
    const { user, currentEvent } = app.globalData
    const events = await getUserEvents(user.id, currentEvent.id)
    const points = await getUserPoints(user.id, currentEvent.id)
    const event = events.length > 0 ? events.filter(v => v.status === 1).map(v => ({
      ...v,
      images: v.images.split(','),
      start_time: formatTime(new Date(v.start_time * 1000), 'YYYY/MM/DD'),
      end_time: formatTime(new Date(v.end_time * 1000), 'YYYY/MM/DD'),
    }))[0] : {
        camp_points: 0,
        camp_ranking: 0,
        user_points: 0,
        user_ranking: 0,
        images: currentEvent.images.split(','),
        start_time: formatTime(new Date(currentEvent.start_time * 1000), 'YYYY/MM/DD'),
        end_time: formatTime(new Date(currentEvent.end_time * 1000), 'YYYY/MM/DD'),
      }
    this.setData({
      user: {
        id: user.id,
        name: user.wechat_name,
        avatar: user.wechat_avatar && user.wechat_avatar.length > 0 ? RESOURCE_URL + user.wechat_avatar : undefined,
      },
      event,
      points: points.edges.map(v => ({
        ...v.node,
        createTime: formatTime(new Date(v.node.createTime * 1000), 'YYYY/MM/DD HH:mm')
      })),
    })
  },
  onSelectEvent: function () {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1].route;
    wx.navigateTo({ url: '/pages/event/list/index?redirectUrl=' + currentPage });
  },
})