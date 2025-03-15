import { createReducer } from "@reduxjs/toolkit"
import { 
  setLocale,
  setRememberMe, 
  setAccount, 
  clearAccount,
  updateToken,
  Account,
} from "./actions"

export interface AccountState {
  readonly locale: string | undefined
  readonly rememberMe: { loginId: string } | undefined
  readonly account: Account | undefined
}

const initialState: AccountState = {
  locale: "en",
  rememberMe: undefined,
  account: undefined,
}

export default createReducer<AccountState>(initialState, (builder) =>
  builder
    .addCase(
      setLocale, (state, { payload }) => {
        return { ...state, locale: payload }
      }
    )
    .addCase(
      setRememberMe, (state, { payload }) => {
        return { ...state, rememberMe: payload }
      }
    )
    .addCase(setAccount, (state, { payload }) => {
        return { ...state, account: payload }
    })
    .addCase(clearAccount, (state) => {
      return { ...state, account: undefined, role: null }
    })
    .addCase(updateToken, (state, { payload: { token } }) => {
      if (state.account) { 
        //
      }
    })
);