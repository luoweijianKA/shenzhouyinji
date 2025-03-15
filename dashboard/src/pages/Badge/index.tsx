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
  Tooltip,
  ListItem,
  ListItemAvatar,
  Avatar,
 } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { gql, useQuery } from '@apollo/client'
import { RefreshCw, Search, ChevronRight } from 'react-feather'
import { PageWrapper } from 'theme/components'
import { formattedDateTime } from 'utils'
import Loading from 'components/Loading'
import { PageHeader, Title, LinkButton, StyledCard } from 'pages/styled'

const GET_BADGES = gql`
  query GetUserSwaps($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $filter: UserSwapFilter) {
    userSwaps(
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
          userId
          userName
          userAvatar
          badges {
            id
            name
            images
          }
          city
          status
          createTime
          expiredTime
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

interface Badge {
  id: string
  userId: string
  userName: string
  userAvatar: string
  badges: {
    id: string
    name: string
    images: string
  }[]
  city: string
  status: number
  createTime: number
  expiredTime: number
}

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
}

export default function Badge() {
  const [values, setValues] = useState<State>({ 
    first: 20, 
    last: 20, 
    page: 0, 
    totalCount: 0,
  })
  const { first, after, last, before, filter } = values
  const { data, loading, refetch } = useQuery(GET_BADGES, { variables: { first, after, last, before, filter }, fetchPolicy: "no-cache" })

  const badgeRows: Badge[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.userSwaps
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node: Badge }) => node) 
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
  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"徽章交换"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"交换列表"}</Title>
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
                placeholder="搜索用户"
                startAdornment={<Search />}
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
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"发起用户"}</TableCell>
                      <TableCell align="center">{"出"}</TableCell>
                      <TableCell align="center">{"入"}</TableCell>
                      <TableCell>{"地区"}</TableCell>
                      <TableCell>{"状态"}</TableCell>
                      <TableCell>{''}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {badgeRows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.userName}</Typography>
                      <Typography variant='caption'>{formattedDateTime(new Date(row.createTime * 1000))}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th" align="center">
                      <ListItem sx={{ p: 0, justifyContent: "center" }}>
                        <ListItemAvatar sx={{ mt: 0, mr: 1 }}>
                          <Avatar alt={row.badges[0].name} src={process.env.REACT_APP_RESOURCES_DOMAIN + row.badges[0].images} sx={{ width: 56, height: 56 }} />
                        </ListItemAvatar>
                      </ListItem>
                      <Typography variant='body2'>{row.badges[0].name}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th" align="center">
                       <ListItem sx={{ p: 0, justifyContent: "center" }}>
                        <ListItemAvatar sx={{ mt: 0, mr: 1 }}>
                          <Avatar alt={row.badges[1].name} src={process.env.REACT_APP_RESOURCES_DOMAIN + row.badges[1].images} sx={{ width: 56, height: 56 }} />
                        </ListItemAvatar>
                      </ListItem>
                      <Typography variant='body2'>{row.badges[1].name}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='body2'>{row.city}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      {row.status === 1 && (<Typography variant='body2' color="success">{"启用"}</Typography>)}
                      {row.status === 2 && (<Typography variant='body2' color="info">{"禁用"}</Typography>)}
                      {row.status === 3 && (<Typography variant='body2' color="error">{"已下架"}</Typography>)}
                    </TableCell>
                    <TableCell scope="row" sx={{ textAlign: "right" }}>
                      <Tooltip arrow title={"交换详情"}>
                        <IconButton href={`#/badge/${row.id}`}>
                          <ChevronRight size={20} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
              </TableContainer>
            </CardContent>
            {badgeRows.length > 0 && (
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