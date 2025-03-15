import React, { useState, useEffect } from 'react'
import sha1 from 'sha1'
import { Eye, EyeOff } from 'react-feather'
import { useTranslation } from 'react-i18next'
import {
  styled,
  Typography,
  Button,
  FormControl,
  OutlinedInput,
  InputAdornment,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import LoadingButton from '@mui/lab/LoadingButton'
import { useMutation } from '@apollo/client'
import { CHANGE_PASSWORD } from 'constants/graphql'
import { useAlert } from 'state/application/hooks'
import { useAccountState } from "state/account/hooks"

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
}))

interface State {
  password: string
  showPassword: boolean
  newPassword: string
  showNewPassword: boolean
  confirmPassword: string
  showConfirmPassword: boolean
  errorMessage?: string
}

export default function ChangePasswordModal({ onDismiss, ...props } : {
  onDismiss?: (value?: string) => void 
} & DialogProps) {
  const { t } = useTranslation()
  const alert = useAlert()
  const { account } = useAccountState()
  const { open } = props
  const [values, setValues] = useState<State>({
    password: '',
    showPassword: false,
    newPassword: '',
    showNewPassword: false,
    confirmPassword: '',
    showConfirmPassword: false,
    errorMessage: undefined
  })

  const isValid = account 
    && values.password.length > 0 
    && values.newPassword.length > 0 
    && values.newPassword === values.confirmPassword

  useEffect(() => {
    if (open) {
      setValues({ 
        password: '',
        showPassword: false,
        newPassword: '',
        showNewPassword: false,
        confirmPassword: '',
        showConfirmPassword: false,
        errorMessage: undefined
      })
    }
  }, [open])

  const [changePassword, { data, loading }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      data && onDismiss && onDismiss(data.updatePassword)
    }
  })

  const handleClose = () => {
    onDismiss && onDismiss(undefined)
  }

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleFocus = (prop: keyof State) => () => {
    setValues({ ...values, errorMessage: undefined, [prop]: '' })
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (values.errorMessage) {
      setValues({ ...values, errorMessage: undefined })
    }

    if (event && event.key === 'Enter') {
      handleOK()
    }
  }

  const handleClickShowPassword = (prop: keyof State) => () => {
    setValues({
      ...values,
      [prop]: !values[prop],
    });
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }

  const handleOK = () => {
    if (isValid) {
      const { id } = account
      const password = sha1(values.password).toUpperCase()
      const newPassword = sha1(values.newPassword).toUpperCase()

      changePassword({ variables: { id, password, newPassword } }).catch(e => {
        setValues({ ...values, errorMessage: e.message })
        alert({ severity: "error", text: e.message })
      })
    }
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{t("Change Password")}</DialogTitle>
      <DialogContent>
        <Typography component={Label}>{t('Password')}</Typography>
            <FormControl sx={{ width: '100%' }} variant="outlined">
              <StyledOutlinedInput
                id="old-password-input"
                type={values.showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange('password')}
                onFocus={handleFocus('password')}
                onKeyUp={handleKeyUp}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword('showPassword')}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                    >
                        {values.showPassword ? <EyeOff /> : <Eye />}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("Cancel")}</Button>
        <LoadingButton 
          disableElevation 
          variant="contained"
          disabled={!isValid}
          loading={loading}
          onClick={handleOK}
        >
          {t("OK")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
