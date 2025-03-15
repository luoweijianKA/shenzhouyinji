import { useQuery, useMutation } from '../config/index';

export async function getBadges(eventId) {
  const data = await useQuery({
    query: `query GetBadges($eventId: String!) {
      badges(event_id: $eventId) {
        id
        name
        images
      }
    }`,
    variables: { eventId },
  })

  return data.badges
}

export async function createUserSwap(input) {
  const data = await useMutation({
    mutation: `mutation createUserSwap($input: NewUserSwap!) {
      createUserSwap(input: $input) {
        id
      }
    }`,
    variables: { input },
  })

  return data.createUserBadgeSwap
}

export async function updateUserSwap(id, status) {
  const data = await useMutation({
    mutation: `mutation UpdateUserSwap($input: UserSwapInput!) {
      updateUserSwap(input: $input) {
        id
        userId
        userName
        userAvatar
        badges {
          id
          name
          images
        }
        city
        status
        createTime
        expiredTime
      }
    }`,
    variables: { input: { id, status } },
  })

  return data.updateUserSwap
}

export async function getUserSwaps(first, after, last, before, filter) {
  const data = await useQuery({
    query: `query GetUserSwaps($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $filter: UserSwapFilter) {
      userSwaps(
        first: $first
        after: $after
        last: $last
        before: $before
        filter: $filter
      ) {
        totalCount
        edges {
          node {
            id
            userId
            userName
            userAvatar
            badges {
              id
              name
              images
            }
            city
            status
            createTime
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
    }`,
    variables: { first, after, last, before, filter },
  })

  return data.userSwaps
}

export async function getUserSwap(id) {
  const data = await useQuery({
    query: `query GetUserSwap($id: ID!) {
      userSwap(id: $id) {
        id
        userId
        userName
        userAvatar
        badges {
          id
          name
          images
        }
        city
        createTime
      }
    }`,
    variables: { id },
  })

  return data.userSwap
}


export async function sendUserSwap(id, userId, content) {
  const data = await useMutation({
    mutation: `mutation SendUserSwap($id: ID!, $userId: ID!, $content: String!) {
      sendUserSwap(id: $id, userId: $userId, content: $content) {
        content
      }
    }`,
    variables: { id, userId, content },
  })

  return data.sendUserSwap
}

