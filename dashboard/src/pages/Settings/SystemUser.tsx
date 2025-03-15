import React, { useMemo, useState, useEffect } from 'react'
import { Plus, RefreshCw, Lock, Trash2 } from 'react-feather'
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
  Tooltip,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Switch,
 } from '@mui/material'
 import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import sha1 from 'sha1'
import { formattedDate } from 'utils'
import { PageWrapper } from 'theme/components'
import { useAlert } from 'state/application/hooks'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { PageHeader, Title, LinkButton, StyledCard, FormInput } from 'pages/styled'

const GET_USERS = gql`
  query GetUsers {
    admins {
      id
      loginId
      status
      createTime
    }
  }
`

const CREATE_USER = gql`
  mutation CreateUser($input: NewAccount!) {
    createAccount(input: $input) {
      id
    }
  }
`

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $status: Int) {
    updateAccount(input: { id: $id, status: $status}) {
      succed
      message
    }
  }
`

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    updateAccount(input: {id: $id, status: 4}) {
      succed
      message
    }
  }
`

const RESET_PASSWORD = gql`
  mutation ResetPassword($id: ID!, $password: String!) {
    updateAccount(input: {id: $id, password: $password}) {
      succed
      message
    }
  }
`

interface User {
  loginId: string
  password: string
  role: string
}

interface Row {
  id: string
  loginId: string
  status: number
  createTime: number
}

function UserModal({ value, ...props } : { value?: User } & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<User>({
    loginId: "",
    password: "",
    role: "ADMIN",
  })

  const isValid = values.loginId.length > 0

  const [create, { loading }] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      console.log(data)
      if (data.createAccount && onClose) {
        const { succed, message } = data
        if (succed && succed === false) {
          alert({ severity: "error", text: message })
          return
        }
        onClose(data, "escapeKeyDown")
      }
    },
    refetchQueries: [{ query: GET_USERS }, "GetUsers" ]
  })

  useEffect(() => {
    if (open) {
      if (value) {
        setValues({ ...value })
      } else {
        setValues({
          loginId: "",
          password: "",
          role: "ADMIN",
        })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof User) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleOK = () => {
    create({ variables: { input: { ...values, password: sha1(values.password).toUpperCase()} }}).catch((e) => {
      if (e.message && e.message.indexOf('loginid already exists') > 0) {
        alert({ severity: "error", text: "账号已存在，请重新输入" })
      } else {
        alert({ severity: "error", text: e.message })
      }
    })
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{"添加用户"}</DialogTitle>
      <DialogContent>
        <FormControl variant="standard" sx={{ width: "100%", mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"账号"}</Typography>
          <FormInput 
            fullWidth 
            id="loginId-input"
            value={values.loginId}
            onChange={handleChange("loginId")}
          />
        </FormControl>
        <FormControl variant="standard" sx={{ width: "100%", mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"密码"}</Typography>
          <FormInput 
            fullWidth
            type={"password"}
            id="password-input" 
            value={values.password}
            onChange={handleChange("password")}
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

function PasswordModal({ value, ...props } : { value?: string } & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<{ id: string, password: string }>({
    id: "",
    password: "",
  })

  const isValid = values.id.length > 0 && values.password.length > 0

  const [reset, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: (data) => {
      if (data.updateAccount && onClose) {
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
      setValues({id: value ?? "", password: ""})
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof User) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleOK = () => {
    reset({ variables: { ...values, password: sha1(values.password).toUpperCase() }})
      .then(({ data }) => {
        if (data) {
          alert({ severity: "success", text: '已成功重设密码！' })
        }
      })
      .catch((e) => {
        if (e.message) {
          alert({ severity: "error", text: e.message })
        }
      })
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{"重设密码"}</DialogTitle>
      <DialogContent>
        <FormControl variant="standard" sx={{ width: "100%", mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"密码"}</Typography>
          <FormInput 
            fullWidth
            type={"password"}
            id="password-input" 
            value={values.password}
            onChange={handleChange("password")}
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

interface State {
  value?: User
  open: boolean
  id?: string
  openPasswordModal?: boolean
}

export default function SystemUser() {
  const alert = useAlert()
  const [values, setValues] = useState<State>({ value: undefined, open: false })
  const { data, loading, refetch } = useQuery(GET_USERS, { fetchPolicy: "no-cache" })

  const userRows: Row[] = useMemo(() => {
    if (data) {
      return data.admins
        .map((v: any) => ({ ...v }))
        .sort((a: Row, b: Row) => b.loginId.localeCompare(a.loginId))
    }
    return []
  }, [data])

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const handleRefresh = () => {
    refetch()
  }

  const [updateStatus] = useMutation(UPDATE_USER, { refetchQueries: [{ query: GET_USERS }, "GetUsers" ] })

  const handleStatusChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateStatus({ variables: { id, status: event.target.checked ? 1 : 2 }})
      .catch((e) => alert({ severity: "error", text: e.message }))
  };

  const handleResetPassword = (value: string) => () => {
    setValues({ ...values, id: value, openPasswordModal: true })
  }

  const handleResetPasswordClose = (event: {}) => {
    setValues({ ...values , id: undefined, openPasswordModal: false })
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteUser] = useMutation(DELETE_USER, { refetchQueries: [{ query: GET_USERS }, "GetUsers" ] })

  const handleDelete = (value?: { id: string, name: string}) => () => {
      setDeleteValues({ value, open: true })
  }

  const handleDeleteClose = (event: {}) => {
    setDeleteValues({ value: undefined, open: false })
  }
  
  const handleDeleteConfirm = (value?: { id: string }) => {
    if (value) {
      deleteUser({ variables: { ...value }})
        .then(({ data }) => {
          if (data) {
            alert({ severity: "success", text: '已成功删除数据！' })
            return
          }
        })
        .catch((e) => alert({ severity: "error", text: e.message }))
        .finally(() => setDeleteValues({ value: undefined, open: false }))
    }
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"系统管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"系统用户"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <Button
              disableElevation
              variant="contained" 
              startIcon={<Plus />}
              onClick={handleAdd}
            >
              {"添加"}
            </Button>
            <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<RefreshCw size={20}/>}
              onClick={handleRefresh}
            >
              {"刷新"}
            </LinkButton>
        </Grid>
        </PageHeader>
        <UserModal {...values} onClose={handleClose} />
        <PasswordModal value={values.id} open={values.openPasswordModal ?? false} onClose={handleResetPasswordClose} />
        <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"用户"}</TableCell>
                      <TableCell align="center">{"启用"}</TableCell>
                      <TableCell>{"创建时间"}</TableCell>
                      <TableCell>{''}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userRows.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                        <TableCell scope="row" component="th">
                          <Typography variant="subtitle2">{row.loginId}</Typography>
                        </TableCell>
                        <TableCell scope="row" align="center">
                          <Switch checked={row.status === 1} onChange={handleStatusChange(row.id)} />
                        </TableCell>
                        <TableCell scope="row">
                          <Typography variant='body2'>
                            {row.createTime > 0 ? formattedDate(new Date(row.createTime * 1000)) : "--"}
                          </Typography>
                        </TableCell>
                        <TableCell scope="row" sx={{ textAlign: "right" }}>
                          <Tooltip arrow title={"重置密码"}>
                            <IconButton onClick={handleResetPassword(row.id)}>
                              <Lock size={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip arrow title={"删除用户"}>
                            <IconButton onClick={handleDelete({id: row.id, name: row.loginId})}>
                              <Trash2 size={20} />
                            </IconButton>
                          </Tooltip>
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