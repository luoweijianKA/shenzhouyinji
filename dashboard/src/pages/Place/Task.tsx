import React, { useMemo } from 'react'
import { useHistory } from 'react-router-dom' 
import { Search } from 'react-feather'
import {
  Grid,
  Breadcrumbs,
  Typography,
  Card,
  CardMedia,
  CardContent,
  FormControl,
  OutlinedInput,
 } from '@mui/material'
import { gql, useQuery } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import { PageHeader, Title } from 'pages/styled'

const GET_SCENERYSPOTS = gql`
  query GetSceneryspots {
    sceneryspots {
      id
      name
      address
      images
    }
  }
`

interface Sceneryspot {
  id: string
  name: string
  address: string
  images: string
}

export default function PlaceTask() {
  const history = useHistory()
  const { data, loading } = useQuery(GET_SCENERYSPOTS, { fetchPolicy: "no-cache" })

  const sceneryspotRows: Sceneryspot[] = useMemo(() => {
    if (data) {
      return data.sceneryspots.map((v: any) => ({ ...v }))
    }
    return []
  }, [data])

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"景区管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"景区任务"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <FormControl>
              <OutlinedInput
                sx={{
                  "& .MuiOutlinedInput-input": {
                    padding: "8.5px 14px"
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    top: 0,
                    "& > legend": {
                      float: 'left !important',
                    }
                  }
                }}
                notched={false}
                placeholder="搜索景区"
                startAdornment={<Search />}
              />
            </FormControl>
        </Grid>
        </PageHeader>
        {!loading ? (
          <Grid container sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexFlow: 'row wrap',
            width: '100%',
          }}>
            {sceneryspotRows.map((row) => (
              <Grid item sm={6} md={4}>
                <Card onClick={() => history.push(`/place/${row.id}/trek`)} sx={{
                  maxWidth: 345,
                  transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                  overflow: "hidden",
                  borderRadius: "0.5rem",
                  margin: "15px",
                  boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
                  padding: "0",
                  cursor: "pointer",
                }}>
                  <CardMedia
                    sx={{ height: 140 }}
                    image={`${process.env.REACT_APP_RESOURCES_DOMAIN}` + row.images}
                    title={row.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {row.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.address}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Loading />
        )}
    </PageWrapper>
  )
}