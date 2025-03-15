import React from 'react'
import {
  Grid,
  Breadcrumbs,
  Typography,
  CardContent,
 } from '@mui/material'
import { RefreshCw } from 'react-feather'
import { PageWrapper } from 'theme/components'
import QQMap from 'components/QQMap'
import { PageHeader, Title, LinkButton, StyledCard } from 'pages/styled'

export default function Map() {
  const handleRefresh = () => {
    console.log("handleRefresh")
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"系统管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"印迹地图"}</Title>
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
        </Grid>
        </PageHeader>
          <StyledCard>
            <CardContent sx={{ padding: '0px !important' }}>
              <QQMap disableTool overlay={'marker'} />
            </CardContent>
          </StyledCard>
    </PageWrapper>
  )
}