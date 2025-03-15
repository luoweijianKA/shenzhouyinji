
import { RESOURCE_URL, YIN_SELECTED_ICON } from '../../constants/index'
import { getServiceItemsWithCategory } from '../../model/sceneryspot'
import { getPassportByCode, createUserPassport } from '../../model/passport'
import { getUserInfo } from '../../model/usercenter'
const { genNotifyList } = require('../../model/notify')
const { genEventSceneryspots, getEventSettings, getEventPassport, getEventCamps, createUserCamp, getTasks } = require('../../model/event')
const { genSceneryspotsByIDs } = require('../../model/sceneryspot')
const { getUserPhoneNumber, getUserShare, getUserStamp, getUserEventAward } = require('../../model/user')
const app = getApp();

Page({
  data: {
    notifySrcs: [],
    sceneryspot: [],
    current: 1,
    autoplay: true,
    duration: 1000,
    interval: 5000,
    navigation: { type: 'dots-bar' },
    open: false, //弹出层显示与否
    disabled: true,  //是否可用
    opacity: 0.8,    //设置透明度
    counttime: 30,
    userId: undefined,
    phoneNumber: undefined,
    rememberMe: {},
    event: {
      id: '',
      name: '',
      logo: '',
      banner: '',
      alert: ''
    },
    sceneryspot: undefined,
    passport: undefined,
    camps: [],
    campNames: [],
    shared: false,
    stamped: undefined,
    award: undefined,
    completedTask: false,
    openCampModal: false,
    openCampList: false,
    selectedCamp: undefined,
    menus: {},
    activatePassport: null,
    visibleActivatePassport: false,
  },

  async onLoad(option) {
    wx.stopPullDownRefresh()
    const userInfo = await getUserInfo(app.globalData.user.id)
    app.globalData.user = userInfo

    this.setData({
      pageLoading: true,
      userInfo: userInfo,
      sceneryspot: app.globalData.sceneryspot
    })

    genNotifyList().then((notify) => {
      this.setData({
        notifySrcs: notify,
        pageLoading: false,
      })
    })

  },
  onShow: async function (params) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 2,
        yinIcon: YIN_SELECTED_ICON,
      })
    }
    const user = await getUserInfo(app.globalData.user.id)
    app.globalData.user = user
    const { configs, currentEvent: event, sceneryspot } = app.globalData
    const userId = user.id
    const phoneNumber = user.profile?.phone ?? ''
    const rememberMe = wx.getStorageSync('rememberMe')
    if (event) {
      const { id, name, images } = event
      const imageUris = images.split(',')
      const logo = `${RESOURCE_URL}${imageUris[0]}`
      const banner = `${RESOURCE_URL}${imageUris[1]}`
      const alert = `${RESOURCE_URL}${imageUris[4]}`
      const open = !rememberMe[id] || rememberMe[id] < Math.floor(new Date().getTime() / 1000)

      this.setData({
        userId,
        phoneNumber,
        open,
        event: { id, name, logo, banner, alert },
        activatePassport: null,
        visibleActivatePassport: false,
        sceneryspot,
      })
      // show sceneryspot
      this.setMenus(event.id)
      this.loadEventPassport(id, userId, phoneNumber, sceneryspot.id)
      this.setEventCamps(event.id)
      this.setShare()
      this.setStamp()
      // this.setAward()

      if (open) {
        // count down 30 secs
        countDown(this, parseInt(configs.eventAlertDuration))
      }
    }
  },

  onSelectEvent: function () {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1].route;
    wx.navigateTo({ url: '/pages/event/list/index?redirectUrl=' + currentPage });
  },

  onSelectSceneryspot: function () {
    wx.navigateTo({ url: '../sceneryspot/index' });
  },

  onKnow: function (e) {
    const { rememberMe } = this.data
    var storedRememberMe = wx.getStorageSync('rememberMe')
    if (typeof storedRememberMe === 'string') {
      storedRememberMe = {}
    }
    wx.setStorageSync('rememberMe', { ...storedRememberMe, ...rememberMe })
    this.setData({ open: false, disabled: false, opacity: 0.8 })
  },
  onRememberMe: function (e) {
    const { value } = e.currentTarget.dataset
    const { rememberMe } = this.data
    if (rememberMe && rememberMe[value]) {
      this.setData({ rememberMe: { ...rememberMe, [value]: undefined } })
    } else {
      this.setData({
        rememberMe: {
          ...(rememberMe ?? {}),
          [value]: Math.floor(new Date().getTime() / 1000) + (3600 * 24 * 7),
        }
      })
    }
  },
  onGo: function (e) {
    const { passport } = this.data
    if (passport && passport.code.length === 0) {
      wx.navigateTo({ url: `/pages/passport/takecode/index?id=${passport.id}` })
      return
    }
    const { url } = e.currentTarget.dataset
    if (url && url.length > 0) {
      wx.navigateTo({ url })
    }
  },
  onActivatePassport: function (e) {
    const { passport } = this.data
    if (!passport || !passport.activated) {
      const self = this
      const { event } = this.data
      wx.scanCode({
        onlyFromCamera: true,
        success({ result }) {
          setTimeout((code) => {
            getPassportByCode(code).then(({ code, event_id, status }) => {
              if (event.id === event_id) {
                if (status != 0) {
                  wx.showModal({
                    title: '请勿重复激活，如有疑问请联系微信客服',
                    showCancel: false,
                  })
                } else {
                  self.setData({
                    activatePassport: {
                      code,
                      event_id: event.id,
                      event_name: event.name,
                    },
                    visibleActivatePassport: true,
                  })
                }
              } else {
                wx.showModal({
                  title: '护照无效，如有疑问请联系微信客服',
                  showCancel: false,
                })
              }
            })
          }, 1000, result)
        }
      })
    }
  },
  onActivatePassportChange(e) {
    this.setData({ activatePassport: null, visibleActivatePassport: false })
  },
  onActivatePassportSubmit() {
    const { user } = app.globalData
    const { phoneNumber, activatePassport } = this.data
    if (activatePassport) {
      const input = {
        user_id: user.id,
        event_id: activatePassport.event_id,
        passport_code: activatePassport.code,
        phone: phoneNumber,
        authentication: false,
        claim_code: activatePassport.code,
        claim_time: Math.floor(new Date().getTime() / 1000),
        status: 1,
        real_name: '',
        nric: '',
        gender: '',
        profession: '',
        guardian_name: '',
        guardian_nric: '',
        guardian_phone: '',
      }
      createUserPassport(input)
        .then(({ id }) => {
          if (id && id.length > 0) {
            this.setData({
              activatePassport: null,
              visibleActivatePassport: false
            })
            this.onShow()
          }
        })
        .catch(err => wx.showModal({ title: err.message, showCancel: false }))
    }
  },
  onCampVisibleChange(e) {
    this.setData({
      openCampModal: e.detail.visible,
    });
  },
  onCampListVisibleChange(e) {
    this.setData({
      openCampModal: true,
      openCampList: e.detail.visible,
    });
  },
  onSelectCamp: function () {
    const { passport } = this.data
    if (passport && passport.code.length > 0 && !passport.camp) {
      this.setData({ openCampModal: true })
    }
  },
  onSelectCampChange: function () {
    this.setData({ openCampModal: false, openCampList: true })
  },
  onChangeCamp: function (e) {
    const { camps } = this.data
    const { value } = e.currentTarget.dataset
    if (camps.length > value) {
      this.setData({
        selectedCamp: camps[value],
        openCampModal: true,
        openCampList: false
      })
    }
  },
  onSubmitCamp: function (e) {
    const self = this
    const { userId, event, selectedCamp, passport } = self.data
    if (userId && selectedCamp) {
      const input = {
        user_id: userId,
        camp_id: selectedCamp.id,
        honour: '',
        points: 0,
        status: 1,
        create_time: 0,
        event_id: event.id,
        passport_id: passport.id,
      }
      createUserCamp(input).then(({ id }) => {
        self.setData({
          passport: { ...passport, camp: { camp_id: id } },
          openCampModal: false,
        })
      })
        .catch(err => {
          wx.showModal({
            title: '提示',
            content: err.message,
            showCancel: false,
          })
        })
    }
  },
  onAward: async function (e) {
    const { disabled } = e.currentTarget.dataset
    if (!disabled) {
      const { sceneryspot } = this.data
      const services = await getServiceItemsWithCategory(sceneryspot.id, 'f9adcc8c-8315-4240-a0a1-c2f2b01212cc')
      if (services.length > 0) {
        const i = Math.floor(Math.random() * services.length)
        wx.navigateTo({ url: `/sceneryspot/pages/detail/index?id=${services[i].id}` })
      }
    }
  },
  onNav: function (e) {
    const { disabled, url } = e.currentTarget.dataset
    if (disabled === false && url && url.length > 0) {
      wx.navigateTo({ url })
    }
  },
  async loadEventPassport(eventId, userId, phone, sceneryspotId) {
    const passport = await getEventPassport(eventId, phone && phone.length > 0 ? '' : userId, phone)
    console.log("passport", passport)
    let completedTask = false
    if (passport) {
      if (passport.camp) {
        const tasks = await getTasks(userId, eventId, passport.camp.camp_id, sceneryspotId)
        const taskCount = tasks.filter(v => !v.optional).length
        completedTask = taskCount > 0 && tasks.filter(v => !v.optional && !v.completed).length === 0
      }

      this.setData({
        passport: {
          ...passport,
          activated: passport.userId.length > 0 && passport.code.length > 0,
        },
        completedTask,
      })
    }
  },
  async setEventCamps(eventId) {
    const camps = await getEventCamps(eventId)
    const campNames = camps.map(v => v.name)
    this.setData({ camps, campNames })
  },
  async setMenus(eventId) {
    const { menus } = await getEventSettings(eventId)
    this.setData({
      menus: Object.assign({}, ...menus.map(v => ({ [v]: true })))
    })
  },
  async setShare() {
    const { user, currentEvent, sceneryspot } = app.globalData
    if (user && currentEvent && sceneryspot) {
      const userShare = await getUserShare(user.id, currentEvent.id, sceneryspot.id)
      this.setData({ shared: userShare != null })
    }
  },
  async setStamp() {
    const { user, currentEvent, sceneryspot } = app.globalData
    if (user && currentEvent && sceneryspot) {
      const stamp = await getUserStamp(user.id, currentEvent.id, sceneryspot.id)
      const stamped = stamp === null ? null : stamp.status == 1
      this.setData({ stamped })
    }
  },
  async setAward() {
    const { user, currentEvent, sceneryspot } = app.globalData
    if (user && currentEvent && sceneryspot) {
      const input = {
        userId: user.id,
        eventId: currentEvent.id,
        sceneryspotId: sceneryspot.id,
        location: ''
      }
      const award = await getUserEventAward(input)
      this.setData({ award })
    }
  },
  createTweet: function () {
    var url = "../../tweet/pages/create/index";
    wx.navigateTo({ url: url });
  },

  sceneryspotDetail: function () {
    var url = "../../sceneryspot/pages/detail/index";
    wx.navigateTo({ url: url });
  },
  getPhoneNumber: async function (e) {
    const { user, currentEvent: event, sceneryspot } = app.globalData
    const eventId = event.id
    const { code } = e.detail
    if (code && code.length > 0) {
      const { phoneNumber } = await getUserPhoneNumber(user.id, code)
      if (phoneNumber && phoneNumber.length > 0) {
        const userInfo = await getUserInfo(app.globalData.user.id)
        app.globalData.user = userInfo
        this.setData({ phoneNumber })
        this.loadEventPassport(eventId, userInfo.id, phoneNumber, sceneryspot.id)
        this.onKnow(e)
      }
    }
  },
  getScenerySpots: async function (eventId) {
    const eventSceneryspots = await genEventSceneryspots(eventId);
    if (eventSceneryspots.length > 0) {
      return await genSceneryspotsByIDs(eventSceneryspots.map(v => v.scenery_spot_id));
    }

    return []
  },
  tapChat: function (e) {
    wx.reLaunch({ url: "/pages/conversation/index" });
  },
  messageDetail: function (e) {
    wx.navigateTo({ url: "../../message/pages/detail/index?messageIndex=" + e.currentTarget.id });
  },
})

function countDown(self, count) {
  if (!count || count == 0) {
    self.setData({
      counttime: 0,
      opacity: 1,
      disabled: false,
    })
    return
  }

  self.setData({ counttime: count })

  setTimeout(
    () => {
      count--
      countDown(self, count)
    },
    1000,
  )
}
