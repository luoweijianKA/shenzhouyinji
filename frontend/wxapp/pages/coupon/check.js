import { formatTime } from '../../utils/util.js';

const { getCouponDetail, checkPassCoupon } = require('../../model/coupon');

Page({
  data: {
    productList: [{ key: 0, goodName: '', goodBarcode: '' }], // 购买产品列表信息
    id: '', // 优惠券ID
    detail: {}, // 优惠券详情
  },
  async onLoad(options) {
    const { id } = options;
    if (id) {
      const detail = await getCouponDetail(id);
      if (detail) {
        const createTimeText = detail.createTime
          ? formatTime(detail.createTime * 1000, 'YYYY-MM-DD HH:mm:ss')
          : '--';
        const effectiveTimeText = detail.effectiveTime
          ? formatTime(detail.effectiveTime * 1000, 'YYYY-MM-DD')
          : '--';

        for (const key in detail) {
          if (!detail[key]) {
            detail[key] = '--';
          }
        }
        this.setData({
          id,
          detail: {
            ...detail,
            createTimeText,
            effectiveTimeText,
          },
        });
      }
    }
  },
  handleAddProduct() {
    const { productList } = this.data;
    productList.push({ key: productList.length, name: '', code: '' });
    this.setData({ productList });
  },
  handleMinusProduct(e) {
    const { key } = e.currentTarget.dataset;
    const { productList } = this.data;
    productList.splice(key, 1);
    this.setData({ productList });
  },
  async handlePass() {
    const { id, productList } = this.data;
    if (!id) return;
    const result = await checkPassCoupon({
      id,
      couponBuyGoodListJSON: productList[0].goodName
        ? JSON.stringify(productList)
        : '', // 有数据才传
    });
    if (result.succed) {
      wx.showToast({
        title: result.message || '核对成功',
      });
    }
  },
  backToHome() {
    wx.redirectTo({
      url: '/pages/start/index',
    });
  },
});
