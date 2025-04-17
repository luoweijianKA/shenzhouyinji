import { useQuery, useMutation } from '../config/index';

// 获取 GraphQL schema 信息的辅助函数
export async function getSchemaInfo() {
  const data = await useQuery({
    query: `query {
      __schema {
        queryType {
          fields {
            name
            type {
              name
              kind
              ofType {
                name
                kind
                fields {
                  name
                  type {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
        types {
          name
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    }`
  });
  return data;
}




export async function getCouponList(first, after, last, type, state) {
  // 先获取 schema 信息
  const schemaInfo = await getSchemaInfo();
  console.log('Schema Info:', schemaInfo);

  const data = await useQuery({
    query: `query CouponList($first: Int = 20, $after: ID, $last: Int = 20, $before: ID) {
      userSwaps(
        first: $first
        after: $after
        last: $last
        before: $before
      ) {
        totalCount
        edges {
          node {
            id
            status
            userName
            createTime
          }
          __typename
        }
      }
    }`,
    variables: { first, after, last },
  });

  return data.userSwaps;
}


/* export async function getCouponList(first, after, last, type, state) {
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
  } */
