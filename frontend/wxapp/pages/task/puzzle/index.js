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

function makePuzzles(puzzles) {
  const { windowWidth } = wx.getSystemInfoSync()
  const width = (windowWidth - (48 / 750 * windowWidth)) / 3
  const height = width
  return puzzles.map((v, i) => ({
    id: i,
    width,
    height,
    x: (i % 3) * width,
    y: Math.floor(i / 3) * height,
    src: v
  }))
}

var clock = null

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
    taskCategory: 'd64b951d-1c06-4254-b88b-4a0459caac4d',
    result: undefined,
    points: 0,
    name: '',
    countdown: 0,
    introduction: '',
    status: 0,
    puzzles: [],
    moveId: null,
    endX: 0,
    endY: 0,
    polygonGeofence: [],
  },
  moveEnd(e) {
    const { puzzles, moveId, endX, endY } = this.data
    let n = -1
    for (var i = 0; i < puzzles.length; i++) {
      const v = puzzles[i]
      const x = v.x + v.width / 2
      const y = v.y + v.height / 2
      if (endX < x && endY < y) {
        n = i
        break
      }
    }
    if (n > -1) {
      const p1 = puzzles[n]
      const p2 = puzzles[moveId]
      puzzles[n] = { ...p1, id: p2.id, x: p2.x, y: p2.y }
      puzzles[moveId] = { ...p2, id: p1.id, x: p1.x, y: p1.y }
      this.setData({
        puzzles: puzzles.sort((o1, o2) => o1.id < o2.id ? -1 : 0),
      })
      return
    }
  },
  moveStatus(e) {
    const { moveid } = e.currentTarget.dataset
    const { x, y } = e.detail
    this.setData({
      moveId: moveid,
      endX: x,
      endY: y
    })
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
      puzzles: makePuzzles(task.puzzles),
      introduction: task.introduction,
      status: task.status,
      countdown: task.countdown,
      polygonGeofence,
    })
  },
  onLoad: function (options) {
    this.setup(options)
  },
  onHide() {
    this.close()
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
  bindEnd: function () {
    const { close, submitTask } = this
    wx.showModal({
      title: '提示',
      content: '确定完成拼图？',
      success(res) {
        if (res.confirm) {
          submitTask()
        } else {
          close()
          wx.navigateBack()
        }
      }
    })
  },
  start: function () {
    const { puzzles } = this.data
    let newPuzzles = []
    const len = puzzles.length
    for (var i = 0; i < len; i++) {
      const index = Math.floor(Math.random() * (len - i))
      newPuzzles.push(puzzles[index])
      puzzles.splice(index, 1)
    }

    clock = setInterval(
      () => {
        const { data: { countdown }, submitTask } = this
        if (countdown == 0) {
          clearInterval(clock)
          clock = null
          this.setData({ countdown })
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '时间已到！',
            success(res) {
              if (res.confirm) {
                submitTask()
              }
            }
          })
        } else {
          this.setData({ countdown: countdown - 1 })
        }
      },
      1000,
    )

    this.setData({
      started: true,
      clock,
      puzzles: newPuzzles.map((e, i) => ({
        ...e,
        id: i,
        x: (i % 3) * e.width,
        y: Math.floor(i / 3) * e.width,
      }))
    })
  },
  close: function () {
    if (clock) {
      clearInterval(clock)
      clock = null
    }
  },
  submitTask: function () {
    this.close()
    const {
      userId,
      eventId,
      campId,
      sceneryspotId,
      taskId,
      taskCategory,
      points,
      puzzles,
    } = this.data
    const input = {
      user_id: userId,
      event_id: eventId,
      camp_id: campId,
      sceneryspot_id: sceneryspotId,
      task_id: taskId,
      task_category: taskCategory,
      result: puzzles.map(v => v.src).join(','),
      points,
    }
    createUserTask(input)
      .then(({ audit }) => {
        const content = audit && audit.length > 0 ? `任务完成 +${audit}` : '任务失败，再接再力！'
        wx.showModal({
          title: '提示',
          content,
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