import { useMemo } from 'react'
import axios from 'axios'
import { KEYS } from '../constants'
import { useLocalStorage } from './useLocalStorage'

export function useAxios() {
  const [accessToken] = useLocalStorage(KEYS.ACCESS_TOKEN, undefined)

  return useMemo(
    () => {
      const baseURL = `${process.env.REACT_APP_BACKEND_URL}`
      const timeout = 10 * 1000
      const headers = accessToken && accessToken.length > 0 ? {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
      : {
        'Content-Type': 'application/json',
      }

      return  axios.create({ baseURL, timeout, headers })
    }, 
    [accessToken]
  )
}