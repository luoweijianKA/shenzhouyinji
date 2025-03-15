import React, { useState, useMemo } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { RefreshCw, Search, Upload, Trash2, Check, ChevronLeft } from 'react-feather'
import {
  Grid,
  Breadcrumbs,
  Typography,
  CardContent,
  CardActions,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  FormControl,
  OutlinedInput,
  Box,
  TablePagination,
  Button,
  InputLabel,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Checkbox,
 } from '@mui/material'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useTheme } from '@mui/material/styles'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { gql, useQuery, useMutation } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { useAlert } from 'state/application/hooks'
import { PageHeader, Title, LinkButton, StyledCard } from 'pages/styled'
import { ImportModal } from './components/ImportModal'

const GET_PASSPORTS = gql`
  query GetPassports($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $eventId: ID!, $code: String) {
    passports(
        first: $first
        after: $after
        last: $last
        before: $before
        eventId: $eventId
        code: $code
    ) {
      totalCount
      edges {
        node {
          id
          code
          status
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

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      name
      status
    }
  }
`

const DELETE_PASSPORT = gql`
  mutation deletePassport($input: [ID!]) {
    deletePassport(input: $input) {
      id
    }
  }
`

interface Passport {
  id: string
  code: string
  status: number
}

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

interface Event {
  id: string
  name: string
}

interface State {
  first: number
  after?: string
  last: number
  before?: string
  eventId: string
  code?: string
  page: number
  totalCount: number
  startCursor?: string
  endCursor?: string
  open: boolean
}

function useEvents() {
  const { data } = useQuery(GET_EVENTS, { fetchPolicy: "no-cache" })

  return useMemo(() => {
    if (data) {
      return data.events
    }
    return []
  }, [data])
}

export default function PassportList({
  match: {
    params: { id }
  },
}: RouteComponentProps<{ id: string }>) {
  const alert = useAlert()
  const events = useEvents()
  const [values, setValues] = useState<State>({ 
    first: 20, 
    last: 20, 
    eventId: id,
    page: 0, 
    totalCount: 0,
    open: false,
  })
  const { first, after, last, before, eventId, code } = values
  const { data, loading, refetch } = useQuery(GET_PASSPORTS, { variables: { first, after, last, before, eventId, code }, fetchPolicy: "no-cache" })

  const passports: Passport[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.passports
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node: Passport }) => node) 
    }
    return []
  }, [data])

  const handleEventChange = (event: SelectChangeEvent) => {
    setValues({ ...values, eventId: event.target.value as string })
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const code = (value && value.length > 0) ? value : undefined
    setValues({ ...values, after: undefined, before: undefined, page: 0, code })
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

  const [checked, setChecked] = useState<{ [key: string]: boolean }>({})
  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deletePassport] = useMutation(DELETE_PASSPORT, {
    refetchQueries: [
      { query: GET_PASSPORTS, variables: { first, after, last, before, eventId, code } },
      "GetPassports",
    ]
  })

  const handleCheckedAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = Object.assign({}, ...passports.map(v => ({ [v.id]: event.target.checked })))
    setChecked(checked)
  }

  const handleCheckedChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({ ...checked, [id]: event.target.checked })
  }

  const handleDelete = () => {
    const input = Object.keys(checked).filter(key => !!checked[key])
    if (input.length > 0) {
      setDeleteValues({ value: { id: '', name: '护照号码' }, open: true })
    }
  }

  const handleDeleteClose = (event: {}) => {
    setDeleteValues({ value: undefined, open: false })
  }
  
  const handleDeleteConfirm = (value?: { id: string }) => {
    const input = Object.keys(checked).filter(key => !!checked[key])
    if (input.length > 0) {
      deletePassport({ variables: { input } })
        .then(({ data }) => {
          if (data.deletePassport && data.deletePassport.length > 0) {
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

  const handleRefresh = () => {
    const { first, after, last, before, eventId, code } = values
    refetch({ first, after, last, before, eventId, code })
  }

  const handleImport = () => {
    setValues({ ...values, open: true })
  }

  const handleImportClose = (event: any) => {
    const { addPassportStock } = event
    if (addPassportStock && addPassportStock.succed) {
      const { first, after, last, before, eventId, code } = values
      refetch({ first, after, last, before, eventId, code })
    }

    setValues({ ...values , open: false })
  }  

  const disabledDelete = Object.keys(checked).filter(key => !!checked[key]).length === 0

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"护照管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"护照列表"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <FormControl size="small" sx={{ minWidth: 235 }}>
              <InputLabel id="event-select-label">{"活动"}</InputLabel>
              <Select
                labelId="event-select-label"
                id="event-select"
                value={values.eventId}
                label={"活动"}
                onChange={handleEventChange}
              >
                {events && events.map((v: Event) => (<MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>))}
              </Select>
            </FormControl>
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
                placeholder={'护照号码'}
                startAdornment={<Search />}
                onChange={handleSearch}
              />
            </FormControl>
            <Button 
              disableElevation 
              variant="contained" 
              component="label" 
              startIcon={<Upload size={20}/>}
              onClick={handleImport}
              disabled={loading}
            >
                {"导入"}
            </Button>
            <Button 
              disableElevation 
              variant="contained" 
              component="label" 
              startIcon={<Trash2 size={20}/>}
              onClick={handleDelete}
              disabled={disabledDelete || loading}
            >
              {"删除"}
            </Button>
            <Button
              disableElevation
              variant="contained" 
              startIcon={loading ? (<CircularProgress size={20} />) : (<RefreshCw size={20} />)}
              onClick={handleRefresh}
              disabled={loading}
            >
              {"刷新"}
            </Button>
            <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<ChevronLeft size={20} />}
              href="#/passport"
            >
            {"返回"}
          </LinkButton>
        </Grid>
         <ImportModal open={values.open} events={events} selectedEvent={values.eventId} onClose={handleImportClose} />
        <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
        </PageHeader>
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
                      <TableCell>{"护照号码"}</TableCell>
                      <TableCell>{"领取"}</TableCell>
                      <TableCell>{"绑定"}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {passports.map((row) => (
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
                      <Typography variant='subtitle2'>{row.code}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      {(row.status & 1) === 1 && (<Check size={20} />)}
                    </TableCell>
                    <TableCell scope="row" component="th">
                       {(row.status & 2) === 2 && (<Check size={20} />)}
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
              </TableContainer>
            </CardContent>
            {passports.length > 0 && (
          <CardActions sx={{ justifyContent: "center", gap: "0.5rem", p: 2 }}>
            <TablePagination
              component="div"
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
          </CardActions>
        )}
          </StyledCard>
        ) : (
            <Loading />
        )}
    </PageWrapper>
  )
}