const { getCouponList } = require('../../model/coupon');

Page({
  data: {
    visible: false,
    qrcode: null,
    tideSpotName: '',
    pageInfo: {
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,
      useCount: 0,
      expireCount: 0,
    },
    list: [],
    currentTab: 'Used', // Used已使用，Expired已过期
  },
  onLoad() {
    this.getList(1);
  },
  async getList(pageIndex) {
    const { pageInfo, currentTab } = this.data;
    const { data, totalCount, useCount, expireCount } = await getCouponList({
      pageIndex,
      pageSize: pageInfo.pageSize,
      type: '', // 用于区分兑换券还是抵扣券（Exchange兑换券，Deduction抵扣券，全部时不传或传空串）
      stateCode: currentTab, // 状态code（Expired：已过期， Used：已使用，Normal：待使用）
    });

    this.setData({
      list: pageIndex > 1 ? this.data.list.concat(data) : data,
      pageInfo: {
        ...pageInfo,
        pageIndex,
        totalCount,
        useCount,
        expireCount,
      },
    });
  },
  onReachBottom() {
    const {
      pageInfo: { totalCount },
      currentTab,
    } = this.data;

    if (this.data.list.length < totalCount) {
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
        useCount: 0,
        expireCount: 0,
      },
    });
  },
  onTabsChange(event) {
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
      tideSpotName: item.tideSpotName,
      qrcode: `https://tupian.shenzhouyinji.cn/${item.qrCodePath}`,
    });
  },
});
