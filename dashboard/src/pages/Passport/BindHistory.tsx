import React, { useState, useMemo } from 'react'
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
  InputAdornment,
  Menu,
  MenuItem,
  Button,
  Stack,
 } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { gql, useQuery, useMutation } from '@apollo/client'
import { RefreshCw, Search, MoreVertical } from 'react-feather'
import { formattedDateTime } from 'utils'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import { PageHeader, Title, StyledCard } from 'pages/styled'

const GET_USER_PASSPORTS = gql`
  query GetUserPassports($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $filter: UserPassportFilter) {
    usedUserPassports(
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
          event_id
          passport_code
          real_name
          nric
          phone
          claim_by
          claim_time
          event {
            id
            name
          }
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

const UNBIND_PASSPORT = gql`
  mutation UpdateUserPassport($id: ID!) {
    updateUserPassport(input: {id: $id, passport_code: ""}) {
      succed
      message
    }
  }
`

const RESTORE_PASSPORT = gql`
  mutation UpdateUserPassport($id: ID!) {
    updateUserPassport(input: {id: $id, status: 4}) {
      succed
      message
    }
  }
`

interface UserPassport {
  id: string
  passport_code: string
  real_name: string
  nric: string
  phone: string
  claim_by: string
  claim_time: number
  event: {
    id: string
    name: string
  }
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

interface Search {
  label: string
  value: string
}

const SearchOptions: Search[] = [
  { label: '姓名', value: 'NAME' },
  { label: '手机号码', value: 'PHONE' },
]

interface State {
  first: number
  after?: string
  last: number
  before?: string
  filter?: {
    type: string
    search: string
  }
  page: number
  totalCount: number
  startCursor?: string
  endCursor?: string
  open: boolean
}

export default function BindHistory() {
  const [values, setValues] = useState<State>({ 
    first: 20, 
    last: 20, 
    page: 0, 
    totalCount: 0,
    open: false,
  })
  const { first, after, last, before, filter } = values
  const { data, loading, refetch } = useQuery(GET_USER_PASSPORTS, { variables: { first, after, last, before, filter }, fetchPolicy: "no-cache" })

  const passports: UserPassport[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.usedUserPassports
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node : UserPassport }) => node) 
    }
    return []
  }, [data])

  const [search, setSearch] = useState<{ option: Search, value: string }>({ option: { label: '姓名', value: 'NAME' }, value: '' })
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openSearch = Boolean(anchorEl)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch({ ...search, value: event.target.value })
  }

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const { option, value } = search
      const filter = value && value.length > 0 ? { type: option.value, search: value } : undefined
      setValues({ ...values, filter })
    }
  }

  const handleOpenSearch = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMouseDownSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleCloseSearch = (option: Search) => () => {
    setAnchorEl(null)
    setSearch({ ...search, option, value: '' })
  }

  const handleRefresh = () => {
    const { first, after, last, before, filter } = values
    refetch({ first, after, last, before, filter })
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

  const [unbind] = useMutation(UNBIND_PASSPORT, {
    // onCompleted: () => {
    //   if (data && onClose) {
    //     const { succed, message } = data
    //     if (succed && succed === false) {
    //       alert({ severity: "error", text: message })
    //       return
    //     }
    //     onClose(data, "escapeKeyDown")
    //   }
    // },
    refetchQueries: [
      { query: GET_USER_PASSPORTS },
      "GetUserPassports",
    ]
  })

  const handleUnbind = (id: string) => () => {
    unbind({ variables: { id } }).catch((e) => alert({ severity: "error", text: e.message }))
  }

  const [restore] = useMutation(RESTORE_PASSPORT, {
    refetchQueries: [
      { query: GET_USER_PASSPORTS },
      "GetUserPassports",
    ]
  })

  const handleRestore = (id: string) => () => {
    restore({ variables: { id } }).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"护照管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"绑定记录"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
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
                placeholder={search.option.label}
                value={search.value}
                startAdornment={<Search />}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleOpenSearch} onMouseDown={handleMouseDownSearch}>
                    <MoreVertical />
                    </IconButton>
                    <Menu
                      id="search-menu"
                      MenuListProps={{
                        'aria-labelledby': 'search-button',
                      }}
                      anchorEl={anchorEl}
                      open={openSearch}
                      onClose={handleCloseSearch}
                      PaperProps={{
                        style: {
                          width: '20ch',
                        },
                      }}
                    >
                      {SearchOptions.map((option) => (
                        <MenuItem key={option.value} selected={option.value === search.option.value} onClick={handleCloseSearch(option)}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </InputAdornment>
                }
                onChange={handleChange}
                onKeyUp={handleSearch}
              />
            </FormControl>
            <Button
              disableElevation
              variant="contained" 
              startIcon={<RefreshCw size={20}/>}
              onClick={handleRefresh}
            >
              {"刷新"}
            </Button>
        </Grid>
        </PageHeader>
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"参与活动"}</TableCell>
                      <TableCell>{"护照号码"}</TableCell>
                      <TableCell>{"用户"}</TableCell>
                      <TableCell>{"身份证号"}</TableCell>
                      <TableCell>{"手机号码"}</TableCell>
                      <TableCell>{"护照发放"}</TableCell>
                      <TableCell>{''}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {passports.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >

                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>{row.event.name}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.passport_code}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>{row.real_name}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>{row.nric}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>{row.phone}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>{row.claim_by}</Typography>
                      <Typography variant='caption'>{formattedDateTime(new Date(row.claim_time * 1000))}</Typography>
                    </TableCell>
                    <TableCell scope="row" sx={{ textAlign: "right" }}>
                      <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={0.5}
                      >
                        <Button variant="text" onClick={handleUnbind(row.id)}>解除护照</Button>
                        <Typography variant='subtitle2'>{'|'}</Typography>
                        <Button variant="text" onClick={handleRestore(row.id)}>还原护照</Button>
                      </Stack>
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