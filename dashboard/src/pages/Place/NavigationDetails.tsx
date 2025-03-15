import React, { useState, useMemo, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Plus, Edit, Trash2 } from 'react-feather'
import {
  Grid,
  Breadcrumbs,
  Typography,
  Card,
  CardMedia,
  Button,
  Link,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Stack,
  Chip,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormHelperText,
  MenuItem,
  Box,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import UploadFile from 'components/UploadFile'
import QQMap from 'components/QQMap'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { useAlert } from 'state/application/hooks'
import { PageHeader, Title, FormInput } from 'pages/styled'

const GET_SCENERYSPOT = gql`
  query GetSceneryspot($id: String!) {
    sceneryspot(id: $id) {
      id
      name
    }
  }
`

const GET_CATEGORIES = gql`
  query GetCategories($parentId: String!) {
    categoriesByParentID(id: $parentId) {
      id
      name
      parent_id
      has_subclass
      status
      sort
    }
  }
`

const GET_SERVICE_ITEMS = gql`
  query GetServiceItems($sceneryspotId: String!) {
    serviceItems(sceneryspot_id: $sceneryspotId) {
      id
      sceneryspot_id
      name
      category_id
      address
      images
      coordinate
      wxappid
      display_order
      introduction
      expense_instruction
      status
    }
  }
`

const ADD_SERVICE_ITEM = gql`
  mutation AddServiceItem($input: NewServiceItem!) {
    createServiceItem(input: $input) {
      id
    }
  }
`

const UPDATE_SERVICE_ITEM = gql`
  mutation UpdateServiceItem($input: UpdateServiceItem!) {
    updateServiceItem(input: $input) {
      succed
      message
    }
  }
`

const DELETE_SERVICE_ITEM = gql`
  mutation UpdateServiceItem($id: ID!) {
    updateServiceItem(input: {id: $id, status: 4}) {
      succed
      message
    }
  }
`

interface Sceneryspot {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  sort: number
}

interface ServiceItem {
  id?: string
  sceneryspot_id: string
  name: string
  category_id: string
  address: string
  images: string[]
  coordinate: string
  wxappid: string
  display_order: number
  introduction: string
  expense_instruction: string
  status: number
}

const initialServiceItem: ServiceItem = {
  id: undefined,
  sceneryspot_id: "",
  name: "",
  category_id: "",
  address: "",
  images: [""],
  coordinate: "",
  wxappid:"",
  display_order: 1,
  introduction: "",
  expense_instruction: "",
  status: 1
}

const REWARD_CATEGORY = 'f9adcc8c-8315-4240-a0a1-c2f2b01212cc'
const PRINTER_CATETORY = 'fdc82fda-c76d-49b9-902e-6c86ebfa90e6'

interface State {
  category?: Category
  value?: ServiceItem
  open: boolean
}

function useSceneryspot(id: string): Sceneryspot | undefined {
  const [result, setResult] = useState<Sceneryspot | undefined>(undefined)
  const { data } = useQuery(GET_SCENERYSPOT, { variables: { id }, fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (data) {
      setResult(data.sceneryspot)
    }
  }, [data])

  return result
}

function useServiceItems(sceneryspotId: string) {
  const [serviceItems, setServiceItems] = useState<ServiceItem[] | undefined>(undefined)
  const { data, loading } = useQuery(GET_SERVICE_ITEMS, { variables: { sceneryspotId }, fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (data) {
      setServiceItems(data.serviceItems.map((v: any) => ({ ...v, images: v && v.images && v.images.length > 0 ? v.images.split(",") : [""] })))
    }
  }, [data])

  return { serviceItems, loading }
}

function useSave({ value, sceneryspotId, onCompleted } : { value?: ServiceItem, sceneryspotId: string, onCompleted?: (data: any) => void }) {
  const add = useMutation(ADD_SERVICE_ITEM, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createServiceItem)
    },
    refetchQueries: [
      { query: GET_SERVICE_ITEMS, variables: { sceneryspotId } },
      "GetServiceItems",
    ]
  })

  const update = useMutation(UPDATE_SERVICE_ITEM, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateServiceItem)
    },
    refetchQueries: [
      { query: GET_SERVICE_ITEMS, variables: { sceneryspotId } },
      "GetServiceItems",
    ]
  })

  return value?.id ? update : add
}

function ServiceItemModal({ value, categories, sceneryspotId, defaultCategory, ...props } : {
  value?: ServiceItem,
  categories: Category[],
  sceneryspotId: string,
  defaultCategory?: Category
} & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<ServiceItem>({ 
    ...initialServiceItem, 
    sceneryspot_id: sceneryspotId,
    category_id: defaultCategory?.id ?? '',
  })
  const isValid = values.name.length > 0

  const [save, { loading }] = useSave({
    value: values,
    sceneryspotId,
    onCompleted: (data) => {
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
        setValues({ 
          ...initialServiceItem, 
          sceneryspot_id: sceneryspotId,
          category_id: defaultCategory?.id ?? '',
        })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof ServiceItem) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleUploadImage = (index: number) => (value: string) => {
    setValues({ ...values, images: [...values.images.slice(0, index), value, ...values.images.slice(index + 1)] })
  }

  const handleAddImage = () => {
    if (values.images.length >= 30) {
      alert({ severity: "error", text: "最多上传30个图片或视频" })
      return
    }
    setValues({ ...values, images: [...values.images, ""] })
  }

  const handleCategory = (event: SelectChangeEvent) => {
   setValues({ ...values, category_id: event.target.value })
  }

  const handleOK = () => {
    const { 
      id,
      sceneryspot_id,
      name, 
      category_id, 
      address, 
      images, 
      coordinate, 
      wxappid,
      display_order,
      introduction, 
      expense_instruction,
      status,
    } = values

    const input = values.id ? { 
      id, 
      name, 
      category_id, 
      address, 
      images: images.filter(value => value && value.length > 0).join(","),
      coordinate, 
      wxappid,
      display_order,
      introduction, 
      expense_instruction,
      status,
    } : {
      sceneryspot_id,
      name,
      category_id, 
      address, 
      images: images.filter(value => value && value.length > 0).join(","),
      coordinate, 
      wxappid,
      display_order,
      introduction, 
      expense_instruction,
      status,
    }

    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  let lat, lng
  if (values.coordinate && values.coordinate.length > 0) {
    const coordinate = values.coordinate.split(',')
    lat = coordinate[0]
    lng = coordinate[1]
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <DialogTitle>{value ? "修改导航" : "添加导航"}</DialogTitle>
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"名称"}</Typography>
          <FormInput 
            fullWidth 
            id="name-input"
            value={values.name}
            onChange={handleChange("name")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"分类"}</Typography>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={values.category_id}
            size="small"
            variant="outlined"
            notched={true}
            onChange={handleCategory}
            disabled={!!value}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                top: 0,
                "& > legend": {
                    float: "left !important",
                }
              },
            }}
          >
            {categories.map(v => (<MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>))}
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"微信小程序 App ID"}</Typography>
          <FormInput 
            fullWidth 
            id="wxappid-input"
            value={values.wxappid}
            onChange={handleChange("wxappid")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{values.category_id === PRINTER_CATETORY ? "盖章机号": "费用"}</Typography>
          <FormInput 
            fullWidth 
            id="expense-instruction-input"
            value={values.expense_instruction}
            onChange={handleChange("expense_instruction")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"照片"}</Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {values.images.map((value, index) => (<UploadFile accept="*/*" preview={true} value={value} onChange={handleUploadImage(index)} />))}
          </Box>
          {values.category_id === REWARD_CATEGORY && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
              <Button
                disableElevation
                variant="contained"
                sx={{ borderRadius: '50%', padding: 0, height: '32px', minWidth: '32px' }}
                onClick={handleAddImage}
              >
                <Plus />
              </Button>
            </Box>
          )}
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"坐标"}</Typography>
          <FormInput 
            fullWidth 
            id="coordinate-input"
            value={values.coordinate}
            sx={{ mb: 2 }}
            onChange={handleChange("coordinate")}
          />
          <QQMap 
            lat={lat} 
            lng={lng}
            overlay={'marker'}
            onChange={(coordinate) => setValues({ ...values, coordinate }) } 
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"排序"}</Typography>
          <FormInput 
            fullWidth 
            id="display-order-input"
            value={values.display_order}
            onChange={handleChange('display_order')}
          />
          <FormHelperText id="display-order-text">
            {"请填写整数，数值越大越靠前。默认值为1"}
          </FormHelperText>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"介绍"}</Typography>
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

export default function PlaceNavigationDetails({
  match: {
    params: { id }
  },
}: RouteComponentProps<{ id: string }>) {
  const alert = useAlert()
  const { data, loading } = useQuery(GET_CATEGORIES, { variables: { parentId: "7aa5306e-c091-434a-a6d8-ce6bb672300d" }, fetchPolicy: "no-cache" })
  const sceneryspot = useSceneryspot(id)
  const { serviceItems } = useServiceItems(id)
  const categories: Category[] = useMemo(() => {
    if (data) {
      return data.categoriesByParentID
        .map((v: any) => ({ ...v }))
        .sort((a: Category, b: Category) => a.sort - b.sort)
    }
    return []
  }, [data])

  const categoryNames: { [key: string]: string } = useMemo(() => {
    return Object.assign({}, ...categories.map(v => ({ [v.id]: v.name })))
  }, [categories])

  const [values, setValues] = useState<State>({
    category: undefined,
    value: undefined,
    open: false
  })

  const handleChange = (category: Category) => () => {
    setValues({ 
      ...values, 
      category: values.category && values.category.id === category.id ? undefined : category
    })
  }

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleUpdate = (value: ServiceItem) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteServiceItem] = useMutation(DELETE_SERVICE_ITEM, {
    refetchQueries: [
      { query: GET_SERVICE_ITEMS, variables: { sceneryspotId: id } },
      "GetServiceItems",
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
      deleteServiceItem({ variables: { id }})
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.updateServiceItem
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
            <Link underline="hover" color="inherit" href="#/place-navigation">{"景区导航"}</Link>
          </Breadcrumbs>
          {sceneryspot && (<Title variant='h1'>{sceneryspot.name}</Title>)}
        </Grid>
        <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
          <Button
            disableElevation
            variant="contained" 
            startIcon={<Plus />}
            onClick={handleAdd}
          >
            {"添加导航"}
          </Button>
        </Grid>
      </PageHeader>
      <ServiceItemModal  
        {...values}
        categories={categories}
        sceneryspotId={id}
        defaultCategory={values.category}
        onClose={handleClose}
      />
      <DeleteConfirmModal {...deleteValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
      {categories && categories.length > 0 && (
        <Grid container sx={{
          boxSizing: 'border-box',
          display: 'flex',
          flexFlow: 'row wrap',
          width: '100%',
          padding: '16px',
        }}>
          <Stack direction="row" spacing={2}>
            {categories.map((v) => (
              <Chip 
                key={v.id} 
                label={v.name} 
                color={values.category && values.category.id === v.id ? 'primary' : undefined} 
                onClick={handleChange(v)}
              />
            ))}
          </Stack>
        </Grid>
      )}
      {!loading ? (
        <Card sx={{
          backgroundColor: "rgb(255, 255, 255)",
          color: "rgba(0, 0, 0, 0.87)",
          transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          overflow: "hidden",
          borderRadius: "20px",
          margin: "15px",
          boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
          padding: "24px",
        }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"名称"}</TableCell>
                    <TableCell>{"分类"}</TableCell>
                    <TableCell>{"坐标"}</TableCell>
                    <TableCell>{"图片"}</TableCell>
                    <TableCell>{""}</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {serviceItems && serviceItems.filter(v => !values.category || v.category_id === values.category.id).map((row: any) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{row.name}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{categoryNames[row.category_id]}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{row.coordinate}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <CardMedia sx={{ width: 96 }} image={row.images} title={row.name} />
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
        </Card>
      ) : (
        <Loading />
      )}
    </PageWrapper>
  )
}