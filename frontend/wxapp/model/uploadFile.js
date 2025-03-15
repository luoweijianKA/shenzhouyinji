import { DEFAULT } from '../constants/index'

export function uploadFile(filePath, name, preview, tag) {
  const promise = new Promise(function (reslove, reject) {
    wx.uploadFile({
      filePath: filePath,
      name: name,
      url: DEFAULT.UPLOAD_URL,
      formData: {
        "preview": preview,
        "tag": tag
      },
      success: function (res) {
        console.log({ success: res });
        reslove(res.data);
      },
      fail: function (res) {
        console.log({ fail: res });
      }
    });
  });
  return promise;
}
