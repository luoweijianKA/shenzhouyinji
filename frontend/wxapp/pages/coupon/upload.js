Page({
  handleChooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res.tempFilePaths);
      },
    });
  },
  handleSubmit() {
    //
  },
});
