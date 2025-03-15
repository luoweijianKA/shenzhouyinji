import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import enLocale from 'date-fns/locale/en-US'
import cnLocale from 'date-fns/locale/zh-CN'
import thLocale from 'date-fns/locale/th'
import { gql, useLazyQuery } from "@apollo/client"
import { PageWrapper } from '../../theme/components'
import {
    styled,
    Grid,
    Select,
    MenuItem,
    CardContent,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Breadcrumbs,
    FormControl,
    InputLabel,
    Link,
    Button,
    Typography,
    TextField,
    CardActions,
    Box,
    IconButton,
    TablePagination,
 } from '@mui/material'
import { Search } from 'react-feather'
import { useTheme } from '@mui/material/styles'
import { SelectChangeEvent } from '@mui/material/Select'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { OPTION_ALL } from 'constants/index'
import { formattedDate } from 'utils'
import Loading from 'components/Loading'
import { PageHeader, Title, StyledCard, DatePickerWrapper } from 'pages/styled'
import { useAccountState } from 'state/account/hooks'

const GET_LOGS = gql`
  query Logs($first: Int = 20, $after: ID, $start: Int!, $end: Int!, $loginId: String, $platform: Platform) {
    user {
      logs(first: $first, after: $after, start: $start, end: $end, loginId: $loginId, platform: $platform) {
        totalCount,
        edges {
          cursor
          log {
            id
            loginId
            name
            loginTime
            logoutTime
            platform
            ip
            region
          }
        }
        pageInfo {
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
`

const StyledCell = styled(TableCell)(() => ({
  fontFamily: '"DM Sans", sans-serif',
  fontSize: '0.875rem',
}))

interface Log {
  id: string
  loginId: string
  name: string
  loginTime: number
  logoutTime: number
  platform: string
  ip: string
  region: string
}

interface State {
  first: number
  after?: string
  start: number
  end: number
  loginId?: string
  platform?: string
  page: number
  totalCount: number
  logs: Log[]
  nextCursor?: string
}

const d = new Date()
const START = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000)
const platformOptions = ["WEB", "IOS", "ANDROID"]

const dateLocale: { [key: string]: string | object | undefined } = {
  "en": enLocale,
  "zh_CN": cnLocale,
  "th": thLocale,
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

export default function LoginLog() {
  const { t } = useTranslation()
  const { locale } = useAccountState()

  const [values, setValues] = useState<State>({
    first: 20,
    start: START,
    end: START + 24 * 3600,
    page: 0,
    totalCount: 0,
    logs: [],
  })

  const [getLogs, { data, loading }] = useLazyQuery(GET_LOGS)

  useEffect(() => {
    getLogs({ variables: { ...values }})
  }, [])

  useEffect(() => {
    if (data) {
      const { user: { logs: { totalCount, edges, pageInfo } } } = data
      setValues({
        ...values,
        totalCount,
        logs: edges.map(({ log }: { log: Log }) => log),
        nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
    }
  }, [data])

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleFocus = (prop: keyof State) => () => {
    setValues({ ...values, [prop]: "" })
  }

  const handlePlatformChange = (event: SelectChangeEvent) => {
    const { value } = event.target
    setValues({ ...values, platform: value === OPTION_ALL ? undefined : value })
  }

  const handleSearch = () => {
    const { first, start, end, loginId, platform } = values
    getLogs({ variables: { first, start, end, loginId, platform } })
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    console.log({ newPage })
    if (newPage === 0) {
      getLogs({ variables: { ...values, after: undefined }})
    } else if (newPage === values.page + 1) {
      getLogs({ variables: { ...values, after: values.nextCursor }})
    }

    setValues({ ...values, page: newPage })
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const first = parseInt(event.target.value, 10)
    setValues({ ...values, first, after: undefined, page: 0 })

    getLogs({ variables: { 
      ...values, 
      first: first === -1 ? values.totalCount : first, 
      after: undefined,
    }})
  }

  const formattedDuration = (value: number) => {
    return value < 3600 ? `${value}s` : `${Math.floor(value / 3600)}h`
  }

  console.log({ values })

  return (
    <PageWrapper>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale[locale ?? "en"]}>
        <PageHeader container>
          <Grid item xs={4}>
              <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" href="#log">
                {t("System Log")}
              </Link>
            </Breadcrumbs>
            <Title variant='h1'>{t('Login Log')}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <DatePickerWrapper>
              <DesktopDatePicker
                label={t('From')}
                inputFormat="yyyy-MM-dd"
                value={values.start * 1000}
                onChange={(val) => val && setValues({ ...values, start: Math.floor(val / 1000) })}
                renderInput={(params) => <TextField {...params} />}
              />
            </DatePickerWrapper>
            <DatePickerWrapper>
              <DesktopDatePicker
                label={t('To')}
                inputFormat="yyyy-MM-dd"
                value={values.end * 1000}
                onChange={(val) => val && setValues({ ...values, end: Math.floor(val / 1000) })}
                renderInput={(params) => <TextField {...params} />}
              />
            </DatePickerWrapper>
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="status-select-label">{t("From")}</InputLabel>
              <Select
                labelId="platform-select-label"
                id="platform-select"
                value={values.platform}
                label={t("From")}
                onChange={handlePlatformChange}
              >
                <MenuItem value={OPTION_ALL}>
                  <em>{t("All")}</em>
                </MenuItem>
                {platformOptions.map(opt => (<MenuItem key={opt} value={opt}>{t(opt)}</MenuItem>))}
              </Select>
            </FormControl>
             <TextField  
              id="loginid-input"
              label={t("Login Id")}
              defaultValue={values.loginId}
              size="small"
              onChange={handleChange("loginId")}
              onFocus={handleFocus("loginId")}
            />
            <Button
              disableElevation
              variant="contained" 
              startIcon={<Search size={18} />}
              onClick={handleSearch}
            >
              {t('Search')}
            </Button>
         </Grid>
        </PageHeader>
      </LocalizationProvider>
      {loading ? (<Loading />) : (
        <StyledCard>
            <CardContent>
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("Account")}</TableCell>
                    <TableCell>{t("From")}</TableCell>
                    <TableCell>{t("Login Time")}</TableCell>
                    <TableCell>{t("Logout Time")}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{t("Duration")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {values.logs.map((log) => (
                  <TableRow
                    key={log.loginId}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <StyledCell component="th" scope="row">
                      <Typography variant='subtitle2'>{log.loginId}</Typography>
                      <Typography variant='caption'>{log.name}</Typography>
                    </StyledCell> 
                    <StyledCell scope="row">
                      <Typography variant='subtitle2'>{log.platform}</Typography>
                      <Typography variant='subtitle2'>{log.ip}</Typography>
                      <Typography variant='caption'>{log.region}</Typography>
                    </StyledCell>
                    <StyledCell scope="row">{formattedDate(new Date(log.loginTime * 1000))}</StyledCell>
                    <StyledCell scope="row">
                      {log.logoutTime > 0 ? formattedDate(new Date(log.logoutTime * 1000)) : "--"}
                    </StyledCell>
                    <StyledCell scope="row" sx={{ textAlign: "center" }}>
                      {log.logoutTime > 0 ? formattedDuration(log.logoutTime - log.loginTime) : "--"}
                    </StyledCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
                </TableContainer>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", gap: "0.5rem", p: 2 }}>
                <TablePagination
                  component="div"
                  rowsPerPageOptions={[10, 20, 50, 100, { label: t("All"), value: -1 }]}
                  count={values.totalCount}
                  rowsPerPage={values.first}
                  page={values.page}
                  SelectProps={{
                    inputProps: {
                      'aria-label': 'page size',
                    },
                    native: true,
                  }}
                  labelRowsPerPage={`${t("Page Size")}:`}
                  labelDisplayedRows={() => ""}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
            </CardActions>
        </StyledCard>
      )}
    </PageWrapper>
  )
}