import React, { useMemo } from 'react'
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
  IconButton,
  Tooltip,
 } from '@mui/material'
import { RefreshCw, Trash2, XCircle } from 'react-feather'
import { formattedDate } from 'utils'
import { PageWrapper } from 'theme/components'
// import Loading from 'components/Loading'
import Empty from 'components/Empty'
import { PageHeader, Title, LinkButton, StyledCard } from 'pages/styled'

interface Message {
  id: string
  title: string
  content: string
  timestamp: number
}

export default function Message() {
  const messageRows: Message[] = useMemo(() => {
    // return [
    //   { id: "1", title: '母笑阳', message: "各位玩家可将1-4期视频素材投稿给小迹获取福利，感兴趣的玩家快去“神州印迹”公众号查看详情吧！", timestamp: 1658419200 },
    //   { id: "2", title: '福星高照', message: "7.30日已开始", timestamp: 1659110400 },
    // ]
    return []
  }, [])

  const handleRefresh = () => {
    console.log("handleRefresh")
  }

  const handleCancel = (id: string) => () => {
    console.log({ cancel: id })
  }

  const handleDelete = (id: string) => () => {
    console.log({ delete: id })
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"留言管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"已审留言"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<RefreshCw />}
              onClick={handleRefresh}
            >
              {"刷新"}
            </LinkButton>
        </Grid>
        </PageHeader>
        {messageRows.length > 0 ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"留言"}</TableCell>
                      <TableCell>{"发布时间"}</TableCell>
                      <TableCell>{''}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {messageRows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.title}</Typography>
                      <Typography variant='caption'>{row.content}</Typography>
                    </TableCell>
                      <TableCell scope="row">
                        <Typography variant='body2'>
                          {formattedDate(new Date(row.timestamp * 1000))}
                        </Typography>
                      </TableCell>
                    <TableCell scope="row" sx={{ textAlign: "right" }}>
                      <Tooltip arrow title={"取消审核"}>
                        <IconButton onClick={handleCancel(row.id)}>
                          <XCircle size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title={"删除"}>
                        <IconButton onClick={handleDelete(row.id)}>
                          <Trash2 size={20} />
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
        <Empty />
        )}
    </PageWrapper>
  )
}