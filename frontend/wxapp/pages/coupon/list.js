Page({
  data: {
    visible: false,
  },
  showPopup() {
    this.setData(
      {
        visible: true,
      },
      () => {
        const tabs = this.selectComponent('tabs');

        tabs.setTrack(); // 这一步很重要，因为小程序的无法正确执行生命周期，所以需要手动设置下 tabs 的滑块
      },
    );
  },
  onTabsChange(event) {
    console.log(`Change tab, tab-panel value is ${event.detail.value}.`);
  },

  onTabsClick(event) {
    console.log(`Click tab, tab-panel value is ${event.detail.value}.`);
  },

  handleHistory() {
    wx.navigateTo({
      url: '/pages/coupon/history',
    });
  },
  handleExchange() {
    wx.switchTab({
      url: '/pages/coupon/index',
    });
  },
  handleQrcode(e) {
    const { item } = e.currentTarget.dataset;
    this.setData({
      visible: true,
      qrcode: item,
    });
  },
});
