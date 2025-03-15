import { QRCodeModel } from '../../utils/qrcode'
const { getServiceItemsWithCategory } = require('../../model/sceneryspot')
const { getLocation, openLocation } = require('../../utils/wxapi')
const { getUserStamp, createUserStamp } = require('../../model/user')
const app = getApp()
const CLOCK_CATEGORY = "fdc82fda-c76d-49b9-902e-6c86ebfa90e6"


function getRoundNum(num, fixedNum = 0) {
  return Number(num.toFixed(fixedNum))
}

function getPxFromRpx(rpx) {
  const screenWidth = wx.getSystemInfoSync()['screenWidth']
  return Math.round(rpx * screenWidth / 750)
}

function _drawDot(canvasContext, centerX, centerY, nSize, xyOffset = 0, dotScale = 1) {
  canvasContext.fillRect(
    (centerX + xyOffset) * nSize,
    (centerY + xyOffset) * nSize,
    dotScale * nSize,
    dotScale * nSize
  )
}

function formattedDateTime(d) {
  const year = `${d.getFullYear()}`;
  const month = `${d.getMonth() + 1}`.padStart(2, "0")
  const date = `${d.getDate()}`.padStart(2, "0")
  const hours = `${d.getHours()}`.padStart(2, "0")
  const minutes = `${d.getMinutes()}`.padStart(2, "0")
  const seconds = `${d.getSeconds()}`.padStart(2, "0")

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
}

function timer(self, time) {
  if (!time || time == 0) {
    return
  }

  self.setData({ time: formattedDateTime(new Date(time * 1000)) })
  setTimeout(() => timer(self, ++time), 1000)
}

function getLatLng(coordinate) {
  console.log({ coordinate })
  const values = coordinate && coordinate.length > 0 ? coordinate.split(',') : []
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
        width: 24,
        height: 24,
        iconPath: `/assets/icons/${v.category_id}.png`,
        callout: {
          content: v.name,
          color: '#226208',
          fontSize: 14,
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
    name: '',
    distance: '0.0',
    serviceItems: [],
    openRule: true,
    stamp: undefined,
    time: '',
    markerShowMedia: '',
  },
  onLoad: async function (options) {
    const { sceneryspot, configs } = app.globalData
    if (sceneryspot) {
      const { id, name } = sceneryspot
      this.setData({
        name,
        markerShowMedia: configs.markerShowMedia,
      })
      this.setServiceItems(id)
    }
    timer(this, Math.floor(new Date().getTime() / 1000))
  },
  onShow: async function (e) {
    // const { code } = this.data
    const { user, currentEvent: event, sceneryspot } = app.globalData
    const stamp = await getUserStamp(user.id, event.id, sceneryspot.id)
    if (stamp && stamp.code && stamp.code.length > 0 && stamp.location && stamp.location.length > 0) {
      this.setData({ stamp })
    }
  },
  onMap: function () {
    const { latitude, longitude } = this.data
    openLocation(latitude, longitude)
  },
  onStamp: function () {
    const { user, currentEvent: event, sceneryspot } = app.globalData
    const { stamp } = this.data
    if (stamp) {
      this.setData({
        stamp: {
          ...stamp,
          title: `活动<<${event.name}>>在${sceneryspot.name}的打卡点`
        }
      })
      wx.navigateTo({
        url: `/pages/stamp/index?code=${stamp.code}&color=#ccc`,
      })
      return
    }

    getLocation(null, ({ latitude, longitude }) => {
      const input = {
        user_id: user.id,
        event_id: event.id,
        sceneryspot_id: sceneryspot.id,
        code: '',
        location: `${latitude},${longitude}`,
      }
      createUserStamp(input)
        .then((data) => {
          this.setData({
            stamp: {
              ...data,
              title: `活动 ${event.name} 在${sceneryspot.name}的打卡点`
            }
          })
          wx.navigateTo({
            url: `/pages/stamp/index?code=${data.code}`,
          })
        })
        .catch(err => {
          wx.showModal({
            title: '提示',
            content: err.message,
            showCancel: false,
          })
          self.setData({ started: false })
        })
    })
  },
  onCode: function () {
    const { code } = this.data
    wx.showToast({
      icon: "none",
      title: code,
    })
  },
  onCloseRule: function () {
    this.setData({ openRule: false })
  },
  async setServiceItems(id) {
    const serviceItems = await getServiceItemsWithCategory(id, CLOCK_CATEGORY)
    console.log({ serviceItems })
    if (serviceItems && serviceItems.length > 0) {
      this.setData({ serviceItems })
      const item = serviceItems[0]
      const { latitude, longitude } = getLatLng(item.coordinate)
      if (latitude && longitude) {
        const markers = getMarkers(latitude, longitude, item)
        this.setData({ latitude, longitude, markers })
        getLocation({ latitude, longitude }, ({ distance }) => {
          console.log({ distance })
          this.setData({ distance })
        })
      }
    }
  },
  async draw(data) {
    // 获取canvas以及context
    const canvas = await this.getQrContainer();
    const ctx = canvas.getContext('2d');
    // 二维码的颜色
    const colorDark = '#000';
    // 获取二维码的大小，因css设置的为500rpx，将其转为px
    const rawViewportSize = getPxFromRpx(500);
    console.log(rawViewportSize)
    // 二维码容错率{ L: 1, M: 0, Q: 3, H: 2 }
    const correctLevel = 0;

    // 创建二维码实例对象，并添加数据进行生成
    const qrCode = new QRCodeModel(-1, correctLevel);
    qrCode.addData(data);
    qrCode.make();

    // 每个方向的二维码数量
    const nCount = qrCode.moduleCount;
    // 计算每个二维码方块的大小
    const nSize = getRoundNum(rawViewportSize / nCount, 3)
    // 每块二维码点的大小比例
    const dataScale = 1;
    // 计算出dataScale不为1时，每个点的偏移值
    const dataXyOffset = (1 - dataScale) * 0.5;

    // 二重循环，绘制每一个点
    for (let row = 0; row < nCount; row++) {
      for (let col = 0; col < nCount; col++) {
        // row 和 col 处的模块是否是黑色区
        const bIsDark = qrCode.isDark(row, col);
        // 是否是二维码的图案定位标识区 Position Detection Pattern（如本模块，是三个顶点位置处的大方块）
        const isBlkPosCtr = (col < 8 && (row < 8 || row >= nCount - 8)) || (col >= nCount - 8 && row < 8);
        // 是否是Timing Patterns，也是用于协助定位扫描的
        const isTiming = (row == 6 && col >= 8 && col <= nCount - 8) || (col == 6 && row >= 8 && row <= nCount - 8);
        // 如果是这些区域 则不进行绘制
        let isProtected = isBlkPosCtr || isTiming;

        // 计算每个点的绘制位置（left，top）
        const nLeft = col * nSize + (isProtected ? 0 : dataXyOffset * nSize);
        const nTop = row * nSize + (isProtected ? 0 : dataXyOffset * nSize);
        // 描边色、线宽、填充色配置
        ctx.strokeStyle = colorDark;
        ctx.lineWidth = 0.5;
        ctx.fillStyle = bIsDark ? colorDark : "rgba(255, 255, 255, 0.6)";
        // 如果不是标识区，则进行绘制
        if (!isProtected) {
          ctx.fillRect(
            nLeft,
            nTop,
            (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize,
            (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize
          );
        }
      }
    }
    // 绘制Position Detection Pattern
    ctx.fillStyle = colorDark;
    ctx.fillRect(0, 0, 7 * nSize, nSize);
    ctx.fillRect((nCount - 7) * nSize, 0, 7 * nSize, nSize);
    ctx.fillRect(0, 6 * nSize, 7 * nSize, nSize);
    ctx.fillRect((nCount - 7) * nSize, 6 * nSize, 7 * nSize, nSize);
    ctx.fillRect(0, (nCount - 7) * nSize, 7 * nSize, nSize);
    ctx.fillRect(0, (nCount - 7 + 6) * nSize, 7 * nSize, nSize);
    ctx.fillRect(0, 0, nSize, 7 * nSize);
    ctx.fillRect(6 * nSize, 0, nSize, 7 * nSize);
    ctx.fillRect((nCount - 7) * nSize, 0, nSize, 7 * nSize);
    ctx.fillRect((nCount - 7 + 6) * nSize, 0, nSize, 7 * nSize);
    ctx.fillRect(0, (nCount - 7) * nSize, nSize, 7 * nSize);
    ctx.fillRect(6 * nSize, (nCount - 7) * nSize, nSize, 7 * nSize);
    ctx.fillRect(2 * nSize, 2 * nSize, 3 * nSize, 3 * nSize);
    ctx.fillRect((nCount - 7 + 2) * nSize, 2 * nSize, 3 * nSize, 3 * nSize);
    ctx.fillRect(2 * nSize, (nCount - 7 + 2) * nSize, 3 * nSize, 3 * nSize);
    // 绘制Position Detection Pattern 完毕

    // 绘制Timing Patterns
    const timingScale = 1;
    const timingXyOffset = (1 - timingScale) * 0.5;
    for (let i = 0; i < nCount - 8; i += 2) {
      _drawDot(ctx, 8 + i, 6, nSize, timingXyOffset, timingScale);
      _drawDot(ctx, 6, 8 + i, nSize, timingXyOffset, timingScale);
    }
    // 绘制Timing Patterns 完毕
  },
  getQrContainer() {
    return new Promise((reslove) => {
      if (this.qrContainer) {
        reslove(this.qrContainer)
      } else {
        const query = this.createSelectorQuery();
        let dpr = wx.getSystemInfoSync().pixelRatio;
        query.select('#qr').fields({ node: true, size: true, id: true })
          .exec((res) => {
            if (res.length > 0 && res[0] != null) {
              let { node: canvas, height, width } = res[0];
              let ctx = canvas.getContext('2d');
              canvas.width = width * dpr
              canvas.height = height * dpr
              ctx.scale(dpr, dpr);
              this.qrContainer = canvas;
              reslove(canvas)
            }
          })
      }
    })
  },
})