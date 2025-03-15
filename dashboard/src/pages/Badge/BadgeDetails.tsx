import React, { useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ChevronLeft, RefreshCw } from 'react-feather'
import {
  Grid,
  Box,
  Typography,
  Breadcrumbs,
  Avatar,
  Link,
  Card,
  Stack,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
 } from '@mui/material'
import { gql, useQuery } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import { formattedDateTime } from 'utils'
import Loading from 'components/Loading'
import Empty from 'components/Empty'
import { Title, PageHeader, LinkButton } from 'pages/styled'

const GET_BADGES = gql`
  query GetUserSwaps($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $filter: UserSwapFilter) {
    userSwaps(
      first: $first
      after: $after
      last: $last
      before: $before
      filter: $filter
    ) {
      totalCount
      edges {
        node {
          id
          userId
          userName
          userAvatar
          badges {
            id
            name
            images
          }
          city
          status
          createTime
          expiredTime
          messages
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

interface State {
  id: string
  userId: string
  userName: string
  userAvatar: string
  badges: {
    id: string
    name: string
    images: string
  }[]
  city: string
  status: number
  createTime: number
  expiredTime: number
  messages: {
    userId: string
    userName: string
    userAvatar: string
    msg: string
    timestamp: number
  }[]
}

export default function BadgeDetails({
  match: {
    params: { id }
  },
  history
}: RouteComponentProps<{ id?: string }>) {
  const [values, setValues] = useState<State | undefined>()

  const { data, loading, refetch } = useQuery(GET_BADGES, { variables: { filter: { id } }, fetchPolicy: "no-cache" })

  // const badge: Badge = useMemo(() => {
  //   if (data) {
  //     const { edges } = data.userSwaps
  //     return (edges.lenght > 0) ? edges[0].node : undefined
  //   }
  //   return undefined
  // }, [data])

  useEffect(() => {
    if (data && data.userSwaps) {
      const { edges } = data.userSwaps
      if (edges.length > 0) {
        setValues({ ...edges[0].node })
      }
    }
  }, [data])

  const handleRefresh = () => {
    refetch({ filter: { id } })
  }

  return (
    <PageWrapper>
      <PageHeader container>
        <Grid item xs={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">{"徽章交换"}</Typography>
            <Link underline="hover" color="inherit" href="#/badge">{"交换列表"}</Link>
          </Breadcrumbs>
          <Title>{"交换详情"}</Title>
        </Grid>
        <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
          <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<ChevronLeft size={20} />}
              href="#/badge"
            >
              {"返回"}
            </LinkButton>
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
      {!loading ? (
        <Grid container sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexFlow: 'row wrap',
            width: '100%',
        }}>
          {values ? (
            <React.Fragment>
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
                  <Stack direction="row" justifyContent="space-around">
                    <Avatar src={process.env.REACT_APP_RESOURCES_DOMAIN + values.badges[0].images} sx={{ width: 96, height: 96 }} />
                    <Avatar src={"images/inout.png"} sx={{ width: 96, height: 96 }} />
                    <Avatar src={process.env.REACT_APP_RESOURCES_DOMAIN + values.badges[0].images} sx={{ width: 96, height: 96 }} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-around" sx={{ mt: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{
                        margin: "8px 0px 8px",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                        fontWeight: 600,
                      }}>{"发起用户"}</Typography>
                      <Typography variant="body2">{values.userName}</Typography>
                      <Typography variant="caption">{formattedDateTime(new Date(values.createTime * 1000))}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{
                        margin: "8px 0px 8px",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                        fontWeight: 600,
                      }}>{"交易地点"}</Typography>
                      <Typography variant="body2">{values.city}</Typography>
                      {values.status === 1 && (<Typography variant='body2' color="success">{"启用"}</Typography>)}
                      {values.status === 2 && (<Typography variant='body2' color="info">{"禁用"}</Typography>)}
                      {values.status === 3 && (<Typography variant='body2' color="error">{"已下架"}</Typography>)}
                    </Box>
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
                    <Typography variant="h6" sx={{
                      margin: "0px 0px 8px",
                      fontWeight: 600,
                      fontSize: "1rem",
                      lineHeight: 1.5,
                    }}>
                      {"沟通记录"}
                    </Typography>
                    {values.messages.length > 0 ? (
                      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {values.messages.map((m, i) => (
                          <React.Fragment key={i}>
                          <ListItem alignItems="flex-start" sx={{ '& .MuiListItemSecondaryAction-root': { top: "24px" }}}  secondaryAction={
                            <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="caption"
                                color="text.primary"
                              >
                               {formattedDateTime(new Date(m.timestamp * 1000))}
                              </Typography>
                            }>
                            <ListItemAvatar>
                              <Avatar alt={m.userName} src={process.env.REACT_APP_RESOURCES_DOMAIN + m.userAvatar} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={m.userName}
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    sx={{ display: 'inline' }}
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                  </Typography>
                                    {m.msg}
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Empty />
                    )}
                  </CardContent>
                </Card>
            </Grid>
            </React.Fragment>
          ) : (<Empty />)}
        </Grid>
      ) : (
        <Loading />
      )}
    </PageWrapper>
  )
}