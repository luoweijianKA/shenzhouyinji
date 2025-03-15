const app = getApp();

Page({
  data: {
    message: [],
  },
  onLoad(option) {
    console.log(app.globalData.notifys[option.messageIndex]);
    this.setData({
      message: app.globalData.notifys[option.messageIndex]
    });
  }
});