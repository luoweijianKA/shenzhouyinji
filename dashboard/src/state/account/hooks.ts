import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, AppState } from "../index"
import {
  setLocale,
  setAccount,
  setRememberMe,
  clearAccount,
  Account,
} from './actions'

export function useAccountState(): AppState['account'] {
  return useSelector<AppState, AppState['account']>((state) => state.account);
}

export function useAccountActionHandlers(): {
  onLocale: (locale?: string) => void
  onRememberMe: (rememberMe?: { loginId: string }) => void
  onLogged: (account: Account) => void
  onLogout: () => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onLocale = useCallback((locale?: string) => dispatch(setLocale(locale)), [dispatch])
  const onRememberMe = useCallback((rememberMe?: { loginId: string }) => dispatch(setRememberMe(rememberMe)), [dispatch])

  const onLogged = useCallback((account: Account) => {
    if (account.accessToken && account.accessToken.length > 0) {
      localStorage.setItem('accessToken', account.accessToken)
    }
    dispatch(setAccount(account))
  }, [dispatch])

  const onLogout = useCallback(() => {
    localStorage.removeItem('accessToken')
    dispatch(clearAccount())
  }, [dispatch])

  return {
    onLocale,
    onRememberMe,
    onLogged,
    onLogout,
  };
}
