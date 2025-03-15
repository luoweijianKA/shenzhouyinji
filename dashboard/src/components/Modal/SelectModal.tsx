import React, { useState } from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControlLabel,
  Checkbox,
  Typography,
 } from '@mui/material'
import Dialog, { DialogProps } from '@mui/material/Dialog'

interface Value {
  id: string
  name: string
}

interface SelectModalProps {
  options: Value[]
  title?: string
  value?: Value[]
  onConfirm?: (value: (Value | undefined)[]) => void
}

export default function SelectModal({ options, title, value, onConfirm, ...props } : SelectModalProps & DialogProps) {
  const { onClose } = props
  const [checked, setChecked] = useState<{ [key: string]: Value | undefined  }>({})

  const handleCheckedAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = Object.assign({}, ...options.map(v => ({ [v.id]: event.target.checked ? v : undefined })))
    setChecked(checked)
  }

  const handleCheckedChange = (v: Value) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({ ...checked, [v.id]: (event.target.checked ? v : undefined) })
  }

  const handleClose = () => {
    onClose && onClose({}, "escapeKeyDown")
  }

  const handleConfirm = () => {
    const value = Object.values(checked).filter(v => !!v)
    onConfirm && onConfirm(value)
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>
        {title ?? '选择'}
      </DialogTitle>
      <DialogContent>
         <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <FormControlLabel 
                          control={<Checkbox onChange={handleCheckedAll} />} 
                          label=''
                        />
                      </TableCell>
                      <TableCell>{"全部"}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {options.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <FormControlLabel 
                        control={<Checkbox checked={!!checked[row.id]} onChange={handleCheckedChange(row)} />} 
                        label=''
                      />
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.name}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
              </TableContainer>
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