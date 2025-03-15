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
    scale: 13,
    polygons: [],
    markers: [],
    started: false,
    distance: '0.0',
    positionTolerance: 0,
    run: {
      start: 0,
      step: 0,
      complete: 0,
      target: 0,
    },
    userId: '',
    eventId: '',
    campId: '',
    sceneryspotId: '',
    task: undefined,
    taskId: '',
    taskCategory: '00e19ddf-6af6-4d8a-889f-a4dc6a030c02',
    result: undefined,
    points: 0,
    autoplay: false,
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
      const center = [0, 0]
      const size = coordinate.length / 2
      for (let i = 0; i < coordinate.length; i += 2) {
        center[0] += parseFloat(coordinate[i])
        center[1] += parseFloat(coordinate[i + 1])
      }
      latitude = center[0] / size
      longitude = center[1] / size
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
          markers: [{
            id: 0,
            latitude: latitude,
            longitude: longitude,
            width: 30,
            height: 40,
            value: undefined,
          }],
          positionTolerance,
          polygonGeofence,
          distance,
        })
      })
    }

    const images = task.images && task.images.length > 0 ? task.images.split(",") : []
    this.setData({
      userId,
      eventId,
      campId,
      sceneryspotId,
      task: { ...task, images: images.length > 0 ? images[Math.floor(Math.random() * images.length)] : '' },
      taskId: task.id,
      points: task.points,
      geocaching: {
        name: task.name,
        introduction: task.introduction,
        status: task.status,
      },
      polygonGeofence,
    })
  },
  onLoad: function (options) {
    this.setup(options)
  },
  onGeocaching: function () {
    const {
      latitude,
      longitude,
      positionTolerance,
      geocaching,
      polygonGeofence,
    } = this.data
    if (geocaching.status && geocaching.status === 2) {
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
        this.submitTask()
      })
    } else {
      this.submitTask()
    }
  },
  submitTask() {
    const self = this
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        const { result } = res
        wx.showModal({
          title: '提示',
          content: '确定提交寻宝吗？',
          success: function (res) {
            if (res.confirm) {
              const {
                userId,
                eventId,
                campId,
                sceneryspotId,
                taskId,
                taskCategory,
                points,
              } = self.data

              createUserTask({
                user_id: userId,
                event_id: eventId,
                camp_id: campId,
                sceneryspot_id: sceneryspotId,
                task_id: taskId,
                task_category: taskCategory,
                result,
                points,
              })
                .then(({ audit }) => {
                  const ok = audit && audit.length > 0
                  const content = ok ? `寻宝成功 +${audit}` : '任务失败！'
                  wx.showModal({
                    title: '提示',
                    content,
                    showCancel: false,
                    success: (res) => {
                      if (res.confirm) {
                        if (ok) {
                          self.setData({ autoplay: true })
                          self.selectComponent('#geocaching').showFrame()
                        } else {
                          wx.navigateBack({ backRefresh: true })
                        }
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
          }
        })
      }
    })
  },
  onClose(e) {
    wx.navigateBack({ backRefresh: true })
  },
})