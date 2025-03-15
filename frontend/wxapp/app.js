import updateManager from './common/updateManager';

App({
  globalData: {
    user: null,
    notifys: [],
    events: [],
    currentEvent: [],
    currentSceneryspots: [],
    sceneryspot: [],
    configs: {},
  },

  onShow: function (options) {
    updateManager();
    console.log(options)
    const { extraData } = options.referrerInfo
    if (typeof extraData != 'undefined') {
      if (extraData.callbackObj.from == 'esign') {
        if (extraData.isSuccess) {
          const input = extraData.callbackObj
          createEventPassport(input)
            .then((data) => {
              console.log({ data })
              wx.reLaunch({ url: `/pages/passport/takecode/index?id=${data}` })
            })
            .catch(e => {
              wx.showModal({
                title: '提示',
                content: e.message,
                showCancel: false,
              })
            })
        } else {
          wx.showModal({
            title: '提示',
            content: '实名认证失败，如有疑问请联系微信客服',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/home/home',
                })
              }
            },
          })
        }
      }
    }
  },
});
