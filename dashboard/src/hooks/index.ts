import { useEffect, useState, useCallback } from 'react'
import sha1 from 'sha1'
import axios from 'axios'
import { useMutation, useQuery } from '@apollo/client'
import { useAxios } from './useAxios'
import { Account } from '../state/account/actions'
import { useAccountActionHandlers } from '../state/account/hooks'
import { LOGOUT, GET_ACCOUNT } from 'constants/graphql'

const api = axios.create({ 
  baseURL: `${process.env.REACT_APP_BACKEND_URL}`, 
  timeout: 10 * 1000,
  headers: {
    'Content-Type': 'application/json',
  }
})

function authorizationHeaders(account?: Account) {
  if (account && account.accessToken) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${account.accessToken}`,
    }
  } else {
    return {
      'Content-Type': 'application/json',
    }
  }
}

export function useGetCall(account?: Account): (url:string, data?: any) => Promise<any> {
  return useCallback((url: string) => {
    return api.get(url, { headers: authorizationHeaders(account) }).then(({ data }) => data)
  }, [account])
}

export function usePostCall(account?: Account): (url: string, data?: any) => Promise<any> {
  return useCallback((url: string, data?: any) => {
    return api.post(url, data, { headers: authorizationHeaders(account) }).then(({ data }) => data)
  }, [account])
}

export function useAccount(): Account | undefined {
  const { data, error } = useQuery(GET_ACCOUNT, { variables: { id: null }})
  const [result, setResult] = useState<Account | undefined>(undefined)

  const { onLogout, onLogged } = useAccountActionHandlers()

  useEffect(() => {
    console.log({ error })
    if (error && (error.message === "unauthorized" || error.message === "invalid token")) {
      onLogout()
    }
  }, [onLogout, error])

  useEffect(
    () => {
      if (data) {
        onLogged(data.account)
        setResult(data.account)
      }
    },
    [onLogged, data]
  )

  return result
}

export function useLogin(loginId?: string, password?: string): { 
  callback: null | (() => Promise<Account>); 
  error: string | null; 
} {
  const axios = useAxios()
  
  if (loginId && password) {
    console.log({ password: sha1(password) })
    return {
      callback: async function onLogin(): Promise<Account> { 
        return axios.post( `/login`, { 
          loginId, 
          password: sha1(password + "08993056").toUpperCase() 
        }).then(reps => reps.data)
      },
      error: null,
    }
  }

  return {
    callback: null,
    error: null,
  }
}

export function useLoginWithToken(token?: string): void {
  const { onLogged } = useAccountActionHandlers()

  useEffect(
    () => {
      if (token && token.length > 0) {
        api.post(`/login/${token}`).then(reps => {
          onLogged && onLogged(reps.data)
        })
      }
    },
    [onLogged, token]
  )
}

export function useLogout() {
  const { onLogout } = useAccountActionHandlers()
  const [logout, { data, error }] = useMutation(LOGOUT, {
    onCompleted: () => {
      onLogout()
    }
  })
  
  return {
    logout,
    data,
    error
  }
}

