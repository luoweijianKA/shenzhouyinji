import React, { useState, useMemo } from 'react'
import { RefreshCw, Trash2 } from 'react-feather'
import {
  Grid,
  Breadcrumbs,
  Typography,
  TablePagination,
  Box,
  IconButton
 } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { Photo, usePhotos, useRemovePhotos } from 'hooks/usePhotos'
import { useAlert } from 'state/application/hooks'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import Empty from 'components/Empty'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { PageHeader, Title, LinkButton } from 'pages/styled'
import PhotoCard from './components/PhotoCard'

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;
  const pageCount = rowsPerPage === -1 ? 1 : Math.ceil(count / rowsPerPage)

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <Typography 
        variant='body2' 
        sx={{ 
          display: 'inline-block',
          padding: '0.5rem 1rem',
        }}
      >
        {page + 1} / {pageCount}
      </Typography>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  )
}

interface State {
  first: number
  after?: string
  last: number
  before?: string
  status: number
  eventId?: string
  scenerysports?: string[]
  page: number
  totalCount: number
  startCursor?: string
  endCursor?: string
  open: boolean
}

export default function PhotoRecycle() {
  const alert = useAlert()
  const [values, setValues] = useState<State>({ 
    first: 20, 
    last: 20, 
    status: 3,
    page: 0, 
    totalCount: 0,
    open: false,
  })
  const { first, after, last, before, status, eventId, scenerysports } = values
  const { data, loading, refetch } = usePhotos({ first, after, last, before, status, eventId, scenerysports })

  const photos: Photo[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.photos
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node: Photo }) => node) 
    }
    return []
  }, [data])

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [remove] = useRemovePhotos({status: status ?? 3, onCompleted: (data) => { console.log({ data }) }})

  const handleDelete = () => {
      setDeleteValues({ value: undefined, open: true })
  }

  const handleDeleteClose = (event: {}) => {
    setDeleteValues({ value: undefined, open: false })
  }
  
  const handleDeleteConfirm = (value?: { id: string }) => {
    remove()
      .then(({ data }) => {
        if (data) {
          alert({ severity: "success", text: '已成功清空数据！' })
          return
        }
      })
      .catch((e) => alert({ severity: "error", text: e.message }))
      .finally(() => setDeleteValues({ value: undefined, open: false }))
  }

  const handleRefresh = () => {
    const { first, after, last, before, status, eventId, scenerysports } = values
    refetch({ first, after, last, before, status, eventId, scenerysports })
  }

  const handleChange = (id: string, status: number) => {
    console.log({ id, status })
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    if (newPage === 0) {
      setValues({ ...values, after: undefined, before: undefined, page: newPage })
    } else if (newPage === values.page - 1) {
      setValues({ ...values, after: undefined, before: values.startCursor, page: newPage })
    } else {
      setValues({ ...values, after: values.endCursor, before: undefined, page: newPage })
    }
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = parseInt(event.target.value, 10)
    const limit = val === -1 ? values.totalCount : val
    setValues({ ...values, first: limit, after: undefined, last: limit, before: undefined, page: 0 })
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"印迹打卡"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"相册回收站"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
             <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<Trash2 />}
              onClick={handleDelete}
            >
              {"清空收回站"}
            </LinkButton>
            <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<RefreshCw />}
              onClick={handleRefresh}
            >
              {"刷新"}
            </LinkButton>
        </Grid>
         <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
        </PageHeader>
        {!loading ? (
          <Box>
          <Grid container sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexFlow: 'row wrap',
            width: '100%',
          }}>
            {photos.map((row) => (
              <Grid item sm={3} key={row.id}>
                <PhotoCard {...row} status={values.status} onChange={handleChange} />
              </Grid>
            ))}
            {photos.length === 0 && (<Empty />)}
          </Grid>
          {values.totalCount > 20 && (
              <TablePagination
                component="div"
                sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
                rowsPerPageOptions={[10, 20, 50, 100, { label: '全部', value: -1 }]}
                count={values.totalCount}
                rowsPerPage={values.first}
                page={values.page}
                SelectProps={{
                  inputProps: {
                    'aria-label': 'page size',
                  },
                  native: true,
                }}
                labelRowsPerPage={'页面数量:'}
                labelDisplayedRows={() => ""}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            )}
          </Box>
        ) : (
          <Loading />
        )}
    </PageWrapper>
  )
}