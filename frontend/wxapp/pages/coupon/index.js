import { CHAO_SELECTED_ICON } from '../../constants/index';

Page({
  data: {
    product: {
      value: 'all',
      options: [
        {
          value: 'all',
          label: '全部产品',
        },
        {
          value: 'new',
          label: '最新产品',
        },
        {
          value: 'hot',
          label: '最火产品',
        },
      ],
    },
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 3,
        chaoIcon: CHAO_SELECTED_ICON,
      });
    }
  },
  onChange(e) {
    this.setData({
      'product.value': e.detail.value,
    });
  },
  handleRule() {
    wx.navigateTo({
      url: '/pages/coupon/rule',
    });
  },
});
