import { DEFAULT, RESOURCE_URL } from '../../../constants/index';
import { getEventSettings } from '../../../model/event'
import { uploadFile } from '../../../model/uploadFile';
import { createTweet } from '../../../model/tweet';
import { getTags } from '../../../model/user';

const { getLocation, getRegion } = require('../../../utils/wxapi')

const app = getApp();

Page({
  data: {
    latitude: 0,
    longitude: 0,
    location: '',
    region: '',
    userInfo: [],
    images: [],
    imageCount: 3,
    visible: false,
    devicePosition: "back",
    cameraDisplay: true,
    loading: false,
    resourceUrl: RESOURCE_URL,
    tags: [],
    value: undefined,
    backgrouds: [],
    index: undefined,
    sharePhotographTimes: 3,
    currentUploadImage: 0,
  },

  onLoad: async function () {
    getLocation(null, ({ latitude, longitude }) => {
      getRegion(latitude, longitude).then(({ location, region }) => {
        this.setData({ location, region })
      })
    })

    const { configs: { sharePhotographTimes }, currentEvent } = app.globalData
    const { markBackgrouds } = await getEventSettings(currentEvent.id)
    const backgrouds = (markBackgrouds ?? []).filter(v => v.length > 0).map(v => RESOURCE_URL + v)

    this.setData({
      userInfo: app.globalData.user,
      backgrouds,
      sharePhotographTimes,
      images: backgrouds.map(v => null)
    });
    this.setTags()
  },
  onTagChange(e) {
    const { value } = e.currentTarget.dataset
    this.setData({ value })
  },
  async setTags() {
    const tags = await getTags('d238156c-2da8-4c7b-8d47-260b61988dc5')
    this.setData({ tags })
  },

  async submitTweet(e) {
    const { user, currentEvent, sceneryspot } = app.globalData
    const { backgrouds, value } = this.data

    getLocation(null, ({ latitude, longitude }) => {
      getRegion(latitude, longitude)
        .then(({ location, region }) => {
          const images = this.data.images.filter(v => !!v)
          if (images.length !== backgrouds.length) {
            wx.showModal({
              title: `请拍摄 ${backgrouds.length} 张相片`,
              showCancel: false,
              confirmText: "确定",
              confirmColor: "#576B95"
            });
            return;
          }

          if (!value) {
            wx.showModal({
              title: "提示",
              content: "请分享您的印迹心情",
              showCancel: false,
              confirmText: "确定",
              confirmColor: "#576B95"
            });
            return;
          }

          this.setData({ loading: true })
          this.uploadImages(images)
            .then(imagesUrl => {
              const input = {
                "user_id": user.id,
                "event_id": currentEvent.id,
                "sceneryspot_id": sceneryspot.id,
                "content": JSON.stringify({ "text": value.name, "images": imagesUrl }),
                location,
                region,
              }
              createTweet(input)
                .then(result => {
                  if (result.id != "") {
                    this.setData({ loading: false })
                    wx.showModal({
                      title: "发布成功!",
                      showCancel: false,
                      confirmText: "确定",
                      confirmColor: "#576B95",
                      success(res) {
                        if (res.confirm) {
                          let pages = getCurrentPages();
                          let lasterPage = pages[pages.length - 2];
                          lasterPage.onLoad();
                          wx.navigateBack({ delta: 1 });
                        }
                      }
                    })
                  }
                })
                .catch((e) => {
                  console.log(e)
                  this.setData({ loading: false })
                })
            })
            .catch((e) => {
              console.log(e)
              this.setData({ loading: false })
            })
        })
        .catch(e => {
          console.log(e)
          this.setData({ loading: false })
          wx.showModal({ title: '提示', showCancel: false, content: '获取位置失败，请授权您的定位' })
        })
    })
  },

  async uploadImages(images) {
    var imagesUrl = [];
    for (let i = 0; i < images.length; i++) {
      this.setData({ currentUploadImage: i + 1 })
      // this.showLoading()
      var upload = await uploadFile(images[i].url, "file", "true", "tweet");
      var fileInfo = JSON.parse(upload).file;
      imagesUrl.push(fileInfo.previewUri);
      // wx.hideLoading()
    }
    return imagesUrl;
  },

  openCamera: function (e) {
    const { index } = e.currentTarget.dataset
    const { images } = this.data
    if (!images[index]) {
      images[index] = {
        times: 0,
        redo: true
      }
    }
    if (!images[index].redo) {
      return
    }
    this.setData({
      index,
      images,
      visible: true,
      cameraDisplay: true,
    });
  },

  switchCamera: function () {
    var dp = "";

    if (this.data.devicePosition == "front") {
      dp = "back";
    } else {
      dp = "front";
    }

    this.setData({
      devicePosition: dp,
    });
  },

  cancelCamera: function () {
    this.setData({
      visible: false,
      cameraDisplay: false,
    });
  },

  takePhoto() {
    const ctx = wx.createCameraContext()
    const { images, index, sharePhotographTimes } = this.data

    ctx.takePhoto({
      quality: DEFAULT.TAKE_PHOTO_QUALITY,
      success: (res) => {
        const url = res.tempImagePath
        const time = images[index].times + 1
        const redo = time < sharePhotographTimes
        images[index] = { url, time, redo }
        this.setData({ images })
      }
    });

    setTimeout(() => {
      this.setData({
        visible: false,
        cameraDisplay: false,
      });
    }, 500);
  },

  error(e) {
    console.log(e.detail)
  },

  showLoading() {
    wx.showLoading({
      title: this.data.currentUploadImage + '/' + this.data.backgrouds.length + ' 上传中...',
    })
  },

});