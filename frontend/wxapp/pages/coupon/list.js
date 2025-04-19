import { formatTime } from '../../utils/util.js';
const { getCouponList } = require('../../model/coupon');

Page({
  data: {
    visible: false,
    qrcode: null,
    tideSpotName: '',
    pageInfo: {
      pageIndex: 1,
      pageSize: 10,
      totalCount: undefined, // 原本默认是0，为了兼容t-tab-panel label没有被监听变更的bug
      totalDeductionCount: 0,
      totalExchangeCount: 0,
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
        pageIndex,
        pageSize: pageInfo.pageSize,
        type: currentTab, // 用于区分兑换券还是抵扣券（Exchange兑换券，Deduction抵扣券，全部时不传或传空串）
        stateCode: 'Normal', // 状态code（Expired：已过期， Used：已使用，Normal：待使用）
      });

    let _list = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      _list.push({
        ...item,
        effectiveTimeText:
          formatTime(item.effectiveTime * 1000, 'YYYY年MM月DD日') || '',
      });
    }

    this.setData({
      list: pageIndex > 1 ? this.data.list.concat(_list) : _list,
      pageInfo: {
        ...pageInfo,
        pageIndex,
        totalCount,
        totalDeductionCount,
        totalExchangeCount,
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
        totalDeductionCount: 0,
        totalExchangeCount: 0,
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
