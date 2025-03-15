
const { getServiceItem } = require('../../../model/sceneryspot')
const { getLocation, openLocation } = require('../../../utils/wxapi')

const app = getApp();

function getLatLng(coordinate) {
  const values = coordinate.split(',')
  if (values.length > 1) {
    const latitude = values[0], longitude = values[1]
    if (-90 <= latitude && latitude <= 90) {
      return { latitude, longitude }
    }
  }
  return { latitude: undefined, longitude: undefined }
}

function getMarkers(latitude, longitude, serviceItem) {
  return [serviceItem]
    .map((v, i) => {
      const { latitude, longitude } = getLatLng(v.coordinate)
      return {
        id: i + 1,
        latitude: latitude,
        longitude: longitude,
        width: 15,
        height: 15,
        iconPath: `/assets/icons/${v.category_id}.png`,
        callout: {
          content: v.name,
          color: '#226208',
          fontSize: 12,
          display: 'ALWAYS',
          textAlign: 'center',
          anchorY: '0'
        }
      }
    })
    .filter(({ latitude, longitude }) => latitude && longitude)
}

Page({
  data: {
    latitude: 0,
    longitude: 0,
    scale: 15,
    markers: [],
    distance: '0',
    serviceItem: undefined,
  },
  onLoad(options) {
    const { id } = options
    const { sceneryspot } = app.globalData
    if (sceneryspot) {
      const { latitude, longitude } = getLatLng(sceneryspot.coordinate)
      if (latitude && longitude) {
        this.setData({ latitude, longitude })
      }
    }
    this.setServiceItem(id)
  },

  onMap: function () {
    const { latitude, longitude } = this.data
    openLocation(latitude, longitude)
  },

  goMiniProgram: function (e) {
    const { value } = e.currentTarget.dataset;
    wx.navigateToMiniProgram({
      appId: value,
      extraData: {},
      envVersion: 'release',
    })
  },
  async setServiceItem(id) {
    const serviceItem = await getServiceItem(id)
    if (serviceItem) {
      const images = serviceItem.images && serviceItem.images.length > 0 ? serviceItem.images.split(",") : []
      const serviceItemImages = images.length > 0 ? images[Math.floor(Math.random() * images.length)] : ''
      this.setData({
        serviceItem: {
          ...serviceItem,
          images: serviceItemImages,
          isVideo: serviceItemImages && serviceItemImages.endsWith(".mp4")
        }
      })

      const { latitude, longitude } = getLatLng(serviceItem.coordinate)
      if (latitude && longitude) {
        const markers = getMarkers(latitude, longitude, serviceItem)
        this.setData({ latitude, longitude, markers })
        getLocation({ latitude, longitude }, ({ distance }) => {
          this.setData({ distance })
        })
      }
    }
  },
});