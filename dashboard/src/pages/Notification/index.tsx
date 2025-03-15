import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { gql, useQuery, useLazyQuery } from '@apollo/client'
import {
    Grid,
    Breadcrumbs,
    Link,
    Typography,
    Drawer,
    Box,
    Divider,
    FormControl,
    OutlinedInput,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
 } from '@mui/material'
import { ago } from 'utils'
import Loading from 'components/Loading'
import { PageWrapper } from '../../theme/components'
import { PageHeader, Title, StyledCard } from 'pages/styled'

const GET_NOTIFICATIONS = gql`
  query Notifications($first: Int = 20, $after: ID, $last: Int, $before: ID, $start: Int, $end: Int, $notificationType: NotificationType) {
    notifications(
      first: $first
      after: $after
      last: $last
      before: $before
      start: $start
      end: $end
      notificationType: $notificationType
    ) {
      totalCount
      edges {
        node {
          id
          title
          message
          type
          timestamp
        }
      }
    }
  }
`

const GET_NOTIFICATION = gql`
  query Notification($id: ID!) {
    notification(id: $id) {
      id
      title
      message
      type
      timestamp
    }
  }
`

interface State {
  id?: string
}

interface NotificationDetails {
  id: string
  title: string
  message: string
  type: string
  timestamp: number
}

function useAllNotifications(): { [id: string]: NotificationDetails } {
 const [result, setResult] = useState<{ [id: string]: NotificationDetails }>({})
 const { data } = useQuery(GET_NOTIFICATIONS)

  useEffect(() => {
    if (data) {
      const { totalCount, edges } = data.notifications
      console.log(`${totalCount} notifications.`)
      setResult(Object.assign(
        {},
        ...edges.map((edge: any) => ({ [edge.node.id]: edge.node}))
      ))
    }
  }, [data])

  return result
}

function useNotification(id?: string): NotificationDetails | undefined {
  const [result, setResult] = useState<NotificationDetails | undefined>(undefined)
  const [getNotification, { data }] = useLazyQuery(GET_NOTIFICATION)

  useEffect(() => {
    console.log({ id })
    if (id) {
      getNotification({ variables: { id } })
    }
  }, [getNotification, id])

  useEffect(() => {
    if (data) {
      setResult(data.notification)
    }
  }, [data])

  return result
}

function isNotificationRecent(n: NotificationDetails): boolean {
  return true
}

function newNotificationsFirst(a: NotificationDetails, b: NotificationDetails) {
  return b.timestamp - a.timestamp
}

export default function Notification({
  match: {
    params: { id }
  },
}: RouteComponentProps<{ id?: string }>) {
  const { t } = useTranslation()
  const [loading] = useState<Boolean>(false)
  const [values, setValues] = useState<State>({})
  const ntifications = useAllNotifications()

  const sortedNotifications = useMemo(() => {
    return Object.values(ntifications).filter(isNotificationRecent).sort(newNotificationsFirst)
  }, [ntifications])

  useEffect(() => {
    if (id) {
      setValues({ ...values, id })
    }
  }, [id])

  const notification = useNotification(values.id)

  const handleNotification = useCallback((id: string) => () => {
    console.log({ id })
    setValues({ ...values, id })
  }, [])

  return (
    <PageWrapper>
    <PageHeader container>
        <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="#log">
            {t("System Log")}
            </Link>
        </Breadcrumbs>
        <Title variant='h1'>{t('Notifications')}</Title>
        </Grid>
        <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
        
        </Grid>
    </PageHeader>
      {loading ? (<Loading />) : (
        <StyledCard sx={{ display: "flex", p: 0, height: "calc(100vh - 243px)" }}>
          <Box sx={{ width: 320, minWidth: 320, flexGrow: 0 }}>
            <Box sx={{ display: "flex", p: 2 }}>
              <FormControl fullWidth>
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
                  placeholder="Search notifications"
                />
              </FormControl>
            </Box>
            <Divider />
            <List sx={{ overflow: "auto",  height: "calc(100vh - 315px)" }}>
              {sortedNotifications.map((n) => (
                <ListItem key={n.id} disablePadding sx={{ pb: 1 }}>
                  <ListItemButton onClick={handleNotification(n.id)}>
                    <ListItemText
                      sx={{
                        "& .MuiListItemText-secondary": {
                          margin: 0,
                          fontWeight: 400,
                          fontSize: '0.875rem',
                          lineHeight: 1.43,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      }}
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                          <Typography 
                            component="span" 
                            variant="subtitle1" 
                            color="text.primary"
                            sx={{
                              margin: '0px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              lineHeight: 1.5,
                            }}
                          >
                            {n.title}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Typography variant="caption">{ago(n.timestamp)}</Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
               ))}
            </List>
          </Box>
          <Drawer
            sx={{
              zIndex: 0,
              flex: '1 auto',
              width: '100%',
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                position: 'relative',
                p: 3,
              },
            }}
            variant="permanent"
            anchor="right"
          >
            {notification && (
              <React.Fragment>
                <Box sx={{ pb: 2 }}>
                  <Typography variant="h4" sx={{
                    margin: '0px',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    lineHeight: 1.8,
                  }}>
                    {notification.title}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ pt: 2, pb: 2 }}>
                  <Typography paragraph>{notification.message}</Typography>
                </Box>
              </React.Fragment>
            )}
          </Drawer>
        </StyledCard>
      )}
    </PageWrapper>
  )
}