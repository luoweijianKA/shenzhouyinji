import { useQuery, useMutation, apiServer } from '../config/index';

// 获取优惠券列表
// export async function getCouponList({ pageIndex, pageSize, type, stateCode }) {
//   const token = wx.getStorageSync('accessToken');
//   const authorization = 'Bearer ' + token;
//
//   const data = new Promise(function (reslove, reject) {
//     wx.request({
//       url: apiServer.gqlUri,
//       method: 'POST',
//       header: {
//         Authorization: authorization,
//       },
//       data: JSON.stringify({
//         query: `query CouponListByPagination($pageIndex: Int!, $pageSize: Int!, $type: String, $stateCode: String) {
//                     couponListByPagination(
//                         pageIndex: $pageIndex
//                         pageSize: $pageSize
//                         type: $type
//                         stateCode: $stateCode
//                     ) {
//                         totalCount
//                         totalExchangeCount
//                         totalDeductionCount
//                         data {
//                             id
//                             type
//                             typeText
//                             tideSpotName
//                             couponName
//                             desc
//                             effectiveTime
//                             createTime
//                             qrCodePath
//                             state
//                             stateText
//                             userWechatName
//                             buyGoodName
//                             verificationWechatName
//                             userPhone
//                             useTime
//                             minimumAmount
//                             deductionAmount
//                         }
//                         __typename
//                     }
//                 }`,
//         variables: { pageIndex, pageSize, type, stateCode },
//       }),
//       success(res) {
//         reslove(res.data.data.couponListByPagination);
//       },
//       fail(res) {
//         console.log({ fail: res.data });
//         reject(res.data);
//       },
//     });
//   });
//
//   return data;
// }

// 上传凭证
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

// 优惠券详情
export async function getCouponDetail(id) {
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
        query: `query Coupon($id: String!) {
                    coupon(id: $id) {
                        id
                        type
                        typeText
                        tideSpotName
                        couponName
                        generateWord
                        generateImgPath
                        createTime
                        userWechatName
                        submitWord
                        submitImgPath
                        effectiveTime
                        desc
                    }
                    __typename
                }`,
        variables: {
          id,
        },
      }),
      success(res) {
        reslove(res.data.data.coupon);
      },
      fail(res) {
        console.log({ fail: res.data });
        reject(res.data);
      },
    });
  });

  return data;
}

// 核对通过优惠券
export async function checkPassCoupon(input) {
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
        query: `mutation UpdateCoupon($input: UpdateCoupon!) {
                    updateCoupon(input: $input) {
                        succed
                        message
                    }
                }`,
        variables: {
          input: {
            id: input.id,
            couponBuyGoodListJSON: input.couponBuyGoodListJSON,
            use: true,
          },
        },
      }),
      success(res) {
        reslove(res.data.data.updateCoupon);
      },
      fail(res) {
        console.log({ fail: res.data });
        reject(res.data);
      },
    });
  });

  return data;
}

// 优惠券配置详情
export async function getCouponConfigDetail(id) {
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
        query: `query TideSpotConfig($id: String!) {
                    tideSpotConfig(id: $id) {
                        id
                        guideVideoPath
                        guideDesc
                    }
                    __typename
                }`,
        variables: {
          id,
        },
      }),
      success(res) {
        reslove(res.data.data.tideSpotConfig);
      },
      fail(res) {
        console.log({ fail: res.data });
        reject(res.data);
      },
    });
  });

  return data;
}


// 获取景区列表（用于筛选）
export async function getTideSpotList(params = {}) {
  const {
    first = 20,
    after = '',
    last = 20,
    before = '',
    name = ''
  } = params;

  const data = await useQuery({
    operationName: 'TideSpotList',
    query: `query TideSpotList($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $name: String) {
      tideSpotList(
        first: $first
        after: $after
        last: $last
        before: $before
        name: $name
      ) {
        totalCount
        edges {
          node {
            id
            name
            electricFence
            createTime
            updateTime
            positionTolerance
            __typename
          }
          __typename
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
          __typename
        }
        __typename
      }
    }`,
    variables: { first, after, last, before, name }
  });

  return {
    list: data.tideSpotList.edges.map(edge => edge.node),
    pageInfo: data.tideSpotList.pageInfo,
    totalCount: data.tideSpotList.totalCount
  };
}

// 获取优惠券列表
export async function getCouponList(tideSpotId = '') {
  const data = await useQuery({
    operationName: 'CouponListGroupByType',
    query: `query CouponListGroupByType($tideSpotId: String) {
      couponListGroupByType(tideSpotId: $tideSpotId) {
        exchangeList {
          id
          couponName
          tideSpotName
          effectiveTime
          tideSpotConfigId
          __typename
        }
        deductionList {
          id
          couponName
          tideSpotName
          effectiveTime
          tideSpotConfigId
          minimumAmount
          deductionAmount
          __typename
        }
      }
      __typename
    }`,
    variables: { tideSpotId }
  });

  return data.couponListGroupByType;
}

