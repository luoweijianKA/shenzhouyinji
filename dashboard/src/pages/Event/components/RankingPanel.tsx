import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'react-feather'
import {
  Box,
  Grid,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Tooltip,
 } from '@mui/material'
import { gql, useQuery } from '@apollo/client'
import Loading from 'components/Loading'
import Empty from 'components/Empty'
import { PageHeader } from 'pages/styled'

const GET_RANKS = gql`
  query GetRanks($eventId: String!) {
    campRanks(eventId: $eventId) {
      rank
      id
      name
      points
      logo
      user_count
    }
    userRanks(eventId: $eventId) {
      rank
      id
      name
      points
      trip_count
      honour_id
      honour_name
      camp_id
      camp_name
    }
  }
`

interface TabPanelProps {
  value: { id: string }
  index: number
  hidden: boolean
}

interface CampRank { 
  rank: number
  id: string
  name: string
  points: number
  logo: string
  user_count: number
}

interface UserRank { 
  rank: number
  id: string
  name: string
  points: number
  trip_count: number
  honour_id: number
  honour_name: number
  camp_id: number
  camp_name: number
}

interface State {
  value: string
  campRanks: CampRank[]
  userRanks: UserRank[]
}

export default function RankingPanel(props: TabPanelProps) {
  const { value: { id: eventId }, index, hidden, ...other } = props
  const { data, loading, refetch } = useQuery(GET_RANKS, { variables: { eventId }, fetchPolicy: "no-cache" })

  const [values, setValues] = useState<State>({ value: "camp", campRanks: [], userRanks: [] })

  useEffect(() => {
    if (data) {
      const { campRanks, userRanks } = data
      setValues({ ...values, campRanks, userRanks })
    }
  }, [data])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, value: (event.target as HTMLInputElement).value })
  }

  const handleRefresh = () => {
    refetch({ eventId })
  }

  return (
    <div
      role="tabpanel"
      hidden={hidden}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {!hidden && (
        <Box>
          <PageHeader container sx={{ pl: 0, pr: 0 }}>
            <Grid item xs={8}>
              <RadioGroup
                row
                aria-labelledby="ranking-group-label"
                name="ranking-group"
                value={values.value}
              onChange={handleChange}
              >
                <FormControlLabel value="camp" control={<Radio />} label={"阵营积分排行"} />
                <FormControlLabel value="user" control={<Radio />} label={"个人积分排行"} />
              </RadioGroup>
            </Grid>
            <Grid item xs={4} sx={{ display: "flex", alignItems: "flex-end", justifyContent: "end" }}>
              <Tooltip arrow title={"刷新"}>
                <IconButton color="primary" aria-label="刷新" onClick={handleRefresh}>
                  <RefreshCw size={20} />
                </IconButton>
              </Tooltip>
            </Grid>
          </PageHeader>
          {loading && (<Loading />)}
          {values.value === "camp" && (values.campRanks.length === 0 ? (<Empty />) :(
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"名次"}</TableCell>
                    <TableCell>{"阵营名称"}</TableCell>
                    <TableCell>{"阵营人数"}</TableCell>
                    <TableCell>{"积分"}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {values.campRanks.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                      <TableCell scope="row" component="th">
                         <Typography variant='subtitle2'>{row.rank}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='body2'>{row.user_count}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='body2'>{row.points}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            )
          )}
          {values.value === "user" && (values.userRanks.length === 0 ? (<Empty />) :(
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"名次"}</TableCell>
                    <TableCell>{"用户"}</TableCell>
                    <TableCell>{"所在阵营"}</TableCell>
                    <TableCell>{"积分"}</TableCell>
                    <TableCell>{"打卡数量"}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {values.userRanks.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                      <TableCell scope="row" component="th">
                         <Typography variant='subtitle2'>{row.rank}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='body2'>{row.camp_name}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='body2'>{row.points}</Typography>
                      </TableCell>
                      <TableCell scope="row" component="th">
                        <Typography variant='body2'>{row.trip_count}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            )
          )}
        </Box>
      )}
    </div>
  )
}