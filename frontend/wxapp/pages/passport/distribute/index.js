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
  onClickCell: function (e) {
    const { value } = e.currentTarget.dataset
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        const { result } = res
        if (result && result.length > 0) {
          wx.navigateTo({
            url: `/pages/passport/activate/index?id=${result}&eventId=${value}`,
          })
        }
      },
    })
  }
})