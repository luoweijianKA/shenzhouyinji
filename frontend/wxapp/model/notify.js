
import { apiServer } from '../config/index';

async function getNotifys() {
  return new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query: `query getNotifications{
          notifications{
            id,
            name,
            content,
            release_time,
            blocking_time
          }
        }`,
      }),
      success(res) {
        reslove(res.data.data.notifications);
      },
    });
  });
}

export async function genNotifyList() {
  let result = await getNotifys();
  return result;
}
