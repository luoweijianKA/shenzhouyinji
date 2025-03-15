import { RESOURCE_URL } from '../../../constants/index'
import { openLocation } from '../../../utils/wxapi'
import { getUser, getUserStampByUserID, getUserStampPointsRecord, updateUserStampRecord } from '../../../model/user'

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

function getMarkers(latitude, longitude, value) {
  return value
    .map((v, i) => {
      const { latitude, longitude } = getLatLng(v.sceneryspot_coordinate)
      return {
        id: i + 1,
        latitude: latitude,
        longitude: longitude,
        width: 24,
        height: 24,
        iconPath: `/assets/icons/q.png`,
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
    user: undefined,
    eventId: '',
    latitude: 40.046598363138266,
    longitude: 116.28675579028959,
    scale: 5.5,
    markers: [],
    userStamps: [{
      user_id: "",
      event_id: "",
      sceneryspot_id: "",
      sceneryspot_name: "",
      sceneryspot_images: "",
      sceneryspot_address: "",
      sceneryspot_coordinate: "",
      status: 0,
      like_count: 0,
      share_count: 0,
      view_count: 0,
      hasLike: false,
      isself: false
    }],
    paths: [
      {
        path: [40.044908, 116.28292, 40.045069, 116.283019, 40.045177, 116.283158, 40.04527, 116.283311, 40.045317, 116.283486],
        styleId: "styel1"
      },
      {
        path: [40.051751, 116.288379, 40.051908, 116.289468, 40.051894, 116.289548, 40.051847, 116.289586, 40.050994, 116.289776, 40.050929, 116.289746, 40.050899, 116.289688],
        styleId: "styel2"
      },
    ],
    platformWidth: 0,
    navbarHeight: 0,
    menuHeight: 0,
    navberWidth: 0,
    windowWidth: 0,
    goHome: false,
    totalLike: 0,
    totalShare: 0,
    totalView: 0,
    autoplay: false,
    navigation: { type: 'dots-bar' },
    tapping: {},
  },
  onLoad: async function (options) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    let sysInfo = wx.getSystemInfoSync();
    let menuInfo = wx.getMenuButtonBoundingClientRect();

    let platformWidth = 0;
    let platform = sysInfo.platform;
    let windowWidth = sysInfo.windowWidth;
    let statusBarHeight = sysInfo.statusBarHeight;
    let navbarHeight = statusBarHeight + menuInfo.height + (menuInfo.top - statusBarHeight) * 2;

    if (platform == "devtools" || platform == "ios") {
      platformWidth = 68;
    } else {
      platformWidth = 120;
    }

    this.setData({
      platformWidth: platformWidth,
      navbarHeight: navbarHeight,
      menuHeight: menuInfo.height,
      navberWidth: sysInfo.screenWidth - menuInfo.width,
      windowWidth: windowWidth
    });

    const { uid, goHome } = options
    if (typeof goHome != 'undefined') {
      this.setData({ goHome: goHome })
    }

    const user = await getUser(uid ?? app.globalData.user.id)
    const eventId = options.eventId || app.globalData.currentEvent.id

    this.setData({
      user: {
        id: user.id,
        name: user.wechat_name,
        avatar: user.wechat_avatar && user.wechat_avatar.length > 0 ? RESOURCE_URL + user.wechat_avatar : undefined,
      },
      eventId
    })

    var userStamp = await getUserStampByUserID(user.id)
    userStamp = userStamp.filter((i) => i.event_id == eventId)

    console.log({ userStamp, options })

    var totalLike = 0;
    var totalShare = 0;
    var totalView = 0;

    userStamp.forEach(async (i) => {
      totalLike += i.like_count
      totalShare += i.share_count
      totalView += i.view_count

      const action_user_id = wx.getStorageSync('userId')
      const input = {
        "user_id": user.id,
        "event_id": this.data.eventId,
        "sceneryspot_id": i.sceneryspot_id,
        "action_user_id": action_user_id
      }

      const result = await getUserStampPointsRecord(input)
      i.userStampPointsRecord = result

      result.forEach((r) => {
        if (r.like == 1) {
          i.hasLike = true
        } else {
          i.hasLike = false
        }

        if (r.action_user_id == user.id) {
          i.isself = true
        } else {
          i.isself = false
        }
      })
    });

    if (userStamp.length > 0) {
      const { latitude, longitude } = getLatLng(userStamp[0].sceneryspot_coordinate)
      const markers = getMarkers(latitude, longitude, userStamp)

      setTimeout(() => {
        this.setData({
          latitude,
          longitude,
          markers,
          userStamp,
          totalLike,
          totalShare,
          totalView,
          isDisabled: false
        })
      }, 1000)
    }
  },
  bindMap: function (e) {
    console.log({ e })
    // openLocation(latitude, longitude)
  },
  onNav: function (e) {
    const { index } = e.currentTarget.dataset
    const { userStamp } = this.data
    if (userStamp.length > index) {
      const { latitude, longitude } = getLatLng(userStamp[index].sceneryspot_coordinate)
      openLocation(latitude, longitude)
    }
  },
  goBack: function () {
    wx.navigateBack();
  },
  goHome: function () {
    wx.reLaunch({
      url: `/pages/home/home`
    });
  },
  tapLike: async function (e) {
    const { tapping } = this.data
    const us = e.detail.currentTarget.dataset.custom
    if (!tapping[us.sceneryspot_id]) {
      console.log({ us })
      if (!us.hasLike) {
        this.setData({ tapping: { ...tapping, [us.sceneryspot_id]: true } })
        this.like(us)
      }
    }
  },
  like: async function (us) {
    const action_user_id = wx.getStorageSync('userId')
    const input = {
      user_id: us.user_id,
      event_id: us.event_id,
      sceneryspot_id: us.sceneryspot_id,
      action_user_id: action_user_id,
      action_type: "Like"
    }

    if (action_user_id != us.user_id) {
      const result = await updateUserStampRecord(input)
      if (result.succed) {
        const { userStamp, totalLike, tapping } = this.data
        userStamp.forEach((i) => {
          if (i.sceneryspot_id == us.sceneryspot_id) {
            i.hasLike = true
            i.like_count += 1
          }
        })

        setTimeout(() => {
          this.setData({
            totalLike: totalLike + 1,
            userStamp: userStamp,
            tapping: { ...tapping, [us.sceneryspot_id]: true }
          })
        }, 500)
      }
    } else {
      console.log("can't tap like tweet by yourself")
    }
  },
  unlike: async function (us) {
    const action_user_id = wx.getStorageSync('userId')
    const input = {
      user_id: us.user_id,
      event_id: us.event_id,
      sceneryspot_id: us.sceneryspot_id,
      action_user_id: action_user_id,
      action_type: "Unlike"
    }

    const result = await updateUserStampRecord(input)
    if (result.succed) {
      var userStamp = this.data.userStamp
      userStamp.forEach((i) => {
        if (i.sceneryspot_id == us.sceneryspot_id) {
          i.hasLike = false
          i.like_count -= 1
        }
      })

      setTimeout(() => {
        this.setData({
          totalLike: this.data.totalLike - 1,
          userStamp: userStamp
        })
      }, 500)

    }
  },
  onShareAppMessage: async function (e) {
    if (e.from === 'button') {
      const us = e.target.dataset.custom
      const action_user_id = wx.getStorageSync('userId')
      const input = {
        user_id: us.user_id,
        event_id: us.event_id,
        sceneryspot_id: us.sceneryspot_id,
        action_user_id: action_user_id,
        action_type: "Share"
      }

      const result = await updateUserStampRecord(input)
      if (result.succed) {
        var userStamp = this.data.userStamp
        userStamp.forEach((i) => {
          if (i.sceneryspot_id == us.sceneryspot_id) {
            i.share_count += 1
          }
        })

        setTimeout(() => {
          this.setData({
            totalShare: this.data.totalShare + 1,
            userStamp: userStamp
          })
        }, 500)
      }
    }

    if (e.from === 'menu') {
      // 来自菜单内转发按钮
      console.log(e.target)
    }

    const { user, eventId } = this.data
    if (user) {
      return {
        title: '印迹地图',
        path: '/pages/start/index?redirectUrl=' + encodeURIComponent(`/pages/usercenter/map/index?uid=${user.id}&goHome=true&eventId=${eventId}`),
      }
    }
  },
  onShareTimeline: function (e) {
    const { user, eventId } = this.data
    if (user) {
      return {
        title: '印迹地图',
        path: '/pages/start/index?redirectUrl=' + encodeURIComponent(`/pages/usercenter/map/index?uid=${user.id}&goHome=true&eventId=${eventId}`),
      }
    }
  },
})