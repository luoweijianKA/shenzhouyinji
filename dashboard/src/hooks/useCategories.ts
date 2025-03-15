import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { GET_CATEGORIES } from 'constants/graphql'

export interface Category {
  id: string
  name: string
  sort: number
}

export function useCategories(parentId: string): Category[] | undefined  {
  const [result, setResult] = useState<Category[] | undefined>(undefined)
  const { data } = useQuery(GET_CATEGORIES, { variables: { parentId }, fetchPolicy: "no-cache" })

  useEffect(() => {
    if (data) {
      const reslut = data.categoriesByParentID
        .map((v: any) => ({ ...v }))
        .sort((a: Category, b: Category) => a.sort - b.sort)
      setResult(reslut)
    }
  }, [data])

  return result
}