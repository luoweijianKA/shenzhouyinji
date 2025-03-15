import { YIN_ICON } from '../../constants/index'
const { getUserStamp } = require('../../model/user')
const { getSceneryspot, getNavigations } = require('../../model/sceneryspot')
const { getLocation, openLocation } = require('../../utils/wxapi')
const { getEventPassport, getTasks } = require('../../model/event')
const { getUserShare } = require('../../model/user')
const app = getApp()

Page({
  data: {
    categories: [
      { id: '10d80eae-f94c-436a-a396-67f43521ed98', name: '餐饮', disabled: false },
      { id: 'ac0a8cf5-7926-456c-af9e-d3154f20aefe', name: '住宿', disabled: false },
      { id: 'b8aae19c-9307-4345-8421-60737dcdc4f3', name: '停车/站点', disabled: false },
      { id: 'ce60687f-a1df-4359-aa9b-208396a2d55e', name: '景点', disabled: false },
      { id: '087254d6-96fd-49b9-956b-c3a4d5063287', name: '商店', disabled: false },
      { id: 'f9edad6e-5040-4c44-b52a-0c88fa627278', name: '游乐', disabled: false },
      { id: 'b13f7d55-dac3-4faf-962b-2f851919d37d', name: '厕所/客服', disabled: false },
      { id: 'f9adcc8c-8315-4240-a0a1-c2f2b01212cc', name: '兑奖', disabled: false },
      { id: 'fdc82fda-c76d-49b9-902e-6c86ebfa90e6', name: '打卡', disabled: true },
    ],
    tab: '',
    latitude: 21.463213,
    longitude: 111.140699,
    scale: 13.5,
    polygon: [],
    navigations: [],
    markers: [],
    search: '',
    result: [],
    stamp: undefined,
  },
  onShow: function (params) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 1,
        yinIcon: YIN_ICON,
      })
    }

    this.loadSceneryspot()
  },
  onLocation: function (e) {
    getLocation(null, ({ latitude, longitude }) => {
      this.setData({ latitude, longitude })
    })
  },
  onTabChange: function (e) {
    const { tab } = e.currentTarget.dataset
    const { latitude, longitude, navigations } = this.data
    const result = navigations.filter(nav => nav.category_id === tab).sort((a, b) => b.display_order - a.display_order)
    const markers = this.getMarkers(latitude, longitude, result)
    this.setData({ tab, result, markers })
  },
  onMap: function () {
    const { latitude, longitude } = this.data
    openLocation(latitude, longitude)
  },
  onNav: function (e) {
    const { value } = e.currentTarget.dataset
    if (value) {
      wx.navigateTo({ url: `/sceneryspot/pages/detail/index?id=${value.id}` })
    }
  },
  onStamp: function (e) {
    const { value } = e.currentTarget.dataset
    if (value) {
      wx.navigateTo({ url: `/pages/clock/index?code=${value}` })
    }
  },
  onSearchChange: function (e) {
    this.setData({ search: e.detail.value })
  },
  onSearchConfirm: function (e) {
    const { value } = e.detail
    if (value) {
      const { latitude, longitude, navigations } = this.data
      const result = navigations.filter(v => v.name.indexOf(value) > -1).sort((a, b) => b.display_order - a.display_order)
      const markers = this.getMarkers(latitude, longitude, result)
      this.setData({ result, markers })
    }
  },
  onSearchCancel: function (e) {
    this.setData({ search: '' })
  },
  async loadSceneryspot() {
    const { user, currentEvent, sceneryspot } = app.globalData
    if (user && currentEvent && sceneryspot) {
      const { categories } = this.data
      const userId = user.id
      const phoneNumber = user.profile?.phone ?? ''
      const eventId = currentEvent.id
      const sceneryspotId = sceneryspot.id
      const stamp = await getUserStamp(user.id, eventId, sceneryspotId)
      const passport = await getEventPassport(eventId, phoneNumber && phoneNumber.length > 0 ? '' : userId, phoneNumber)
      if (passport && passport.camp) {
        const tasks = await getTasks(userId, eventId, passport.camp.camp_id, sceneryspotId)
        const taskCount = tasks.filter(v => !v.optional).length
        const completedTask = taskCount > 0 && tasks.filter(v => !v.optional && !v.completed).length === 0
        const shared = await getUserShare(userId, eventId, sceneryspotId)
        if (completedTask && shared) {
          categories[8].disabled = stamp != null && stamp.status == 1
        }
      }

      const { id } = app.globalData.sceneryspot
      const { coordinate, electric_fence } = await getSceneryspot(id)
      const { latitude, longitude } = this.getLatLng(coordinate)
      const polygon = this.getPolygon(electric_fence)
      const navigations = await getNavigations(id)
      const markers = this.getMarkers(
        latitude,
        longitude,
        navigations.filter(v => (stamp == 0 && v.category_id == 'fdc82fda-c76d-49b9-902e-6c86ebfa90e6')
          || v.category_id !== 'fdc82fda-c76d-49b9-902e-6c86ebfa90e6')
      )
      this.setData({
        stamp,
        categories: [...categories],
        latitude,
        longitude,
        polygon,
        navigations,
        markers
      });
    }
  },
  getLatLng(coordinate) {
    const v = coordinate && coordinate.length > 0 ? coordinate.split(',') : []
    if (v.length > 1) {
      return { latitude: v[0], longitude: v[1] }
    }
    return { latitude: 0, longitude: 0 }
  },
  getPolygon(value) {
    const data = value.split(',')
    const points = []
    for (let i = 0; i < data.length; i += 2) {
      points.push({ latitude: data[i], longitude: data[i + 1] })
    }
    return [{
      points: points.filter(({ latitude }) => latitude >= -90 && latitude <= 90),
      strokeWidth: 2,
      strokeColor: "#FF0000",
      fillColor: "#3dabde50"
    }]
  },
  getMarkers(latitude, longitude, navigations) {
    return [{
      id: 0,
      latitude: latitude,
      longitude: longitude,
      width: 30,
      height: 40,
      value: undefined,
    }].concat(navigations.map((nav, i) => {
      const { latitude, longitude } = this.getLatLng(nav.coordinate)
      return {
        id: i + 1,
        latitude: latitude,
        longitude: longitude,
        width: 15,
        height: 15,
        value: nav.id,
        iconPath: `/assets/icons/${nav.category_id}.png`,
        callout: {
          content: nav.name,
          color: '#226208',
          fontSize: 12,
          display: 'ALWAYS',
          textAlign: 'center',
          anchorY: '0'
        }
      }
    }))
      .filter(({ latitude }) => latitude >= -90 && latitude <= 90)
  },
})