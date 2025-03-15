import React, { useState, useMemo } from 'react'
import { Plus, Edit, Trash2 } from 'react-feather'
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
  FormControlLabel,
  Checkbox,
  Button,
 } from '@mui/material'
import { gql, useQuery, useMutation } from '@apollo/client'
import { formattedDate } from 'utils'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { useAlert } from 'state/application/hooks'
import { PageHeader, Title, LinkButton, StyledCard } from 'pages/styled'

const GET_ANNOUNCEMENTS = gql`
  query GetNotifications {
    notifications{
      id
      name
      category_id
      content
      sender
      release_time
      blocking_time
      create_time
    }
  }
`

const DELETE_ANNOUNCEMENT = gql`
  mutation DeleteNotification($input: [ID!]) {
    deleteNotification(input: $input)
  }
`

interface Announcement {
  id: string
  title: string
  content: string
  timestamp: number
}

export default function Announcement() {
  const alert = useAlert()
  const { data, loading } = useQuery(GET_ANNOUNCEMENTS, { fetchPolicy: "no-cache" })

  const announcementRows: Announcement[] = useMemo(() => {
    if (data) {
      return data.notifications.map((v: any) => ({
        id: v.id,
        title: v.name,
        content: v.content,
        timestamp: v.release_time,
      }))
      .sort((a: Announcement, b: Announcement) => b.timestamp - a.timestamp)
    }
    return []
  }, [data])

  const [checked, setChecked] = useState<{ [key: string]: boolean }>({})
  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteEventAwards] = useMutation(DELETE_ANNOUNCEMENT, {
    refetchQueries: [
      { query: GET_ANNOUNCEMENTS },
      "GetNotifications",
    ]
  })

  const handleCheckedAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = Object.assign({}, ...announcementRows.map(v => ({ [v.id]: event.target.checked })))
    setChecked(checked)
  }

  const handleCheckedChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({ ...checked, [id]: event.target.checked })
  }

  const handleDelete = () => {
    const input = Object.keys(checked).filter(key => !!checked[key])
    if (input.length > 0) {
      setDeleteValues({ value: { id: '', name: '公告' }, open: true })
    }
  }

  const handleDeleteClose = (event: {}) => {
    setDeleteValues({ value: undefined, open: false })
  }
  
  const handleDeleteConfirm = (value?: { id: string }) => {
    const input = Object.keys(checked).filter(key => !!checked[key])
    if (input.length > 0) {
      deleteEventAwards({ variables: { input }})
        .then(({ data }) => {
          if (data) {
            alert({ severity: "success", text: '已成功删除数据！' })
            setChecked({})
            return
          }
        })
        .catch((e) => alert({ severity: "error", text: e.message }))
        .finally(() => setDeleteValues({ value: undefined, open: false }))
    } else {
      setDeleteValues({ value: undefined, open: false })
    }
  }

  const disabledDelete = Object.keys(checked).filter(key => !!checked[key]).length === 0

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"公告管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"公告列表"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<Plus />}
              href="#/announcement/add"
            >
              {"添加"}
            </LinkButton>
            <Button 
              disableElevation 
              variant="contained" 
              component="label" 
              startIcon={<Trash2 size={20}/>}
              onClick={handleDelete}
              disabled={disabledDelete}
            >
              {"删除"}
            </Button>
        </Grid>
        </PageHeader>
        <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <FormControlLabel 
                          control={<Checkbox onChange={handleCheckedAll} />} 
                          label=''
                        />
                      </TableCell>
                      <TableCell>{"公告"}</TableCell>
                      <TableCell sx={{ minWidth: "135px" }}>{"发布时间"}</TableCell>
                      <TableCell sx={{ minWidth: "135px" }}>{""}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {announcementRows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <FormControlLabel 
                        control={<Checkbox checked={!!checked[row.id]} onChange={handleCheckedChange(row.id)} />} 
                        label=''
                      />
                    </TableCell>
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
                      <IconButton href={`#/announcement/${row.id}`}>
                        <Edit size={20} />
                      </IconButton>
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