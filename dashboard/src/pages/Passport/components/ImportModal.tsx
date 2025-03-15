
import React, { useState, useEffect } from 'react'
import {
  Typography,
  Button,
  FormControl,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  MenuItem,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useMutation } from '@apollo/client'
import UploadFile from 'components/UploadFile'
import { useAlert } from 'state/application/hooks'
import { FormInput } from 'pages/styled'

const ADD_PASSPORT_STOCK = gql`
  mutation AddPassportStock($input: NewPassportStock!) {
    addPassportStock(input: $input) {
      succed
      message
    }
  }
`

interface Event {
  id: string
  name: string
}

interface State {
  eventId?: string
  file: string
  description: string
}

export function ImportModal({ events, selectedEvent, ...props } : { events: Event[], selectedEvent?: string } & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<State>({
    eventId: '',
    file: '',
    description: '',
  })

  const isValid = values.eventId && values.eventId.length > 0

  const [addPassportStock, { data, loading }] = useMutation(ADD_PASSPORT_STOCK, {
    onCompleted: () => {
      if (data && onClose) {
        const { succed, message } = data
        if (succed && succed === false) {
          alert({ severity: "error", text: message })
          return
        }
        onClose(data, "escapeKeyDown")
      }
    }
  })

  useEffect(() => {
    if (open) {
      setValues({
        eventId: selectedEvent,
        file: '',
        description: '',
      })
    }
  }, [open])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleUpload = (prop: keyof State) => (value: string) => {
    setValues({ ...values, [prop]: value })
  }

  const handleEvent = (event: SelectChangeEvent) => {
   setValues({ ...values, eventId: event.target.value })
  }

  const handleOK = () => {
    addPassportStock({ variables: { input: { ...values } }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <DialogTitle>{"导入护照"}</DialogTitle>
      <DialogContent sx={{ 
        "& .MuiFormControl-root": { 
          width: "100%", 
          ":not(:first-of-type)": { 
            mt: 2
          },
          "& .MuiTypography-root": {
            mb: 1
          }
        }
      }}>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"活动"}</Typography>
          <Select
            labelId="event-select-label"
            id="event-select"
            value={values.eventId}
            size="small"
            variant="outlined"
            notched={true}
            onChange={handleEvent}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                top: 0,
                "& > legend": {
                    float: "left !important",
                }
              },
            }}
          >
            {events.map(event => (<MenuItem key={event.id} value={event.id}>{event.name}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"护照库存"}</Typography>
          <UploadFile preview={true} value={values.file} accept={'*.csv'} onChange={handleUpload("file")} />
           <FormHelperText id="display-order-text">
            {"护照库存是已逗号（,)分隔的.csv格式文件"}
          </FormHelperText>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"备注"}</Typography>
          <FormInput 
            fullWidth 
            multiline
            rows={2}
            id="description-input"
            value={values.description}
            onChange={handleChange('description')}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose({})}>{"取消"}</Button>
        <LoadingButton 
          disableElevation 
          variant="contained"
          disabled={!isValid}
          loading={loading}
          onClick={handleOK}
        >
          {"确定"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}