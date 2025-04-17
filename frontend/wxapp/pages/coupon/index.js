import { CHAO_SELECTED_ICON } from '../../constants/index';

Page({
  data: {
    product: {
      name: '全部',
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
    const selectedItem = this.data.product.options.find(
      (item) => item.value === e.detail.value,
    );

    this.setData({
      'product.value': e.detail.value,
      'product.name': selectedItem?.label || '',
    });
  },
  handleRule() {
    wx.navigateTo({
      url: '/pages/coupon/rule',
    });
  },
});
