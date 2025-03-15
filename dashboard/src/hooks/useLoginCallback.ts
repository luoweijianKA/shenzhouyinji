import { useCallback, useMemo } from 'react';
import { useLogin } from './index';
import { Account } from '../state/account/actions';
import { useAccountState, useAccountActionHandlers } from '../state/account/hooks'

export enum LoginState {
  NOT_LOGGED,
  LOGGING,
  LOGGED,
  PASSWORD_INCORRECT,
}

export function useLoginCallback(
  loginId?: string,
  password?: string
): [LoginState, () => Promise<void>] {
  const { account } = useAccountState()

  const loginState: LoginState = useMemo(
    () => {
      return account ? LoginState.LOGGED : LoginState.NOT_LOGGED
    }, 
    [account]
  )

  const { callback: auth } = useLogin(loginId, password)
  const { onLogged } = useAccountActionHandlers()

  const login = useCallback(async (): Promise<void> => {
    if (loginState !== LoginState.NOT_LOGGED) {
      console.error('login was called unnecessarily')
      return
    }

    if (!auth) {
      console.error('no auth')
      return
    }

    return auth()
      .then((account: Account) => onLogged(account))
      .catch((error: Error) => {
        console.debug('Failed to login', error)
        throw error
      })
  }, [loginState, auth, onLogged])

  return [loginState, login]
}