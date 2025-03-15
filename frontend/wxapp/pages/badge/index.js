import { RESOURCE_URL } from '../../constants/index'
import { ago } from '../../utils/util.js'
import { getUserSwaps } from '../../model/badge';
const app = getApp();

Page({
  data: {
    search: undefined,
    region: ['', '', ''],
    badgeBannerUrl: '',
    event: {
      id: '',
      name: '',
      logo: '',
      banner: '',
    },
    swaps: [],
    eventIndex: 0,
    navbarHeight: 0,
    menuHeight: 0,
    navberWidth: 0,
  },
  onLoad(options) {
    const { eventIndex } = options;

    let sysInfo = wx.getSystemInfoSync();
    let menuInfo = wx.getMenuButtonBoundingClientRect();

    let statusBarHeight = sysInfo.statusBarHeight;
    let navbarHeight = statusBarHeight + menuInfo.height + (menuInfo.top - statusBarHeight) * 2;

    this.setData({
      eventIndex: eventIndex,
      navbarHeight: navbarHeight,
      menuHeight: menuInfo.height,
      navberWidth: sysInfo.screenWidth - menuInfo.width
    });
    wx.stopPullDownRefresh()
  },
  onShow(params) {
    const { currentEvent: event } = app.globalData
    const { region } = this.data
    if (event) {
      const { id, name, images } = event
      const imageUris = images.split(',')
      const logo = `${RESOURCE_URL}${imageUris[0]}`
      const banner = `${RESOURCE_URL}${imageUris[1]}`
      this.setData({
        badgeBannerUrl: RESOURCE_URL + imageUris[2],
        event: { id, name, logo, banner },
      })
      this.setUserSwaps(event.id, region[1])
    }
  },
  async setUserSwaps(eventId, city) {
    const { search } = this.data
    const { edges } = await getUserSwaps(100, null, null, null, { status: 1, city })
    const swaps = edges.filter(v => !search || (v.node.badges.length > 0 && v.node.badges[0].id === search.id)).map(v => ({
      ...v.node,
      badges: v.node.badges.map(badge => ({ ...badge, images: RESOURCE_URL + badge.images })),
      city: v.node.city.split(','),
      expiresIn: ago(v.node.createTime),
    }))
    console.log({ search, swaps })
    this.setData({ swaps })
  },
  bindEventChange: function (e) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1].route;
    console.log("currentPage: ", currentPage);

    wx.navigateTo({ url: '/pages/event/list/index?redirectUrl=' + currentPage });
  },
  bindSearch: function (e) {
    wx.navigateTo({ url: './select' })
  },
  bindCloseSearch: function (e) {
    const { region, event } = this.data
    this.setData({ search: undefined })
    this.setUserSwaps(event.id, region[1])
  },
  bindSwap: function (e) {
    const { value } = e.currentTarget.dataset
    if (value) {
      wx.navigateTo({
        url: `/pages/badge/swap?id=${value.id}`,
      })
    }
  },
  bindRegionChange: function (e) {
    const { event } = this.data
    const region = e.detail.value
    this.setData({
      region
    })
    this.setUserSwaps(event.id, region[1])
  },
  goHome: function () {
    wx.reLaunch({
      url: `/pages/home/home?eventIndex=${this.data.eventIndex}`,
    })
  }
})