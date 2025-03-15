import { RESOURCE_URL } from '../../constants/index'
import { formatTime } from '../../utils/util.js'
const { getEventPassport, getUserCampAndHonour, getTasks } = require('../../model/event')
const app = getApp()

const taskUris = {
  '95e1fa0f-40b5-4ae9-84ec-4e65c24e7f7d': './trek/index',
  '0db57a33-ab01-449c-961b-2c1015f35496': './question/index',
  '00e19ddf-6af6-4d8a-889f-a4dc6a030c02': './geocaching/index',
  '62127eeb-29b7-461a-a065-ae62cc5201aa': './screenshot/index',
  'd64b951d-1c06-4254-b88b-4a0459caac4d': './puzzle/index',
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
    campId: '',
    sceneryspotId: '',
    user: {
      name: '',
      avatar: '',
      label: '',
      passportCode: '',
      eventName: '',
      campId: '',
      campName: ''
    },
    sceneryspot: undefined,
    tasks: [],
    optionalTasks: [],
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
    const { camp_id: campId, honour: honourId } = passport.camp
    const { camp, honour } = await getUserCampAndHonour(campId, honourId)
    const tasks = await getTasks(userId, eventId, campId, sceneryspotId)
    const time = formatTime(new Date(), 'YYYY/MM/DD HH:mm')

    this.setData({
      userId,
      eventId,
      campId,
      sceneryspotId,
      sceneryspot,
      user: {
        name: user.wechat_name,
        avatar: user.wechat_avatar && user.wechat_avatar.length > 0 ? RESOURCE_URL + user.wechat_avatar : undefined,
        label: honour.name,
        passportCode: passport.code,
        eventName: event.name,
        campId: camp.id,
        campName: camp.name,
      },
      tasks: tasks.filter(v => !v.optional).map(v => ({
        ...v,
        completedTime: formatTime(new Date(v.timestamp * 1000), 'YYYY/MM/DD HH:mm'),
      })),
      optionalTasks: tasks.filter(v => v.optional).map(v => ({
        ...v,
        completedTime: formatTime(new Date(v.timestamp * 1000), 'YYYY/MM/DD HH:mm'),
      })),
      time,
    })
  },
  async setTasks() {
    const {
      userId,
      eventId,
      campId,
      sceneryspotId,
    } = this.data

    if (userId && eventId && campId && sceneryspotId) {
      const tasks = await getTasks(userId, eventId, campId, sceneryspotId)
      this.setData({
        tasks: tasks.filter(v => !v.optional).map(v => ({
          ...v,
          completedTime: formatTime(new Date(v.timestamp * 1000), 'YYYY/MM/DD HH:mm'),
        })),
        optionalTasks: tasks.filter(v => v.optional).map(v => ({
          ...v,
          completedTime: formatTime(new Date(v.timestamp * 1000), 'YYYY/MM/DD HH:mm'),
        })),
      })
    }
  },
  onLoad: function (options) {
    this.setup()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setTasks()
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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
    wx.navigateTo({ url: '../sceneryspot/index' });
  },
  onTask: function (e) {
    const { user } = this.data
    const { id, category_id, completed } = e.currentTarget.dataset.value
    if (!completed) {
      const uri = taskUris[category_id]
      if (uri && uri.length > 0) {
        wx.navigateTo({ url: uri + `?id=${id}&campId=${user.campId}` })
      }
    }
  }

})

//倒计时60秒
function countDown(that, count) {
  if (count == 0) {
    that.setData({
      counttime: count,
      opacity: 1,
      disabled: false
    })
    return;
  }
  that.setData({
    counttime: count
  })
  setTimeout(function () {
    count--;
    countDown(that, count);
  }, 1000);
}