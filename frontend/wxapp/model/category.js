import { apiServer, useQuery } from '../config/index';

export async function getCategoryByName(name) {
  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query: `query getCategoryByName($name: String!) {
          categoryByName(name: $name) {
            id
            name
          }
        }`,
        variables: {
          "name": name
        },
      }),
      success(res) {
        reslove(res.data.data.categoryByName);
      },
    });
  });
  return data;
}