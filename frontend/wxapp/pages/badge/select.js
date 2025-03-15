
import { RESOURCE_URL } from '../../constants/index'
const { getBadges } = require('../../model/badge')
const app = getApp()

Page({
  data: {
    badges: [],
    index: 0,
    value: undefined,
  },
  onLoad: async function (options) {
    console.log(options)
    const { index, value } = options
    const { currentEvent } = app.globalData
    if (currentEvent) {
      const badges = (await getBadges('')).map(v => ({
        ...v,
        images: v.images && v.images.length > 0 ? RESOURCE_URL + v.images : '',
      }))
      this.setData({ badges, index, value })
    }
  },
  bindChange: function (e) {
    const { index } = e.currentTarget.dataset
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    const { badges } = prevPage.data
    if (badges && badges.length > this.data.index) {
      console.log({ pages, index, badges })
      badges[this.data.index] = this.data.badges[index]
      prevPage.setData({ badges })
    } else {
      prevPage.setData({ search: this.data.badges[index] })
    }
    wx.navigateBack()
  },
})