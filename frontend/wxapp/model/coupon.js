import { useQuery, useMutation } from '../config/index';

export async function getCouponList(first, after, last, type, state) {
  const data = await useQuery({
    query: `query CouponList(
                $first: Int = 20,
                $after: ID,
                $last: Int = 20,
                $before: ID,
                $type: String,
                $state: String = "Normal",
            ) {
                couponList(
                    first: $first,
                    after: $after,
                    last: $last,
                    before: $before,
                    type: $type,
                    state: $state
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
                        }
                        __typename
                    }
                }
            }`,
    variables: { first, after, last, type, state },
  });

  return data.tideSpotConfigList;
}
