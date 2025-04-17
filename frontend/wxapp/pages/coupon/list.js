const { getCouponList } = require('../../model/coupon');

Page({
  data: {
    visible: false,
    qrcode: null,
  },
  onLoad() {
    this.getList();
  },
  async getList() {
    const { edges } = await getCouponList(50, null, null, null, { status: 1 });
    // console.log({ swaps: edges.map(v => v.node) })
    // this.setData({
    //   badge: {
    //     swaps: edges.map((v) => v.node),
    //   },
    // });
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
