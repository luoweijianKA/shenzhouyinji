const { getEvent } = require('../../../model/event')
const { getPassport, activatePassport } = require('../../../model/passport')
const app = getApp()

Page({
  data: {
    value: undefined,
    event: undefined,
    passport: undefined,
    scanCode: ''
  },
  onLoad({ id, eventId }) {
    wx.stopPullDownRefresh()
    this.loadPassport(id, eventId)
  },
  onShow: function (params) {

  },
  onScan: function (e) {
    const self = this
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        const { result } = res
        self.setData({ scanCode: result })
      }
    })
  },
  onSubmit: function (e) {
    const { value, passport } = this.data
    if (value && passport) {
      const { user } = app.globalData
      const { passportCode } = e.detail.value
      if (!passportCode || passportCode.length === 0) {
        wx.showModal({
          title: '提示',
          content: '请扫护照码，如有疑问请联系微信客服',
          showCancel: false,
        })
        return
      }
      if (passport.passport_code.length > 0 && passport.passport_code != passportCode) {
        wx.showModal({
          title: '提示',
          content: '此领取码已录入，请勿重复，如有疑问请联系微信客服',
          showCancel: false,
        })
        return
      }

      const input = {
        id: value,
        userId: passport.user_id.length > 0 ? passport.user_id : user.id,
        eventId: passport.event_id,
        passportCode
      }
      activatePassport(input)
        .then((data) => {
          console.log({ data })
          wx.showModal({
            title: '提示',
            content: '护照已激活成功！',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/home/home',
                })
              }
            }
          })
        })
        .catch(err => {
          wx.showModal({
            content: err.message,
            showCancel: false,
          })
        })
    }
  },
  loadPassport: async function (id, eventId) {
    const passport = await getPassport(id)
    if (passport && passport.event_id === eventId) {
      const event = await getEvent(passport.event_id)
      this.setData({ value: id, event, passport })
    } else {
      wx.showModal({
        title: '无效的领取码',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    }
  }
})