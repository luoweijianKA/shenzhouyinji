import React, { useMemo, useState } from 'react'
import { Plus, Edit, Trash2, Search } from 'react-feather'
import {
  Grid,
  Breadcrumbs,
  Typography,
  CardContent,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  FormControl,
  OutlinedInput,
  Box,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
 } from '@mui/material'
import { gql, useQuery, useMutation } from '@apollo/client'
import { formattedDate } from 'utils'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { useAlert } from 'state/application/hooks'
import { PageHeader, Title, LinkButton, StyledCard } from 'pages/styled'

const GET_EVENTS= gql`
  query GetEvents {
    events {
      id
      code
      name
      start_time
      end_time
      introduction
      images
      step
      status
      enable_award
      category_id
      create_time
    }
  }
`

const UPDATE_EVENT = gql`
  mutation UpdateEvent($input: UpdateEvent!) {
    updateEvent(input: $input) {
      succed
      message
    }
  }
`

const DELETE_EVENT = gql`
  mutation UpdateEvent($id: ID!) {
    updateEvent(
      input: {id: $id, code: "", name: "", start_time: 0, end_time: 0, introduction: "", images: "", step: "", status: 4}
    ) {
      succed
      message
    }
  }
`

interface Event {
  id: string
  code: string
  name: string
  start: number
  end: number
  introduction: string
  images: string[]
  step: string
  status: number
  enable_award: boolean
  category_id: string
  createTime: number
  sceneryspots: string[]
}

enum Status {
  InProcess = 1,
  Close = 2,
}
const StatusOptions = [
  { label: "进行中", value: Status.InProcess },
  { label: "已结束", value: Status.Close },
]
const StatusColors: { [key in Status]: string } = {
  [Status.InProcess]: '#00C292',
  [Status.Close]: '#E46A76',
}


function EventStatus({ event, value, onCompleted }: { event: Event, value: Status, onCompleted?: (data: any) => void }) {
  const [setStatus, { data, loading }] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      onCompleted && onCompleted(data)
    }
  })
  const selected = StatusOptions.find(opt => opt.value === value)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChange = (status: Status) => () => {
    setAnchorEl(null)
    const { id, code, name, start: start_time, end: end_time, introduction, step, enable_award, category_id } = event
    const images = event.images.join(',')
    setStatus({ variables: { input: { id, code, name, start_time, end_time, introduction, images, step, status, enable_award, category_id } }})
  }

  const item = (option: { label: string, value: Status }) => {
    return (
      <Box sx={{ display: 'flex',  alignItems: 'center' }}>
        <Box sx={{ 
          backgroundColor: StatusColors[option.value],
          borderRadius: '100%',
          height: '10px',
          width: '10px',
        }} />
        <Typography variant="h6" sx={{
          margin: '0 0 0 0.5rem',
          fontSize: '0.875rem',
          fontWeight: 400,
          lineHeight: 1.57,  
          color: 'rgb(119, 126, 137)',
          textTransform: 'none',
        }}>
          {option.label}
        </Typography>
      </Box>
    )
  }

  return (
    <React.Fragment>
      {loading ? (<CircularProgress size={18} />) : (
        selected && (
          <Button
            id="status-button"
            aria-controls={open ? 'status-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            {item(selected)}
          </Button>
        )
      )}
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: '20ch',
          },
        }}
      >
        {StatusOptions.map((option) => (
          <MenuItem key={option.value} selected={option.value === value} onClick={handleChange(option.value)}>
            {item(option)}
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  )
}

interface State {
  search: string
}

export default function Event() {
  const alert = useAlert()
  const [values, setValues] = useState<State>({ search: '' })
  const { data, loading, refetch } = useQuery(GET_EVENTS, { fetchPolicy: "no-cache" })

  const eventRows: Event[] = useMemo(() => {
    if (data) {
      return data.events
        .map((v: any) => ({
          id: v.id,
          code: v.code,
          name: v.name,
          start: v.start_time,
          end: v.end_time,
          introduction: v.introduction,
          images: v.images.split(","),
          step: v.step,
          status: v.status,
          enable_award: v.enable_award,
          category_id: v.category_id,
          createTime: v.create_time,
          sceneryspots: [],
        }))
        .sort((a: Event, b: Event) => b.createTime - a.createTime)
    }
    return []
  }, [data])

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleRefetch = () => {
    refetch()
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteEvent] = useMutation(DELETE_EVENT, {
    refetchQueries: [
      { query: GET_EVENTS },
      "GetEvents",
    ]
  })

  const handleDelete = (value: Event) => () => {
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
      deleteEvent({ variables: { id }})
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.updateEvent
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
              <Typography color="text.primary">{"活动管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"活动列表"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <FormControl>
              <OutlinedInput
                sx={{
                  "& .MuiOutlinedInput-input": {
                    padding: "8.5px 14px"
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    top: 0,
                    "& > legend": {
                      float: 'left !important',
                    }
                  }
                }}
                notched={false}
                placeholder="搜索活动"
                startAdornment={<Search />}
                value={values.search}
                onChange={handleChange('search')}
              />
            </FormControl>
            <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<Plus />}
              href="#/event/add"
            >
              {"添加"}
            </LinkButton>
        </Grid>
        </PageHeader>
        <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 80 }}>{"编号"}</TableCell>
                      <TableCell>{"活动"}</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>{"开始时间"}</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>{"结束时间"}</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>{"状态"}</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>{''}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {eventRows.filter(event => event.name.indexOf(values.search) > -1).map((row, i) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.code}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar sx={{ mt: 0.5, mr: 2 }}>
                          <Avatar alt={row.name} src={row.images.length > 0 ? row.images[0] : ""} sx={{ width: 56, height: 56 }} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={row.name}
                          secondary={
                            <Typography sx={{ display: 'inline',  mr: 1 }} variant="caption">
                            {row.introduction}
                            </Typography>
                          }
                        />
                    </ListItem>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>
                        {row.start > 0 ? formattedDate(new Date(row.start * 1000)) : "--"}
                      </Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>
                        {row.end > 0 ? formattedDate(new Date(row.end * 1000)) : "--"}
                      </Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <EventStatus event={row} value={row.status} onCompleted={handleRefetch} />
                    </TableCell>
                    <TableCell scope="row" sx={{ textAlign: "right" }}>
                      <IconButton href={`#/event/${row.id}`}>
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
            </CardContent>
          </StyledCard>
        ) : (
          <Loading />
        )}
    </PageWrapper>
  )
}