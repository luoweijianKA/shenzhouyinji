import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { Message, ApplicationModal, setOpenModal, setMessage } from './actions'

export function useApplicationState(): AppState['application'] {
  return useSelector<AppState, AppState['application']>((state) => state.application)
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useNavToggle(): () => void {
  return useToggleModal(ApplicationModal.NAV)
}

export function useLoginModalToggle(): () => void {
  return useToggleModal(ApplicationModal.LOGIN)
}

export function useTutorialModalToggle(): () => void {
  return useToggleModal(ApplicationModal.TUTORIAL)
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

export function useAlert(): (message?: Message) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((message?: Message) => dispatch(setMessage({ message })), [dispatch])
}