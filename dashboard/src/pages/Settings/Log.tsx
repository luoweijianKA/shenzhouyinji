import React, { useState, useMemo } from 'react'
import { RefreshCw, ChevronRight, X } from 'react-feather'
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
  Box,
  TablePagination,
  Tooltip,
  DialogTitle,
  DialogContent,
  TextField,
 } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import cnLocale from 'date-fns/locale/zh-CN'
import { gql, useQuery } from '@apollo/client'
import { today, formattedDateTime } from 'utils'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import Empty from 'components/Empty'
import { PageHeader, Title, LinkButton, StyledCard, FormInput, DatePickerWrapper } from 'pages/styled'

const GET_AUDITINGS = gql`
  query GetAuditings($first: Int = 20, $after:ID, $last: Int=20, $before: ID, $filter: AuditingFilter) {
    auditings(first: $first, after: $after, last: $last, before: $before, filter: $filter) {
      totalCount
      edges {
        node {
          id
          code
          message
          data
          createdBy
          createdTime
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

interface Auditing {
  id: string
  code: string
  message: string
  data: any
  createdBy: string
  createdTime: number
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

interface DialogTitleProps {
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X />
        </IconButton>
      ) : null}
    </DialogTitle>
  )
}


function AuditingModal({ value, ...props } : { value?: Auditing } & DialogProps) {
  const { onClose } = props

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <BootstrapDialogTitle onClose={handleClose({})}>{"系统日志"}</BootstrapDialogTitle>
      <DialogContent sx={{ 
        "& .MuiFormControl-root": { 
          width: "100%", 
          ":not(:first-of-type)": { 
            mt: 2
          },
          "& .MuiTypography-root": {
            mb: 1
          }
        }
      }}>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"日志"}</Typography>
          <FormInput 
            fullWidth
            disabled
            id="message-input"
            value={value?.message}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"创建人"}</Typography>
          <FormInput 
            fullWidth
            disabled
            id="created-by-input"
            value={value?.createdBy}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"创建时间"}</Typography>
          <FormInput 
            fullWidth
            disabled
            id="created-time-input"
            value={value ? formattedDateTime(new Date(value.createdTime * 1000)) : ''}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"详情"}</Typography>
          <FormInput 
            fullWidth 
            disabled
            multiline
            rows={4}
            id="data-input"
            value={value ? JSON.stringify(value.data) : ''}
          />
        </FormControl>
      </DialogContent>
    </Dialog>
  )
}

interface Filter {
  code: string
  createdBy: string
  startTime: number
  endTime: number
}

interface State {
  first: number
  after?: string
  last: number
  before?: string
  filter?: Filter
  page: number
  totalCount: number
  startCursor?: string
  endCursor?: string
  value?: Auditing
  open: boolean
}

const time = Math.floor(today().getTime() / 1000)

export default function Log() {
  const [values, setValues] = useState<State>({ 
    first: 20, 
    last: 20,
    filter: {
      code: '',
      createdBy: '',
      startTime: time - (6 * 24 * 3600),
      endTime: time + (24 * 3600 - 1),
    },
    page: 0, 
    totalCount: 0,
    open: false,
  })
  const { first, after, last, before, filter } = values
  const { data, loading, refetch } = useQuery(GET_AUDITINGS, { variables: { first, after, last, before, filter }, fetchPolicy: "no-cache" })

  const auditings: Auditing[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.auditings
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node: Auditing }) => node) 
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

  const handleOpen = (value: Auditing) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const handleFilter = (prop: keyof Filter) => (value: number | null) => {
    if (value) {
      console.log({ [prop]: value})
      const filter = { 
        ...(values.filter ?? { code: '', createdBy: '', startTime: 0, endTime: 0 }),
       [prop]: Math.floor(value / 1000),
      }
      
      setValues({ ...values, filter })
    }
  }

  return (
    <PageWrapper>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={cnLocale}>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"系统管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"系统日志"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <DatePickerWrapper>
              <DesktopDatePicker
                label={'开始时间'}
                inputFormat="yyyy-MM-dd"
                value={values.filter ? (values.filter.startTime * 1000) : null}
                onChange={handleFilter('startTime')}
                renderInput={(params) => <TextField {...params} />}
              />
            </DatePickerWrapper>
            <DatePickerWrapper>
              <DesktopDatePicker
                label={'结束时间'}
                inputFormat="yyyy-MM-dd"
                value={values.filter ? (values.filter.endTime * 1000) : null}
                 onChange={handleFilter('endTime')}
                renderInput={(params) => <TextField {...params} />}
              />
            </DatePickerWrapper>
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
        </LocalizationProvider>
        <AuditingModal  
          {...values}
          onClose={handleClose}
        />
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"日志"}</TableCell>
                      <TableCell>{"创建人"}</TableCell>
                      <TableCell>{"创建时间"}</TableCell>
                      <TableCell>{''}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {auditings.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>{row.message}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>{row.createdBy}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>{formattedDateTime(new Date(row.createdTime * 1000))}</Typography>
                    </TableCell>
                     <TableCell scope="row" sx={{ textAlign: "right" }}>
                      <Tooltip arrow title={"详情"}>
                        <IconButton onClick={handleOpen(row)}>
                          <ChevronRight />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {auditings.length === 0 && (
                  <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell scope="row" component="th" colSpan={4}>
                      <Empty />
                    </TableCell>
                  </TableRow>
                )}
                </TableBody>
            </Table>
              </TableContainer>
            </CardContent>
            {auditings.length > 0 && (
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