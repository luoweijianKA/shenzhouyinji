import { RESOURCE_URL } from '../../../constants/index'
const app = getApp();

function getBanner(v) {
  console.log({ v })
  if (v && typeof v === 'string' && v.length > 0) {
    const uris = v.split(',')
    if (uris.length > 1) {
      return RESOURCE_URL + uris[1]
    }
  }
  return null
}

Page({
  data: {
    event: [],
    eventIndex: 0,
  },

  onLoad(option) {
    var eventIndex = app.globalData.events.findIndex((e) => {
      return e.id === option.eventId;
    });

    if (eventIndex <= 0) {
      eventIndex = 0;
    }
    const event = app.globalData.events[eventIndex]
    this.setData({
      event: {
        ...event,
        banner: getBanner(event.images),
      },
      eventIndex: eventIndex,
    });

    console.log({ ...event, banner: getBanner(event.images) })
  },
});