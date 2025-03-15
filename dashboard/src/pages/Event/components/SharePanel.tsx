import React, { useMemo, useState, useEffect } from 'react'
import { RefreshCw } from 'react-feather'
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
  Stack,
  TablePagination,
  Tooltip,
  Button,
  FormControl,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { gql, useQuery, useMutation } from '@apollo/client'
import { formattedDateTime } from 'utils'
import Loading from 'components/Loading'
import Empty from 'components/Empty'
import { useAlert } from 'state/application/hooks'
import { PageHeader, FormInput } from 'pages/styled'

const GET_TASKS = gql`
  query GetUserTasks($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $eventId: String!, $sceneryspotId: String, $categoryId: String) {
    userTasks(
      first: $first
      after: $after
      last: $last
      before: $before
      event_id: $eventId
      sceneryspot_id: $sceneryspotId
      category_id: $categoryId
    ) {
      totalCount
        edges {
          node {
            id
            user {
              id
              wechat
              wechat_name
              wechat_avatar
            }
            task{
              id
              name
              category_id
              category_name
            }
            result
            points
            status
            audit
            create_time
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

const UPDATE_TASK = gql`
  mutation UpdateUserTask($input: UpdateUserTask!) {
    updateUserTask(input: $input) {
      succed
      message
    }
  }
`

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


function TaskModal({ eventId, value, ...props } : { eventId: string, value?: Task } & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()
  const [values, setValues] = useState<{
    id: string
    result: string
    points: number
    status: number
    audit: string
  } | undefined>(undefined)

  const [update, { data, loading }] = useMutation(UPDATE_TASK, {
    onCompleted: () => {
      if (data) {
        const { succed, message } = data.updateUserTask
        if (succed && succed === false) {
          alert({ severity: "error", text: message })
          return
        }
        onClose && onClose({  succed, message }, "escapeKeyDown")
      }
    }
  })

  useEffect(() => {
    if (open && value) {
      const { id, result, points, status, audit } = value
      setValues({ id, result, points, status, audit: audit && audit.length > 0 ? audit : `${points}` })
    }
  }, [open, value]) 

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (values) {
      setValues({ ...values, audit: event.target.value })
    }
  }

  const handleOK = () => {
    if (values) {
      update({ variables: { input: { ...values } } }).catch((e) => alert({ severity: "error", text: e.message }))
    }
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{'审核任务'}</DialogTitle>
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
          <Typography variant="caption" sx={{ mb: 1 }}>{value?.task.category_name}</Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{value?.task.name}</Typography>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"审核积分"}</Typography>
          <FormInput 
            fullWidth 
            id="points-input"
            value={values?.audit}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"结果"}</Typography>
          <Stack direction="column" spacing={0.5}>
            <img alt={value?.task.name} src={`${process.env.REACT_APP_RESOURCES_DOMAIN}` + value?.result} style={{ width: '100%' }} />
            <Typography variant='caption'>
              {value && formattedDateTime(new Date(value.create_time * 1000))}
            </Typography>
          </Stack>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose({})}>{"取消"}</Button>
        <LoadingButton 
          disableElevation
          variant="contained"
          loading={loading}
          onClick={handleOK}
        >
          {"确定"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

interface TabPanelProps {
  value: { id: string }
  index: number
  hidden: boolean
}

interface Task { 
  id: string
  user: {
    id: string
    wechat: string
    wechat_name: string
    wechat_avatar: string
  }
  task: {
    id: string
    name: string
    category_id: string
    category_name: string
  }
  result: string
  points: number
  status: number
  audit: string
  create_time: number
}

interface State {
  first: number
  after?: string
  last: number
  before?: string
  eventId: string
  sceneryspotId?: string
  categoryId?: string
  page: number
  totalCount: number
  startCursor?: string
  endCursor?: string
  value?: Task
  open: boolean
}

export default function SharePanel(props: TabPanelProps) {
  const { value, index, hidden, ...other } = props
  const alert = useAlert()
  const [values, setValues] = useState<State>({
    first: 20, 
    last: 20,
    eventId: value.id,
    categoryId: '62127eeb-29b7-461a-a065-ae62cc5201aa',
    page: 0, 
    totalCount: 0,
    open: false,
  })
  const { first, after, last, before, eventId, sceneryspotId, categoryId } = values
  const { data, loading, refetch } = useQuery(GET_TASKS, { 
    variables: { first, after, last, before, eventId, sceneryspotId, categoryId }, 
    fetchPolicy: "no-cache" 
  })

  useEffect(() => {
    setValues({ ...values, eventId: value.id })
  }, [value])

  const tasks: Task[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.userTasks
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node : Task }) => node) 
    }
    return []
  }, [data])

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

  const handleRefresh = () => {
    refetch({ first, after, last, before, eventId, sceneryspotId, categoryId })
  }
  
  const handleCheck = (value: Task) => () => {
   setValues({ ...values, value, open: true })
  }

  const handleClose = (event: { succed?: boolean }) => {
    setValues({ ...values , value: undefined, open: false })
    console.log({event})
    if (!!event.succed) {
      alert({ severity: "success", text: '已成功审核！' })
      refetch({ first, after, last, before, eventId, sceneryspotId, categoryId })
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
            <Grid item xs={12} sx={{ display: "flex", alignItems: "flex-end", justifyContent: "end" }}>
              <Tooltip arrow title={"刷新"}>
                <IconButton color="primary" aria-label="刷新" onClick={handleRefresh}>
                  <RefreshCw size={20} />
                </IconButton>
              </Tooltip>
            </Grid>
          </PageHeader>
          <TaskModal  
            {...values}
            onClose={handleClose}
          />
          {!loading ? (tasks.length === 0 ? (<Empty />) :(
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"用户"}</TableCell>
                    <TableCell>{"任务"}</TableCell>
                    <TableCell>{"结果"}</TableCell>
                    <TableCell>{''}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.user.wechat_name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.task.name}</Typography>
                        <Typography variant='caption'>{row.task.category_name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Stack direction="column" spacing={0.5}>
                          <img alt={row.task.name} src={`${process.env.REACT_APP_RESOURCES_DOMAIN}` + row.result} style={{ width: 56, height: 56 }} />
                          <Typography variant='caption'>
                            {formattedDateTime(new Date(row.create_time * 1000))}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell scope="row" sx={{ textAlign: "right" }}>
                        <Button variant="text" onClick={handleCheck(row)}>{row.audit && row.audit.length > 0 ? '已审核' : '未审核'}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {values.totalCount > tasks.length && (
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
            )
          ) : (
            <Loading />
          )}
        </Box>
      )}
    </div>
  )
}