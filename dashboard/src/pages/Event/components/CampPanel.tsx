import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'react-feather'
import {
  Box,
  Grid,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Avatar,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import { CATETORY_SCENERYSPOT_TASK } from 'constants/index'
import { useCategories } from 'hooks/useCategories'
import { useAlert } from 'state/application/hooks'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import UploadFile from 'components/UploadFile'
import { PageHeader, FormInput } from 'pages/styled'

const GET_CAMPS = gql`
  query GetCamps($eventId: String!) {
    camps(event_id: $eventId) {
      id
      event_id
      name
      images
      introduction
      points
      status
      category_id
    }
  }
`

const ADD_CAMP = gql`
  mutation AddCamp($input: NewCamp!) {
    createCamp(input: $input) {
      id
    }
  }
`

const UPDATE_CAMP = gql`
  mutation UpdateCamp($input: UpdateCamp!) {
    updateCamp(input: $input) {
      succed
      message
    }
  }
`

interface Camp {
  id?: string
  eventId: string
  name: string
  images: string
  introduction: string
  points: number
  status: number
  categoryId: string
}

const initialCamp: Camp = {
  id: undefined,
  eventId: '',
  name: '',
  images: '',
  introduction: '',
  points: 0,
  status: 1,
  categoryId: '',
}

function useSave({ eventId, value, onCompleted } : { eventId: string, value?: Camp, onCompleted?: (data: any) => void }) {
  const add = useMutation(ADD_CAMP, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createCamp)
    },
    refetchQueries: [
      { query: GET_CAMPS, variables: { eventId } },
      "GetCamps",
    ]
  })

  const update = useMutation(UPDATE_CAMP, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateCamp)
    },
    refetchQueries: [
      { query: GET_CAMPS, variables: { eventId } },
      "GetCamps",
    ]
  })

  return value?.id ? update : add
}

function CampModal({ eventId, value, ...props } : { eventId: string, value?: Camp } & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()
  const categories = useCategories(CATETORY_SCENERYSPOT_TASK)
  const [values, setValues] = useState<Camp>({ ...initialCamp, eventId })

  const isValid = values.name.length > 0

  const [save, { loading }] = useSave({
    eventId,
    value: values,
    onCompleted: (data) => {
      console.log({ data, onClose })
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
        setValues({ ...initialCamp, eventId })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Camp) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleUpload = (prop: keyof Camp) => (value: string) => {
    setValues({ ...values, [prop]: value })
  }

  const handleOK = () => {
    const { id, eventId: event_id, name, images, introduction, points, status, categoryId: category_id } = values
    const input = (!id && name.length > 0)
      ? {
        event_id,
        name,
        images,
        introduction,
        points,
        status,
        category_id,
      }
      : {
        id,
        name,
        images,
        introduction,
        points,
        status,
        category_id,
      }
    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{value ? "修改阵营" : "添加阵营"}</DialogTitle>
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
            id="name-input"
            value={values.name}
            onChange={handleChange("name")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"阵旗"}</Typography>
          <UploadFile preview={true} value={values.images} onChange={handleUpload("images")} />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"任务"}</Typography>
          <RadioGroup
            row
            aria-labelledby="task-group-label"
            name="task-group"
          >
            {categories && categories.map(opt => (
              <FormControlLabel
                key={opt.id}
                value={opt.id} 
                control={<Radio size="small" checked={opt.id === values.categoryId} onChange={handleChange("categoryId")} />} 
                label={opt.name}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"积分"}</Typography>
          <FormInput 
            fullWidth 
            id="points-input"
            value={values.points}
            onChange={handleChange("points")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"介绍"}</Typography>
          <FormInput 
            fullWidth 
            multiline
            rows={4}
            id="introduction-input"
            value={values.introduction}
            onChange={handleChange("introduction")}
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

interface CampPanelProps {
  value: { id: string }
  index: number
  hidden: boolean
}

interface State {
  eventId: string
  value?: Camp
  open: boolean
}

export default function CampPanel(props: CampPanelProps) {
  const { value: { id: eventId }, index, hidden, ...other } = props
  const { data, loading } = useQuery(GET_CAMPS, { variables: { eventId }, fetchPolicy: "no-cache" })
  const alert = useAlert()

  const [values, setValues] = useState<State>({ eventId, value: undefined, open: false })

  const campRows: Camp[] = useMemo(() => {
    if (data) {
      return data.camps.map((v: any) => ({ 
        id: v.id,
        eventId: v.event_id,
        name: v.name,
        images: v.images,
        introduction: v.introduction,
        points: v.points,
        status: v.status,
        categoryId: v.category_id,
      }))
    }
    return []
  }, [data])

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleUpdate = (value: Camp) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [updateCamp] = useMutation(UPDATE_CAMP, {
    refetchQueries: [
      { query: GET_CAMPS, variables: { eventId } },
      "GetCamps",
    ]
  })

  const handleDelete = (value: Camp) => () => {
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
      updateCamp({ variables: { input: { id, status: 4 } } })
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.updateCamp
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
    <div
      role="tabpanel"
      hidden={hidden}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {!hidden && (
        <Box>
          <PageHeader container sx={{ pl: 0, pr: 0 }}>
            <Grid item xs={12} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
              <Button
                disableElevation
                variant="contained" 
                startIcon={<Plus />}
                onClick={handleAdd}
              >
                {"添加"}
              </Button>
            </Grid>
          </PageHeader>
          <CampModal  
            {...values}
            onClose={handleClose}
          />
          <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
          {!loading ? (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"名称"}</TableCell>
                    <TableCell align="center">{"阵旗"}</TableCell>
                    <TableCell align="center">{"积分"}</TableCell>
                    <TableCell>{""}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campRows.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th" align="center">
                        {row.images && row.images.length > 0 && (
                          <Avatar alt={row.name} src={`${process.env.REACT_APP_RESOURCES_DOMAIN}` + row.images} sx={{ width: 40, height: 40, margin: "0 auto" }} />
                        )}
                      </TableCell>
                      <TableCell scope="row" component="th" align="center">
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Loading />
          )}
        </Box>
      )}
    </div>
  )
}