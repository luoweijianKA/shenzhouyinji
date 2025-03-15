import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Navigation, Package } from 'react-feather'
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
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Tooltip,
  FormControl,
  OutlinedInput,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  MenuItem,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import UploadFile from 'components/UploadFile'
import QQMap from 'components/QQMap'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { useAlert } from 'state/application/hooks'
import Loading from 'components/Loading'
import { PageHeader, Title, StyledCard, FormInput } from 'pages/styled'

const GET_CATEGORIES = gql`
  query GetCategories($parentId: String!) {
    categoriesByParentID(id: $parentId) {
      id
      name
      sort
    }
  }
`

const GET_SCENERYSPOTS = gql`
  query GetSceneryspots {
    sceneryspots {
      id
      code
      name
      address
      points
      images
      coordinate
      electric_fence
      introduction
      category_id
      position_tolerance
      passport_link
      health_code_link
      status
      enable_award
    }
  }
`

const ADD_SCENERYSPOT = gql`
  mutation AddSceneryspot($input: NewSceneryspot!) {
    createSceneryspot(input: $input) {
      id
    }
  }
`

const UPDATE_SCENERYSPOT = gql`
  mutation UpdateSceneryspot($input: UpdateSceneryspot!) {
    updateSceneryspot(input: $input) {
      succed
      message
    }
  }
`

const DELETE_SCENERYSPOT = gql`
  mutation UpdateSceneryspot($id: ID!) {
    updateSceneryspot(input: {id: $id, status: 4}) {
      succed
      message
    }
  }
`

interface Option {
  label: string
  value: string
}

interface Sceneryspot {
  id?: string
  code: string
  name: string
  address: string
  points: number
  images: string
  coordinate: string
  electric_fence: string
  introduction: string
  category_id: string
  position_tolerance: string
  passport_link: string
  health_code_link: string
  status: number
  enable_award: boolean
}

const initialSceneryspot: Sceneryspot = {
  id: undefined,
  code: "",
  name: "",
  address: "",
  points: 0,
  images: "",
  coordinate: "",
  electric_fence: "",
  introduction: "",
  category_id: "",
  position_tolerance: "",
  passport_link: "",
  health_code_link: "",
  status: 1,
  enable_award: false,
}

function useSave({ value, onCompleted } : { value?: Sceneryspot, onCompleted?: (data: any) => void }) {
  const add = useMutation(ADD_SCENERYSPOT, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createSceneryspot)
    },
    refetchQueries: [
      { query: GET_SCENERYSPOTS },
      "GetSceneryspots",
    ]
  })

  const update = useMutation(UPDATE_SCENERYSPOT, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateSceneryspot)
    },
    refetchQueries: [
      { query: GET_SCENERYSPOTS },
      "GetSceneryspots",
    ]
  })

  return value?.id ? update : add
}

function SceneryspotModal({ value, ...props } : { value?: Sceneryspot } & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const { data } = useQuery(GET_CATEGORIES, { variables: { parentId: `${process.env.REACT_APP_CATEGOTRY_SCENERY_SPOT}` }, fetchPolicy: "no-cache" })

  const categories: Option[] = useMemo(() => {
    if (data) {
      return data.categoriesByParentID
        .sort((a: any, b: any) => b.sort - a.sort)
        .map((v: any) => ({ label: v.name, value: v.id }))
    }
    return []
  }, [data])

  const [values, setValues] = useState<Sceneryspot>({ ...initialSceneryspot })
  const isValid = values.name.length > 0

  const [save, { loading }] = useSave({
    value: values,
    onCompleted: (data) => {
      console.log({ data, onClose })
      if (data && onClose) {
        const { succed, message } = data
        if (succed && succed === false) {
          alert({ severity: "error", text: message })
          return
        }
        onClose(data, "escapeKeyDown")
      }
    }
  })

  useEffect(() => {
    if (open) {
      if (value) {
        setValues({ ...value })
      } else {
        setValues({ ...initialSceneryspot })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Sceneryspot) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, status: event.target.checked ? 2 : 1 })
  }

  const handleAwardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, enable_award: event.target.checked })
  }

  const handleUpload = (prop: keyof Sceneryspot) => (value: string) => {
    setValues({ ...values, [prop]: value })
  }

  const handleCategory = (event: SelectChangeEvent) => {
   setValues({ ...values, category_id: event.target.value })
  }

  const handleOK = () => {
    save({ variables: { input: { ...values } }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  let lat, lng
  if (values.coordinate && values.coordinate.length > 0) {
    const coordinate = values.coordinate.split(',')
    lat = coordinate[0]
    lng = coordinate[1]
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <DialogTitle>{value ? "修改景区" : "添加景区"}</DialogTitle>
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"景区编号"}</Typography>
          <FormInput 
            fullWidth 
            id="code-input"
            value={values.code}
            onChange={handleChange("code")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"景区名称"}</Typography>
          <FormInput 
            fullWidth 
            id="name-input"
            value={values.name}
            onChange={handleChange("name")}
          />
          <FormControlLabel 
            control={<Checkbox checked={values.status === 2} onChange={handleStatusChange} />} 
            label="完成景区所有已接任务"
            sx={{ '& .MuiTypography-root': { margin: '0 !important' } }}
          />
          <FormControlLabel 
            control={<Checkbox checked={values.enable_award} onChange={handleAwardChange} />} 
            label="奖励"
            sx={{ '& .MuiTypography-root': { margin: '0 !important' } }}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"景区分类"}</Typography>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={values.category_id}
            size="small"
            variant="outlined"
            notched={true}
            onChange={handleCategory}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                top: 0,
                "& > legend": {
                    float: "left !important",
                }
              },
            }}
          >
            {categories.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"地址"}</Typography>
          <FormInput 
            fullWidth 
            id="address-input"
            value={values.address}
            onChange={handleChange("address")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"打卡积分"}</Typography>
          <FormInput 
            fullWidth 
            id="points-input"
            value={values.points}
            onChange={handleChange("points")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"宣传封面"}</Typography>
          <UploadFile preview={true} value={values.images} onChange={handleUpload("images")} />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"中心坐标"}</Typography>
          <FormInput 
            fullWidth 
            id="coordinate-input"
            value={values.coordinate}
            onChange={handleChange("coordinate")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"电字围栏"}</Typography>
          <FormInput 
            fullWidth 
            id="electric-fence-input"
            value={values.electric_fence}
            sx={{ mb: 2 }}
            onChange={handleChange("electric_fence")}
          />
          <QQMap lat={lat} lng={lng} value={values.electric_fence} onChange={(electric_fence) => setValues({ ...values, electric_fence }) } />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"定位容错"}</Typography>
          <FormInput 
            fullWidth 
            id="position-tolerance-input"
            value={values.position_tolerance}
            onChange={handleChange("position_tolerance")}
          />
          <FormHelperText id="display-order-text">
            {"请填写整数，单位KM"}
          </FormHelperText>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"景区介绍"}</Typography>
          <FormInput 
            fullWidth 
            multiline
            rows={4}
            id="introduction-input"
            value={values.introduction}
            onChange={handleChange('introduction')}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose({})}>{"取消"}</Button>
        <LoadingButton 
          disableElevation 
          variant="contained"
          disabled={!isValid}
          loading={loading}
          onClick={handleOK}
        >
          {"确定"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

interface State {
  value?: Sceneryspot
  open: boolean
  search: string
}

export default function Place() {
  const alert = useAlert()
  const [values, setValues] = useState<State>({ value: undefined, open: false, search: '' })
  const { data, loading } = useQuery(GET_SCENERYSPOTS, { fetchPolicy: "no-cache" })

  const sceneryspotRows: Sceneryspot[] = useMemo(() => {
    if (data) {
      return data.sceneryspots.map((v: any) => ({ ...v }))
    }
    return []
  }, [data])

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleUpdate = (value: Sceneryspot) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteSceneryspot] = useMutation(DELETE_SCENERYSPOT, {
    refetchQueries: [
      { query: GET_SCENERYSPOTS },
      "GetSceneryspots",
    ]
  })

  const handleDelete = (value: Sceneryspot) => () => {
    const { id, name } = value
    if (id) {
      setDeleteValues({ value: { id, name }, open: true })
    }
  }

  const handleDeleteClose = (event: {}) => {
    setDeleteValues({ value: undefined, open: false })
  }
  
  const handleDeleteConfirm = (value?: { id: string }) => {
    if (value) {
      const { id } = value
      deleteSceneryspot({ variables: { id }})
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.updateSceneryspot
            if (succed) {
              alert({ severity: "success", text: '已成功删除数据！' })
              return
            }
            alert({ severity: "error", text: message })
          }
          
        })
        .catch((e) => alert({ severity: "error", text: e.message }))
        .finally(() => setDeleteValues({ value: undefined, open: false }))
    } else {
      setDeleteValues({ value: undefined, open: false })
    }
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"景区管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"景区列表"}</Title>
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
                placeholder="搜索景区"
                startAdornment={<Search />}
                value={values.search}
                onChange={handleChange('search')}
              />
            </FormControl>
            <Button
              disableElevation
              variant="contained" 
              startIcon={<Plus />}
              onClick={handleAdd}
            >
              {"添加"}
            </Button>
        </Grid>
        </PageHeader>
        <SceneryspotModal  
          {...values}
          onClose={handleClose}
        />
        <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"编号"}</TableCell>
                      <TableCell>{"景区"}</TableCell>
                      <TableCell>{"坐标"}</TableCell>
                      <TableCell>{''}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {sceneryspotRows.filter(row => row.name.indexOf(values.search) > -1 ).map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.code}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <ListItem alignItems="flex-start" sx={{ p: 0 }}>
                        <ListItemAvatar sx={{ mt: 0.5, mr: 2 }}>
                          <Avatar alt={row.name} src={`${process.env.REACT_APP_RESOURCES_DOMAIN}` + row.images} sx={{ width: 56, height: 56 }} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={row.name}
                          secondary={
                            <Box>
                              <Typography sx={{ display: 'inline',  mr: 1 }} variant="caption">
                                {row.address}
                              </Typography>
                              <Tooltip arrow title={"景区导航"}>
                                <IconButton aria-label="navigation" href={`#/place/${row.id}/navigation`}>
                                  <Navigation size={20} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip arrow title={"景区任务"}>
                                <IconButton aria-label="package" href={`#/place/${row.id}/trek`}>
                                  <Package size={20} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          }
                        />
                    </ListItem>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.coordinate}</Typography>
                    </TableCell>
                    <TableCell scope="row" sx={{ textAlign: "right" }}>
                      <IconButton onClick={handleUpdate(row)}>
                        <Edit size={20} />
                      </IconButton>
                      <IconButton onClick={handleDelete(row)}>
                        <Trash2 size={20} />
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