import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LoadingButton from '@mui/lab/LoadingButton'
import { useMutation } from '@apollo/client'
import { UPDATE_NICKNAME } from 'constants/graphql'

interface State {
  nickname: string
  errorMessage?: string
}

export default function NicknameModal({ onDismiss, ...props }: { onDismiss?: (value?: string) => void } & DialogProps) {
  const { t } = useTranslation()
  const { open } = props
  const [values, setValues] = useState<State>({ nickname: '' })

  useEffect(() => {
    if (open) {
      setValues({ nickname: '' })
    }
  }, [open])

  const [updateNickname, { data, loading }] = useMutation(UPDATE_NICKNAME, {
    onCompleted: () => {
      data && onDismiss && onDismiss(data.updateNickname)
    }
  })

  const handleClose = () => {
    onDismiss && onDismiss(undefined)
  }

  const handleOK = () => {
    updateNickname({ variables: { input: values.nickname }}).catch(e => {
      setValues({ ...values, errorMessage: e.message })
    })
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{t("Set Nickname")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          error={!!values.errorMessage}
          margin="dense"
          id="nickname"
          label="Nickname"
          type="text"
          fullWidth
          variant="standard"
          value={values.nickname}
          helperText={values.errorMessage}
          onChange={(e) => setValues({ ...values, nickname: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("Cancel")}</Button>
        <LoadingButton 
          disableElevation 
          variant="contained"
          disabled={values.nickname.length === 0}
          loading={loading}
          onClick={handleOK}
        >
          {t("OK")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
