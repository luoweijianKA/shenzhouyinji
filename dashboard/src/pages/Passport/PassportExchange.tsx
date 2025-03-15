import React, { useState, useMemo, useEffect } from 'react'
import { RefreshCw, Search, MoreVertical } from 'react-feather'
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
  TablePagination,
  IconButton,
  FormControl,
  OutlinedInput,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  InputAdornment,
  Menu,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  Stack,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import { useAlert } from 'state/application/hooks'
import Loading from 'components/Loading'
import { PageHeader, Title, LinkButton, StyledCard, FormInput } from 'pages/styled'

const GET_PASSPORTS = gql`
  query GetUsedUserPassports($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $filter: UserPassportFilter) {
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
          user_id
          event_id
          passport_code
          real_name
          phone
          status
          event {
            id
            name
          }
          camp {
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

const GET_CAMPS = gql`
  query GetCamps($eventId: String!) {
    camps(event_id: $eventId) {
      id
      name
    }
  }
`

const UPDATE_PASSPORT = gql`
  mutation UpdateUserPassport($input: UpdateUserPassport!) {
    updateUserPassport(input: $input) {
      succed
      message
    }
  }
`

interface Passport {
  id: string
  user_id: string
  event_id: string
  passport_code: string
  real_name: string
  phone: string
  status: number
  event?: { id: string, name: string }
  camp?: { id: string, name: string }
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

function useCamps(eventId?: string) {
  const [result, setResult] = useState<{ id: string, name: string }[] | undefined>(undefined)
  const [fetch, { data }] = useLazyQuery(GET_CAMPS, { fetchPolicy: "no-cache" })

  useEffect(() => {
    if (eventId) {
      fetch({ variables: { eventId } })
    }
  }, [fetch, eventId])

  useEffect(() => {
    if (data) {
      setResult([ ...data.camps ])
    }
  }, [data])
  
  return result
}

interface ExchangeState {
  id: string
  event_id: string
  passport_code: string
  camp_id?: string
}

function ExchangeModal({ value, ...props } : { value?: Passport } & DialogProps) {
  const { open, onClose } = props
  const alert = useAlert()
  const camps = useCamps(value?.event_id)
  const [values, setValues] = useState<ExchangeState | undefined>(undefined)

  const [updatePassport, { data, loading }] = useMutation(UPDATE_PASSPORT, {
    onCompleted: () => {
      if (data && onClose) {
        const { succed, message } = data
        if (succed && succed === false) {
          alert({ severity: "error", text: message })
          return
        }
        onClose(data, "escapeKeyDown")
      }
    },
    refetchQueries: [
      { query: GET_PASSPORTS },
      "GetUsedUserPassports",
    ]
  })

  const isValid = values && values.passport_code.length > 0

  useEffect(() => {
    if (open && value) {
      const { id, event_id, passport_code, camp } = value
      setValues({ ...values, id, event_id, passport_code, camp_id: camp?.id })
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof ExchangeState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (values) {
      setValues({ ...values, [prop]: event.target.value })
    }
  }

  const handleOK = () => {
    if (values) {
      updatePassport({ variables: { input: { ...values } } }).catch((e) => alert({ severity: "error", text: e.message }))
    }
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{"更换护照"}</DialogTitle>
      <DialogContent>
        <FormControl variant="standard" sx={{ width: "100%", mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"护照号码"}</Typography>
          <FormInput 
            fullWidth
            id="passport-id-input"  
            aria-describedby="passport-id-helper-text"
            value={values?.passport_code}
            onChange={handleChange("passport_code")}
          />
        </FormControl>
        <FormControl variant="standard" sx={{ width: "100%", mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"所属阵营"}</Typography>
          <RadioGroup
            row
            aria-labelledby="camp-group-label"
            name="camp-group"
          >
            {camps && camps.map(opt => (
              <FormControlLabel
                key={opt.id}
                value={opt.id} 
                control={<Radio checked={opt.id === values?.camp_id} onChange={handleChange("camp_id")} />} 
                label={opt.name}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose({})}>{"取消"}</Button>
        <LoadingButton 
          disableElevation 
          variant="contained"
          disabled={!isValid || loading}
          loading={loading}
          onClick={handleOK}
        >
          {"确定"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
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
  filter?: { type: string, search: string}
  page: number
  totalCount: number
  startCursor?: string
  endCursor?: string
  value?: Passport
  open: boolean
  showExchange: boolean
}

export default function PassportExchange() {
  const [values, setValues] = useState<State>({
    first: 20, 
    last: 20,
    page: 0, 
    totalCount: 0,
    open: false,
    showExchange: false,
  })
  const { first, after, last, before, filter } = values
  const { data, loading, refetch } = useQuery(GET_PASSPORTS, { variables: { first, after, last, before, filter }, fetchPolicy: "no-cache" })

  const passports: Passport[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.usedUserPassports
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

  const [search, setSearch] = useState<{ option: Search, value: string }>({ option: { label: '姓名', value: 'NAME' }, value: '' })
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openSearch = Boolean(anchorEl)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch({ ...search, value: event.target.value })
  }

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const { option, value } = search
      console.log({ option, value })
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

  const handleUpdate = (value: Passport) => () => {
    setValues({ ...values, value, open: true })
  }

  return (
    <PageWrapper>
      <PageHeader container >
        <Grid item xs={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">{"护照管理"}</Typography>
          </Breadcrumbs>
          <Title variant='h1'>{"护照更换"}</Title>
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
              startAdornment={<InputAdornment position="start"><Search /></InputAdornment>}
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
      <ExchangeModal
        value={values.value}
        open={values.open}
        onClose={() => setValues({ ...values , value: undefined, open: false })}
      />
      {!loading  ? (
        <StyledCard>
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"用户"}</TableCell>
                    <TableCell>{"活动"}</TableCell>
                    <TableCell>{"阵营"}</TableCell>
                    <TableCell>{"护照号码"}</TableCell>
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
                    <Typography variant='subtitle2'>{row.real_name}</Typography>
                    <Typography variant='caption'>{row.phone}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <Typography variant='body2'>{row.event?.name ?? '-'}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <Typography variant='body2'>{row.camp?.name ?? '-'}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{row.passport_code}</Typography>
                  </TableCell>
                  <TableCell scope="row" sx={{ textAlign: "right" }}>
                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      spacing={0.5}
                    >
                      <Button variant="text" onClick={handleUpdate(row)}>更换护照</Button>
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