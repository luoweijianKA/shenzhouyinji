import React, { useState, useEffect } from 'react'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { Plus, Edit, Trash2 } from 'react-feather'
import {
  Grid,
  Breadcrumbs,
  Typography,
  Card,
  Button,
  Link,
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
  FormControlLabel,
  Checkbox,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import { CATETORY_SCENERYSPOT_TASK, TASK_TREK, SCENERYSPOT_TASKS } from 'constants/index'
import { Category, useCategories } from 'hooks/useCategories'
import { useSceneryspot } from 'hooks/useSceneryspot'
import { PageWrapper } from 'theme/components'
import UploadFile from 'components/UploadFile'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import Empty from 'components/Empty'
import { useAlert } from 'state/application/hooks'
import { PageHeader, Title, FormInput } from 'pages/styled'

const GET_TREKS = gql`
  query GetTreks($sceneryspotId: String!) {
    treks(sceneryspot_id: $sceneryspotId) {
      id
      sceneryspot_id
      name
      step
      points
      images
      introduction
      start_time
      end_time
      necessary
      status
      create_time
    }
  }
`

const ADD_TREK = gql`
  mutation AddTrek($input: NewTrek!) {
    createTrek(input: $input) {
      id
    }
  }
`

const UPDATE_TREK = gql`
  mutation UpdateTrek($input: UpdateTrek!) {
    updateTrek(input: $input) {
      succed
      message
    }
  }
`

const DELETE_TREK = gql`
  mutation UpdateTrek($id: ID!) {
    updateTrek(input: {id: $id, status: 4}) {
      succed
      message
    }
  }
`

interface Trek {
  id?: string
  sceneryspot_id: string
  name: string
  step: number
  points: number
  images: string
  introduction: string
  start_time: number
  end_time: number
  necessary: boolean
  status: number
  create_time: number
}

const initialTrek: Trek = {
  id: undefined,
  sceneryspot_id: '',
  name: '',
  step: 0,
  points: 0,
  images: '',
  introduction: '',
  start_time: 0,
  end_time: 0,
  necessary: true,
  status: 1,
  create_time: 0,
}

interface State {
  value?: Trek
  open: boolean
}

function useTreks(sceneryspotId: string) {
  const [treks, setTreks] = useState<Trek[] | undefined>(undefined)
  const { data, loading } = useQuery(GET_TREKS, { variables: { sceneryspotId }, fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (data) {
      setTreks(data.treks)
    }
  }, [data])

  return { treks, loading }
}

function useSave({ value, sceneryspotId, onCompleted } : { value?: Trek, sceneryspotId: string, onCompleted?: (data: any) => void }) {
  const add = useMutation(ADD_TREK, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createTrek)
    },
    refetchQueries: [
      { query: GET_TREKS, variables: { sceneryspotId } },
      "GetTreks",
    ]
  })

  const update = useMutation(UPDATE_TREK, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateTrek)
    },
    refetchQueries: [
      { query: GET_TREKS, variables: { sceneryspotId } },
      "GetTreks",
    ]
  })

  return value?.id ? update : add
}

function TrekModal({ value, sceneryspotId, ...props } : {
  value?: Trek,
  sceneryspotId: string,
} & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<Trek>({ 
    ...initialTrek, 
    sceneryspot_id: sceneryspotId,
  })
  const isValid = values.name.length > 0

  const [save, { loading }] = useSave({
    value: values,
    sceneryspotId,
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
        setValues({ ...initialTrek, sceneryspot_id: sceneryspotId })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Trek) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
  

  const handleUpload = (prop: keyof Trek) => (value: string) => {
    setValues({ ...values, [prop]: value })
  }

  const handleOK = () => {
    const { 
      id,
      sceneryspot_id,
      name,
      step,
      points,
      images,
      introduction,
      start_time, 
      end_time, 
      necessary,
      status,
      create_time,
    } = values

    const input = values.id ? { 
      id,
      name,
      step,
      points,
      images,
      introduction,
      start_time, 
      end_time, 
      necessary,
      status,
    } : {
      sceneryspot_id,
      name,
      step,
      points,
      images,
      introduction,
      start_time, 
      end_time, 
      necessary,
      status,
      create_time,
    }

    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <DialogTitle>{value ? "修改步行" : "添加步行"}</DialogTitle>
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"名称"}</Typography>
          <FormInput 
            fullWidth 
            id="questions-input"
            value={values.name}
            onChange={handleChange("name")}
          />
          <FormControlLabel 
            control={<Checkbox checked={values.status === 2} onChange={handleChange('status')} />} 
            label="在景区的电子围栏内完成任务"
            sx={{ '& .MuiTypography-root': { margin: '0 !important' } }}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"目标步数"}</Typography>
          <FormInput 
            fullWidth 
            id="step-input"
            value={values.step}
            onChange={handleChange("step")}
          />
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"宣传照片"}</Typography>
          <UploadFile preview={true} value={values.images} onChange={handleUpload("images")} />
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

export default function TrekTask({
  match: {
    params: { id }
  },
}: RouteComponentProps<{ id: string }>) {
  const history = useHistory()
  const alert = useAlert()
  const categories = useCategories(CATETORY_SCENERYSPOT_TASK)
  const sceneryspot = useSceneryspot(id)
  const { treks, loading } = useTreks(id)

  const [values, setValues] = useState<State>({
    value: undefined,
    open: false
  })

  const handleChange = (category: Category) => () => {
    history.push(`/place/${id}/${SCENERYSPOT_TASKS[category.id]}`)
  }

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleUpdate = (value: Trek) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteTrek] = useMutation(DELETE_TREK, {
    refetchQueries: [
      { query: GET_TREKS, variables: { sceneryspotId: id } },
      "GetTreks",
    ]
  })

  const handleDelete = (value: Trek) => () => {
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
            const { succed, message } = data.updateTrek
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
    <PageWrapper>
      <PageHeader container >
        <Grid item xs={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">{"景区管理"}</Typography>
            <Link underline="hover" color="inherit" href="#/place-navigation">{"景区任务"}</Link>
          </Breadcrumbs>
          {sceneryspot && (<Title variant='h1'>{sceneryspot.name}</Title>)}
        </Grid>
        <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
          <Button
            disableElevation
            variant="contained" 
            startIcon={<Plus />}
            onClick={handleAdd}
          >
            {"添加步行"}
          </Button>
        </Grid>
      </PageHeader>
      <TrekModal {...values} sceneryspotId={id}  onClose={handleClose} />
      <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
      {categories && categories.length > 0 && (
        <Grid container sx={{
          boxSizing: 'border-box',
          display: 'flex',
          flexFlow: 'row wrap',
          width: '100%',
          padding: '16px',
        }}>
          <Stack direction="row" spacing={2}>
            {categories.map((v) => (
              <Chip 
                key={v.id} 
                label={v.name} 
                color={ v.id === TASK_TREK ? 'primary' : undefined} 
                onClick={handleChange(v)}
              />
            ))}
          </Stack>
        </Grid>
      )}
      {!loading ? (
        <Card sx={{
          backgroundColor: "rgb(255, 255, 255)",
          color: "rgba(0, 0, 0, 0.87)",
          transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          overflow: "hidden",
          borderRadius: "20px",
          margin: "15px",
          boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
          padding: "24px",
        }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"计步任务"}</TableCell>
                    <TableCell>{"目标步数"}</TableCell>
                    <TableCell>{"获得积分"}</TableCell>
                    <TableCell>{""}</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {treks ? treks.map((row: any) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{row.name}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{row.step}</Typography>
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
    </PageWrapper>
  )
}