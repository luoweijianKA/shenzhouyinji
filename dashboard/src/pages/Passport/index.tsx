import React, { useState, useMemo } from 'react'
import { RefreshCw, Upload, ChevronRight } from 'react-feather'
import {
  Grid,
  Breadcrumbs,
  Typography,
  CardContent,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Button,
  Tooltip,
  IconButton,
 } from '@mui/material'
import { gql, useQuery } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import { PageHeader, Title, LinkButton, StyledCard } from 'pages/styled'
import { ImportModal } from './components/ImportModal'

const GET_PASSPORT_STOCKS = gql`
  query GetPassportStocks {
    passportStocks {
      eventId
      eventName
      total
      issuedCount
      usedCount
      availableCount
    }
  }
`

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      name
      status
    }
  }
`

interface Event {
  id: string
  name: string
}

interface StatProps {
  label: string
  value: string
}

function Stat(props: StatProps) {
  const { label, value } = props

  return (
    <CardContent sx={{ 
      padding: "30px",
      "@media (min-width: 720px)": {
        borderRight: "1px solid rgba(0, 0, 0, 0.1)",
      }
    }}>
      <Box sx={{
        display: "flex",
        alignItems: "center",
      }}>
        <Typography variant="h3" sx={{
          margin: 0,
          fontWeight: 500,
          fontSize: "1.3125rem",
          lineHeight: 1.5,
        }}>{value}</Typography>
      </Box>
      <Typography variant="h6" sx={{
        margin: 0,
        fontSize: "0.875rem",
        lineHeight: 1.5,
        color: "rgb(119, 126, 137)",
        fontWeight: 400,
      }}>{label}</Typography>
    </CardContent>
  )
}

interface PassportStock {
  eventId: string
  eventName: string
  total: number
  issuedCount: number
  usedCount: number
  availableCount: number
}

interface StockSummary {
  total: number
  issuedCount: number
  usedCount: number
  availableCount: number
}

interface State {
  open: boolean
  search: string
}

function useEvents(): Event[] {
  const { data } = useQuery(GET_EVENTS, { fetchPolicy: "no-cache" })

  return useMemo(() => {
    if (data) {
      return data.events
    }
    return []
  }, [data])
}

export default function Passport() {
  const [values, setValues] = useState<State>({ open: false, search: '' })
  const events = useEvents()
  const { data, loading, refetch } = useQuery(GET_PASSPORT_STOCKS, { fetchPolicy: "no-cache" })

  const rows: PassportStock[] = useMemo(() => {
    if (data) {
      return data.passportStocks
    }
    return []
  }, [data])

  const stock: StockSummary = useMemo(() => {
    if (data) {
      return data.passportStocks.reduce((a: StockSummary, b: StockSummary) => ({
        total: a.total + b.total,
        issuedCount: a.issuedCount + b.issuedCount,
        usedCount: a.usedCount + b.usedCount,
        availableCount: a.availableCount + b.availableCount,
      }))
    }
    return {
      total: 0,
      issuedCount: 0,
      usedCount: 0,
      availableCount: 0,
    }
  }, [data])

  const handleImport = () => {
    setValues({ ...values, open: true })
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleImportClose = (event: any) => {
    const { addPassportStock } = event
    if (addPassportStock && addPassportStock.succed) {
      refetch()
    }

    setValues({ ...values , open: false })
  }  

  return (
    <PageWrapper>
      <PageHeader container>
        <Grid item xs={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">{"护照管理"}</Typography>
          </Breadcrumbs>
          <Title variant='h1'>{"护照库存"}</Title>
        </Grid>
        <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
          <Button 
            disableElevation 
            variant="contained" 
            component="label" 
            startIcon={<Upload size={20}/>}
            onClick={handleImport}
          >
            {"导入"}
          </Button>
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
      <ImportModal  {...values} events={events} onClose={handleImportClose} />
      <StyledCard sx={{ p: 0 }}>
        <Grid container sx={{
          boxSizing: "border-box",
          display: "flex",
          flexFlow: "row wrap",
          width: "100%",
          "& .MuiGrid-item:last-child": {
            "& .MuiCardContent-root": {
              border: 0,
            }
          }
        }}>
          <Grid item xs={6} sm={3} lg={3}>
            <Stat label="总发行" value={`${stock.total}`}></Stat>
          </Grid>
          <Grid item xs={6} sm={3} lg={3}>
            <Stat label="领取" value={`${stock.issuedCount}`}></Stat>
          </Grid>
          <Grid item xs={6} sm={3} lg={3}>
            <Stat label="绑定" value={`${stock.usedCount}`}></Stat>
          </Grid>
          <Grid item xs={6} sm={3} lg={3}>
            <Stat label="库存" value={`${stock.availableCount}`}></Stat>
          </Grid>
        </Grid>
      </StyledCard>
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"活动"}</TableCell>
                      <TableCell>{"发行"}</TableCell>
                      <TableCell>{"领取"}</TableCell>
                      <TableCell>{"绑定"}</TableCell>
                      <TableCell>{"库存"}</TableCell>
                      <TableCell>{""}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.eventId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.eventName}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='body2'>{row.total}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='body2'>{row.issuedCount}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='body2'>{row.usedCount}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='body2'>{row.availableCount}</Typography>
                      </TableCell>
                      <TableCell scope="row" sx={{ textAlign: "right" }}>
                        <Tooltip arrow title={"详情"}>
                          <IconButton href={`#/passport/${row.eventId}`}>
                            <ChevronRight size={20} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        ) : (
          <Loading />
        )}
    </PageWrapper>
  )
}