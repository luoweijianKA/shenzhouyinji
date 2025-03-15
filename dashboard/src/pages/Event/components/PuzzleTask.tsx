import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw, Edit, Trash2 } from 'react-feather'
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
  RadioGroup,
  Radio,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import cnLocale from 'date-fns/locale/zh-CN'
import { gql, useQuery, useMutation } from '@apollo/client'
import { today } from 'utils'
import { TASK_CHECKIN } from 'constants/index'
import { Category } from 'hooks/useCategories'
import UploadFile from 'components/UploadFile'
import Loading from 'components/Loading'
import QQMap from 'components/QQMap'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import Empty from 'components/Empty'
import { useAlert } from 'state/application/hooks'
import { FormInput, DatePickerWrapper } from 'pages/styled'

const GET_PUZZLES = gql`
  query GetPuzzles($sceneryspotId: String!, $eventId: String) {
    puzzles(sceneryspot_id: $sceneryspotId, event_id: $eventId) {
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
      countdown
      create_time
      electric_fence
    }
  }
`

const CREATE_PUZZLE = gql`
  mutation CreatePuzzle($input: NewPuzzle!) {
    createPuzzle(input: $input) {
      id
    }
  }
`

const UPDATE_PUZZLE = gql`
  mutation UpdatePuzzle($input: UpdatePuzzle!) {
    updatePuzzle(input: $input) {
      succed
      message
    }
  }
`

const DELETE_PUZZLE = gql`
  mutation UpdatePuzzle($id: ID!) {
    updatePuzzle(input: {id: $id, status: 4}) {
      succed
      message
    }
  }
`

interface Puzzle {
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
  level: number
  countdown: number
  electric_fence: string
}

const time = Math.floor(today().getTime() / 1000)
const initialPuzzle: Puzzle = {
  id: undefined,
  event_id: '',
  sceneryspot_id: '',
  name: '',
  points: 0,
  images: ['','','','','','','','','','','',''],
  introduction: '',
  start_time: time,
  end_time: time + (7 * 24 * 3600 - 1),
  necessary: false,
  status: 1,
  create_time: 0,
  level: 6,
  countdown: 0,
  electric_fence: "",
}

interface State {
  value?: Puzzle
  open: boolean
}

function usePuzzles(sceneryspotId: string, eventId?: string) {
  const [puzzles, setPuzzles] = useState<Puzzle[] | undefined>(undefined)
  const { data, loading, refetch } = useQuery(GET_PUZZLES, { variables: { sceneryspotId, eventId }, fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (data) {
      setPuzzles(data.puzzles.map((v: any) => {
        const images = v.images.split(',')
        return { ...v, images, level: images.length }
      }))
    }
  }, [data])

  return { puzzles, loading, refetch }
}

function useSave({ value, sceneryspotId, eventId, onCompleted } : { value?: Puzzle, sceneryspotId: string, eventId?: string, onCompleted?: (data: any) => void }) {
  const add = useMutation(CREATE_PUZZLE, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createPuzzle)
    },
    refetchQueries: [
      { query: GET_PUZZLES, variables: { sceneryspotId, eventId } },
      "GetPuzzles",
    ]
  })

  const update = useMutation(UPDATE_PUZZLE, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updatePuzzle)
    },
    refetchQueries: [
      { query: GET_PUZZLES, variables: { sceneryspotId, eventId } },
      "GetPuzzles",
    ]
  })

  return value?.id ? update : add
}

function PuzzleModal({ value, sceneryspotId, eventId, ...props } : {
  value?: Puzzle,
  sceneryspotId: string,
  eventId?: string,
} & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<Puzzle>({ 
    ...initialPuzzle, 
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
        setValues({ ...initialPuzzle, sceneryspot_id: sceneryspotId,  event_id: eventId ?? '' })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Puzzle) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target
    if (prop === 'necessary') {
      setValues({ ...values, [prop]: checked })
      return
    }
    if (prop === 'status') {
       setValues({ ...values, [prop]: checked ? 2 : 1 })
       return
    }
    if (prop === 'level') {
       setValues({ ...values, [prop]: parseInt(value) })
       return
    }

    setValues({ ...values, [prop]: value })
  }

  const handleDateChange = (prop: keyof Puzzle) => (value: number | null) => {
    if (value) {
      setValues({ ...values, [prop]: Math.floor(value / 1000) })
    }
  }

  const handleUpload = (i: number) => (value: string) => {
    const { images } = values
    setValues({ ...values, images: images.slice(0, i).concat(value).concat(images.slice(i + 1)) })
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
      level,
      countdown,
      electric_fence,
    } = values

    const input = values.id ? { 
      id,
      name,
      points,
      images: images.slice(0, level).join(','),
      introduction,
      start_time, 
      end_time, 
      necessary,
      status,
      countdown,
      electric_fence,
    } : {
      event_id,
      sceneryspot_id,
      name,
      points,
      images: images.slice(0, level).join(','),
      introduction,
      start_time, 
      end_time, 
      necessary,
      status,
      countdown,
      create_time,
      electric_fence,
    }

    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <DialogTitle>{value ? "修改拼图" : "添加拼图"}</DialogTitle>
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"计时"}</Typography>
          <FormInput 
            fullWidth 
            id="end-time-input"
            value={values.countdown}
            onChange={handleChange("countdown")}
          />
          <FormHelperText>
            {'任务计时，以（秒）为单位'}
          </FormHelperText>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ margin: '0 !important' }}>{"难度指数"}</Typography>
          <RadioGroup
            row
            name="level-buttons-group"
            sx={{ '& .MuiTypography-root': { margin: '0 !important' } }}
            value={values.level}
            onChange={handleChange('level')}
          >
            <FormControlLabel value={6} control={<Radio />} label="6" />
            <FormControlLabel value={9} control={<Radio />} label="9" />
            <FormControlLabel value={12} control={<Radio />} label="12" />
          </RadioGroup>
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
        <FormControl variant="standard" sx={{ '& .MuiInputBase-root': { mb: 1 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"图片"}</Typography>
          {Array.from(new Array(values.level).keys()).map((i) => (<UploadFile key={i} preview={true} value={values.images[i]} onChange={handleUpload(i)} />))}
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"任务介绍"}</Typography>
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

interface TaskProps {
  sceneryspotId?: string
  eventId?: string
  categories?: Category[]
  onCategoryChange: (value: Category) => void
}

export default function PuzzleTask(props: TaskProps) {
  const { sceneryspotId, eventId, categories, onCategoryChange } = props
  const alert = useAlert()
  const { puzzles, loading, refetch } = usePuzzles(sceneryspotId ?? '', eventId)

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

  const handleUpdate = (value: Puzzle) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteTrek] = useMutation(DELETE_PUZZLE, {
    refetchQueries: [
      { query: GET_PUZZLES, variables: { sceneryspotId: sceneryspotId ?? '', eventId } },
      "GetPuzzles",
    ]
  })

  const handleDelete = (value: Puzzle) => () => {
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
      deleteTrek({ variables: { id }})
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.updatePuzzle
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

  return (
    <React.Fragment>
      <PuzzleModal {...values} sceneryspotId={sceneryspotId ?? ''} eventId={eventId}  onClose={handleClose} />
      <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
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
                color={ v.id === TASK_CHECKIN ? 'primary' : undefined} 
                onClick={handleChange(v)}
              />
            ))}
          </Stack>
          </Grid>
           <Grid item xs={4} sx={{ display: "flex", alignItems: "flex-end", justifyContent: "end" }}>
              <Tooltip arrow title={"添加拼图"}>
                <IconButton color="primary" aria-label="添加拼图" onClick={handleAdd}>
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
                    <TableCell>{"拼图任务"}</TableCell>
                    <TableCell>{"任务计时"}</TableCell>
                    <TableCell>{"获得积分"}</TableCell>
                    <TableCell>{""}</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {puzzles ? puzzles.map((row: any) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{row.name}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{`${row.countdown} 秒`}</Typography>
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