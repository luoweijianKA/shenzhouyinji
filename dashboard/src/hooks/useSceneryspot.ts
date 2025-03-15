import { useState, useEffect } from 'react'
import { gql, useQuery } from '@apollo/client'

const GET_SCENERYSPOT = gql`
  query GetSceneryspot($id: String!) {
    sceneryspot(id: $id) {
      id
      name
    }
  }
`

export interface Sceneryspot {
  id: string
  name: string
}

export function useSceneryspot(id: string): Sceneryspot | undefined {
  const [result, setResult] = useState<Sceneryspot | undefined>(undefined)
  const { data } = useQuery(GET_SCENERYSPOT, { variables: { id }, fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (data) {
      setResult(data.sceneryspot)
    }
  }, [data])

  return result
}