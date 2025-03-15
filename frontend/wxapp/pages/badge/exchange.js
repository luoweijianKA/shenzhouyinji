import { RESOURCE_URL } from '../../constants/index'
import { ago } from '../../utils/util.js'
import { createUserSwap, getUserSwaps, updateUserSwap } from '../../model/badge'
const app = getApp()

Page({
  data: {
    user: undefined,
    event: undefined,
    badges: [undefined, undefined],
    region: [],
    swaps: [],
  },
  async setup() {
    const { user, currentEvent } = app.globalData

    const { edges } = await getUserSwaps(100, null, null, null, { userId: user.id })
    const swaps = edges.map(v => ({
      ...v.node,
      badges: v.node.badges.map(badge => ({ ...badge, images: RESOURCE_URL + badge.images })),
      city: v.node.city.split(','),
      expiresIn: ago(v.node.createTime),
    }))
    console.log({ swaps })
    this.setData({
      user: {
        id: user.id,
        name: user.wechat_name,
        avatar: user.wechat_avatar && user.wechat_avatar.length > 0 ? RESOURCE_URL + user.wechat_avatar : undefined,
      },
      event: currentEvent,
      swaps
    })
  },
  onLoad: function (options) {
    this.setup()
  },
  onShow: function () {
    const { badges } = this.data
    console.log({ badges })
  },
  bindBadge: function (e) {
    const { index, value } = e.currentTarget.dataset
    wx.navigateTo({
      url: `./select?index=${index}&value=${value}`,
    })
  },
  bindRegionChange: function (e) {
    this.setData({ region: e.detail.value })
  },
  bindSubmit: function (e) {
    const { user, event, badges, region } = this.data
    if (user && event && badges.length === 2 && badges[0] && badges[1] && region.length > 0) {
      const input = {
        userId: user.id,
        eventId: event.id,
        badges: badges.map(v => v.id),
        city: region.join(','),
      }
      console.log({ input })
      createUserSwap(input).then(() => {
        wx.showModal({
          title: '提示',
          content: '交换信息已发布成功！',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              wx.navigateBack()
            }
          }
        })
      }).catch((e) => {
        wx.showModal({
          title: '提示',
          content: e.message + '，如有疑问请联系微信客服',
          showCancel: false,
        })
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请填写您的交易信息',
        showCancel: false,
      })
    }
  },
  handleSwapChange(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    const { swaps } = this.data
    if (swaps.length > index) {
      updateUserSwap(swaps[index].id, value ? 1 : 2).then((data) => {
        swaps[index] = { ...swaps[index], status: data.status }
        this.setData({ swaps })
      }).catch((e) => {
        wx.showModal({
          title: e.message + '，如有疑问请联系微信客服',
          showCancel: false,
        })
      })
    }
  },
})