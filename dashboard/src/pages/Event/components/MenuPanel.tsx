import React, { useState, useEffect } from 'react'
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
  Checkbox,
 } from '@mui/material'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Check } from 'react-feather'
import Loading from 'components/Loading'
import { useAlert } from 'state/application/hooks'
import { PageHeader, LinkButton } from 'pages/styled'

const GET_EVENT_SETTINGS = gql`
  query GetEventSettings($id: ID!) {
    eventSettings(id: $id)
  }
`

const UPDATE_EVENT_SETTINGS = gql`
  mutation UpdateEventSettings($id: ID!, $settings: Map!) {
    updateEventSettings(id: $id, settings: $settings)
  }
`

interface MenuPanelProps {
  value: { id: string }
  index: number
  hidden: boolean
}

interface State {
  id: string
  menus: string[]
}

const menus = [
  { id: "1", name: '实名领取' },
  { id: "2", name: '护照激活' },
  { id: "3", name: '选择阵营' },
  { id: "4", name: '实施任务' },
  { id: "5", name: '印记分享' },
  { id: "6", name: '打卡盖章' },
  { id: "7", name: '领取奖励' },
]

export default function MenuPanel(props: MenuPanelProps) {
  const { value, index, hidden, ...other } = props
  const alert = useAlert()
  const { data } = useQuery(GET_EVENT_SETTINGS, { variables: { id: value.id }, fetchPolicy: "no-cache" })
  const [updateEventSettings] = useMutation(UPDATE_EVENT_SETTINGS)
  const [values, setValues] = useState<State>({ id: value.id, menus: [] })

  useEffect(() => {
    if (data) {
      setValues({ ...values, menus: data.eventSettings.menus ?? []})
    }
  }, [data])

  useEffect(() => {
     setValues({ ...values, id: value.id })
  }, [value])

  const handleChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { menus } = values
    if (event.target.checked) {
      setValues({ ...values, menus: menus.concat(id)})
    } else {
      const i = menus.indexOf(id)
      if (i > -1) {
        menus.splice(i, 1)
        setValues({ ...values, menus })
      }
    }
  }

  const handleOK = () => {
    const { id, menus } = values
    if (menus.indexOf("1") == -1 && menus.indexOf("2") == -1) {
      alert({ severity: "info", text: "护照领取或护照激活必须选择一个" })
      return
    }
    if (menus.indexOf("1") > -1 && menus.indexOf("2") > -1) {
      alert({ severity: "info", text: "护照领取或护照激活只能选择一个" })
      return
    }

    updateEventSettings({ variables: { id, settings: { menus  } }})
      .then(({ data }) => {
        if (data && data.updateEventSettings) {
          setValues({ ...values, menus: data.updateEventSettings.menus ?? []})
          alert({ severity: "success", text: '菜单修改成功！' })
        }
      })
      .catch((e) => alert({ severity: "error", text: e.message }))
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
            <Grid item xs={12} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
              <LinkButton
                disableElevation
                variant="contained" 
                startIcon={<Check size={20} />}
                onClick={handleOK}
              >
                {"确定"}
              </LinkButton>
            </Grid>
          </PageHeader>
          {menus ? (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"菜单名称"}</TableCell>
                    <TableCell>{''}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menus.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                      <TableCell scope="row" component="th">
                        <Typography variant='subtitle2'>{row.name}</Typography>
                      </TableCell>
                      <TableCell scope="row" sx={{ textAlign: "right" }}>
                        <Checkbox checked={values.menus.indexOf(row.id) > -1} onChange={handleChange(row.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Loading />
          )}
        </Box>
      )}
    </div>
  )
}