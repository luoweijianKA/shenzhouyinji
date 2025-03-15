import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'react-feather'
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
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormHelperText,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import { useAlert } from 'state/application/hooks'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { PageHeader, Title, StyledCard, FormInput } from 'pages/styled'

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

const ADD_CATEGORY = gql`
  mutation AddCategory($input: NewCategory!) {
    createCategory(input: $input) {
      id
    }
  }
`

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: UpdateCategory!) {
    updateCategory(input: $input) {
      succed
      message
    }
  }
`

interface Category {
  id?: string
  name: string
  displayOrder: number
  description: string
}

const EVENT_CATEGOTRY = '774496be-227a-11ef-a7c1-e43d1ad7d220'

function useSave({ value, onCompleted } : { value?: Category, onCompleted?: (data: any) => void }) {
  const add = useMutation(ADD_CATEGORY, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createCategory)
    },
    refetchQueries: [
      { query: GET_CATEGORIES, variables: { parentId: EVENT_CATEGOTRY } },
      "GetCategories",
    ]
  })

  const update = useMutation(UPDATE_CATEGORY, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateCategory)
    },
    refetchQueries: [
      { query: GET_CATEGORIES, variables: { parentId: EVENT_CATEGOTRY } },
      "GetCategories",
    ]
  })

  return value?.id ? update : add
}

function CategoryModal({ value, ...props } : { value?: Category } & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<Category>({
    id: undefined,
    name: "",
    displayOrder: 1,
    description: "",
  })

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
        setValues({
          id: undefined,
          name: "",
          displayOrder: 1,
          description: "",
        })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Category) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleOK = () => {
    const { id, name, displayOrder } = values
    const input = (!id && name.length > 0)
      ? {
        name,
        parent_id: EVENT_CATEGOTRY,
        has_subclass: false,
        status: 1,
        sort: displayOrder,
      }
      : {
        id,
        name,
        parent_id: EVENT_CATEGOTRY,
        has_subclass: false,
        status: 1,
        sort: displayOrder,
      }
    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{value ? "修改分类" : "添加分类"}</DialogTitle>
      <DialogContent>
        <FormControl variant="standard" sx={{ width: "100%", mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"分类名称"}</Typography>
          <FormInput 
            fullWidth 
            id="name-input"
            value={values.name}
            onChange={handleChange("name")}
          />
        </FormControl>
        <FormControl variant="standard" sx={{ width: "100%", mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"序号"}</Typography>
          <FormInput 
            fullWidth
            id="display-order-input"  
            aria-describedby="display-order-text"
            value={values.displayOrder}
            onChange={handleChange("displayOrder")}
          />
          <FormHelperText id="display-order-text">
            {"请填写整数，数值越大越靠前。默认值为 1"}
          </FormHelperText>
        </FormControl>
        {/* <FormControl variant="standard" sx={{ width: "100%", mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"描述"}</Typography>
          <FormInput 
            fullWidth 
            multiline
            rows={2}
            id="description-input"
            value={values.description}
            onChange={handleChange('description')}
          />
        </FormControl> */}
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
  value?: Category
  open: boolean
}

export default function EventCategory() {
  const alert = useAlert()
  const [values, setValues] = useState<State>({ value: undefined, open: false })
  const { data, loading } = useQuery(GET_CATEGORIES, { variables: { parentId: EVENT_CATEGOTRY }, fetchPolicy: "no-cache" })

  const categoryRows: Category[] = useMemo(() => {
    if (data) {
      return data.categoriesByParentID
        .map((v: any) => ({
          id: v.id, displayOrder: v.sort, name: v.name, description: "",
        }))
        .sort((a: Category, b: Category) => b.displayOrder - a.displayOrder)
    }
    return []
  }, [data])

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleUpdate = (value: Category) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [categoryValues, setCategoryValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteCategory] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: [
      { query: GET_CATEGORIES, variables: { parentId: EVENT_CATEGOTRY }, fetchPolicy: "no-cache" },
      "GetCategories",
    ],
  })

  const handleDelete = (value?: { id: string, name: string }) => () => {
    setCategoryValues({ value, open: true })
  }

  const handleDeleteClose = (event: {}) => {
    setCategoryValues({ value: undefined, open: false })
  }

  const handleDeleteConfirm = (value?: { id: string, name: string }) => {
    if (value) {
      const { id, name } = value
      const input = {
        id,
        name,
        parent_id: EVENT_CATEGOTRY,
        has_subclass: false,
        status: 4,
        sort: 0,
      }
      deleteCategory({ variables: { input }})
        .then(({ data }) => {
          if (data) {
            alert({ severity: "success", text: '已成功删除数据！' })
          }
        })
        .catch((e) => {
          if (e.message && e.message.indexOf("Permissions Denied") > -1) {
            alert({ severity: "error", text: '权限不足，无法删除！' })
            return
          }
          alert({ severity: "error", text: e.message })
        })
        .finally(() => {
          setCategoryValues({ value: undefined, open: false })
        })
    } else {
      setCategoryValues({ value: undefined, open: false })
    }
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"活动管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"活动分类"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
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
        <CategoryModal  
          {...values}
          onClose={handleClose}
        />
        <DeleteConfirmModal {...categoryValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ maxWidth: 100 }}>{"序号"}</TableCell>
                      <TableCell>{"分类"}</TableCell>
                      <TableCell>{""}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {categoryRows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.displayOrder}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.name}</Typography>
                      <Typography variant='caption'>{row.description}</Typography>
                    </TableCell>
                    <TableCell scope="row" sx={{ textAlign: "right" }}>
                      <IconButton onClick={handleUpdate(row)}>
                        <Edit size={20} />
                      </IconButton>
                      <IconButton onClick={handleDelete({ id: row.id ?? '', name: row.name })}>
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