import { RESOURCE_URL } from '../../constants/index'
import { ago } from '../../utils/util.js'
const { getUserSwap, sendUserSwap } = require('../../model/badge')
const app = getApp();

Page({
  data: {
    user: {
      name: '',
      avatar: '',
      label: '',
    },
    swap: undefined
  },
  async setup(options) {
    const { id } = options
    const { user } = app.globalData
    const swap = await getUserSwap(id)
    this.setData({
      user: {
        id: user.id,
        name: user.wechat_name,
        avatar: user.wechat_avatar && user.wechat_avatar.length > 0 ? RESOURCE_URL + user.wechat_avatar : undefined,
      },
      swap: {
        ...swap,
        badges: swap.badges.map(badge => ({ ...badge, images: RESOURCE_URL + badge.images })),
        city: swap.city.split(','),
        expiresIn: ago(swap.createTime),
      },
    })
  },
  onLoad(options) {
    wx.stopPullDownRefresh()
    this.setup(options)
  },
  onShow: function (params) {

  },
  bindEventChange: function (e) {
    wx.navigateTo({ url: '/pages/event/list/index' })
  },
  bindSubmit: async function (e) {
    const { user, swap } = this.data
    const { content } = e.detail.value
    if (content.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请务必填写您的交易信息',
        showCancel: false,
      })
      return
    }
    if (content.length > 200) {
      wx.showModal({
        title: '提示',
        content: '您的交易信息已超出200个字',
        showCancel: false,
      })
      return
    }
    if (swap) {
      await sendUserSwap(swap.id, user.id, content)
      wx.showModal({
        title: '提示',
        content: '您的交易信息已发送',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    }
  }
})