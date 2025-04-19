import { CHAO_SELECTED_ICON } from '../../constants/index';
import { getTideSpotList, getCouponListGroupByType } from '../../model/coupon';

Page({
  data: {
    product: {
      name: '全部',
      value: 'all',
      options: [],
    },
    couponList: [],
    tideSpotList: [],
    currentTideSpot: '',
    loading: false,
    hasMore: true,
    pageInfo: null,
    dropdownHeight: '300rpx',
  },

  onLoad() {
    this.loadTideSpotList();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 3,
        chaoIcon: CHAO_SELECTED_ICON,
      });
    }
  },

  // 加载景区列表
  async loadTideSpotList() {
    try {
      const { list, pageInfo } = await getTideSpotList();
      const options = list.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      this.setData(
        {
          tideSpotList: list,
          pageInfo,
          'product.options': options,
          'product.value': options[0]?.value || 'all',
          'product.name': options[0]?.label || '全部',
          currentTideSpot: options[0]?.value || '',
        },
        () => {
          this.loadCouponList();
        },
      );
    } catch (error) {
      console.error('加载景区列表失败:', error);
      wx.showToast({
        title: '加载景区列表失败',
        icon: 'none',
      });
    }
  },

  // 加载更多景区
  async loadMoreTideSpot() {
    if (!this.data.pageInfo?.hasNextPage || this.data.loading) return;

    this.setData({ loading: true });
    try {
      const { list, pageInfo } = await getTideSpotList({
        after: this.data.pageInfo.endCursor,
      });

      const newOptions = list.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      this.setData({
        tideSpotList: [...this.data.tideSpotList, ...list],
        pageInfo,
        'product.options': [...this.data.product.options, ...newOptions],
        loading: false,
      });
    } catch (error) {
      console.error('加载更多景区失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载更多景区失败',
        icon: 'none',
      });
    }
  },

  // 选择景区
  onChange(e) {
    const selectedItem = this.data.product.options.find(
      (item) => item.value === e.detail.value,
    );

    this.setData(
      {
        'product.value': e.detail.value,
        'product.name': selectedItem?.label || '',
        currentTideSpot: e.detail.value,
      },
      () => {
        this.loadCouponList();
      },
    );
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      couponList: [],
      tideSpotList: [],
      currentTideSpot: '',
      hasMore: true,
      pageInfo: null,
    });
    Promise.all([this.loadTideSpotList(), this.loadCouponList()]).finally(
      () => {
        wx.stopPullDownRefresh();
      },
    );
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadMoreTideSpot();
  },

  // 加载优惠券列表
  async loadCouponList() {
    try {
      this.setData({ loading: true });
      const res = await getCouponListGroupByType(this.data.currentTideSpot);

      if (res) {
        // 处理兑换券列表
        const exchangeList = res.exchangeList.map((item) => ({
          id: item.id,
          title: item.couponName,
          sceneryName: item.tideSpotName,
          expireDate: this.formatDate(item.effectiveTime),
        }));

        // 处理抵扣券列表
        const deductionList = res.deductionList.map((item) => ({
          id: item.id,
          title: item.couponName,
          sceneryName: item.tideSpotName,
          amount: item.deductionAmount,
          condition: `满${item.minimumAmount}元可用`,
          expireDate: this.formatDate(item.effectiveTime),
        }));

        this.setData({
          coupons: {
            exchange: exchangeList,
            deduction: deductionList,
          },
        });
      }
    } catch (error) {
      console.error('加载优惠券失败:', error);
      wx.showToast({
        title: '加载优惠券失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 格式化日期
  formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(date.getDate()).padStart(2, '0')}`;
  },

  handleRule(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/coupon/rule?id=${id}`,
    });
  },

  // 下拉框滚动事件
  onDropdownScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.detail;
    // 当滚动到底部时加载更多
    if (scrollHeight - scrollTop - clientHeight < 50) {
      this.loadMoreTideSpot();
    }
  },
});
