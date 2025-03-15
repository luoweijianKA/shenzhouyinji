import { useEffect } from "react"
import { useDispatch } from 'react-redux'
// import useRefreshToken from "hooks/useRefreshToken"
import { ApplicationStatus, setStatus } from './actions'
import { useAccountState, useAccountActionHandlers } from "state/account/hooks"

export default function Updater(): null {
  const { onLogout } = useAccountActionHandlers()
  const { account } = useAccountState()
  const dispatch = useDispatch()
  // const token = useRefreshToken()
  const token = account?.accessToken
  
  useEffect(() => {
    if (token) {
      localStorage.setItem('accessToken', token)
    }

    if (token !== undefined) {
      if (token == null) {
        onLogout()
      }
    }
    dispatch(setStatus(ApplicationStatus.READY))
  }, [dispatch, token, onLogout])

  return null
}
