import { getSceneryspot } from '../../../model/sceneryspot'
import { decodeWeRunData } from '../../../model/user'
const { getLocation, getPolygonGeofence, isInsidePolygonGeofence, getWeRunData } = require('../../../utils/wxapi')
const { getTask, getUserTask, createUserTask, completeUserTask } = require('../../../model/event')
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

var clock

Page({
  data: {
    latitude: 21.463213,
    longitude: 111.140699,
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
    taskId: '',
    taskCategory: '95e1fa0f-40b5-4ae9-84ec-4e65c24e7f7d',
    trek: undefined,
    result: undefined,
    points: 0,
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
        title: '您的任务已完成！',
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
          distance
        })
      })
    }

    let started = false
    let run = {
      start: 0,
      step: 0,
      complete: 0,
      target: task.step,
    }
    const ut = await getUserTask(userId, task.id)
    if (ut && ut.status === 1) {
      started = true
      if (ut.result.length > 0) {
        run.start = parseInt(ut.result)
      }
    }
    console.log(task)
    this.setData({
      userId,
      eventId,
      campId,
      sceneryspotId,
      taskId: task.id,
      points: task.points,
      trek: {
        name: task.name,
        images: task.images,
        introduction: task.introduction,
        status: task.status,
      },
      polygonGeofence,
      started,
      run,
    })

    if (clock) {
      clearInterval(clock)
      clock = null
    }

    if (started) {
      setTimeout(() => this.bindRefresh(), 500)
    }
  },
  onLoad: function (options) {
    this.setup(options)
  },
  onUnload: function (e) {
    if (clock) {
      clearInterval(clock)
      clock = null
    }
  },
  refreshRunData: function () {
    const { run } = this.data
    getWeRunData(({ encryptedData, iv }) => {
      decodeWeRunData(encryptedData, iv).then((data) => {
        const { stepInfoList } = data
        if (stepInfoList && stepInfoList.length > 0) {
          const { step } = stepInfoList[stepInfoList.length - 1]
          const complete = step - run.start
          this.setData({ run: { ...run, step, complete } })
        }
      })
    })
  },
  start: function () {
    const self = this
    const {
      userId,
      eventId,
      campId,
      sceneryspotId,
      taskId,
      taskCategory,
      points,
    } = self.data
    wx.showModal({
      title: '开始任务后将不能暂停，你确定要开始执行步行任务吗？',
      cancelText: '再想想',
      confirmText: '确认开始',
      success: function (res) {
        if (res.confirm) {
          const { run } = self.data
          getWeRunData(({ encryptedData, iv }) => {
            decodeWeRunData(encryptedData, iv).then((data) => {
              const { stepInfoList } = data
              if (stepInfoList && stepInfoList.length > 0) {
                const { step } = stepInfoList[stepInfoList.length - 1]
                createUserTask({
                  user_id: userId,
                  event_id: eventId,
                  camp_id: campId,
                  sceneryspot_id: sceneryspotId,
                  task_id: taskId,
                  task_category: taskCategory,
                  result: step,
                  points,
                })
                  .then(() => {
                    self.setData({ run: { ...run, start: step, step }, started: true })
                  })
                  .catch(err => {
                    wx.showModal({
                      title: err.message,
                      showCancel: false,
                    })
                    self.setData({ started: false })
                  })
              }
            })
          })

          clock = setInterval(() => self.refreshRunData(), 10 * 1000)
        }
      }
    })
  },
  end: function () {
    const self = this
    const {
      run,
      userId,
      eventId,
      campId,
      sceneryspotId,
      taskId,
      taskCategory,
      points,
    } = self.data

    getWeRunData(({ encryptedData, iv }) => {
      decodeWeRunData(encryptedData, iv).then((data) => {
        const { stepInfoList } = data
        if (stepInfoList && stepInfoList.length > 0) {
          const { step } = stepInfoList[stepInfoList.length - 1]
          const result = step - run.start
          wx.showModal({
            title: '你当前完成' + result + '步，确定提交吗？',
            success: function (res) {
              if (res.confirm) {
                if (clock) {
                  clearInterval(clock)
                  clock = null
                }
                completeUserTask({
                  user_id: userId,
                  event_id: eventId,
                  camp_id: campId,
                  sceneryspot_id: sceneryspotId,
                  task_id: taskId,
                  task_category: taskCategory,
                  result,
                  points,
                }).then(({ audit }) => {
                  const title = audit && audit.length > 0 ? `任务完成 +${audit}` : '任务失败，再接再力！'
                  self.setData({ started: false })
                  wx.showModal({
                    title,
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
                      title: err.message,
                      showCancel: false,
                    })
                    self.setData({ started: false })
                  })
              }
            }
          })
        }
      })
    })
  },
  bindStart: function (e) {
    const { latitude, longitude, positionTolerance, polygonGeofence, trek } = this.data
    if (trek.status && trek.status === 2) {
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
  bindRefresh: function (e) {
    this.refreshRunData()
    wx.showToast({
      title: '正在获取微信运动数据...',
      icon: 'loading',
      duration: 1500,
      mask: true,
    })
  },
  bindEnd: function () {
    const { latitude, longitude, positionTolerance, polygonGeofence, trek } = this.data
    if (trek.status && trek.status === 2) {
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

        this.end()
      })
    } else {
      this.end()
    }
  },
})