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
  Stack,
  CardContent,
  FormControl,
  Autocomplete,
  TextField,
  Checkbox,
  Box,
  CardHeader,
  CardActions,
  Chip,
  InputLabel,
  MenuItem,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  IconButton,
 } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { gql, useQuery, useMutation } from '@apollo/client'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import SelectModal from 'components/Modal/SelectModal'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { useAlert } from 'state/application/hooks'
import { formattedNumerical, formattedDateTime } from 'utils'
import { Title, PageHeader, LinkButton, FormInput } from 'pages/styled'
import { useAccountState } from '../../state/account/hooks'

const GET_ACCOUNT = gql`
  query GetAccount($id: String!) {
    account(id: $id){
      id
      wechat
      wechat_name
      wechat_avatar
      role
      scopes
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
      follow
      like
      joinedEvents {
        id
        name
      }
    }
  }
`

const UPDARE_ACCOUNT = gql`
  mutation UpdateAccount($input: UpdateAccount!) {
    updateAccount(input: $input) {
      succed
      message
    }
  }
`

const RESTORE_ACCOUNT = gql`
  mutation RestoreAccount($userId: ID!, $input: [ID!]) {
    restoreUser(userId: $userId, input: $input) {
      succed
      message
    }
  }
`

const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($id: ID!) {
    deleteAccount(id: $id) {
      id
      loginId
      wechat
      wechat_name
      wechat_avatar
    }
  }
`

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      name
      status
    }
  }
`

const GET_CLAIM_PASSPORTS = gql`
  query GetClaimPassports($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $userId: ID, $eventId: ID) {
    claimPassports(
      first: $first
      after: $after
      last: $last
      before: $before
      userId: $userId
      eventId: $eventId
    ) {
      totalCount
      edges {
        node {
          id
          userId
          userName
          userAvatar
          eventId
          passportCode
          claimBy
          claimTime
          status
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

const UPDATE_PROFILE =  gql`
  mutation UpdateProfile($input: UpdateProfile!) {
    updateProfile(input: $input) {
      succed
      message
    }
  }
`

interface Event {
  id: string
  name: string
}

function useEvents(): Event[] {
  const { data } = useQuery(GET_EVENTS, { fetchPolicy: "no-cache" })

  return useMemo(() => {
    if (data) {
      return data.events
    }
    return []
  }, [data])
}

function EventSelect({ options }: { options?: { id: string, name: string }[] }) {
  return (
    <Autocomplete
      multiple
      disabled
      size="small"
      id="event-select"
      sx={{
        "& .MuiOutlinedInput-notchedOutline": {
          top: 0,
          "& > legend": {
            float: "left",
          }
        }
      }}
      options={options ?? []}
      value={options}
      disableCloseOnSelect
      getOptionLabel={(option) => option.name}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.name}
        </li>
      )}
      style={{ width: "100%" }}
      renderInput={(params) => (
        <TextField {...params} label={""}/>
      )}
    />
  );
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

interface Passport {
  id: string
  code: string
  userId: string
  userName: string
  eventId: string
  passportCode: string
  claimBy: string
  claimTime: number
  status: number
}

interface PassportCardProps {
  userId: string
  events: Event[]
}

function PassportCard(props: PassportCardProps) {
  const { events } = props 
  const [values, setValues] = useState<{
    first: number
    after?: string
    last: number
    before?: string
    userId?: string
    eventId?: string
    page: number
    totalCount: number
    startCursor?: string
    endCursor?: string
  }>({ 
    first: 20, 
    last: 20, 
    userId: props.userId,
    page: 0, 
    totalCount: 0,
  })
  const { first, after, last, before, userId, eventId } = values
  const { data, loading } = useQuery(GET_CLAIM_PASSPORTS, { variables: { first, after, last, before, userId, eventId }, fetchPolicy: "no-cache" })

  const passports: Passport[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.claimPassports
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node: Passport }) => node) 
    }
    return []
  }, [data])

  const handleEventChange = (event: SelectChangeEvent) => {
    setValues({ 
      ...values,
      after: undefined,
      before: undefined,
      page: 0,
      eventId: event.target.value as string,
    })
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
    <Card sx={{
        backgroundColor: "rgb(255, 255, 255)",
        color: "rgba(0, 0, 0, 0.87)",
        transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        overflow: "hidden",
        borderRadius: "20px",
        margin: "15px",
        boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
    }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ margin: "0px 0px 8px", fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 }}>
            {"发放记录"}
          </Typography>
        } 
      />
        <CardContent sx={{
          p: 3,
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
          <FormControl size="small" sx={{ minWidth: 235 }}>
            <InputLabel id="event-select-label">{"活动"}</InputLabel>
            <Select
              labelId="event-select-label"
              id="event-select"
              value={values.eventId}
              label={"活动"}
              onChange={handleEventChange}
            >
              {events && events.map((v: Event) => (<MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>))}
            </Select>
          </FormControl>
           {!loading ? (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"护照号码"}</TableCell>
                      <TableCell>{"持有用户"}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {passports.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.passportCode}</Typography>
                       <Typography variant='caption'>{formattedDateTime(new Date(row.claimTime * 1000))}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th" sx={{ verticalAlign: 'text-top'}}>
                       <Typography variant='body2'>{row.userName}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
          </TableContainer>
          ) : (
            <Loading />
        )}
      </CardContent>
      {!loading && passports.length > 0 && (
          <CardActions sx={{ justifyContent: "center", gap: "0.5rem", p: 2 }}>
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
          </CardActions>
        )}
    </Card>
  )
}

interface State {
  id: string
  avatar: string
  name: string
  role: Role
  scopes?: string[]
  wechatId: string
  gender: string
  phone: string
  email: string
  city: string
  joinedEvents: { id: string, name: string }[]
  follow: number
  like: number
  createTime: number
}

type Role = 'USER' | 'OPERATOR'

export default function UserDetails({
  match: {
    params: { id }
  },
  history,
}: RouteComponentProps<{ id: string }>) {
  const alert = useAlert()
  const { account } = useAccountState()
  const events = useEvents()
  const [values, setValues] = useState<State | undefined>(undefined)
  const { data, loading, refetch } = useQuery(GET_ACCOUNT, { variables: { id }, fetchPolicy: "no-cache" })

  const [updateAccount] = useMutation(UPDARE_ACCOUNT, {
    refetchQueries: [
      { query: GET_ACCOUNT, variables: { id } },
      "GetAccount",
    ]
  })

  const [updateProfile] = useMutation(UPDATE_PROFILE,)

  useEffect(() => {
    if (data && data.account) {
      const { 
        id, 
        role,
        wechat_avatar: avatar,
        wechat_name: name,
        wechat: wechatId,
        create_time: createTime,
        profile: { gender, phone, email, city },
        follow,
        like,
        joinedEvents,
      } = data.account
      setValues({
        id,
        avatar,
        name,
        role,
        wechatId,
        gender,
        phone,
        email,
        city,
        joinedEvents,
        follow,
        like,
        createTime: createTime, 
      })
    }
  }, [data])

  const handleRefresh = () => {
    refetch({ id })
  }

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (values) {
      setValues({ ...values, [prop]: event.target.value })
    }
  }

  const [roleValues, setRoleValues] = useState<{ 
    options: { id: string, name: string }[],
    title: string,
    value?: { id: string, role: Role },
    open: boolean,
  }>({ 
    options: [],
    title: '选择活动',
    open: false 
  })

  const handleChangeRole = (role: Role) => () => {
    if (values) {
      const { id  } = values

      if (role === 'USER') {
        const input = {
          id,
          wechat_name: '',
          wechat_avatar: '',
          status: 0,
          role,
          scopes: [],
        }
        console.log({ input })
        updateAccount({ variables: { input }})
          .catch((e) => alert({ severity: "error", text: e.message }))
        return
      }
      
      setRoleValues({ ...roleValues, value: { id, role }, open: true })
    }
  }

  const handleRoleClose = (event: {}) => {
    setRoleValues({ ...roleValues, open: false })
  }
  
  const handleRoleConfirm = (value: ({ id: string, name: string } | undefined)[])  => {
    if (roleValues.value) {
      const { id, role  } = roleValues.value
      const scopes = value.filter(v => !!v).map(v => v?.id)
      const input = {
        id,
        wechat_name: '',
        wechat_avatar: '',
        status: 0,
        role,
        scopes,
      }
      console.log({ input })
      updateAccount({ variables: { input }})
        .catch((e) => alert({ severity: "error", text: e.message }))
        .finally(() => setRoleValues({ ...roleValues, value: undefined, open: false }))
    } else {
      setRoleValues({ ...roleValues, value: undefined, open: false })
    }
  }

  const [deleteValues, setDeleteValues] = useState<{ 
    options: { id: string, name: string }[],
    title: string,
    open: boolean,
  }>({ 
    options: [],
    title: '选择要清除数据的活动',
    open: false 
  })
  const [restoreAccount] = useMutation(RESTORE_ACCOUNT)

  const handleDelete = () => {
    setDeleteValues({ ...deleteValues, open: true })
  }

  const handleDeleteClose = (event: {}) => {
    setDeleteValues({ ...deleteValues, open: false })
  }
  
  const handleDeleteConfirm = (value: ({ id: string, name: string } | undefined)[])  => {
    if (values && value.length > 0) {
      const { id } = values
      restoreAccount({ variables: { userId: id, input: value.map(v => v?.id) }})
        .then(({ data }) => {
          if (data && data.restoreUser) {
            alert({ severity: "success", text: '已成功清除数据！' })
            refetch({ id })
          }
          
        })
        .catch((e) => alert({ severity: "error", text: e.message }))
        .finally(() => setDeleteValues({ ...deleteValues, open: false }))
    } else {
      setDeleteValues({ ...deleteValues, open: false })
    }
  }

  const handleChangeProfile = () => {
    if (values) {
      const { id,  gender, phone, email } = values

      const input = {
        id,
        name: '',
        gender,
        email,
        phone,
        city: '',
        tags: '',
        nric: '',
        authentication: false,
        profession: '',
        guardian_name: '',
        guardian_nric: '',
        guardian_phone: ''
      }

      updateProfile({ variables: { input } })
        .then(({ data }) => {
          if (data && data.updateProfile) {
            const { succed, message } = data.updateProfile
            if (succed) {
              alert({ severity: "success", text: '已成功更新！' })
            } else {
              alert({ severity: "error", text: message })
            }
          }
        })
        .catch((e) => alert({ severity: "error", text: e.message }))
    }
  }

  const [accountValues, setAccountValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteAccount] = useMutation(DELETE_ACCOUNT)

  const handleDeleteAccount = () => {
    setAccountValues({ ...accountValues, open: true })
  }

  const handleDeleteAccountClose = (event: {}) => {
    setAccountValues({ value: undefined, open: false })
  }

  const handleDeleteAccountConfirm = (value?: { id: string }) => {
    if (id) {
      deleteAccount({ variables: { id }})
        .then(({ data }) => {
          if (data) {
            alert({ severity: "success", text: '已成功删除数据！' })
            history.goBack()
          }
        })
        .catch((e) => {
          if (e.message && e.message.indexOf("Permissions Denied") > -1) {
            alert({ severity: "error", text: '权限不足，无法注销用户！' })
            return
          }
          alert({ severity: "error", text: e.message })
        })
        .finally(() => {
          setAccountValues({ value: undefined, open: false })
        })
    } else {
      setAccountValues({ value: undefined, open: false })
    }
  }

  return (
    <PageWrapper>
      <PageHeader container>
        <Grid item xs={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="#/user">{"用户管理"}</Link>
            {values && (<Typography color="text.primary">{values.name}</Typography>)}
          </Breadcrumbs>
          <Title>{"用户详情"}</Title>
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
          <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<ChevronLeft size={20} />}
              href="#/user"
            >
            {"返回"}
          </LinkButton>
        </Grid>
      </PageHeader>
      <SelectModal title={roleValues.title} open={roleValues.open} options={events} onClose={handleRoleClose} onConfirm={handleRoleConfirm} />
      <SelectModal {...deleteValues} options={values?.joinedEvents ?? []} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
      <DeleteConfirmModal {...accountValues} onClose={handleDeleteAccountClose} onConfirm={handleDeleteAccountConfirm} />
      {loading && (<Loading />)}
      {values && (
        <Grid container sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexFlow: 'row wrap',
            width: '100%',
        }}>
            <Grid item xs={12} md={12} lg={4}>
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
                    <CardHeader
                      action={
                        values.role === 'OPERATOR' && (<Chip label="工作人员" variant="outlined" color="primary" />)
                      } 
                    />
                    <Avatar alt={values.name} src={process.env.REACT_APP_RESOURCES_DOMAIN + values.avatar} sx={{ width: 96, height: 96 }} />
                    <Typography variant="h2" sx={{
                      margin: "8px 0px 0px",
                      fontWeight: 500,
                      fontSize: "1.5rem",
                      lineHeight: 1.5,
                    }}>
                      {values.name}
                    </Typography>
                    <Typography variant="body2">{values.wechatId}</Typography>
                    <Typography variant="h6" sx={{
                      margin: "24px 0px 8px",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      fontWeight: 600,
                    }}>{"注册时间"}</Typography>
                    <Typography variant="body2">{formattedDateTime(new Date(values.createTime * 1000))}</Typography>
                    <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 3 }}>
                      <Box sx={{ width: "100%" }}>
                        <Typography variant="h1" sx={{
                          margin: 0,
                          fontSize: "1.875rem",
                          lineHeight: 1.5,
                          fontWeight: 500,
                        }}>{formattedNumerical(values.follow, 0)}</Typography>
                        <Typography variant="h6" sx={{
                          margin: 0,
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                          fontWeight: 400,
                          color: "rgb(119, 126, 137)",
                          opacity: 0.6,
                        }}>{"关注粉丝"}</Typography>
                      </Box>
                      <Box sx={{ width: "100%" }}>
                        <Typography variant="h1" sx={{
                          margin: 0,
                          fontSize: "1.875rem",
                          lineHeight: 1.5,
                          fontWeight: 500,
                        }}>{formattedNumerical(values.like, 0)}</Typography>
                        <Typography variant="h6" sx={{
                          margin: 0,
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                          fontWeight: 400,
                          color: "rgb(119, 126, 137)",
                          opacity: 0.6,
                        }}>{"获得点赞"}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                      {values.role === 'USER' && (<Button variant="contained" onClick={handleChangeRole('OPERATOR')}>{"设为工作人员"}</Button>)}
                      {values.role === 'OPERATOR' && (<Button variant="contained" onClick={handleChangeRole('USER')}>{"设为普通用户"}</Button>)}
                      <Button variant="contained" onClick={handleDelete}>{"清除数据"}</Button>
                      {account && account.role === 'ROOT' && <Button variant="contained" onClick={handleDeleteAccount}>{"注销用户"}</Button>}
                    </Stack>
                </Card>
            </Grid>
            <Grid item xs={12} md={12} lg={8}>
                <Card sx={{
                    backgroundColor: "rgb(255, 255, 255)",
                    color: "rgba(0, 0, 0, 0.87)",
                    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    overflow: "hidden",
                    borderRadius: "20px",
                    margin: "15px",
                    boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
                }}>
                  <CardHeader sx={{ p: 3 }}
                    title={
                      <Typography variant="h6" sx={{ margin: "0px 0px 8px", fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 }}>
                        {"用户详情"}
                      </Typography>
                    } 
                  />
                  <CardContent sx={{
                    p: 3,
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
                    {/* <FormControl variant="standard">
                      <Typography variant="subtitle2">{"性别"}</Typography>
                      <FormInput 
                        fullWidth
                        id="gender-input"
                        value={values.gender}
                        onChange={handleChange("gender")}
                      />
                    </FormControl> */}
                    <FormControl variant="standard">
                      <Typography variant="subtitle2">{"手机"}</Typography>
                      <FormInput 
                        fullWidth
                        id="phone-input"
                        value={values.phone}
                        onChange={handleChange("phone")}
                      />
                    </FormControl>
                    <FormControl variant="standard">
                      <Typography variant="subtitle2">{"邮箱"}</Typography>
                      <FormInput 
                        fullWidth
                        id="email-input"  
                        value={values.email}
                        onChange={handleChange("email")}
                      />
                    </FormControl>
                    <FormControl variant="standard">
                      <Typography variant="subtitle2">{"参与活动"}</Typography>
                      <EventSelect options={values.joinedEvents} />
                    </FormControl>
                  </CardContent>
                  <CardActions sx={{ padding: '0 24px 24px' }}>
                    <Button variant="contained" onClick={handleChangeProfile}>{"更新"}</Button>
                  </CardActions>
                </Card>
                {values.role === 'OPERATOR' && (<PassportCard userId={values.id} events={events} />)}
            </Grid>
        </Grid>
      )}
    </PageWrapper>
  )
}