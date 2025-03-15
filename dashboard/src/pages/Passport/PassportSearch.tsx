import React, { useState, useEffect } from 'react'
import { Search, MoreVertical, ChevronRight, ChevronLeft } from 'react-feather'
import {
  Grid,
  Breadcrumbs,
  Typography,
  CardContent,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Menu,
  MenuItem,
  IconButton,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Button,
  Stack,
 } from '@mui/material'
import { gql, useLazyQuery } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import Empty from 'components/Empty'
import { PageHeader, Title, StyledCard } from 'pages/styled'

const PASSPORT_SEARCH = gql`
  query PassportSearch($input: PassportSearchInput!) {
    passportSearch(input: $input) {
      id
      code
      event {
        id
        name
      }
      name
      nric
      phone
      guardianName
      guardianNric
      guardianPhone
    }
  }
`

interface Search {
  label: string
  value: string
}

const SearchOptions: Search[] = [
  { label: '护照号码', value: 'CODE' },
  { label: '姓名', value: 'NAME' },
  { label: '身份证号', value: 'NRIC' },
  { label: '手机号码', value: 'PHONE' },
  { label: '监护人姓名', value: 'GUARDIAN_NAME' },
  { label: '监护人身份证号', value: 'GUARDIAN_NRIC' },
  { label: '监护人手机号码', value: 'GUARDIAN_PHONE' },
]

interface State {
  search: Search
  value: string
  result: Passport[] | undefined
}

interface Passport {
  id: string
  code: string
  event: { id: string, name: string }
  name: string
  nric: string
  phone: string
  guardianName: string
  guardianNric: string
  guardianPhone: string
}

export default function PassportSearch() {
  const [values, setValues] = useState<State>({ search: { label: '护照号码', value: 'CODE' }, value: '', result: undefined })
  const [fetch, { data, loading }] = useLazyQuery(PASSPORT_SEARCH, { fetchPolicy: "no-cache" })
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openSearch = Boolean(anchorEl)

  useEffect(() => {
    if (data) {
      setValues({ ...values, result: [ ...data.passportSearch ] })
    }
  }, [data])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, value: event.target.value })
  }

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const { search, value } = values
      fetch({ variables: { input: { search: search.value, value } } })
    }
  }

  const handleOpenSearch = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMouseDownSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleCloseSearch = (search: Search) => () => {
    setAnchorEl(null)
    setValues({ ...values, search, value: '' })
  }

  const handleBack = () => {
    setValues({ ...values, value: '', result: undefined })
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"护照管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"护照搜索"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            {values.result && (
              <Button
                disableElevation
                variant="contained" 
                startIcon={<ChevronLeft size={20} />}
                onClick={handleBack}
              >
                {"返回"}
              </Button>
            )}
          </Grid>
        </PageHeader>
        {loading && ( <Loading />)}
        {!values.result && (
          <StyledCard sx={{ width: '60%', margin: '0 auto' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <FormControl sx={{ width: '100%' }}>
                <OutlinedInput
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      top: 0,
                      "& > legend": {
                        float: 'left !important',
                      }
                    }
                  }}
                  notched={false}
                  placeholder={values.search.label}
                  startAdornment={<InputAdornment position="start"><Search /></InputAdornment>}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton onClick={handleOpenSearch} onMouseDown={handleMouseDownSearch}>
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
                          <MenuItem key={option.value} selected={option.value === values.search.value} onClick={handleCloseSearch(option)}>
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
            </CardContent>
          </StyledCard>
        )}
        {values.result && (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"搜索结查"}</TableCell>
                      <TableCell>{""}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {values.result.length === 0 ? (
                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell scope="row" component="th" colSpan={2}>
                        <Empty />
                      </TableCell>
                    </TableRow>
                  ) : (
                    values.result.map((row) => (
                      <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell scope="row" component="th">
                          <Typography variant='subtitle2'>{row.code}</Typography>
                          <Stack
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="center"
                            spacing={2}
                          >
                            <Typography variant='caption'>{'所属活动：' + row.event.name}</Typography>
                            <Typography variant='caption'>{'姓名：' + row.name}</Typography>
                            <Typography variant='caption'>{'身份证号：' + row.nric}</Typography>
                            <Typography variant='caption'>{'手机号码：' + row.phone}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell scope="row" sx={{ textAlign: "right" }}>
                          <Tooltip arrow title={"详情"}>
                            <IconButton href={`#/passport/search/${row.id}`}>
                              <ChevronRight size={20} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        )}
    </PageWrapper>
  )
}