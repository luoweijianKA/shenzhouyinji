import { RESOURCE_URL } from '../../constants/index'
import { phoneRegCheck, idtest } from '../../utils/util'
import { checkUserEventPassport, createEventPassport } from '../../model/event'
import { getUserPhoneNumber, getUserIndivIdentity, getUserIdentityAuthDetail } from '../../model/user'
import { idcard2age } from '../../utils/util'
const app = getApp()

Page({
  data: {
    genders: ['男', '女'],
    event: undefined,
    value: {},
    flowId: undefined,
    guardian: undefined,
    visibleGuardian: false,
  },
  onLoad(option) {
    wx.stopPullDownRefresh()
    console.log({ app, option })
    const { user, currentEvent: event } = app.globalData
    const imageUris = event.images.split(',')
    const logo = `${RESOURCE_URL}${imageUris[0]}`

    this.setData({
      event: { ...event, logo },
      value: {
        userId: user.id,
        eventId: event.id,
        phone: '',
      }
    })
  },
  onShow: function (options) {
    const { flowId, value, guardian } = this.data
    console.log({ onShow: options, flowId })
    if (flowId) {
      wx.showLoading({ title: '检测实名认证...', mask: true })
      let count = 0
      let timer = setInterval(() => {
        count++
        getUserIdentityAuthDetail(flowId).then((data) => {
          console.log({ getUserIdentityAuthDetail: data })
          if (data) {
            if (data.status !== 'INIT' || count >= 3) {
              if (timer) {
                clearInterval(timer)
                timer = null
              }
              wx.hideLoading()

              if (data.status === 'SUCCESS') {
                const input = { ...value, guardian }
                console.log({ input })
                createEventPassport(input).then((data) => {
                  wx.reLaunch({ url: `/pages/passport/takecode/index?id=${data}` })
                })
                  .catch(e => {
                    wx.showModal({
                      title: '错误',
                      content: e.message,
                      showCancel: false,
                    })
                  })
              } else {
                wx.showModal({
                  title: '实名认证失败，请重新认证',
                  showCancel: false,
                })
              }
            }
          }
        })
      }, 3000)
    }
  },
  onChangeGender: function (e) {
    const { genders, value } = this.data
    const gender = genders[e.detail.value]
    this.setData({
      value: { ...value, gender },
    })
  },
  onSubmit: async function (e) {
    const self = this
    const { value } = self.data
    const input = Object.assign({ ...value }, e.detail.value)
    console.log({ input })
    if (input.realName.length === 0 || input.nric.length === 0 || input.phone.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请务必真实填写姓名，身份证号，手机号码',
        showCancel: false,
      })
      return
    }
    if (input.realName.length < 2) {
      wx.showModal({
        title: '提示',
        content: '无效的姓名',
        showCancel: false,
      })
      return
    }
    if (!idtest(input.nric)) {
      wx.showModal({
        title: '提示',
        content: '无效的身份证号',
        showCancel: false,
      })
      return
    }
    if (!phoneRegCheck(input.phone)) {
      wx.showModal({
        title: '提示',
        content: '无效的手机号码',
        showCancel: false,
      })
      return
    }

    const age = idcard2age(input.nric)
    if (age < 14) {
      wx.showModal({
        title: '你未满14岁，需要监护人协助人脸识别',
        cancelText: '修改信息',
        confirmText: '我知道了',
        complete: (res) => {
          if (res.confirm) {
            this.setData({ value: { ...input }, visibleGuardian: true })
          }
        }
      })
      return
    }

    const { succed, message } = await checkUserEventPassport(input)
    if (!succed) {
      wx.showModal({ title: '提示', content: message, showCancel: false })
      return
    }

    try {
      const { flowId } = await getUserIndivIdentity(
        input.userId,
        input.realName,
        input.nric,
        input.phone,
        ''
      )
      console.log({ flowId })
      if (flowId) {
        wx.navigateToMiniProgram({
          appId: 'wx1cf2708c2de46337',  // 上链公证签小程序APPID
          path: '/pages/index/index', // 上链公证签页面地址
          extraData: {
            requestObj: {  // 必填，入参
              flowId, // 必填，认证流程Id
              type: 'REALNAME',// 必填，业务类型：实名 REALNAME
              env: 'sml' // 非必填，对接环境：线上 prod(默认）, 模拟 sml(用于对接调试阶段）
            },
            callbackObj: {
              from: 'esign',
              input,
            }
          },
          success(res) {
            console.log({ input, res })
            self.setData({ flowId, value: { ...input }, guardian: null })
          },
          fail({ errMsg }) {
            if (errMsg !== 'navigateToMiniProgram:fail cancel') {
              wx.showModal({
                title: '实名认证失败，请重新认证',
                content: errMsg,
                showCancel: false,
              })
            }
          },
        })
      }
    }
    catch (e) {
      wx.showModal({
        title: '错误',
        content: e.message + '，如有疑问请联系微信客服',
        showCancel: false,
      })
    }
  },
  onVisibleGuardianChange(e) {
    this.setData({ visibleGuardian: e.detail.visible })
  },
  async onSubmitGuardian(e) {
    const guardian = e.detail.value
    if (guardian.name.length === 0 || guardian.nric.length === 0 || guardian.phone.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请务必真实填写姓名，身份证号，手机号码',
        showCancel: false,
      })
      return
    }
    if (guardian.name.length < 2) {
      wx.showModal({
        title: '提示',
        content: '无效的姓名',
        showCancel: false,
      })
      return
    }
    if (!idtest(guardian.nric)) {
      wx.showModal({
        title: '提示',
        content: '无效的身份证号',
        showCancel: false,
      })
      return
    }
    if (!phoneRegCheck(guardian.phone)) {
      wx.showModal({
        title: '提示',
        content: '无效的手机号码',
        showCancel: false,
      })
      return
    }
    const { value } = this.data
    try {
      const { flowId } = await getUserIndivIdentity(
        value.userId,
        guardian.name,
        guardian.nric,
        guardian.phone,
        ''
      )
      console.log({ flowId, userId: value.userId, guardian })
      if (flowId) {
        const self = this
        wx.navigateToMiniProgram({
          appId: 'wx1cf2708c2de46337',  // 上链公证签小程序APPID
          path: '/pages/index/index', // 上链公证签页面地址
          extraData: {
            requestObj: {  // 必填，入参
              flowId, // 必填，认证流程Id
              type: 'REALNAME',// 必填，业务类型：实名 REALNAME
              env: 'sml' // 非必填，对接环境：线上 prod(默认）, 模拟 sml(用于对接调试阶段）
            },
            callbackObj: {
              from: 'esign',
              data: guardian,
            }
          },
          success(res) {
            self.setData({ flowId, guardian, visibleGuardian: false })
          },
          fail({ errMsg }) {
            if (errMsg !== 'navigateToMiniProgram:fail cancel') {
              wx.showModal({
                title: '实名认证失败，请重新认证',
                content: errMsg,
                showCancel: false,
              })
            }
          },
        })
      }
    }
    catch (e) {
      wx.showModal({
        title: '错误',
        content: e.message + '，如有疑问请联系微信客服',
        showCancel: false,
      })
    }
  },
  getPhoneNumber: async function (e) {
    console.log({ e })
    const { value } = this.data
    const { code } = e.detail
    if (code && code.length > 0) {
      const { phoneNumber } = await getUserPhoneNumber(value.userId, code)
      if (phoneNumber && phoneNumber.length > 0) {
        this.setData({ value: { ...value, phone: phoneNumber } })
      }
    }
  },
})