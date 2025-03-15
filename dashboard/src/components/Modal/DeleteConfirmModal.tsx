import React, { useState, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
 } from '@mui/material'
import Dialog, { DialogProps } from '@mui/material/Dialog'

interface Value {
  id: string
  name: string
}

interface DeleteConfirmProps {
  value?: Value
  onConfirm?: (value?: Value) => void
}

export default function DeleteConfirmModal({ value, onConfirm, ...props } : DeleteConfirmProps & DialogProps) {
  const { open, onClose } = props
  const [title, setTitle] = useState<string>('删除?')

  useEffect(() => {
    if (open && value) {
      setTitle(`删除${value.name}?`)
    }
  }, [open])

  const handleClose = () => {
    onClose && onClose({}, "escapeKeyDown")
  }

  const handleConfirm = () => {
    onConfirm && onConfirm(value)
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          如确定此操作，这意味着数据将无法恢复。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          {'取消'}
        </Button>
        <Button autoFocus onClick={handleConfirm}>
          {'确定'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}