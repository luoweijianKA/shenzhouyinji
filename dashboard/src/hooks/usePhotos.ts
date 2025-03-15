import { gql, useMutation, useQuery } from '@apollo/client'

const GET_PHOTOS = gql`
  query GetPhotos($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $status: Int!, $eventId: ID, $scenerysports: [ID!]) {
    photos(
      first: $first
      after: $after
      last: $last
      before: $before
      status: $status
      eventId: $eventId
      sceneryspots: $scenerysports
    ) {
      totalCount
      edges {
        node {
          id
          author
          avatar
          pics
          content
          timestamp
          location
          region
          sceneryspot {
            id
            name
            address
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`

const UPDATE_PHOTO_STATUS = gql`
  mutation UpdatePhotoStatus($input: NewPhotoStatus!) {
    updatePhotoStatus(input: $input)
  }
`

const REMOVE_PHOTOS = gql`
  mutation CleanUpPhotos {
    removePhotos {
      succed
      message
    }
  }
`

export interface Photo {
  id: string
  author: string
  avatar: string
  pics: string[]
  content: string
  timestamp: number
  location: string
  region: string
  sceneryspot: {
    id: string
    name: string
    address: string
  }
}

export function usePhotos(
  variables: {
    first: number
    after?: string
    last: number
    before?: string
    status: number
    eventId?: string
    scenerysports?: string[]
  }
) {
    return useQuery(GET_PHOTOS, { variables, fetchPolicy: "no-cache" })
}

export function useUpdatePhotoStatus({ status, onCompleted } : { status: number, onCompleted?: (data: any) => void }) {
    const mutation = useMutation(UPDATE_PHOTO_STATUS, {
      onCompleted: () => {
        onCompleted && mutation[1].data && onCompleted(mutation[1].data.updatePhotoStatus)
      },
        refetchQueries: [
        { query: GET_PHOTOS, variables: { status } },
        "GetPhotos",
        ]
    })

    return mutation
}

export function useRemovePhotos({ status, onCompleted } : { status: number, onCompleted?: (data: any) => void }) {
    const mutation = useMutation(REMOVE_PHOTOS, {
      onCompleted: () => {
        onCompleted && mutation[1].data && onCompleted(mutation[1].data.removePhotos)
      },
        refetchQueries: [
        { query: GET_PHOTOS, variables: { status } },
        "GetPhotos",
        ]
    })

    return mutation
}