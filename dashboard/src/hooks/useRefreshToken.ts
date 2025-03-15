import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client"
import { REFRESH_TOKEN } from "constants/graphql"

export default function useRefreshToken(): string | null | undefined {
  const token = localStorage.getItem("accessToken")
  const [result, setResult] = useState< string | null | undefined>(undefined)

  const [refreshToken, { data }] = useMutation(REFRESH_TOKEN, {
    onCompleted: () => {
      if (data) {
        const { accessToken } = data.refreshToke
        setResult(accessToken)
      }
    }
  })
  
  useEffect(() => {
    if (token) {
      refreshToken({ variables: { token }}).catch(e => {
        setResult(null)
      })
    } else {
      setResult(null)
    }
  }, [token, refreshToken])

  return result
}