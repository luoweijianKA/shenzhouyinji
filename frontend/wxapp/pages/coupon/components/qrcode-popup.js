/**
 * 优惠券二维码弹窗
 */
Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    qrcode: {
      type: Object,
      value: null,
    },
  },
  methods: {
    onVisibleChange(e) {
      this.setData({
        visible: e.detail.visible,
      });
    },
    onClose() {
      this.setData({
        visible: false,
      });
    },
  },
});
