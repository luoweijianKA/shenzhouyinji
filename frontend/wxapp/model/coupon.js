import { useQuery, useMutation } from '../config/index';

export async function getCouponList(first, after, last, type, stateCode) {
  const data = await useQuery({
    query: `query CouponList(
                $first: Int = 10,
                $after: ID,
                $last: Int = 10,
                $before: ID,
                $type: String,
                $stateCode: String = "Normal"
            ) {
                couponList(
                    first: $first,
                    after: $after,
                    last: $last,
                    before: $before,
                    type: $type,
                    stateCode: $stateCode
                ) {
                    totalCount
                    edges {
                        node {
                            id
                            type
                            typeText
                            state
                            stateText
                            tideSpotName
                            couponName
                            desc
                            effectiveTime
                            createTime
                            qrCodePath
                            totalExchangeCount
                            totalDeductionCount
                            minimumAmount
                            deductionAmount
                        }
                        __typename
                    }
                }
            }`,
    variables: { first, after, last, type, stateCode },
  });

  return data.couponList;
}
