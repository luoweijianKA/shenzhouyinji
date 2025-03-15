const app = getApp();

async function fetchHomeData() {
  const { delay } = require('../_utils/delay');
  const { genNotifyList } = require('../../model/notify');
  const { genEventList } = require('../../model/event');

  let notifys = await genNotifyList();
  let events = await genEventList();

  app.globalData.notifys = notifys;
  app.globalData.events = events;
  if (!app.globalData.currentEvent) {
    app.globalData.currentEvent = events[0];
  }

  return delay().then(() => {
    return {
      notify: notifys,
      event: events,
      tabList: app.globalData.currentSceneryspots,
    };
  });
}

export function fetchHome() {
  return fetchHomeData();
}
