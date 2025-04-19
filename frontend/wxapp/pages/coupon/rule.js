const { getCouponConfigDetail } = require('../../model/coupon');

Page({
  data: {
    id: '', // 优惠券ID
    detail: {}, // 详情
  },
  async onLoad(options) {
    const { id } = options;
    if (id) {
      const detail = await getCouponConfigDetail(id);
      if (detail) {
        this.setData({
          id,
          detail,
        });
      }
    }
  },
  handleButton() {
    wx.navigateTo({
      url: '/pages/coupon/upload',
    });
  },
});
