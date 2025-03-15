import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Trash2 } from 'react-feather'
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
  Tooltip,
  FormControl,
  OutlinedInput,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import { useAlert } from 'state/application/hooks'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { PageHeader, Title, LinkButton, StyledCard, FormInput } from 'pages/styled'

const GET_TAGS = gql`
  query GetTags($categoryId: String!) {
    tagByCategory(category: $categoryId) {
      id
      name
      category_id
      status
    }
  }
`

const CREATE_TAG = gql`
  mutation CreateTag($input: NewTag!) {
    createTag(input: $input) {
      id
    }
  }
`

const UPDATE_TAG = gql`
  mutation updateTag($input: UpdateTag!) {
    updateTag(input: $input) {
      succed
      message
    }
  }
`

interface Tag {
  id?: string
  name: string
  category_id: string
  status: number
}

const TAG_CATEGORY = "2b7933c0-a70f-4541-bb93-660a2356c876"
const initialTag: Tag = {
  id: undefined,
  name: "",
  category_id: TAG_CATEGORY,
  status: 1,
}

function useSave({ value, onCompleted } : { value?: Tag, onCompleted?: (data: any) => void }) {
  const create = useMutation(CREATE_TAG, {
    onCompleted: () => {
      onCompleted && create[1].data && onCompleted(create[1].data.createTag)
    },
    refetchQueries: [
      { query: GET_TAGS, variables: { categoryId: TAG_CATEGORY } },
      "GetTags",
    ]
  })

  return create
}


function TagModal({ value, ...props } : { value?: Tag } & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<Tag>({ ...initialTag })
  const isValid = values.name.length > 0

  const [save, { loading }] = useSave({
    value: values,
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
        setValues({ ...initialTag })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Tag) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleOK = () => {
    save({ variables: { input: { ...values } }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <DialogTitle>{value ? "修改标签" : "添加标签"}</DialogTitle>
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
  value?: Tag
  open: boolean
  search: string
}

export default function UserTag() {
  const alert = useAlert()
  const [values, setValues] = useState<State>({ value: undefined, open: false, search: '' })
  const { data, loading } = useQuery(GET_TAGS, { variables: { categoryId: TAG_CATEGORY }, fetchPolicy: "no-cache" })

  const tags: Tag[] = useMemo(() => {
    if (data) {
      return data.tagByCategory.map((v: any) => ({ ...v }))
    }
    return []
  }, [data])

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [tagValues, setTagValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteTag] = useMutation(UPDATE_TAG, {
    refetchQueries: [
      { query: GET_TAGS, variables: { categoryId: TAG_CATEGORY }, fetchPolicy: "no-cache" },
      "GetTags",
    ],
  })

  const handleDelete = (value?: { id: string, name: string }) => () => {
    setTagValues({ value, open: true })
  }

  const handleDeleteClose = (event: {}) => {
    setTagValues({ value: undefined, open: false })
  }

  const handleDeleteConfirm = (value?: { id: string, name: string }) => {
    if (value) {
      const { id, name } = value
      const input = {
        id,
        name,
        category_id: TAG_CATEGORY,
        status: 4,
      }
      deleteTag({ variables: { input }})
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
          setTagValues({ value: undefined, open: false })
        })
    } else {
      setTagValues({ value: undefined, open: false })
    }
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"系统管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"用户标签"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <FormControl>
              <OutlinedInput
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    top: 0,
                    "& > legend": {
                      float: 'left !important',
                    }
                  }
                }}
                size="small"
                notched={false}
                placeholder="搜索标签"
                startAdornment={<Search />}
                value={values.search}
                onChange={handleChange('search')}
              />
            </FormControl>
            <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<Plus size={20}/>}
              onClick={handleAdd}
            >
              {"添加"}
            </LinkButton>
        </Grid>
        </PageHeader>
        <TagModal  
          {...values}
          onClose={handleClose}
        />
        <DeleteConfirmModal {...tagValues} onClose={handleDeleteClose} onConfirm={handleDeleteConfirm} />
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"标签"}</TableCell>
                      <TableCell>{''}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {tags.filter(tag => tag.name.indexOf(values.search) > -1).map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.name}</Typography>
                    </TableCell>
                    <TableCell scope="row" sx={{ textAlign: "right" }}>
                      <Tooltip arrow title={"删除标签"}>
                        <IconButton onClick={handleDelete({ id: row.id ?? '', name: row.name })}>
                          <Trash2 size={20} />
                        </IconButton>
                      </Tooltip>
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