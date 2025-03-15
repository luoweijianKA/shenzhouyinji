import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client'
import sha1 from 'sha1'
import {
    styled, 
    Container, 
    Box, 
    Typography, 
    // Avatar,
    FormControlLabel,
    Checkbox,
    FormControl,
    OutlinedInput,
    InputAdornment,
    IconButton,
    Card,
    CardContent,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { Eye, EyeOff } from 'react-feather'
import { useAccountState, useAccountActionHandlers } from 'state/account/hooks'
import { LOGIN } from 'constants/graphql'

const Logo = styled(Box)(() => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginBottom: "2rem",
  
  "& > img": {
    width: "135px"
  }
}))

const Gov = styled(Box)(() => ({
  position: "absolute",
  bottom: 0,
  marginBottom: "2rem",
  fontSize: '14px',

  '& > a': {
    color: 'rgba(0, 0, 0, 0.87)',
  }
}))

const InputLabel = styled(Typography)(() => ({
  margin: '1rem 0px 0.5rem !important',
}))

const StyledOutlinedInput = styled(OutlinedInput)(() => ({
  '& .MuiOutlinedInput-notchedOutline': {
      '& > legend': {
          float: 'left !important',
      }
  },
}));

interface State {
  loginId: string
  password: string
  showPassword: boolean
  rememberMe?: boolean
  loginErrorMessage?: string
}

export default function SignIn() {
  const { t } = useTranslation()
  const { rememberMe } = useAccountState()
  const { onRememberMe, onLogged } = useAccountActionHandlers()

  const [values, setValues] = useState<State>({
    loginId: rememberMe?.loginId ?? '',
    password: '',
    showPassword: false,
    rememberMe: !!rememberMe,
    loginErrorMessage: undefined
  })

  const [ login, { data, loading, error }] = useMutation(LOGIN, {
    // errorPolicy: 'ignore',
    fetchPolicy: "no-cache",
    onCompleted: () => {
      if (data) {
        data.login && onLogged({ ...data.login })
      }
    }
  })

  console.log({ data})

  const isValid = values.loginId && values.loginId.length > 0 && values.password && values.password.length > 0

  // const [login, loginCallback] = useLoginCallback(values.loginId, values.password)
  // const [loginSubmitted, setLoginSubmitted] = useState<boolean>(false)

  // useEffect(() => {
  //   if (login === LoginState.LOGGED) {
  //     setLoginSubmitted(false)
  //   }
  // }, [login, loginSubmitted])

  const handleLogin = useCallback(
    () => {
      onRememberMe(values.rememberMe ? { loginId: values.loginId } : undefined)

      if (isValid) {
        const timestamp = Math.floor(new Date().getTime() / 1000)
        const { loginId } = values
        const password = sha1(values.password).toUpperCase()
        
        login({ variables: { loginId, password, timestamp }}).catch(err => {
          console.log({ err })
          // Mock
          // onLogged({ 
          //   id: "376ac37f-33ea-4fb8-9f09-ba42e51190e7", 
          //   loginId: "18675535133", 
          //   name: "", 
          //   status: "", 
          //   role: "", 
          //   accessToken: "",
          // })
        })
      }
    },
    [onRememberMe, login, values, isValid]
  )

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleFocus = (prop: keyof State) => () => {
    setValues({ ...values, loginErrorMessage: undefined, [prop]: '' })
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (values.loginErrorMessage) {
      setValues({ ...values, loginErrorMessage: undefined })
    }

    if (event && event.key === 'Enter') {
      handleLogin()
    }
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleRememberMe = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target
    setValues({ ...values, rememberMe: checked})
  }

  return (
    <Container sx={{
      maxWidth: '520px !important',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100%',
      flexDirection: 'column',
    }}>
      <Logo>
        <img alt={`${process.env.REACT_APP_NAME}`} src={`/images/logo.jpg`} />
      </Logo>
      <Card sx={{
        p: 2,
        backgroundColor: '#FFF',
        color: 'rgba(0, 0, 0, 0.87)',
        transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        borderRadius: '0.5rem',
        backgroundImage: 'none',
        width: '100%',
        boxShadow: 'rgb(90 114 123 / 11%) 0px 7px 30px 0px',
      }}>
        <CardContent>
        <Typography variant="subtitle2">
          {t("Welcome")}
        </Typography>
        <Box sx={{ mt: '2rem' }}>
          <InputLabel variant="subtitle2">{t('Login Id')}</InputLabel>
          <FormControl sx={{ width: '100%' }} variant="outlined">
            <StyledOutlinedInput
              id="loginId-input"
              type="text"
              value={values.loginId}
              onChange={handleChange('loginId')}
              onFocus={handleFocus('loginId')}
              onKeyUp={handleKeyUp}
            />
          </FormControl>

          <InputLabel variant="subtitle2">{t('Password')}</InputLabel>
          <FormControl sx={{ width: '100%' }} variant="outlined">
            <StyledOutlinedInput
              id="password-input"
              type={values.showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={handleChange('password')}
              onFocus={handleFocus('password')}
              onKeyUp={handleKeyUp}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {values.showPassword ? <EyeOff /> : <Eye />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <Box sx={{
            margin: '1rem 0',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <FormControlLabel 
              control={<Checkbox checked={values.rememberMe} size="small" onChange={handleRememberMe} />} 
              label={t('Remember Me')}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                }
              }}
            />
            {/* <Typography component='a' href="#" sx={{ lineHeight: '2.5' }}>Forgot Password ?</Typography> */}
          </Box>

          <LoadingButton
            fullWidth
            disableElevation
            size="large"
            variant="contained"
            loading={loading}
            disabled={!isValid}
            onClick={handleLogin}
          >
            {t('Sign In')}
          </LoadingButton>

          {error && (
            <Typography 
              variant='subtitle2' 
              color="error"
              sx={{ textAlign: 'center', mt: 2 }}
            >
              {t(error.message)}
            </Typography>
          )}
        </Box>
        </CardContent>
      </Card>
      <Gov>
        <a href='https://beian.miit.gov.cn/' target='_blank' rel="noreferrer">粤ICP备2021054993号-2</a>
      </Gov>
    </Container>
  )
}