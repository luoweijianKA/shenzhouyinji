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
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useAlert } from 'state/application/hooks'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { PageHeader, FormInput } from 'pages/styled'

const GET_CAMPS = gql`
  query GetCamps($eventId: String!) {
    camps(event_id: $eventId) {
      id
      name
    }
  }
`

const GET_HONOURS = gql`
  query GetHonours($eventId: String!) {
    eventHonours(event_id: $eventId) {
      id
      camp_id
      camp_name
      name
      images
      min_points
      max_points
      status
    }
  }
`

const ADD_HONOUR = gql`
  mutation AddHonour($input: NewHonour!) {
    createHonour(input: $input) {
      id
    }
  }
`

const UPDATE_HONOUR = gql`
  mutation UpdateHonour($input: UpdateHonour!) {
    updateHonour(input: $input) {
      succed
      message
    }
  }
`

interface Honour {
  id?: string
  camp_id: string
  camp_name: string
  name: string
  images: string
  min_points: number
  max_points: number
  status: number
}

const initialHonour: Honour = {
  id: undefined,
  camp_id: "",
  camp_name: "",
  name: "",
  images: "",
  min_points: 0,
  max_points: 0,
  status: 1,
}

function useSave({ eventId, value, onCompleted } : { eventId: string, value?: Honour, onCompleted?: (data: any) => void }) {
  const add = useMutation(ADD_HONOUR, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createHonour)
    },
    refetchQueries: [
      { query: GET_HONOURS, variables: { eventId } },
      "GetHonours",
    ],
  })

  const update = useMutation(UPDATE_HONOUR, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateHonour)
    },
    refetchQueries: [
      { query: GET_HONOURS, variables: { eventId } },
      "GetHonours",
    ],
  })

  return value?.id ? update : add
}

function HonourModal({ eventId, campOptions, value, ...props } : { 
  eventId: string
  campOptions: { id: string, name: string }[], 
  value?: Honour 
} & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<Honour>({ ...initialHonour })

  const isValid = values.name.length > 0 && values.camp_id.length > 0

  const [save, { loading }] = useSave({
    eventId,
    value: values,
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
        setValues({ ...initialHonour })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Honour) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleOK = () => {
    const { id, camp_id, name, images, min_points, max_points, status } = values
    const input = (!id && name.length > 0)
      ? {
        camp_id,
        name,
        images,
        min_points,
        max_points,
        status,
      }
      : {
        id,
        name,
        images,
        min_points,
        max_points,
        status,
      }
    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{value ? "修改荣耀" : "添加荣耀"}</DialogTitle>
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"荣耀名称"}</Typography>
          <FormInput 
            fullWidth 
            id="name-input"
            value={values.name}
            onChange={handleChange("name")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"关联阵营"}</Typography>
          <RadioGroup
            row
            aria-labelledby="camp-group-label"
            name="camp-group"
          >
            {campOptions.map(opt => (
              <FormControlLabel
                key={opt.id}
                value={opt.id} 
                control={<Radio disabled={!!values.id} checked={opt.id === values.camp_id} onChange={handleChange("camp_id")} />} 
                label={opt.name}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"荣耀标识"}</Typography>
          <FormInput 
            fullWidth
            id="images-input"  
            aria-describedby="images-text"
            value={values.images}
            onChange={handleChange("images")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"最小积分"}</Typography>
          <FormInput 
            fullWidth
            id="min-points-input"  
            aria-describedby="min-points-text"
            value={values.min_points}
            onChange={handleChange("min_points")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"最大积分"}</Typography>
          <FormInput 
            fullWidth
            id="max-points-input"  
            aria-describedby="max-points-text"
            value={values.max_points}
            onChange={handleChange("max_points")}
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

interface HonourPanelProps {
  value: { id: string }
  index: number
  hidden: boolean
}

interface State {
  eventId: string
  value?: Honour
  open: boolean
}

function useCamps(eventId: string): { id: string, name: string }[] {
  const { data } = useQuery(GET_CAMPS, { variables: { eventId }, fetchPolicy: "no-cache" })

  return useMemo(() => {
    if (data) {
      return data.camps.map(({ id, name }: { id: string, name: string }) => ({ id, name }))
    }
    return []
  }, [data])
}

export default function HonourPanel(props: HonourPanelProps) {
  const { value: { id: eventId }, index, hidden, ...other } = props
  const { data, loading } = useQuery(GET_HONOURS, { variables: { eventId }, fetchPolicy: "no-cache" })
  const alert = useAlert()
  const camps = useCamps(eventId)
  const [values, setValues] = useState<State>({ eventId, value: undefined, open: false })

  const honourRows: Honour[] = useMemo(() => {
    if (data) {
      return data.eventHonours
    }
    return []
  }, [data])

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleUpdate = (value: Honour) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: { succed?: boolean }) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [updateHonour] = useMutation(UPDATE_HONOUR, {
    refetchQueries: [
      { query: GET_HONOURS, variables: { eventId } },
      "GetHonours",
    ]
  })

  const handleDelete = (value: Honour) => () => {
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
      updateHonour({ variables: { input: { id, status: 4 } } })
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.updateHonour
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
          <HonourModal  
            {...values}
            campOptions={Object.values(camps)}
            onClose={handleClose}
          />
          <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
          {!loading ? (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"名称"}</TableCell>
                    <TableCell>{"阵营"}</TableCell>
                    <TableCell>{"积分"}</TableCell>
                    <TableCell>{''}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {honourRows.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.camp_name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{`${row.min_points} 至 ${row.max_points}`}</Typography>
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