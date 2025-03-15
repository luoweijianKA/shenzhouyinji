import { createAction } from '@reduxjs/toolkit'
import { AlertColor } from '@mui/material'

export enum ApplicationModal {
  NAV,
  LOGIN,
  TUTORIAL,
  SETTINGS,
}

export enum ApplicationStatus {
  UPDATING,
  MAINTENANCE,
  READY,
}

export interface Message {
  readonly text: string
  readonly severity: AlertColor
}

export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const setMessage = createAction<{ message: Message | undefined }>('application/message')
export const setStatus = createAction<ApplicationStatus | null>('application/status')
