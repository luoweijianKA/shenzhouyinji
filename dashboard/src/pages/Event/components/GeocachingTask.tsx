import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, RefreshCw, X } from 'react-feather'
import QRCode from "react-qr-code"
import {
  Grid,
  Typography,
  Card,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Stack,
  Chip,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Tooltip,
  TextField,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Box,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import cnLocale from 'date-fns/locale/zh-CN'
import { gql, useQuery, useMutation } from '@apollo/client'
import { today } from 'utils'
import { TASK_SHARE } from 'constants/index'
import { Category } from 'hooks/useCategories'
import UploadFile from 'components/UploadFile'
import QQMap from 'components/QQMap'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import Empty from 'components/Empty'
import { useAlert } from 'state/application/hooks'
import { FormInput, DatePickerWrapper } from 'pages/styled'

const GET_GEOCACHINGS = gql`
  query GetGeocachings($sceneryspotId: String!, $eventId: String) {
    geocachings(sceneryspot_id: $sceneryspotId, event_id: $eventId) {
      id
      event_id
      sceneryspot_id
      name
      points
      images
      introduction
      start_time
      end_time
      necessary
      status
      create_time
      electric_fence
    }
  }
`

const CREATE_GEOCACHING = gql`
  mutation CreateGeocaching($input: NewGeocaching!) {
    createGeocaching(input: $input) {
      id
    }
  }
`

const UPDATE_GEOCACHING = gql`
  mutation UpdateGeocaching($input: UpdateGeocaching!) {
    updateGeocaching(input: $input) {
      succed
      message
    }
  }
`

const DELETE_GEOCACHING = gql`
  mutation UpdateGeocaching($id: ID!) {
    updateGeocaching(input: {id: $id, status: 4}) {
      succed
      message
    }
  }
`

interface Geocaching {
  id?: string
  event_id: string
  sceneryspot_id: string
  name: string
  points: number
  images: string[]
  introduction: string
  start_time: number
  end_time: number
  necessary: boolean
  status: number
  create_time: number
  electric_fence: string
}

const time = Math.floor(today().getTime() / 1000)
const initialGeocaching: Geocaching = {
  id: undefined,
  event_id: '',
  sceneryspot_id: '',
  name: '',
  points: 0,
  images: [''],
  introduction: '',
  start_time: time,
  end_time: time + (7 * 24 * 3600 - 1),
  necessary: false,
  status: 1,
  create_time: 0,
  electric_fence: '',
}

interface State {
  value?: Geocaching
  open: boolean
}

function useGeocachings(sceneryspotId: string, eventId?: string) {
  const [geocachings, setGeocachings] = useState<Geocaching[] | undefined>(undefined)
  const { data, loading, refetch } = useQuery(GET_GEOCACHINGS, { variables: { sceneryspotId, eventId }, fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (data) {
      setGeocachings(data.geocachings.map((v: any) => ({ ...v, images: v && v.images && v.images.length > 0 ? v.images.split(",") : [""] })))
    }
  }, [data])

  return { geocachings, loading, refetch }
}

function useSave({ value, sceneryspotId, eventId, onCompleted } : { value?: Geocaching, sceneryspotId: string, eventId?: string, onCompleted?: (data: any) => void }) {
  const add = useMutation(CREATE_GEOCACHING, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createGeocaching)
    },
    refetchQueries: [
      { query: GET_GEOCACHINGS, variables: { sceneryspotId, eventId } },
      "GetGeocachings",
    ]
  })

  const update = useMutation(UPDATE_GEOCACHING, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateGeocaching)
    },
    refetchQueries: [
      { query: GET_GEOCACHINGS, variables: { sceneryspotId, eventId } },
      "GetGeocachings",
    ]
  })

  return value?.id ? update : add
}

function GeocachingModal({ value, sceneryspotId, eventId, ...props } : {
  value?: Geocaching,
  sceneryspotId: string,
  eventId?: string,
} & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<Geocaching>({ 
    ...initialGeocaching, 
    sceneryspot_id: sceneryspotId,
    event_id: eventId ?? '',
  })
  const isValid = values.name.length > 0

  const [save, { loading }] = useSave({
    value: values,
    sceneryspotId,
    eventId,
    onCompleted: (data) => {
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
      if (value) {
        setValues({ ...value })
      } else {
        setValues({ ...initialGeocaching, sceneryspot_id: sceneryspotId, event_id: eventId ?? '' })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Geocaching) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target

    if (prop === 'necessary') {
      setValues({ ...values, [prop]: checked })
      return
    }
    if (prop === 'status') {
        setValues({ ...values, [prop]: checked ? 2 : 1 })
        return
    }

    setValues({ ...values, [prop]: value })
  }

  const handleDateChange = (prop: keyof Geocaching) => (value: number | null) => {
    if (value) {
      setValues({ ...values, [prop]: Math.floor(value / 1000) })
    }
  }

  const handleUploadImage = (index: number) => (value: string) => {
    setValues({ ...values, images: [...values.images.slice(0, index), value, ...values.images.slice(index + 1)] })
  }

  const handleAddImage = () => {
    if (values.images.length >= 30) {
      alert({ severity: "error", text: "最多上传30个图片或视频" })
      return
    }
    setValues({ ...values, images: [...values.images, ""] })
  }

  const handleOK = () => {
    const { 
      id,
      event_id,
      sceneryspot_id,
      name,
      points,
      images,
      introduction,
      start_time, 
      end_time, 
      necessary,
      status,
      create_time,
      electric_fence,
    } = values

    const input = values.id ? { 
      id,
      name,
      points,
      images: images.filter(value => value && value.length > 0).join(","),
      introduction,
      start_time, 
      end_time, 
      necessary,
      status,
      electric_fence,
    } : {
      event_id,
      sceneryspot_id,
      name,
      points,
      images: images.filter(value => value && value.length > 0).join(","),
      introduction,
      start_time, 
      end_time, 
      necessary,
      status,
      create_time,
      electric_fence,
    }

    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <DialogTitle>{value ? "修改剧本" : "添加剧本"}</DialogTitle>
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
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={cnLocale}>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"名称"}</Typography>
          <FormInput 
            fullWidth 
            id="questions-input"
            value={values.name}
            onChange={handleChange("name")}
          />
          <FormControlLabel 
            control={<Checkbox checked={values.status === 2} onChange={handleChange('status')} />} 
            label="在电子围栏内完成任务"
            sx={{ '& .MuiTypography-root': { margin: '0 !important' } }}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"电字围栏"}</Typography>
          <FormInput 
            fullWidth 
            id="electric-fence-input"
            value={values.electric_fence}
            sx={{ mb: 2 }}
            onChange={handleChange("electric_fence")}
          />
          <QQMap value={values.electric_fence} onChange={(electric_fence) => setValues({ ...values, electric_fence }) } />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"开始时间"}</Typography>
          <DatePickerWrapper sx={{ '& .MuiFormControl-root': {  width: '100% !important' } }}>
            <DesktopDatePicker
            label={''}
            inputFormat="yyyy-MM-dd"
            value={values.start_time * 1000}
            onChange={handleDateChange('start_time')}
            renderInput={(params) => <TextField {...params} />}
            />
          </DatePickerWrapper>
        </FormControl>
         <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"结束时间"}</Typography>
          <DatePickerWrapper sx={{ '& .MuiFormControl-root': {  width: '100% !important' } }}>
            <DesktopDatePicker
              label={''}
              inputFormat="yyyy-MM-dd"
              value={values.end_time * 1000}
              onChange={handleDateChange('end_time')}
              renderInput={(params) => <TextField {...params} />}
            />
          </DatePickerWrapper>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"获得积分"}</Typography>
          <FormInput 
            fullWidth 
            id="points-input"
            value={values.points}
            onChange={handleChange("points")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"剧本宣传"}</Typography>
          <FormHelperText id="options-text">
            {"上传剧本游成功后显示的图片或视频"}
          </FormHelperText>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {values.images.map((value, index) => (<UploadFile accept="*/*" preview={true} value={value} onChange={handleUploadImage(index)} />))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <Button
            disableElevation
            variant="contained"
            sx={{ borderRadius: '50%', padding: 0, height: '32px', minWidth: '32px' }}
            onClick={handleAddImage}
          >
            <Plus />
          </Button>
          </Box>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"介绍"}</Typography>
          <FormInput 
            fullWidth 
            multiline
            rows={4}
            id="introduction-input"
            value={values.introduction}
            onChange={handleChange('introduction')}
          />
        </FormControl>
        </LocalizationProvider>
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


interface DialogTitleProps {
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X />
        </IconButton>
      ) : null}
    </DialogTitle>
  )
}

function QRCodeModal({ value, ...props } : { value?: Geocaching } & DialogProps) {
  const { onClose } = props

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <BootstrapDialogTitle onClose={handleClose({})}>
        {"剧本游"}
      </BootstrapDialogTitle>
      {value && value.id && (
        <DialogContent sx={{ 
          display: 'grid',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
          p: 3,
        }}>
          <QRCode 
            size={512}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={value.id}
          />
          <Typography variant="h5">{value.name}</Typography>
        </DialogContent>
      )}
    </Dialog>
  )
}

interface TaskProps {
  sceneryspotId?: string
  eventId?: string
  categories?: Category[]
  onCategoryChange: (value: Category) => void
}

export default function GeocachingTask(props: TaskProps) {
  const { sceneryspotId, eventId, categories, onCategoryChange } = props
  const alert = useAlert()
  const { geocachings, loading, refetch } = useGeocachings(sceneryspotId ?? '', eventId)

  const [values, setValues] = useState<State>({
    value: undefined,
    open: false
  })

  const handleChange = (value: Category) => () => {
    onCategoryChange && onCategoryChange(value)
  }

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleRefresh = () => {
    refetch({ sceneryspotId: sceneryspotId ?? '', eventId })
  }

  const handleUpdate = (value: Geocaching) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteGeocaching] = useMutation(DELETE_GEOCACHING, {
    refetchQueries: [
      { query: GET_GEOCACHINGS, variables: { sceneryspotId: sceneryspotId ?? '', eventId } },
      "GetGeocachings",
    ]
  })

  const handleDelete = (value: Geocaching) => () => {
    const { id, name } = value
    if (id) {
      setDeleteValues({ value: { id, name }, open: true })
    }
  }

  const handleDeleteClose = (event: {}) => {
    setDeleteValues({ value: undefined, open: false })
  }
  
  const handleDeleteConfirm = (value?: { id: string }) => {
    if (value) {
      const { id } = value
      deleteGeocaching({ variables: { id }})
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.updateGeocaching
            if (succed) {
              alert({ severity: "success", text: '已成功删除数据！' })
              return
            }
            alert({ severity: "error", text: message })
          }
          
        })
        .catch((e) => alert({ severity: "error", text: e.message }))
        .finally(() => setDeleteValues({ value: undefined, open: false }))
    } else {
      setDeleteValues({ value: undefined, open: false })
    }
  }

  const [qrcode, setQRcode] = useState<State>({ open: false })
  
  const handleQRCodeOpen = (value: Geocaching) => () => {
    setQRcode({ ...qrcode, value, open: true })
  }

  const handleQRCodeClose = (event: {}) => {
    setQRcode({ ...qrcode, value: undefined, open: false })
  }

  return (
    <React.Fragment>
      <GeocachingModal {...values} sceneryspotId={sceneryspotId ?? ''} eventId={eventId}  onClose={handleClose} />
      <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
      <QRCodeModal {...qrcode} onClose={handleQRCodeClose} />
        <Grid container sx={{
          boxSizing: 'border-box',
          display: 'flex',
          flexFlow: 'row wrap',
          width: '100%',
          padding: '16px',
        }}>
            <Grid item xs={8}>
          <Stack direction="row" spacing={2}>
            {categories && categories.map((v) => (
              <Chip 
                key={v.id} 
                label={v.name} 
                color={ v.id === TASK_SHARE ? 'primary' : undefined} 
                onClick={handleChange(v)}
              />
            ))}
          </Stack>
          </Grid>
           <Grid item xs={4} sx={{ display: "flex", alignItems: "flex-end", justifyContent: "end" }}>
              <Tooltip arrow title={"添加剧本"}>
                <IconButton color="primary" aria-label="添加剧本游" onClick={handleAdd}>
                  <Plus size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip arrow title={"刷新"}>
                <IconButton color="primary" aria-label="刷新" onClick={handleRefresh}>
                  <RefreshCw size={20} />
                </IconButton>
              </Tooltip>
            </Grid>
        </Grid>
      {!loading ? (
        <Card elevation={0}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"剧本游"}</TableCell>
                    <TableCell>{"获得积分"}</TableCell>
                    <TableCell>{""}</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {geocachings ? geocachings.map((row: any) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell scope="row" component="th">
                   <QRCode 
                      size={56}
                      style={{ height: "auto", maxWidth: "56px", width: "100%", cursor: "pointer" }}
                      value={row.id}
                      onClick={handleQRCodeOpen(row)}
                    />
                    <Typography variant='subtitle2' sx={{ mt: 0.5 }}>{row.name}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{row.points}</Typography>
                  </TableCell>
                  <TableCell scope="row" sx={{ textAlign: "right" }}>
                    <IconButton onClick={handleUpdate(row)}>
                      <Edit size={20} />
                    </IconButton>
                    <IconButton onClick={handleDelete(row)}>
                      <Trash2 size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell scope='row' align='center' colSpan={3}>
                    <Empty />
                  </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Loading />
      )}
    </React.Fragment>
  )
}