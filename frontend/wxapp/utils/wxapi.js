const keys = 'FJGBZ-XHVCO-ULEW3-SBGO7-U6ENK-VXF52'

function toRadians(d) {
  return d * Math.PI / 180
}

function getDistance(lat1, lng1, lat2, lng2) {
  var dis = 0;
  var radLat1 = toRadians(lat1)
  var radLat2 = toRadians(lat2)
  var deltaLat = radLat1 - radLat2
  var deltaLng = toRadians(lng1) - toRadians(lng2)
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)))

  return dis * 6378137
}

const getLocation = (dest, callback) => {
  wx.getLocation({
    type: 'gcj02',
    altitude: true,
    highAccuracyExpireTime: 0,
    isHighAccuracy: true,
    success: function (res) {
      const { latitude, longitude } = res
      console.log({ latitude, longitude, dest })
      const distance = dest ? getDistance(dest.latitude, dest.longitude, latitude, longitude) / 1000 : 0
      callback && callback({ ...res, distance: distance.toFixed(2) })
    },
    fail: (res) => {
      console.log('fail getLocation', res)
      wx.showModal({
        title: '获取位置失败，请授权您的定位',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.navigateBack({ delta: 1 })
          }
        }
      })
    },
  })
}

const openLocation = (latitude, longitude) => {
  wx.openLocation({
    latitude: Number(latitude),
    longitude: Number(longitude),
    scale: 16,
  })
}

const getWeRunData = (callback) => {
  wx.getWeRunData({
    success(res) {
      callback && callback(res)
      // wx.cloud.callFunction({
      //   name: 'desrundata',
      //   data: {
      //     weRunData: wx.cloud.CloudID(res.cloudID)
      //   }
      // }).then(res => {
      //   var { stepInfoList } = res.result.event.weRunData.data
      //   if (stepInfoList && stepInfoList.length > 0) {
      //     const { step } = stepInfoList[stepInfoList.length - 1]
      //     callback && callback({ step })
      //   }
      // })
    },
  })
}

const getRegion = async (latitude, longitude) => {
  return new Promise(function (reslove, reject) {
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${keys}`,
      header: {
        'Content-Type': 'application/json'
      },
      success({ data, errMsg }) {
        if (errMsg !== 'request:ok') {
          reject(errMsg)
          return
        }
        if (data.result && data.result.address_component) {
          const { address_component: { province, city, district }, location } = data.result
          reslove({
            location: `${location.lat},${location.lng}`,
            region: `${province},${city},${district}`,
          })
        } else {
          reslove({
            location: `${latitude},${longitude}`,
            region: '',
          })
        }
      },
    })
  })
}

const getPolygonGeofence = (value) => {
  const data = value.split(',')
  const points = []
  for (let i = 0; i < data.length; i += 2) {
    points.push([parseFloat(data[i]), parseFloat(data[i + 1])])
  }
  return points
}

const isInsidePolygonGeofence = (location, points) => {
  let isInside = false;
  let end = points.length - 1;
  for (let i = 0; i < points.length; i++) {
    const pointX = location[0];
    const pointY = location[1];
    const pointIX = points[i][0];
    const pointIY = points[i][1];
    const pointEndX = points[end][0];
    const pointEndY = points[end][1];
    if (pointY > pointIY && pointY < pointEndY || pointY < pointIY && pointY > pointEndY) {
      console.log({
        i,
        end,
        pointIY,
        pointEndY,
        point: (pointY - pointIY) / (pointEndY - pointIY) * (pointEndX - pointIX) + pointIX,
      })
      if ((pointY - pointIY) / (pointEndY - pointIY) * (pointEndX - pointIX) + pointIX < pointX) {
        isInside = !isInside;
      }
    }
    end = i;
  }
  return isInside;
}

module.exports = {
  getLocation,
  openLocation,
  getWeRunData,
  getRegion,
  getPolygonGeofence,
  isInsidePolygonGeofence,
};