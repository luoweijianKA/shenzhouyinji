import React, { useState, useMemo, useEffect } from 'react'
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
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client'
import { RefreshCw, Search, Upload, Trash2, Check } from 'react-feather'
import { formattedDateTime } from 'utils'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { useUpload } from 'components/UploadFile'
import { useAlert } from 'state/application/hooks'
import { PageHeader, Title, StyledCard } from 'pages/styled'

const GET_SCENERYSPOTS = gql`
  query GetSceneryspots {
    sceneryspots {
      id
      name
    }
  }
`

const GET_EVENT_AWARDS = gql`
  query GetEventAwards($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $sceneryspotId: ID!, $code: String) {
    eventAwards(
      first: $first
      after: $after
      last: $last
      before: $before
      sceneryspotId: $sceneryspotId
      code: $code
    ) {
      totalCount
      edges {
        node {
          id
          eventId
          code
          createTime
          userId
          userName
          userAvatar
          sceneryspotId
          location
          awardTime
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

const CREATE_EVENT_AWARDS = gql`
  mutation CreateEventAwards($input: NewEventAwardUploadFile!) {
    createEventAwards(input: $input) {
      id
    }
  }
`

const DELETE_EVENT_AWARDS = gql`
  mutation DeleteEventAwards($input: [ID!]) {
    deleteEventAward(input: $input) {
      id
    }
  }
`

interface Award {
  id: string
  eventId: string
  code: string
  createTime: number
  userId?: string
  userName?: string
  userAvatar?: string
  sceneryspotId?: string
  location?: string
  awardTime?: number
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

interface ImportButtonProps {
  preview?: boolean
  tag?: string
  accept?: string
  onComplete?:  (value: string) => void
}

function ImportButton(props: ImportButtonProps) {
  const { preview, tag, accept, onComplete } = props
  const [values, setValues] = useState<{files: FileList | null, uri: string}>({ files: null, uri: "" })

  const { data, loading } = useUpload(values.files, preview ?? true, tag)

  useEffect(() => {
    if (data) {
      const { rawUri, previewUri } = data.file    
      const value = previewUri && previewUri.length > 0 ? previewUri : rawUri
      onComplete && onComplete(value ?? "")
    }
  }, [data])

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { validity, files } = event.target
    if (validity.valid && files) {
      setValues({ ...values, files })
    }
  }

  return (
    <Button 
      disableElevation 
      variant="contained" 
      component="label" 
      startIcon={loading ? (<CircularProgress size={20} />) : (<Upload size={20} />)}
      disabled={loading}
    >
      <input hidden accept={accept ?? "*/*"} type="file" name="myFile" onChange={handleUpload} />
      {"导入"}
    </Button>
  )
}

interface Sceneryspot {
  id: string
  name: string
}

interface Search {
  label: string
  value: string
}

interface State {
  first: number
  after?: string
  last: number
  before?: string
  sceneryspotId: string
  code?: string
  filter?: {
    type: string
    search: string
  }
  page: number
  totalCount: number
  startCursor?: string
  endCursor?: string
  search: Search
  open: boolean
}

function useSceneryspots() {
  const { data } = useQuery(GET_SCENERYSPOTS, { fetchPolicy: "no-cache" })

  return useMemo(() => {
    if (data) {
      return data.sceneryspots
    }
    return []
  }, [data])
}

export default function PlaceAward() {
  const alert = useAlert()
  const [values, setValues] = useState<State>({ 
    first: 20, 
    last: 20,
    page: 0, 
    sceneryspotId: '',
    totalCount: 0,
    search: { label: '领取码', value: 'CODE' },
    open: false,
  })
  const { first, after, last, before, sceneryspotId, code } = values

  const sceneryspots = useSceneryspots()

  useEffect(() => {
    if (!sceneryspotId && sceneryspots && sceneryspots.length > 0) {
      console.log(sceneryspots[0].id)
      setValues({ ...values, sceneryspotId: sceneryspots[0].id})
    }
  }, [sceneryspots])
 
  const [fetch, { data, loading, refetch }] = useLazyQuery(GET_EVENT_AWARDS, { fetchPolicy: "no-cache" })
  useEffect(() => {
    if (sceneryspotId && sceneryspotId.length > 0) {
      fetch({ variables: { first, after, last, before, sceneryspotId, code } })
    }
  }, [fetch, first, after, last, before, sceneryspotId, code ])
  
  const [createEventAwards] = useMutation(CREATE_EVENT_AWARDS, {
    refetchQueries: [
      { query: GET_EVENT_AWARDS, variables: { first, after, last, before, sceneryspotId, code } },
      "GetEventAwards",
    ]
  })

  const awards: Award[] = useMemo(() => {
    if (data) {
      const { totalCount, edges, pageInfo } = data.eventAwards
      setValues({
        ...values,
        totalCount,
        startCursor: pageInfo.hasPreviousPage ? pageInfo.startCursor : undefined,
        endCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
      })
      return edges.map(({ node }: { node: Award }) => node) 
    }
    return []
  }, [data])

  const handleSceneryspotChange = (event: SelectChangeEvent) => {
    console.log({ value: event.target.value })
    setValues({ ...values, sceneryspotId: event.target.value as string })
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } =  event.target
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

  const handleImportComplete = (file: string) => {
    if (file && file.length > 0) {
      const { sceneryspotId } = values
      createEventAwards({ variables: { input: { sceneryspotId, file } }})
        .catch((e) => alert({ severity: "error", text: e.message }))
    }
  }

  const [checked, setChecked] = useState<{ [key: string]: boolean }>({})
  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteEventAwards] = useMutation(DELETE_EVENT_AWARDS, {
    refetchQueries: [
      { query: GET_EVENT_AWARDS, variables: { first, after, last, before, sceneryspotId, code } },
      "GetEventAwards",
    ]
  })

  const handleCheckedAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = Object.assign({}, ...awards.map(v => ({ [v.id]: event.target.checked })))
    setChecked(checked)
  }

  const handleCheckedChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({ ...checked, [id]: event.target.checked })
  }

  const handleDelete = () => {
    const input = Object.keys(checked).filter(key => !!checked[key])
    if (input.length > 0) {
      setDeleteValues({ value: { id: '', name: '景区奖励' }, open: true })
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

  const handleRefresh = () => {
    const { first, after, last, before, sceneryspotId, code } = values
    refetch({ first, after, last, before, sceneryspotId, code })
  }

  const disabledDelete = Object.keys(checked).filter(key => !!checked[key]).length === 0

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"景区管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"景区奖励"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <FormControl size="small" sx={{ minWidth: 235 }}>
              <InputLabel id="Sceneryspot-select-label">{"景区"}</InputLabel>
              <Select
                labelId="Sceneryspot-select-label"
                id="Sceneryspot-select"
                value={values.sceneryspotId}
                label={"景区"}
                onChange={handleSceneryspotChange}
              >
                {sceneryspots && sceneryspots.map((v: Sceneryspot) => (<MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>))}
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
                placeholder={'领取码'}
                startAdornment={<Search />}
                onChange={handleSearch}
              />
            </FormControl>
            <ImportButton onComplete={handleImportComplete} />
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
            <Button
              disableElevation
              variant="contained" 
              startIcon={<RefreshCw size={20}/>}
              onClick={handleRefresh}
            >
              {"刷新"}
            </Button>
        </Grid>
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
                      <TableCell>{"领取码"}</TableCell>
                      <TableCell>{"领取"}</TableCell>
                      <TableCell>{"领取时间"}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {awards.map((row) => (
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
                      {row.userId && (<Check size={20} />)}
                    </TableCell>
                    <TableCell scope="row" component="th">
                      {row.awardTime && (<Typography variant='body2'>{formattedDateTime(new Date(row.awardTime * 1000))}</Typography>)}
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
              </TableContainer>
            </CardContent>
            {awards.length > 0 && (
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