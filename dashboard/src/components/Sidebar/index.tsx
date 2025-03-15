import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  styled,
  Box,
  Drawer,
  List,
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material'
import { MENUS } from 'constants/index'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen } from 'state/application/hooks'
import { useAccountState } from 'state/account/hooks'

const drawerWidth = 265

const ScrollbarWrapper = styled('div')(() => ({
  overflowY: 'auto',
  overflowAnchor: 'none',
  touchAction: 'auto',
  position: 'relative',
  borderRight: '0px !important',
  height: 'calc(100vh - 5px)',
}))

const Link = styled(Button)(() => ({
  backgroundColor: 'transparent',
  outline: 0,
  border: 0,
  margin: '0px 0px 8px',
  cursor: 'pointer',
  userSelect: 'none',
  verticalAlign: 'middle',
  appearance: 'none',
  color: 'inherit',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'relative',
  textDecoration: 'none',
  textTransform: 'none',
  width: '100%',
  boxSizing: 'border-box',
  textAlign: 'left',
  padding: '8px 16px',
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  borderRadius: '9px',
  // color: 'white',
  // backgroundColor: 'rgb(3, 201, 215) !important',

  '&:hover': {
    backgroundColor: 'rgb(0, 0, 0, 0.03)',
    color: 'inherit',
  },

  '&:active': {
    backgroundColor: '#C00012',
    color: 'white',

    "svg": {
      color: 'white',
    }
  }
}))

const SelectedLink = styled(Button)(() => ({
  backgroundColor: '#C00012',
  outline: 0,
  border: 0,
  margin: '0px 0px 8px',
  userSelect: 'none',
  verticalAlign: 'middle',
  appearance: 'none',
  color: 'white',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'relative',
  textDecoration: 'none',
  textTransform: 'none',
  width: '100%',
  boxSizing: 'border-box',
  textAlign: 'left',
  padding: '8px 16px',
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  borderRadius: '9px',

  "svg": {
      color: 'white',
  },

  '&:hover': {
    backgroundColor: '#C00012',
    color: 'white',
    cursor: 'pointer',
  },
}))

export default function Sidebar() {
  const { t } = useTranslation()
  const { account } = useAccountState()
  const navOpen = useModalOpen(ApplicationModal.NAV)
  const loaction = useLocation()
  const selected = (url: string) => loaction.pathname === url

  return (
    <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            transform: 'none',
            backgroundColor: 'rgb(255, 255, 255)',
            color: 'rgba(0, 0, 0, 0.87)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 0 auto',
            width: drawerWidth,
            boxSizing: 'border-box',
            zIndex: 1200,
            position: 'fixed',
            top: '100px',
            left: '24px',
            borderRadius: '0.5rem',
            border: '0',
            height: 'calc(100vh - 130px)',
            boxShadow: 'rgb(90 114 123 / 11%) 0px 7px 30px 0px',
            transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
          },
        }}
        variant="persistent"
        anchor="left"
        open={navOpen}
      >
        <ScrollbarWrapper>
        {account && (
          <List sx={{ padding: '1rem' }}>
            {MENUS.filter(menu => menu.value > 0).map(menu => (
              <Box key={menu.label}>
                <ListSubheader sx={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  padding: '16px 0',
                  lineHeight: '1.5',
                  color: 'rgba(0, 0, 0, 0.35)',
                }}>
                  {t(menu.label)}
                </ListSubheader>
                {menu.childrens.filter(item => item.value > 0 && (!item.roles || item.roles.indexOf(account.role) > -1)).map(item => (
                  <List key={item.label} component="li" sx={{
                    listStyle: 'none',
                    margin: '0',
                    padding: '0',
                    position: 'relative',
                  }}>
                    <ListItem component={selected(item.url) ? SelectedLink : Link} href={`#${item.url}`} key={item.label}>
                      <ListItemIcon sx={{ minWidth: '32px' }}>
                        <item.icon size={20}></item.icon>
                      </ListItemIcon>
                      <ListItemText
                        primary={t(item.label)}
                        sx={{ 
                          "& .MuiTypography-root": {
                            fontSize: '0.875rem',
                          }
                        }}
                      />
                    </ListItem>
                  </List>
                ))}
              </Box>
            ))}
          </List>
        )}
        </ScrollbarWrapper>
      </Drawer>
  )
}
