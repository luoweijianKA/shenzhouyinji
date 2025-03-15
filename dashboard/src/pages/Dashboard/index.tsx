import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gql, useQuery } from '@apollo/client'
import {
    Grid,
    Typography,
    CardHeader,
    CardContent,
    Paper,
    TableContainer,
    Table,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
 } from '@mui/material'
import { Edit } from 'react-feather'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import { formattedDateTime } from 'utils'
import { StyledCard } from 'pages/styled'
import { useAccountState } from 'state/account/hooks'
import NicknameModal from './components/NicknameModal'

const GET_ACCOUNT = gql`
  query Account($id: String!) {
    account(id: $id) {
      id
      loginId
      wechat
      role
      status
      create_time
    }
  }
`

interface State {
  showNickname: boolean
  market?: string
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { account } = useAccountState()

  const [values, setValues] = useState<State>({
    market: undefined,
    showNickname: false,
  })

  const { data, refetch } = useQuery(
    GET_ACCOUNT,
    { variables: { id: account?.id } },
  )

  const accountRows = useMemo(() => {
    if (data) {
      const { loginId, role, status, create_time } = data.account
      return [
        { name: '账号', value: loginId },
        { name: '角色', value: role === 'ROOT' ? '系统管理员' : '管理员' },
        { name: '状态', value: status === 1 ? '启用' : '禁用' },
        { name: '创建时间', value: create_time > 0 ? formattedDateTime(new Date(create_time * 1000)) : "--" },
      ]
    }

    return undefined
  }, [data])


  const handleNicknameDismiss = (value?: string) => {
    if (value) {
      refetch({ id: account?.id })
    }

    setValues({ ...values, showNickname: false })
  }

  return (
    <PageWrapper>
      {accountRows ? (
        <Grid container>
          <Grid item xs={6}>
            <NicknameModal 
              open={values.showNickname} 
              onClose={() => setValues({ ...values, showNickname: false })}
              onDismiss={handleNicknameDismiss}
            />
            <StyledCard>
              <CardHeader 
                title={
                  <Typography variant="h3" sx={{
                    margin: 0,
                    fontWeight: 500,
                    fontSize: '1.125rem',
                    lineHeight: 1.5,
                  }}
                  >
                    {"账号信息"}
                  </Typography>
                }
              />
              <CardContent>
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table aria-label="simple table">
                        <TableBody>
                        {accountRows && accountRows.map((row) => (
                          <TableRow
                            key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row" sx={{ pl: 0, fontWeight: 500 }}>
                              {t(row.name)}
                            </TableCell>
                            {row.name === 'Nickname' ? (
                              <TableCell align="right" sx={{ pr: 0, display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={() => setValues({ ...values, showNickname: true })}>
                                  <Edit size={18} />
                                </IconButton>
                                <Typography variant="body2" sx={{ mr: 1 }}>{row.value}</Typography>
                              </TableCell>
                            ) : (
                              <TableCell align="right" sx={{ pr: 0 }}>
                                <Typography variant="body2">{row.value}</Typography>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6}></Grid>
        </Grid>
      ) : (
        <Loading />
      )}
    </PageWrapper>
  )
}