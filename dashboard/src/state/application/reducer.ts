import { createReducer } from '@reduxjs/toolkit'
import {
  Message,
  ApplicationStatus, 
  ApplicationModal, 
  setOpenModal, 
  setMessage, 
  setStatus,
} from './actions'

export interface ApplicationState {
  readonly openModal: ApplicationModal | null
  readonly message: Message | undefined
  readonly status: ApplicationStatus | null
}

const initialState: ApplicationState = {
  openModal: ApplicationModal.NAV,
  message: undefined,
  status: ApplicationStatus.UPDATING,
}

export default createReducer(initialState, builder =>
  builder
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(setMessage, (state, { payload: { message } }) => {
      return { ...state, message }
    })
    .addCase(setStatus, (state, { payload }) => {
      return { ...state, status: payload }
    })
)
