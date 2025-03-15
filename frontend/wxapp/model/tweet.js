import { apiServer, useQuery } from '../config/index';

export async function createTweet(input) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation tweet($input:NewTweet!){
          createTweet(input:$input){
            id
          }
        }`,
        variables: {
          "input": {
            "user_id": input.user_id,
            "content": input.content,
            "event_id": input.event_id,
            "sceneryspot_id": input.sceneryspot_id,
            "location": input.location,
            "region": input.region
          }
        },
      }),
      success(res) {
        reslove(res.data.data.createTweet);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function getTweet(id) {
  const data = await useQuery({
    query: `query GetTweet($id: String!) {
      tweet(id: $id) {
        id
        user_id
        content
        like_count
        view_count
        share_count
        create_time
        event_id
        sceneryspot_id
        location
        region
      }
    }`,
    variables: { id },
  })

  return data.tweet
}

export async function getTweets() {
  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query getTweets($userId:String!){
          tweets(user_id:$userId){
            id
            user_id
            content
            like_count
            view_count
            share_count
            create_time
          }
        }`,
        variables: {
          "userId": userId
        },
      }),
      success(res) {
        reslove(res.data.data.tweets);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function getTweetUserActionState(tweetId) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query getTweetUserActionState($tweetId: String!) {
          tweetUserActionState(tweet_id: $tweetId) {
            tweet_id
            user_id
            like
            share
            view
          }
        }`,
        variables: {
          "tweetId": tweetId
        },
      }),
      success(res) {
        reslove(res.data.data.tweetUserActionState);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function getTweetsByUserId(userId) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query getTweets($userId:String!){
          tweets(user_id:$userId){
            id
            user_id
            content
            like_count
            view_count
            share_count
            create_time
          }
        }`,
        variables: {
          "userId": userId
        },
      }),
      success(res) {
        reslove(res.data.data.tweets);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function getNewestTweets(input) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query newestTweetByPagination($eId: String!, $sId: String!, $pageIndex: Int!, $pageSize: Int!) {
          newestTweetByPagination(
            event_id: $eId
            sceneryspot_id: $sId
            pageIndex: $pageIndex
            pageSize: $pageSize
          ) {
            total
            tweets {
              id
              user_id
              wechat_name
              wechat_avatar
              content
              like_count
              view_count
              share_count
              create_time
              status
              event_id
              sceneryspot_id
              location
              region
            }
          }
        }`,
        variables: {
          "eId": input.eId,
          "sId": input.sId,
          "pageIndex": input.pageIndex,
          "pageSize": input.pageSize
        },
      }),
      success(res) {
        reslove(res.data.data.newestTweetByPagination);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function getTweetLikerIds(tweet_id) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query GetTweetLikerIds($tweet_id: String!) {
          tweetLikers(tweet_id: $tweet_id) {
            user_id
          }
        }`,
        variables: {
          "tweet_id": tweet_id,
        },
      }),
      success(res) {
        reslove(res.data.data.tweetLikers);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;
}

export async function getTweetLikers(tweet_id) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query GetTweetLikers($tweet_id: String!) {
          tweetLikers(tweet_id: $tweet_id) {
            user_id
            wechat_name
            wechat_avatar
          }
        }`,
        variables: {
          "tweet_id": tweet_id,
        },
      }),
      success(res) {
        reslove(res.data.data.tweetLikers);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;
}

export async function getTweetShareIds(tweet_id) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query GetTweetShareIds($tweet_id: String!) {
          tweetSharers(tweet_id: $tweet_id) {
            user_id
          }
        }`,
        variables: {
          "tweet_id": tweet_id,
        },
      }),
      success(res) {
        reslove(res.data.data.tweetSharers);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;
}

export async function getTweetShares(tweet_id) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query GetTweetShares($tweet_id: String!) {
          tweetSharers(tweet_id: $tweet_id) {
            user_id
            wechat_name
            wechat_avatar
          }
        }`,
        variables: {
          "tweet_id": tweet_id,
        },
      }),
      success(res) {
        reslove(res.data.data.tweetSharers);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;
}

export async function getTweetViewerIds(tweet_id) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query GetTweetViewerIds($tweet_id: String!) {
          tweetViewers(tweet_id: $tweet_id) {
            user_id
          }
        }`,
        variables: {
          "tweet_id": tweet_id,
        },
      }),
      success(res) {
        reslove(res.data.data.tweetViewers);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;
}

export async function getTweetViewers(tweet_id) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query GetTweetViewers($tweet_id: String!) {
          tweetViewers(tweet_id: $tweet_id) {
            user_id
            wechat_name
            wechat_avatar
          }
        }`,
        variables: {
          "tweet_id": tweet_id,
        },
      }),
      success(res) {
        reslove(res.data.data.tweetViewers);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;
}

export async function following(input) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation following($input:InputFollowing!){
          createFollowing(input:$input){
            succed
            message
          }
        }`,
        variables: {
          "input": input
        },
      }),
      success(res) {
        reslove(res.data.data.createFollowing);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function followers(input) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation followers($input:InputFollowers!){
          createFollowers(input:$input){
            succed
            message
          }
        }`,
        variables: {
          "input": input
        },
      }),
      success(res) {
        reslove(res.data.data.createFollowers);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function myFollowing() {
  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query myFollowing($userId:String!){
          following(user_id:$userId){
            following
            following_time
          }
        }`,
        variables: {
          "userId": userId
        },
      }),
      success(res) {
        reslove(res.data.data.following);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function removeFollowing(input) {
  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation removeFollowing($input: InputFollowing!) {
          removeFollowing(input: $input) {
            succed
          }
        }`,
        variables: {
          "input": {
            "user_id": input.user_id,
            "following": input.following,
          }
        },
      }),
      success(res) {
        reslove(res.data.data.removeFollowing);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function myFollowers() {
  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query myFollowers($userId:String!){
          followers(user_id:$userId){
            follower
            follower_time
          }
        }`,
        variables: {
          "userId": userId
        },
      }),
      success(res) {
        reslove(res.data.data.followers);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function removeFollowers(input) {
  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation removeFollowers($input: InputFollowers!) {
          removeFollowers(input: $input) {
            succed
          }
        }`,
        variables: {
          "input": {
            "user_id": input.user_id,
            "follower": input.follower,
          }
        },
      }),
      success(res) {
        reslove(res.data.data.removeFollowers);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function likeTweet(input) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation likeTweet($userId:String!,$tweetId:String!){
          likeTweet(userId:$userId,tweetId:$tweetId){
            succed
          }
        }`,
        variables: {
          "userId": input.userId,
          "tweetId": input.tweetId
        },
      }),
      success(res) {
        reslove(res.data.data.likeTweet);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function unlikeTweet(input) {
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation unlikeTweet($userId:String!,$tweetId:String!){
          unlikeTweet(userId:$userId,tweetId:$tweetId){
            succed
          }
        }`,
        variables: {
          "userId": input.userId,
          "tweetId": input.tweetId
        },
      }),
      success(res) {
        reslove(res.data.data.unlikeTweet);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function viewTweet(tweet_id) {

  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation viewTweet($user_id: String!, $tweet_id: String!) {
          viewTweet(user_id: $user_id, tweet_id: $tweet_id) {
            succed
          }
        }`,
        variables: {
          "user_id": userId,
          "tweet_id": tweet_id
        },
      }),
      success(res) {
        reslove(res.data.data.viewTweet);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function shareTweet(tweet_id) {
  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `mutation shareTweet($user_id: String!, $tweet_id: String!) {
          shareTweet(user_id: $user_id, tweet_id: $tweet_id) {
            succed
          }
        }`,
        variables: {
          "user_id": userId,
          "tweet_id": tweet_id
        },
      }),
      success(res) {
        reslove(res.data.data.shareTweet);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function userRecordByUserId(id, action) {

  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query userRecordByUserId($id: String!, $action: String!) {
          userRecordByUserId(id: $id, action: $action) {
            id
            user_id
            user_name
            user_avatar
            tweet_id
            tweet_user_id
            tweet_user_name
            tweet_user_avatar
            action_type
            time
          }
        }`,
        variables: {
          "id": id,
          "action": action
        },
      }),
      success(res) {
        reslove(res.data.data.userRecordByUserId);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}

export async function userRecordByTweetUserId(id, action) {

  var token = wx.getStorageSync('accessToken')
  var authorization = "Bearer " + token;

  const data = new Promise(function (reslove, reject) {
    wx.request({
      url: apiServer.gqlUri,
      method: 'POST',
      header: {
        "Authorization": authorization,
      },
      data: JSON.stringify({
        query: `query userRecordByTweetUserId($id: String!, $action: String!) {
          userRecordByTweetUserId(id: $id, action: $action) {
            id
            user_id
            user_name
            user_avatar
            tweet_id
            tweet_user_id
            tweet_user_name
            tweet_user_avatar
            action_type
            time
          }
        }`,
        variables: {
          "id": id,
          "action": action
        },
      }),
      success(res) {
        reslove(res.data.data.userRecordByTweetUserId);
      },
      fail(res) {
        console.log({ fail: res.data })
        reject(res.data);
      }
    });
  });

  return data;

}