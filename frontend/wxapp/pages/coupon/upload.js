import { uploadFile } from '../../model/uploadFile';
const { uploadVoucher } = require('../../model/coupon');

Page({
  data: {
    id: '', // 优惠券配置id
    // 凭证
    voucher: {
      tempFile: '',
      rawUri: '',
    },
    // logo
    logo: {
      tempFile: '',
      rawUri: '',
    },
  },
  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ id });
    }
  },
  handleChooseImage(type) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        console.log(res.tempFilePaths);
        const tempFile = res.tempFilePaths[0];
        const upload = await uploadFile(tempFile, 'file', 'true', 'coupon');
        const { file } = JSON.parse(upload);
        if (type === 'voucher') {
          this.setData({
            voucher: { tempFile, rawUri: file.rawUri },
          });
        } else if (type === 'logo') {
          this.setData({
            logo: { tempFile, rawUri: file.rawUri },
          });
        }
      },
    });
  },
  handleChooseVoucher() {
    this.handleChooseImage('voucher');
  },
  handleChooseLogo() {
    this.handleChooseImage('logo');
  },
  async handleSubmit() {
    const { voucher, logo, id } = this.data;
    if (!id) {
      wx.showModal({
        title: '提示',
        content: '缺少优惠券配置id',
        showCancel: false,
      });
      return;
    }
    if (!voucher.rawUri) {
      wx.showModal({
        title: '提示',
        content: '请先上传凭证',
        showCancel: false,
      });
      return;
    }
    if (!logo.rawUri) {
      wx.showModal({
        title: '提示',
        content: '请先上传logo',
        showCancel: false,
      });
      return;
    }
    const result = await uploadVoucher({
      tideSpotConfigId: id,
      textImgPath: voucher.rawUri,
      logoImgPath: logo.rawUri,
    });
    console.log('result', result);
    wx.showModal({
      title: '提示',
      content: result.msg,
      showCancel: false,
    });
  },
});
