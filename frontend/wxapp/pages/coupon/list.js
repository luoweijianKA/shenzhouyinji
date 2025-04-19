const { getCouponList } = require('../../model/coupon');

Page({
  data: {
    visible: false,
    qrcode: null,
    // totalExchangeCount: 0,
    // totalDeductionCount: 0,
    pageInfo: {
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,
    },
    list: [],
    currentTab: '', // ''全部，'Exchange'兑换券，'Deduction'抵扣券
  },
  onLoad() {
    this.getList(1);
  },
  async getList(pageIndex) {
    const { pageInfo, currentTab } = this.data;
    const { data, totalCount, totalDeductionCount, totalExchangeCount } =
      await getCouponList({
        pageIndex: pageInfo.pageIndex,
        pageSize: pageInfo.pageSize,
        type: currentTab,
        stateCode: 'Normal',
      });

    this.setData({
      list: pageIndex > 1 ? this.data.list.concat(data) : data,
      pageInfo: {
        ...pageInfo,
        pageIndex,
        totalCount,
      },
      totalDeductionCount,
      totalExchangeCount,
    });
  },
  onReachBottom() {
    if (this.data.list.length < this.data.pageInfo.totalCount) {
      this.getList(this.data.pageInfo.pageIndex + 1);
    } else {
      wx.showToast({
        icon: 'none',
        title: '已加载完毕',
      });
    }
  },
  resetList() {
    this.setData({
      list: [],
      pageInfo: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
    });
  },
  onTabsChange(event) {
    console.log(`Change tab, tab-panel value is ${event.detail.value}.`);
    this.resetList();
    this.setData(
      {
        currentTab: event.detail.value,
      },
      () => {
        this.getList(1);
      },
    );
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
