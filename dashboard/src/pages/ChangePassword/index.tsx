import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    styled,
    Grid,
    Box, 
    Typography,
    Card,
    CardHeader,
    CardContent,
    Button,
    FormControl,
    OutlinedInput,
    InputAdornment,
    IconButton,
    CircularProgress,
 } from '@mui/material'
import { Eye, EyeOff } from 'react-feather'
import { PageWrapper } from '../../theme/components'

const Label = styled('label')(() => ({
  margin: '1rem 0px 0.5rem !important',
  fontWeight: '500',
  fontSize: '0.875rem',
  lineHeight: '1.5',
  fontFamily: '"DM Sans", sans-serif',
  display: 'block',
}))

const StyledOutlinedInput = styled(OutlinedInput)(() => ({
  '& .MuiOutlinedInput-notchedOutline': {
      '& > legend': {
          float: 'left !important',
      }
  },
}));

interface State {
  oldPassword: string
  showOldPassword: boolean
  newPassword: string
  showNewPassword: boolean
  confirmPassword: string
  showConfirmPassword: boolean
  passwordErrorMessage?: string
}

export default function ChangePassword() {
  const { t } = useTranslation()

  const [values, setValues] = useState<State>({
    oldPassword: '',
    showOldPassword: false,
    newPassword: '',
    showNewPassword: false,
    confirmPassword: '',
    showConfirmPassword: false,
    passwordErrorMessage: undefined
  })

  const isValid = values.oldPassword.length > 0
    && values.newPassword.length > 0
    && values.newPassword === values.confirmPassword

  const handleChangePassword = () => {}

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleFocus = (prop: keyof State) => () => {
    setValues({ ...values, passwordErrorMessage: undefined, [prop]: '' })
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (values.passwordErrorMessage) {
      setValues({ ...values, passwordErrorMessage: undefined })
    }

    if (event && event.key === 'Enter') {
      //
    }
  }

  const handleClickShowPassword = (prop: keyof State) => () => {
    setValues({
      ...values,
      [prop]: !values[prop],
    });
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <PageWrapper>
       <Grid container>
            <Grid item xs={6}>
      <Card sx={{
        backgroundColor: 'rgb(255, 255, 255)',
        color: 'rgba(0, 0, 0, 0.87)',
        transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        overflow: 'hidden',
        borderRadius: '20px',
        padding: '14px',
        margin: '15px',
        boxShadow: 'rgb(90 114 123 / 11%) 0px 7px 30px 0px'
      }}>
        <CardHeader 
          title={
            <Typography variant="h3" sx={{
              margin: 0,
              fontWeight: 500,
              fontSize: '1.125rem',
              lineHeight: 1.5,
            }}
            >
              {t('Login Password')}
            </Typography>
          }
        />
        <CardContent>
          <Box>
            <Typography component={Label}>{t('Old Password')}</Typography>
            <FormControl sx={{ width: '100%' }} variant="outlined">
              <StyledOutlinedInput
                id="old-password-input"
                type={values.showOldPassword ? 'text' : 'password'}
                value={values.oldPassword}
                onChange={handleChange('oldPassword')}
                onFocus={handleFocus('oldPassword')}
                onKeyUp={handleKeyUp}
                endAdornment={
                    <InputAdornment position="end">
                    <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword('showOldPassword')}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                    >
                        {values.showOldPassword ? <EyeOff /> : <Eye />}
                    </IconButton>
                    </InputAdornment>
                }
              />
            </FormControl>
            
            <Typography component={Label}>{t('New Password')}</Typography>
            <FormControl sx={{ width: '100%' }} variant="outlined">
              <StyledOutlinedInput
                id="new-password-input"
                type={values.showNewPassword ? 'text' : 'password'}
                value={values.newPassword}
                onChange={handleChange('newPassword')}
                onFocus={handleFocus('newPassword')}
                onKeyUp={handleKeyUp}
                endAdornment={
                    <InputAdornment position="end">
                    <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword('showNewPassword')}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                    >
                        {values.showNewPassword ? <EyeOff /> : <Eye />}
                    </IconButton>
                    </InputAdornment>
                }
              />
            </FormControl>

            <Typography component={Label}>{t('Confirm Password')}</Typography>
            <FormControl sx={{ width: '100%' }} variant="outlined">
              <StyledOutlinedInput
                id="confirm-password-input"
                type={values.showConfirmPassword ? 'text' : 'password'}
                value={values.confirmPassword}
                onChange={handleChange('confirmPassword')}
                onFocus={handleFocus('confirmPassword')}
                onKeyUp={handleKeyUp}
                endAdornment={
                    <InputAdornment position="end">
                    <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword('showConfirmPassword')}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                    >
                        {values.showConfirmPassword ? <EyeOff /> : <Eye />}
                    </IconButton>
                    </InputAdornment>
                }
              />
            </FormControl>
            
            <Box sx={{ mt: '2rem' }}>
              <Button 
                variant="contained"
                color={values.passwordErrorMessage ? 'error' : 'primary'}
                disabled={!isValid}
                sx={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '1rem',
                    height: '40px'
                }}
                onClick={handleChangePassword}
              >
                {false 
                  ? <CircularProgress color='inherit' size="2rem" />
                  : t(values.passwordErrorMessage ? values.passwordErrorMessage : 'Submit')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      </Grid>
      </Grid>
    </PageWrapper>
  )
}