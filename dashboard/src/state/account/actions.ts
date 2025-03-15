import { createAction } from "@reduxjs/toolkit"

export enum Status {
  Active = 1,
  Suspend = 2,
  Inactive = 3,
}

export interface Profile {
  paymentTransfer: number
  game: string[]
  market: string[]
  package: string | null
}

export interface Account {
  id: string
  loginId: string
  name: string
  status: number
  role: string
  accessToken: string
}

export const setLocale = createAction<string | undefined>('account/locale')
export const setRememberMe = createAction<{ loginId: string } | undefined>('account/rememberMe')
export const setAccount = createAction<Account | undefined>('account/account')
export const clearAccount = createAction('account/clear')
export const updateToken = createAction<{ token: string }>('account/token')