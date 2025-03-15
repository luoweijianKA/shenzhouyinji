const { getSceneryspots } = require('../../model/sceneryspot')
const app = getApp()

Page({
  data: {
    event: undefined,
    sceneryspots: [],
  },
  onLoad(option) {
    wx.stopPullDownRefresh()
    console.log({ app, option })
    this.setData({
      pageLoading: true,
      event: app.globalData.currentEvent,
    })
  },
  onShow: function (params) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 2,
      })
    }
    // show sceneryspots
    this.loadSceneryspots()
  },
  onChange(e) {
    const { value } = e.currentTarget.dataset
    console.log({ sceneryspots: this.data.sceneryspots, value })
    app.globalData.sceneryspot = this.data.sceneryspots[value]
    wx.reLaunch({ url: '../tweet/index' })
  },
  async loadSceneryspots() {
    const event = app.globalData.currentEvent;
    console.log({ event })
    if (event) {
      const values = event.scenerySpots.map(v => v.scenery_spot_id)
      const sceneryspots = await getSceneryspots(values)
      console.log({ sceneryspots })
      this.setData({ sceneryspots: sceneryspots.sort((a, b) => parseInt(a.code) - parseInt(b.code)) })
    }
  },
})