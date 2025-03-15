import React, { useState, useMemo, useEffect } from 'react'
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
  Stack,
  TablePagination,
  Menu,
  MenuItem,
  CircularProgress,
  Divider,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useTheme } from '@mui/material/styles'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Download, MoreVertical  } from 'react-feather'
import { Sceneryspot } from 'hooks/useSceneryspot'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { useAlert } from 'state/application/hooks'
import UserPointsModal from './UserPointsModal'
import UserStampModal from './UserStampModal'
import { PageHeader } from 'pages/styled'
import CampSelect from "./CampSelect"

const GET_EVENT_USERS = gql`
  query GetEventUsers($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $eventId: String!, $camps: [String!], $sceneryspots: [String!]) {
    eventUsers(
      first: $first
      after: $after
      last: $last
      before: $before
      event_id: $eventId
      camps: $camps
      sceneryspots: $sceneryspots
    ) {
      totalCount
        edges {
          node {
            id
            user_id
            user_name
            user_wechat
            camp_id
            camp_name
            points
            trips
            city
            email
            phone
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
    }
  }
`

const DELETE_EVENT_USER = gql`
  mutation UpdateSceneryspot($userId: String!, $campId: String!) {
    updateUserCamp(
      input: {user_id: $userId, camp_id: $campId, points: 0, status: 4}
    ) {
      succed
      message
    }
  }
`

const EXPORT_EVENT_USERS = gql`
  mutation ExportEventUsers($eventId: String!, $camps: [String!]) {
    exportEventUsers(event_id: $eventId, camps: $camps) {
      message
      succed
    }
  }
`

interface EventUser {
  id: string
  user_id: string
  user_name: string
  user_wechat: string
  camp_id: string
  camp_name: string
  points: number
  trips: number
  city: string
  email: string
  phone: string
}

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

interface TabPanelProps {
  value: { id: string }
  index: number
  hidden: boolean
  sceneryspotOptions?: Sceneryspot[]
}

interface State {
  first: number
  after?: string
  last: number
  before?: string
  eventId: string
  camps: string[]
  sceneryspots: string[]
  page: number
  totalCount: number
  startCursor?: string
  endCursor?: string
  value?: EventUser
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;
  const pageCount = rowsPerPage === -1 ? 1 : Math.ceil(count / rowsPerPage)

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <Typography 
        variant='body2' 
        sx={{ 
          display: 'inline-block',
          padding: '0.5rem 1rem',
        }}
      >
        {page + 1} / {pageCount}
      </Typography>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  )
}

export default function UserPanel(props: TabPanelProps) {
  const alert = useAlert()
  const { value, index, hidden, sceneryspotOptions, ...other } = props
  const [values, setValues] = useState<State>({ 
    first: 20, 
    last: 20,
    eventId: value.id,
    camps: [],
    sceneryspots: [],
    page: 0, 
    totalCount: 0,
  })
  const { first, after, last, before, eventId, camps, sceneryspots } = values
  const { data, loading, refetch } = useQuery(GET_EVENT_USERS, { 
    variables: { first, after, last, before, eventId, camps, sceneryspots }, 
    fetchPolicy: "no-cache" 
  })

  useEffect(() => {
    setValues({ ...values, eventId: value.id, camps: [], sceneryspots: [] })
  }, [value])

  const users: EventUser[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.eventUsers
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node : EventUser }) => node) 
    }
    return []
  }, [data])

  const handleCampChange = (value: { id: string }[] | null) => {
    setValues({ ...values, camps: value ? value.map(v => v.id) : [] })
  }

  const [exportEventUsers, { loading: exportLoading }] = useMutation(EXPORT_EVENT_USERS)

  const handleExport = () => {
    exportEventUsers({ variables: { eventId, camps }})
      .then(({ data }) => {
        if (data) {
          const { succed, message } = data.exportEventUsers
          if (succed) {
            alert({ severity: "success", text: '已成功导出数据！' })
            window.open(process.env.REACT_APP_RESOURCES_DOMAIN + message)
            return
          }
          alert({ severity: "error", text: message })
        }
      })
      .catch((e) => alert({ severity: "error", text: e.message }))
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    if (newPage === 0) {
      setValues({ ...values, after: undefined, before: undefined, page: newPage })
    } else if (newPage === values.page - 1) {
      setValues({ ...values, after: undefined, before: values.startCursor, page: newPage })
    } else {
      setValues({ ...values, after: values.endCursor, before: undefined, page: newPage })
    }
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = parseInt(event.target.value, 10)
    const limit = val === -1 ? values.totalCount : val
    setValues({ ...values, first: limit, after: undefined, last: limit, before: undefined, page: 0 })
  }

  const [userPoints, setUserPoints] = useState<{
    title?: string
    value?: { 
      userId: string
      eventId: string
      campId: string
      points: number
    }
    open: boolean
  }>({ open: false })
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (value: EventUser) => (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setValues({ ...values, value })
  }

  const handleClose = () => {
    setAnchorEl(null)
    setValues({ ...values, value: undefined })
  }

  const handlePointsChange = () => {
    setAnchorEl(null)

    const { value } = values
    if (value) {
      setUserPoints({
        title: `更改${value.user_name}的积分`, 
        value: { userId: value.user_id, eventId, campId: value.camp_id, points: value.points },
        open: true
      })
    }
  }

  const handleUserPointsDismiss = (value?: { userId: string, eventId: string, campId: string, points: number }) => {
    setAnchorEl(null)
    setUserPoints({ title: undefined, value, open: false })
    if (value) {
      refetch({ first, after, last, before, eventId, camps, sceneryspots })
    }
  }

  const [userStamp, setUserStamp] = useState<{
    title?: string
    value?: { 
      userId: string
      campId: string
      stampCount: number
    }
    open: boolean
  }>({ open: false })

  const handleStampChange = () => {
    setAnchorEl(null)

    const { value } = values
    if (value) {
      setUserStamp({
        title: `更改${value.user_name}的打卡`, 
        value: { userId: value.user_id, campId: value.camp_id, stampCount: value.trips },
        open: true
      })
    }
  }

  const handleUserStampDismiss = (value?: { userId: string, campId: string, stampCount: number }) => {
    setAnchorEl(null)
    setUserStamp({ title: undefined, value, open: false })
    if (value) {
      refetch({ first, after, last, before, eventId, camps, sceneryspots })
    }
  }

  const [deleteValues, setDeleteValues] = useState<{
    value?: { id: string, name: string, userId: string, campId: string },
    open: boolean
  }>({ open: false })
  const [deleteUser] = useMutation(DELETE_EVENT_USER, {
    refetchQueries: [
      { query: GET_EVENT_USERS, variables: { first, after, last, before, eventId, camps, sceneryspots } },
      "GetEventUsers",
    ]
  })

  const handleUserDelete = () => {
    setAnchorEl(null)

    const { value } = values
    if (value) {
      setDeleteValues({ 
        value: {
          id: value.id,
          name: value.user_name,
          userId: value.user_id,
          campId: value.camp_id 
        }, 
        open: true,
      })
    }
  }

  const handleDeleteClose = (event: {}) => {
    setAnchorEl(null)
    setDeleteValues({ value: undefined, open: false })
  }
  
  const handleDeleteConfirm = () => {
    const { value } = deleteValues
    if (value) {
      const { userId, campId } = value
      deleteUser({ variables: { userId, campId }})
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.updateUserCamp
            if (succed) {
              alert({ severity: "success", text: '已成功删除数据！' })
              refetch({ first, after, last, before, eventId, camps, sceneryspots })
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
            <Grid item xs={4}></Grid>
            <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
              <CampSelect eventId={eventId} onChange={handleCampChange} />
               <LoadingButton 
                    disableElevation 
                    variant="contained"
                    startIcon={<Download size={20} />}
                    sx={{ minWidth: 135 }}
                    loading={exportLoading}
                    disabled={exportLoading}
                    onClick={handleExport}
                  >
                  {'导出EXCEL'}
                </LoadingButton>
            </Grid>
          </PageHeader>
          <UserPointsModal {...userPoints} onDismiss={handleUserPointsDismiss} />
          <UserStampModal {...userStamp} onDismiss={handleUserStampDismiss} />
          <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
          {!loading ? (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"用户名"}</TableCell>
                    <TableCell>{"所在城市"}</TableCell>
                    <TableCell>{"邮箱"}</TableCell>
                    <TableCell>{"所在阵营"}</TableCell>
                    <TableCell>{"积分"}</TableCell>
                    <TableCell>{'打卡数量'}</TableCell>
                    <TableCell>{''}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.user_name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.city}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.email}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.camp_name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.points}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.trips}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <IconButton
                          aria-label="more"
                          id="more-button"
                          aria-controls={open ? 'more-menu' : undefined}
                          aria-expanded={open ? 'true' : undefined}
                          aria-haspopup="true"
                          onClick={handleClick(row)}
                          disabled={loading}
                        >
                          {loading ? (<CircularProgress size={24} />) : (<MoreVertical size={24} />)}
                        </IconButton>
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
                        <MenuItem onClick={handlePointsChange}>
                          {'更改积分'}
                        </MenuItem>
                        <MenuItem onClick={handleStampChange}>
                          {'更改打卡'}
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleUserDelete}>
                          {'删除用户'}
                        </MenuItem>
                      </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {values.totalCount > users.length && (
                <Stack direction="row" justifyContent="center">
                  <TablePagination
                    component="div"
                    rowsPerPageOptions={[10, 20, 50, 100, { label: '全部', value: -1 }]}
                    count={values.totalCount}
                    rowsPerPage={values.first}
                    page={values.page}
                    SelectProps={{
                      inputProps: {
                        'aria-label': 'page size',
                      },
                      native: true,
                    }}
                    labelRowsPerPage={'页面数量:'}
                    labelDisplayedRows={() => ""}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </Stack>
              )}
              </TableContainer>
          ) : (
            <Loading />
          )}
        </Box>
      )}
    </div>
  )
}