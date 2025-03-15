import { RESOURCE_URL } from '../../../constants/index'
import { formatTime } from '../../../utils/util.js'
const { getEventPassport, getTemporaryTasks } = require('../../../model/event')
const app = getApp()

const taskUris = {
  '95e1fa0f-40b5-4ae9-84ec-4e65c24e7f7d': '../trek/index',
  '0db57a33-ab01-449c-961b-2c1015f35496': '../question/index',
  '00e19ddf-6af6-4d8a-889f-a4dc6a030c02': '../geocaching/index',
  '62127eeb-29b7-461a-a065-ae62cc5201aa': '../screenshot/index',
  'd64b951d-1c06-4254-b88b-4a0459caac4d': '../puzzle/index',
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultUserAvatar:
      'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/icon-user-center-avatar@2x.png',
    userId: '',
    eventId: '',
    sceneryspotId: '',
    user: {
      name: '',
      avatar: '',
      label: '',
      passportCode: '',
      eventName: '',
    },
    event: {
      id: '',
      name: '',
      logo: '',
      banner: '',
    },
    sceneryspot: undefined,
    tasks: [],
  },
  async setup() {
    const {
      user,
      sceneryspot,
      currentEvent: event,
    } = app.globalData
    const { id: userId } = user
    const { id: eventId } = event
    const { id: sceneryspotId } = sceneryspot
    const phone = ''
    const passport = await getEventPassport(eventId, userId, phone)
    if (!passport) {
      wx.showModal({
        title: `您尚未领取<${event.name}>的护照！`,
        showCancel: false,
        complete: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
      return
    }

    const tasks = await getTemporaryTasks(userId, eventId, '')
    const time = formatTime(new Date(), 'YYYY/MM/DD HH:mm')

    this.setData({
      userId,
      event: { ...event, images: event.images.split(',') },
      eventId,
      sceneryspotId,
      sceneryspot,
      user: {
        name: user.wechat_name,
        avatar: user.wechat_avatar && user.wechat_avatar.length > 0 ? RESOURCE_URL + user.wechat_avatar : undefined,
        passportCode: passport.code,
        eventName: event.name,
      },
      tasks: tasks.map(v => ({
        ...v,
        completedTime: formatTime(new Date(v.timestamp * 1000), 'YYYY/MM/DD HH:mm'),
      })),
      time,
    })
  },
  async setTasks() {
    const { userId, eventId, sceneryspotId } = this.data
    if (userId && eventId && sceneryspotId) {
      const tasks = await getTemporaryTasks(userId, eventId, '', sceneryspotId)
      this.setData({
        tasks: tasks.map(v => ({
          ...v,
          completedTime: formatTime(new Date(v.timestamp * 1000), 'YYYY/MM/DD HH:mm'),
        })),
      })
    }
  },
  onLoad: function (options) {
    this.setup()
  },
  onShow: function () {
    this.setTasks()
  },
  onSelectEvent: function () {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1].route;
    wx.navigateTo({ url: '/pages/event/list/index?redirectUrl=' + currentPage });
  },
  go: function (event) {
    wx.navigateTo({
      url: event.currentTarget.dataset.url,

    })
  },
  goIm: function (event) {
    wx.showToast({
      title: '准备中...',
      icon: 'loading',
      duration: 5500,

      mask: true,
      success: function () {
        setTimeout(function () {

          wx.navigateTo({
            url: event.currentTarget.dataset.url,

          })
        }, 3500)
      }
    })
  },
  gono: function (event) {
    var im = this.data.state
    if (im == 2) {
      wx.navigateTo({
        url: event.currentTarget.dataset.url,

      })
    }
    else {
      wx.showToast({
        title: '完成任务后激活',
        icon: 'error',
        duration: 2000
      })
    }

  },
  onSelectSceneryspot: function () {
    wx.navigateTo({ url: '../../sceneryspot/index' });
  },
  onTask: function (e) {
    const { user } = this.data
    const { id, category_id } = e.currentTarget.dataset.value
    const uri = taskUris[category_id]
    if (uri && uri.length > 0) {
      wx.navigateTo({ url: uri + `?id=${id}&campId=${user.campId ?? ""}` })
    }
  }
})
