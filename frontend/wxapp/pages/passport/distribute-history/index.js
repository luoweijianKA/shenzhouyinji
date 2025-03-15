const app = getApp()

Page({
  data: {
    events: []
  },
  onLoad() {
    const { user: { scopes }, events } = app.globalData
    this.setData({
      events: events.filter(v => scopes && scopes.indexOf(v.id) > -1)
    })
  },
  onClick: function (e) {
    console.log(e)
    const { value } = e.currentTarget.dataset
    wx.navigateTo({
      url: `./list?id=${value.id}`,
    })
  }
})