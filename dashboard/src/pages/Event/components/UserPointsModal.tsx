import React, { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LoadingButton from '@mui/lab/LoadingButton'
import { gql, useMutation } from '@apollo/client'
import { useAlert } from 'state/application/hooks'

const UPDATE_EVENT_USER_POINTS = gql`
   mutation updateEventUserPoints($input: NewUserPoints!) {
    updateEventUserPoints(input: $input) {
        points
    }
  }
`
interface State {
  userId: string
  eventId: string
  campId: string
  points: number
}

interface UserPointsProps {
  title?: string
  value?: State
  onDismiss?: (value?: State) => void 
}

export default function UserPointsModal({
    title,
    value,
    onDismiss, 
    ...props 
  } : UserPointsProps & DialogProps) {
  const alert = useAlert()
  const { open } = props
  const [values, setValues] = useState<State | undefined>(undefined)

  useEffect(() => {
    if (open && value) {
      setValues(value)
    }
  }, [open, value])

  const [updateEventUserPoints, { data, loading }] = useMutation(UPDATE_EVENT_USER_POINTS, {
    onCompleted: () => {
      data && onDismiss && onDismiss(data.updateEventUserPoints)
    }
  })

  const handleFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.currentTarget.select()
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (values) {
        setValues({ ...values, points: isNaN(value) ? 0 : value })
    }
  }

  const handleClose = () => {
    onDismiss && onDismiss(undefined)
  }

  const handleOK = () => {
    if (values) {
      updateEventUserPoints({ variables: { input: { ...values } } }).catch((e) => alert({ severity: "error", text: e.message }))
    }
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event && event.key === 'Enter') {
      handleOK()
    }
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{title ?? ""}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          type="text"
          variant="standard"
          value={values?.points ?? 0}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{'取消'}</Button>
        <LoadingButton 
          disableElevation 
          variant="contained"
          disabled={values === undefined}
          loading={loading}
          onClick={handleOK}
        >
          {'确定'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
