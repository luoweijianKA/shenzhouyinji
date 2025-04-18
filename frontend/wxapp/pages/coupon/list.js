const { getCouponList } = require('../../model/coupon');

Page({
  data: {
    visible: false,
    qrcode: null,
    pageInfo: {
      pageIndex: 1,
      pageSize: 1,
      totalCount: 0,
    },
    list: [],
  },
  onLoad() {
    this.getList(1);
  },
  async getList(pageIndex) {
    const { pageInfo } = this.data;
    const { edges, totalCount } = await getCouponList(
      pageInfo.pageSize,
      null,
      null,
      '',
      'Normal',
    );
    this.setData({
      list: edges.map((v) => v.node),
      pageInfo: {
        ...pageInfo,
        totalCount,
      },
    });
  },
  loadMoreList() {
    this.getList();
  },
  onReachBottom() {
    if (this.data.list.length < this.data.pageInfo.totalCount) {
      this.loadMoreList();
    } else {
      wx.showToast({
        icon: 'none',
        title: '已加载完毕',
      });
    }
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
      qrcode: item.qrCodePath,
    });
  },
});
