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
      type: String,
      value: '',
    },
    tideSpotName: {
      type: String,
      value: '',
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
