import { useQuery, useMutation, apiServer } from '../config/index';

export async function getCouponList({ pageIndex, pageSize, type, stateCode }) {
  const token = wx.getStorageSync('accessToken');
  const authorization = 'Bearer ' + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        Authorization: authorization,
      },
      data: JSON.stringify({
        query: `query CouponListByPagination($pageIndex: Int!, $pageSize: Int!, $type: String, $stateCode: String) {
                    couponListByPagination(
                        pageIndex: $pageIndex
                        pageSize: $pageSize
                        type: $type
                        stateCode: $stateCode
                    ) {
                        totalCount
                        totalExchangeCount
                        totalDeductionCount
                        data {
                            id
                            type
                            typeText
                            tideSpotName
                            couponName
                            desc
                            effectiveTime
                            createTime
                            qrCodePath
                            state
                            stateText
                            userWechatName
                            buyGoodName
                            verificationWechatName
                            userPhone
                            useTime
                            minimumAmount
                            deductionAmount
                        }
                        __typename
                    }
                }`,
        variables: { pageIndex, pageSize, type, stateCode },
      }),
      success(res) {
        reslove(res.data.data.couponListByPagination);
      },
      fail(res) {
        console.log({ fail: res.data });
        reject(res.data);
      },
    });
  });

  return data;
}

export async function uploadVoucher(input) {
  const token = wx.getStorageSync('accessToken');
  const authorization = 'Bearer ' + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        Authorization: authorization,
      },
      data: JSON.stringify({
        query: `mutation CreateCouponByOcr($input: OcrImgPath!) {
                    createCouponByOcr(input: $input) {
                        couponId
                        msg
                    }
                }`,
        variables: {
          input: {
            tideSpotConfigId: input.tideSpotConfigId,
            textImgPath: input.textImgPath,
            logoImgPath: input.logoImgPath,
          },
        },
      }),
      success(res) {
        reslove(res.data.data.createCouponByOcr);
      },
      fail(res) {
        console.log({ fail: res.data });
        reject(res.data);
      },
    });
  });

  return data;
}
