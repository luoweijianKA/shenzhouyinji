const app = getApp()

Page({
  data: {
    src: undefined
  },
  onLoad(options) {
    const { idx } = options
    const { configs } = app.globalData
    const services = JSON.parse(configs.services)
    if (services.length > idx) {
      const val = services[idx]
      wx.setNavigationBarTitle({ title: val.name })
      this.setData({ src: val.url })
    }
  }
})