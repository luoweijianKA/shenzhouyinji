export const config = {
  /** 是否使用mock代替api返回 */
  useMock: true,
};

export const apiServer = {
  gqlUri: 'https://ces.shenzhouyinji.cn/query',
};

function getHeader() {
  const accessToken = wx.getStorageSync('accessToken');
  const header =
    accessToken && accessToken.length > 0
      ? {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${accessToken}`,
        }
      : {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
  return header;
}

export async function useQuery({ query, variables }) {
  return new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: getHeader(),
      data: JSON.stringify({ query, variables }),
      success(res) {
        const { data, errors } = res.data;
        if (errors && errors.length > 0) {
          reject(errors[0]);
          return;
        }
        reslove(data);
      },
    });
  });
}

export async function useMutation({ mutation, variables }) {
  return new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: getHeader(),
      data: JSON.stringify({ query: mutation, variables }),
      success(res) {
        const { data, errors } = res.data;
        if (errors && errors.length > 0) {
          reject(errors[0]);
          return;
        }
        reslove(data);
      },
    });
  });
}
