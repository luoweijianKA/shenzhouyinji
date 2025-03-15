import React, { useState, useMemo, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ChevronLeft, RefreshCw } from 'react-feather'
import {
  Grid,
  Typography,
  Breadcrumbs,
  Avatar,
  Link,
  Button,
  Card,
  CardContent,
  CardHeader,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  Box,
  IconButton,
  TablePagination,
 } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import { formattedDate, formattedDateTime } from 'utils'
import { Title, PageHeader, LinkButton } from 'pages/styled'
import Empty from 'components/Empty'

const GET_PASSPORT = gql`
  query GetPassport($id: String!) {
    passport(id: $id) {
      id
      code
      status
      event_passport {
        id
        eventId
        name
        nric
        phone
        gender
        profession
        guardianName
        guardianNric
        guardianPhone
        claimBy
        claimTime
        status
      }
      user {
        id
        wechat
        wechat_name
        wechat_avatar
        role
        status
        create_time
        profile {
          name
          gender
          age
          email
          phone
          city
        }
      }
    }
  }
`

const GET_USER_EVENT = gql`
  query GetUserEvents($userId: String!, $eventId: String, $status: Int) {
    userEvents(userId: $userId, eventId: $eventId, status: $status) {
      id
      name
      images
      start_time
      end_time
      status
      passport_code
      camp_id
      camp_name
      camp_points
      camp_ranking
      user_points
      user_ranking
      user_honour
    }
  }
`

const GET_ACCOUNT = gql`
  query GetAccount($id: String!) {
    account(id: $id){
      id
      wechat
      wechat_name
      wechat_avatar
    }
  }
`

const GET_USER_POINTS = gql`
  query GetUserPoints($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $userId: ID!, $eventId: ID, $timestamp: Int) {
    userPoints(
      first: $first
      after: $after
      last: $last
      before: $before
      userId: $userId
      eventId: $eventId
      timestamp: $timestamp
    ) {
      totalCount
      edges {
        node {
          id
          userId
          content
          op
          points
          createTime
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

interface Event {
  id: string
  name: string
  images: string
  start_time: number
  end_time: number
  status: number
  passport_code: string
  camp_id: string
  camp_name: string
  camp_points: number
  camp_ranking: number
  user_points: number
  user_ranking: number
  user_honour: string
}

interface Pagination {
  first: number
  after?: string
  last: number
  before?: string
  page: number
  totalCount: number
  startCursor?: string
  endCursor?: string
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

interface Point {
  id: string
  userId: string
  content: string
  op: string
  points: number
  createTime: number
}

interface PointCardProps {
  userId?: string
  eventId?: string
}

function PointCard(props: PointCardProps) {
  const { userId, eventId } = props
  const [fetch, { data }] = useLazyQuery(GET_USER_POINTS, { fetchPolicy: "no-cache" })

  const [values, setValues] = useState<Pagination>({ 
    first: 10, 
    last: 10, 
    page: 0, 
    totalCount: 0,
  })
  const { first, after, last, before } = values

  const points: Point[] | undefined = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.userPoints
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node: Point }) => node) 
    }

    return undefined
  }, [data])

  useEffect(() => {
    if (userId && eventId) {
      fetch({ variables: { first, after, last, before, userId, eventId }})
    }
  }, [fetch, first, after, last, before, userId, eventId])

  if (!points) {
    return (<Loading height='auto' />)
  }

  if (points.length === 0) {
    return (<Empty />)
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

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
      <Table>
        <TableBody>
          {points.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
              <TableCell scope="row" component="th">
                <Typography variant='body2'>{row.content}</Typography>
                <Typography variant='caption'>{formattedDateTime(new Date(row.createTime * 1000))}</Typography>
              </TableCell>
              <TableCell scope="row" component="th">
                <Typography variant='subtitle1'>{`${row.op} ${row.points}`}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter sx={{ display: "flex", justifyContent: "center" }}>
          {values.totalCount > first && (
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
          )}
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

function useUserEvent(userId?: string, eventId?: string): Event | undefined {
  const [result, setResult] = useState<Event | undefined>(undefined)
  const [fetch, { data }] = useLazyQuery(GET_USER_EVENT, { fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (userId && eventId) {
      fetch({ variables: { userId, eventId } })
    }
  }, [fetch, userId, eventId])
  
  useEffect(() => {
    if (data && data.userEvents.length) {
      setResult({ ...data.userEvents[0] })
    }
  }, [data])

  return result
}

interface Account {
  id: string
  wechat: string
  wechat_name: string
  wechat_avatar: string
}

function useAccount(id?: string): Account | undefined {
  const [result, setResult] = useState<Account | undefined>(undefined)
  const [fetch, { data }] = useLazyQuery(GET_ACCOUNT, { fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (id) {
      fetch({ variables: { id } })
    }
  }, [fetch, id])
  
  useEffect(() => {
    if (data) {
        setResult({ ...data.account })
    }
  }, [data])

  return result
}

interface State {
  id: string
  code: string
  status: number
  event_passport: {
    id: string
    eventId: string
    name: string
    nric: string
    phone: string
    gender: string
    profession: string
    guardianName: string
    guardianNric: string
    guardianPhone: string
    claimBy: string
    claimTime: number
    status: number
  }
  user: {
    id: string
    wechat: string
    wechat_name: string
    wechat_avatar: string
    role: string
    status: number
    create_time: number
    profile: {
      name: string
      gender: string
      age: number
      email: string
      phone: string
      city: string
    }
  }
}

export default function PassportDetails({
  match: {
    params: { id }
  },
  history,
}: RouteComponentProps<{ id: string }>) {
  const [values, setValues] = useState<State | undefined>(undefined)
  const { data, loading, refetch } = useQuery(GET_PASSPORT, { variables: { id }, fetchPolicy: "no-cache" })
  const claim = useAccount(values?.event_passport?.claimBy)
  const event = useUserEvent(values?.user?.id, values?.event_passport?.eventId)

  useEffect(() => {
    if (data) {
      setValues({ ...data.passport })
    }
  }, [data])

  const handleRefresh = () => {
    refetch({ id })
  }

  const eventRows = useMemo(() => {
     if (event) {
      return [
        { name: '活动名称', value: event.name },
        { name: '开始时间', value: formattedDate(new Date(event.start_time * 1000))},
        { name: '结束时间', value: formattedDate(new Date(event.end_time * 1000))},
        { name: '状态', value: event.status === 1 ? '进行中' : (event.status === 2 ? '已结束' : '-') },
        { name: '所在阵营', value: event.camp_name ?? '-' },
        { name: '阵营积分', value: event.camp_points },
        { name: '阵营排名', value: event.camp_ranking },
        { name: '用户积分', value: event.user_points },
        { name: '用户排名', value: event.user_ranking },
        { name: '用户荣誉', value: event.user_honour },
      ]
    }

    return undefined
  }, [event])

  const passportRows = useMemo(() => {
    if (data) {
      const { code, status, event_passport } = data.passport
      const value = [
        { name: '护照号码', value: code },
        { name: '状态', value: status === 0 ? '未领取' : (status === 1 ? '已领取' : '已绑定') },
        { name: '姓名', value: event_passport.name },
        { name: '身份证号', value: event_passport.nric },
        { name: '手机号码', value: event_passport.phone },
        { name: '性别', value: event_passport.gender },
        { name: '职业', value: event_passport.profession },
        { name: '监护人姓名', value: event_passport.guardianName },
        { name: '监护人身份证号', value: event_passport.guardianNric },
        { name: '监护人手机号码', value: event_passport.guardianPhone },
      ]
      if (claim) {
        return [
          ...value,
          { name: '发放人员', value: claim.wechat_name },
          { name: '发放时间', value: formattedDateTime(new Date(event_passport.claimTime * 1000)) },
        ]
      }
      return value
    }

    return undefined
  }, [data, claim])

  return (
    <PageWrapper>
      <PageHeader container>
        <Grid item xs={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">{"护照管理"}</Typography>
            <Link underline="hover" color="inherit" href="#/passport/search">{"护照搜索"}</Link>
          </Breadcrumbs>
          <Title>{"护照详情"}</Title>
        </Grid>
        <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
          <LinkButton
            disableElevation
            variant="contained" 
            startIcon={<RefreshCw size={20}/>}
            onClick={handleRefresh}
          >
            {"刷新"}
          </LinkButton>
          <Button
              disableElevation
              variant="contained" 
              startIcon={<ChevronLeft size={20} />}
              onClick={() => history.goBack()}
            >
            {"返回"}
          </Button>
        </Grid>
      </PageHeader>
      {loading && (<Loading />)}
      {values && (
        <Grid container sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexFlow: 'row wrap',
            width: '100%',
        }}>
            <Grid item xs={12} md={12} lg={8}>
                <Card sx={{
                    backgroundColor: "rgb(255, 255, 255)",
                    color: "rgba(0, 0, 0, 0.87)",
                    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    overflow: "hidden",
                    borderRadius: "20px",
                    margin: "15px",
                    boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
                    padding: "16px",
                }}>
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ margin: "0px 0px 8px", fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 }}>
                        {"护照信息"}
                      </Typography>
                    } 
                  />
                  <CardContent sx={{
                    p: 2,
                    pt: 0,
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
                  <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table aria-label="simple table">
                        <TableBody>
                        {passportRows && passportRows.map((row) => (
                          <TableRow
                            key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row" sx={{ pl: 0, fontWeight: 500 }}>
                              {row.name}
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 0 }}>
                            <Typography variant="body2">{row.value}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
              <Card sx={{
                    backgroundColor: "rgb(255, 255, 255)",
                    color: "rgba(0, 0, 0, 0.87)",
                    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    overflow: "hidden",
                    borderRadius: "20px",
                    margin: "15px",
                    boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
                    padding: "16px",
                }}>
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ margin: "0px 0px 8px", fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 }}>
                        {"积分明细"}
                      </Typography>
                    } 
                  />
                  <CardContent sx={{
                    p: 2,
                    pt: 0,
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
                    <PointCard userId={values.user?.id} eventId={values.event_passport?.eventId} />
                  </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={12} lg={4}>
                <Card sx={{
                    backgroundColor: "rgb(255, 255, 255)",
                    color: "rgba(0, 0, 0, 0.87)",
                    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    overflow: "hidden",
                    borderRadius: "20px",
                    margin: "15px",
                    boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
                    padding: "16px",
                }}>
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ margin: "0px 0px 8px", fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 }}>
                        {"持照用户"}
                      </Typography>
                    } 
                  />
                  {values.user ? (
                    <CardContent>
                      <Avatar 
                        alt={values.user.wechat_name} 
                        src={process.env.REACT_APP_RESOURCES_DOMAIN + values.user.wechat_avatar} 
                        sx={{ width: 96, height: 96 }}
                      />
                      <Typography variant="h2" sx={{
                        margin: "8px 0px 0px",
                        fontWeight: 500,
                        fontSize: "1.5rem",
                        lineHeight: 1.5,
                        }}>
                        {values.user.wechat_name}
                      </Typography>
                      <Typography variant="body2">{values.user.wechat}</Typography>
                      <Typography variant="h6" sx={{
                        margin: "24px 0px 8px",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                        fontWeight: 600,
                        }}>
                        {"注册时间"}
                      </Typography>
                      <Typography variant="body2">{formattedDateTime(new Date(values.user.create_time * 1000))}</Typography>
                    </CardContent>
                  ) : (
                    <CardContent>
                      <Typography variant="body2">{'未绑定'}</Typography>
                    </CardContent>
                  )}
                </Card>
                {eventRows && (
                  <Card sx={{
                    backgroundColor: "rgb(255, 255, 255)",
                    color: "rgba(0, 0, 0, 0.87)",
                    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    overflow: "hidden",
                    borderRadius: "20px",
                    margin: "15px",
                    boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
                    padding: "16px",
                }}>
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ margin: "0px 0px 8px", fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 }}>
                        {"归属活动"}
                      </Typography>
                    } 
                  />
                  <CardContent sx={{
                    p: 2,
                    pt: 0,
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
                   <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table aria-label="simple table">
                        <TableBody>
                        {eventRows.map((row) => (
                          <TableRow
                            key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row" sx={{ pl: 0, fontWeight: 500 }}>
                              {row.name}
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 0 }}>
                            <Typography variant="body2">{row.value}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                  </CardContent>
                </Card>
              )}
            </Grid>
        </Grid>
      )}
    </PageWrapper>
  )
}