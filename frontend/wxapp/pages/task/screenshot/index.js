import { uploadFile } from '../../../model/uploadFile'
import { getSceneryspot } from '../../../model/sceneryspot'
const { getLocation, getPolygonGeofence, isInsidePolygonGeofence } = require('../../../utils/wxapi')
const { getTask, createUserTask } = require('../../../model/event')
const app = getApp()

function getLatLng(coordinate) {
  const values = coordinate && coordinate.length > 0 ? coordinate.split(',') : []
  if (values.length > 1) {
    const latitude = values[0], longitude = values[1]
    if (-90 <= latitude && latitude <= 90) {
      return { latitude, longitude }
    }
  }
  return { latitude: undefined, longitude: undefined }
}

function getPolygons(value) {
  const data = value.split(',')
  const points = []
  for (let i = 0; i < data.length; i += 2) {
    points.push({ latitude: data[i], longitude: data[i + 1] })
  }
  return [{
    points: points.filter(({ latitude }) => latitude >= -90 && latitude <= 90),
    strokeWidth: 2,
    strokeColor: "#FF5C8E",
    fillColor: "#3dabde50"
  }]
}

Page({
  data: {
    latitude: 0,
    longitude: 0,
    distance: '0.0',
    positionTolerance: 0,
    started: false,
    userId: '',
    eventId: '',
    campId: '',
    sceneryspotId: '',
    taskId: '',
    taskCategory: '62127eeb-29b7-461a-a065-ae62cc5201aa',
    result: undefined,
    points: 0,
    name: '',
    images: '',
    introduction: '',
    status: 0,
    tempFiles: [],
    polygonGeofence: [],
  },
  async setup(options) {
    const { id, campId } = options
    const {
      user: { id: userId },
      currentEvent: { id: eventId },
      sceneryspot: { id: sceneryspotId },
    } = app.globalData
    const { taskCategory } = this.data
    const task = await getTask(id, taskCategory, userId, eventId, campId, sceneryspotId)
    if (task.completed) {
      wx.showModal({
        title: '提示',
        content: '您的任务已完成！',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
      return
    }

    let latitude, longitude, polygons, positionTolerance, polygonGeofence
    if (task.electric_fence && task.electric_fence.length > 0) {
      const coordinate = task.electric_fence.split(',')
      latitude = coordinate[0]
      longitude = coordinate[1]
      polygons = getPolygons(task.electric_fence)
      positionTolerance = 50
      polygonGeofence = getPolygonGeofence(task.electric_fence)
    } else {
      const { coordinate, electric_fence, position_tolerance } = await getSceneryspot(sceneryspotId)
      const latLng = getLatLng(coordinate)
      latitude = latLng.latitude
      longitude = latLng.longitude
      polygons = getPolygons(electric_fence)
      positionTolerance = position_tolerance
      polygonGeofence = getPolygonGeofence(electric_fence)
    }
    if (latitude && longitude) {
      const dest = { latitude, longitude }
      getLocation(dest, ({ latitude, longitude, distance }) => {
        // if (distance < 0.0015) {
        //   wx.showModal({
        //     title: '您的手机没有打开定位功能',
        //     showCancel: false,
        //     success(res) {
        //       if (res.confirm) {
        //         wx.navigateBack({ delta: 1 })
        //       }
        //     }
        //   })
        //   return
        // }

        if (task.status && task.status === 2 && !isInsidePolygonGeofence([latitude, longitude], polygonGeofence)) {
          wx.showModal({
            title: '您当前位置不在指定范围内，不能实施任务',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.navigateBack({ delta: 1 })
              }
            }
          })
          return
        }

        this.setData({
          latitude,
          longitude,
          polygons,
          positionTolerance,
          polygonGeofence,
          distance,
        })
      })
    }

    this.setData({
      userId,
      eventId,
      campId,
      sceneryspotId,
      taskId: task.id,
      points: task.points,
      name: task.name,
      images: task.images,
      introduction: task.introduction,
      status: task.status,
      polygonGeofence,
    })
  },
  onLoad: function (options) {
    this.setup(options)
  },
  bindStart: function () {
    const {
      latitude,
      longitude,
      electricFence,
      positionTolerance,
      polygonGeofence,
      status,
    } = this.data

    if (status && status === 2) {
      const dest = { latitude, longitude }
      getLocation(dest, ({ latitude, longitude, distance }) => {
        // if (distance < 0.0015) {
        //   wx.showModal({
        //     title: `您的手机没有打开定位功能`,
        //     showCancel: false,
        //   })
        //   return
        // }

        if (!isInsidePolygonGeofence([latitude, longitude], polygonGeofence)) {
          wx.showModal({
            title: '您当前位置不在指定范围内，不能实施任务',
            showCancel: false,
          })
          return
        }
        this.start()
      })
    } else {
      this.start()
    }
  },
  bindUpload: function () {
    const { data: { tempFiles }, submitTask } = this

    if (!tempFiles || tempFiles.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请先执行截图任务，如有疑问请联系微信客服',
        showCancel: false,
      })
      return
    }

    wx.showModal({
      title: '提示',
      content: '确定上传截图？',
      success(res) {
        if (res.confirm) {
          submitTask()
        }
      }
    })
  },
  start: function () {
    const self = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success({ tempFiles }) {
        self.setData({ tempFiles, started: tempFiles.length > 0 })
      },
      fail(res) {
        if (res && res.errMsg !== 'chooseMedia:fail cancel') {
          wx.showModal({
            title: 'fail',
            content: JSON.stringify(res),
          })
        }
      }
    })
  },
  submitTask: async function () {
    const {
      userId,
      eventId,
      campId,
      sceneryspotId,
      taskId,
      taskCategory,
      points,
      tempFiles,
    } = this.data
    const upload = await uploadFile(tempFiles[0].tempFilePath, "file", "true", "screenshot")
    const { file } = JSON.parse(upload)
    const input = {
      user_id: userId,
      event_id: eventId,
      camp_id: campId ?? "",
      sceneryspot_id: sceneryspotId,
      task_id: taskId,
      task_category: taskCategory,
      result: file.previewUri,
      points,
    }

    createUserTask(input)
      .then(() => {
        wx.showModal({
          title: '提示',
          content: '已提交任务，等待审核',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              wx.navigateBack({ backRefresh: true })
            }
          }
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
  }
})