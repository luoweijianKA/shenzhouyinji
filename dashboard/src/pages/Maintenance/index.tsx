import React from 'react'
import {
  styled,
  AppBar,
  Toolbar,
  Grid,
  Container,
  Box,
  Typography,
 } from '@mui/material'

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
  background-color: transparent !important;
  box-shadow: none;
`

const rows = [
  {
    title: 'DEAR VALUED CUSTOMERS',
    description: 'We are currently doing maintenance and upgrading. Please check back again later.',
  },
  {
    title: '亲爱客户',
    description: '我们正在进行系统提升与更新,请稍后再尝试登入',
  }
]

export default function Maintenance() {
  return (
    <React.Fragment>
      <HeaderWrapper position="fixed">
        <Toolbar />
      </HeaderWrapper>
      <Grid container sx={{ alignItems: 'center', background: 'rgb(250, 251, 251)' }}>
        <Grid item xs={6} sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#FFF',
        }}>
          <Typography variant="h3" sx={{ 
            fontFamily: '"DM Sans", sans-serif',
            color: 'rgba(0, 0, 0, 0.87)',
          }}>
            UNDER MAINTENANCE
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Container>
          {rows.map(row => (
            <Box key={row.title} sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{
                fontSize: '1.25rem',
                lineHeight: 1.5,
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
              }}>
                {row.title}
              </Typography>
              <Typography variant="h5" sx={{
                fontSize: '1rem',
                lineHeight: 1.5,
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 400,
                color: 'rgb(119, 126, 137)',
              }}>
                {row.description}
              </Typography>
            </Box>
          ))}
          </Container>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}