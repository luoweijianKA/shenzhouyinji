export default () => {
  if (!wx.canIUse('getUpdateManager')) {
    return;
  }

  const updateManager = wx.getUpdateManager();

  updateManager.onCheckForUpdate(function (res) {
    console.log('版本信息', res);
  });

  updateManager.onUpdateReady(function () {
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          updateManager.applyUpdate();
        }
      },
    });
  });

  updateManager.onUpdateFailed(function () {
    // 新版本下载失败
  });
};
