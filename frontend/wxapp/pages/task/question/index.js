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
    userId: '',
    eventId: '',
    campId: '',
    sceneryspotId: '',
    taskId: '',
    taskCategory: '0db57a33-ab01-449c-961b-2c1015f35496',
    question: undefined,
    result: undefined,
    points: 0,
    toast: {
      title: '',
      icon: 'loading',
      duration: 30000,
      mask: true,
    },
    polygonGeofence: [],
  },
  async setup(options) {
    const { id, campId } = options
    const {
      user: { id: userId },
      sceneryspot: { id: sceneryspotId },
      currentEvent: { id: eventId },
    } = app.globalData
    const { taskCategory } = this.data
    const task = await getTask(id, taskCategory, userId, eventId, campId, sceneryspotId)
    if (task.completed && !task.redone) {
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
          ...dest,
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
      question: {
        name: task.name,
        answers: task.options.map(opt => ({ value: opt, checked: false })),
        status: task.status
      },
      polygonGeofence,
    })
  },
  onLoad: function (options) {
    this.setup(options)
  },
  onResultChange: function (e) {
    const { question } = this.data
    const { value } = e.detail
    for (var i = 0; i < question.answers.length; i++) {
      question.answers[i].checked = value && value.length > 0 && `${i}` === value[value.length - 1]
    }
    const answers = question.answers.filter(answer => answer.checked).map(answer => answer.value)
    const result = answers.length > 0 ? answers[0] : undefined
    const done = (result && result.length > 0) ?? false
    this.setData({ question, result, done })
  },
  onSubmit: function () {
    const {
      latitude,
      longitude,
      positionTolerance,
      question,
      polygonGeofence,
    } = this.data
    if (question.status && question.status === 2) {
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
        this.submitQuestion()
      })
    } else {
      this.submitQuestion()
    }
  },
  submitQuestion() {
    const {
      userId,
      eventId,
      campId,
      sceneryspotId,
      taskId,
      taskCategory,
      points,
      result,
      done,
    } = this.data
    if (done) {
      createUserTask({
        user_id: userId,
        event_id: eventId,
        camp_id: campId,
        sceneryspot_id: sceneryspotId,
        task_id: taskId,
        task_category: taskCategory,
        result,
        points,
      }).then(({ audit }) => {
        const content = audit && audit.length > 0 ? `答题正确 +${audit}` : '答题不正确'
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
        })
    }
  }
})