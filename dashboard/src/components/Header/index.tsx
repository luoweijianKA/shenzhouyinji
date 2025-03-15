import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import { 
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Link,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Stack,
  Avatar,
  Tooltip,
} from '@mui/material'
import { deepOrange } from '@mui/material/colors'
import { Menu as MenuIcon, MessageSquare, Settings, Lock, LogOut } from 'react-feather'
import ChangePasswordModal from "components/ChangePasswordModal"
import { useLogout } from 'hooks'
import { useNavToggle } from '../../state/application/hooks'
import { useAccountState } from 'state/account/hooks'
import Message from "./Message"

const HeaderWrapper = styled(AppBar)`
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  position: fixed;
  z-index: 1100;
  top: 0px;
  left: auto;
  right: 0px;
  color: rgb(255, 255, 255) !important;
  padding-left: 0px;
  background-color: rgb(255, 255, 255) !important;
  box-shadow: rgb(90 114 123 / 11%) 0px 7px 30px 0px !important;
`

const HeaderBrand = styled.div`
  display: flex;
  align-items: center;
  width: 265px;
`

const Logo = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  > img {
    width: 120px;
    padding: 0.5rem;
  }
`

const StyledIconButton = styled(IconButton)`
  color: rgb(148, 157, 178) !important;
`

interface State {
  showChangePassword: boolean
  showMessage: boolean
}

function stringAvatar(name?: string) {
  if (name) {
    return {
      children: `${name.split(' ')[0][0]}`,
    }
  } else {
    return {}
  }
}

export default function Header() {
  const { t } = useTranslation()
  const { account } = useAccountState()
  const client = useApolloClient();
  const toggleNav = useNavToggle()
  const { logout, data } = useLogout()

  const [values, setValues] = useState<State>({
    showChangePassword: false,
    showMessage: false
  })

  useEffect(() => {
    if (data) {
      client.clearStore()
    }
  }, [client, data])

  const [anchorEls, setAnchorEls] = React.useState<{ [key: string]: null | HTMLElement }>({})

  const handleClick = (name: string) => (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEls({ ...anchorEls, [name]: event.currentTarget })
  }

  const handleClose = (name: string) => () => {
    setAnchorEls({ ...anchorEls, [name]: null })
  }

  return (
    <HeaderWrapper position="fixed">
      <Toolbar>
        <HeaderBrand>
          <Logo>
            <img alt={`${process.env.REACT_APP_NAME}`} src={`/images/logo.jpg`} />
          </Logo>
        </HeaderBrand>
        <StyledIconButton
          edge="start"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleNav}
        >
          <MenuIcon size={20} />
        </StyledIconButton>
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Link href="#/dashboard" underline="none">
            {'首页'}
          </Link>
          <Link href="https://doc.shenzhouyinji.cn/" underline="none" target="_blank">
            {'操作指南'}
          </Link>
        </Box>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
        <Tooltip title={"消息"} arrow>
          <StyledIconButton
            edge="start"
            aria-label="logout"
            sx={{ mr: 0.25, ml: 0.25 }}
            onClick={() => setValues({ ...values , showMessage: true })}
          >
            <MessageSquare size={20} />
          </StyledIconButton>
        </Tooltip>
         <Tooltip title={"设置"} arrow>
        <StyledIconButton
          edge="start"
          aria-label="logout"
          sx={{ mr: 0.25, ml: 0.25 }}
          onClick={handleClick("settings")}
        >
          <Settings size={20} />
        </StyledIconButton>
        </Tooltip>
      </Toolbar>
      <Menu
        anchorEl={anchorEls["settings"]}
        id="settings-menu"
        open={Boolean(anchorEls["settings"])}
        onClose={handleClose("settings")}
        onClick={handleClose("settings")}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            borderRadius: '8px',
            minWidth: 180,
            '& .MuiAvatar-root': {
              width: 56,
              height: 56,
              m: 0,
            },
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Stack spacing={1} direction="column" justifyContent="center" alignItems="center" sx={{ m: 2 }}>
          <Avatar sx={{ bgcolor: deepOrange[500] }} alt={account?.loginId} { ...stringAvatar(account?.loginId)} />
          <Typography variant="subtitle2">{account?.loginId}</Typography>
        </Stack>
        <Divider />
        <MenuItem onClick={() => setValues({ ...values , showChangePassword: true })}>
          <ListItemIcon>
            <Lock size={20} />
          </ListItemIcon>
          {t("NAV_PASSWORD")}
        </MenuItem>
        <MenuItem onClick={() => logout()}>
          <ListItemIcon>
            <LogOut size={20} />
          </ListItemIcon>
          {t("Logout")}
        </MenuItem>
      </Menu>
      <Message open={values.showMessage} onClose={() => setValues({ ...values , showMessage: false })} />
      <ChangePasswordModal
        open={values.showChangePassword} 
        onClose={() => setValues({ ...values , showChangePassword: false })}
        onDismiss={() => setValues({ ...values , showChangePassword: false })}
      />
    </HeaderWrapper>
  );
}