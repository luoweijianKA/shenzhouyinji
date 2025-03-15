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
  Avatar,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useAlert } from 'state/application/hooks'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import UploadFile from 'components/UploadFile'
import { PageHeader, FormInput } from 'pages/styled'

const GET_BADGES = gql`
  query GetBadges($eventId: String!) {
    badges(event_id: $eventId) {
      id
      event_id
      name
      images
    }
  }
`

const ADD_BADGE = gql`
  mutation AddBadge($input: NewBadge!) {
    createBadge(input: $input) {
      id
    }
  }
`

const UPDATE_BADGE = gql`
  mutation UpdateBadge($input: UpdateBadge!) {
    updateBadge(input: $input) {
      succed
      message
    }
  }
`

const DELETE_BADGE = gql`
  mutation DeleteBadge($input: [ID!]) {
    deleteBadge(input: $input) {
      id
    }
  }
`

interface Badge {
  id?: string
  eventId: string
  name: string
  images: string
}

const initialBadge: Badge = {
  id: undefined,
  eventId: "",
  name: "",
  images: "",
}

function useSave({ eventId, value, onCompleted } : { eventId: string, value?: Badge, onCompleted?: (data: any) => void }) {
  const add = useMutation(ADD_BADGE, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createBadge)
    },
    refetchQueries: [
      { query: GET_BADGES, variables: { eventId } },
      "GetBadges",
    ]
  })

  const update = useMutation(UPDATE_BADGE, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateBadge)
    },
    refetchQueries: [
      { query: GET_BADGES, variables: { eventId } },
      "GetBadges",
    ]
  })

  return value?.id ? update : add
}

function BadgeModal({ eventId, value, ...props } : { eventId: string, value?: Badge } & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<Badge>({ ...initialBadge, eventId })

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
        setValues({ ...initialBadge, eventId })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Badge) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleUpload = (prop: keyof Badge) => (value: string) => {
    setValues({ ...values, [prop]: value })
  }

  const handleOK = () => {
    const { id, eventId: event_id, name, images } = values
    const input = (!id && name.length > 0)
      ? {
        event_id,
        name,
        images,
      }
      : {
        id,
        name,
        images,
      }
    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{value ? "修改徽章" : "添加徽章"}</DialogTitle>
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"图片"}</Typography>
          <UploadFile preview={true} value={values.images} onChange={handleUpload("images")} />
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

interface BadgePanelProps {
  value: { id: string }
  index: number
  hidden: boolean
}

interface State {
  eventId: string
  value?: Badge
  open: boolean
}

export default function BadgePanel(props: BadgePanelProps) {
  const { value: { id: eventId }, index, hidden, ...other } = props
  const { data, loading } = useQuery(GET_BADGES, { variables: { eventId }, fetchPolicy: "no-cache" })
  const alert = useAlert()

  const [values, setValues] = useState<State>({ eventId, value: undefined, open: false })

  const badgeRows: Badge[] = useMemo(() => {
    if (data) {
      return data.badges.map((v: any) => ({ 
        id: v.id,
        eventId: v.event_id,
        name: v.name,
        images: v.images,
      }))
    }
    return []
  }, [data])

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleUpdate = (value: Badge) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }


  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [updateCamp] = useMutation(DELETE_BADGE, {
    refetchQueries: [
      { query: GET_BADGES, variables: { eventId } },
      "GetBadges",
    ]
  })

  const handleDelete = (value: Badge) => () => {
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
      updateCamp({ variables: { input: [id] } })
        .then(({ data }) => {
          if (data && data.deleteBadge.length > 0) {
            alert({ severity: "success", text: '已成功删除数据！' })
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
          <BadgeModal  
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
                    <TableCell align="center">{"图片"}</TableCell>
                    <TableCell>{''}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {badgeRows.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th" align="center">
                        {row.images && row.images !== "" && (
                          <Avatar alt={row.name} src={`${process.env.REACT_APP_RESOURCES_DOMAIN}` + row.images} sx={{ width: 40, height: 40, margin: "0 auto" }} />
                        )}
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