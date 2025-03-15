
const { genEventSceneryspots, getEventCategories } = require('../../../model/event');
const { genSceneryspotsByIDs } = require('../../../model/sceneryspot');

const app = getApp();
Page({
  data: {
    categories: [],
    redirectUrl: "",
  },
  async onLoad(options) {
    const { redirectUrl } = options
    const { events } = app.globalData
    const categories = await getEventCategories()
    const categoriedEvents = categories.map(c => ({
      ...c,
      expand: false,
      events: events.filter(v => v.category_id === c.id)
    }))
    const otherEvents = events.filter(v => !v.category_id || v.category_id.length === 0)
    if (otherEvents && otherEvents.length > 0) {
      categoriedEvents.push({
        id: "",
        name: "其它",
        sort: 0,
        expand: true,
        events: otherEvents
      })
    }
    this.setData({
      categories: categoriedEvents,
      redirectUrl: redirectUrl,
    });
  },
  joinEvent: async function ({ currentTarget: { id } }) {
    const idx = app.globalData.events.findIndex(e => e.id === id)
    app.globalData.currentEvent = app.globalData.events[idx]
    const eventSceneryspots = await genEventSceneryspots(id)
    if (eventSceneryspots.length > 0) {
      const sceneryspots = await genSceneryspotsByIDs(eventSceneryspots.map(v => v.scenery_spot_id))
      app.globalData.currentSceneryspots = sceneryspots
      app.globalData.sceneryspot = sceneryspots.length > 0 ? sceneryspots[0] : undefined
    }

    if (this.data.redirectUrl == "pages/home/home") {
      wx.reLaunch({
        url: `/pages/home/home?eventIndex=${idx}`
      });
    } else if (this.data.redirectUrl == "pages/tweet/index") {
      wx.reLaunch({
        url: `/pages/tweet/index?eventIndex=${idx}`
      });
    } else {
      const url = `/${this.data.redirectUrl}?eventIndex=${idx}`;
      console.log("url: ", url);
      wx.redirectTo({
        url: url,
      })
    }
  },
  eventDetail: function (e) {
    wx.navigateTo({ url: '/pages/event/detail/index?eventId=' + e.currentTarget.id });
  },
  onExpandCategory(e) {
    const { value, expand } = e.currentTarget.dataset
    const { categories } = this.data
    categories[value] = { ...categories[value], expand: !expand }
    this.setData({ categories })
  }
});