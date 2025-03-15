import React, { useState, useEffect } from 'react'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { Plus, Edit, Trash2 } from 'react-feather'
import {
  Grid,
  Breadcrumbs,
  Typography,
  Card,
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
  FormControlLabel,
  FormHelperText,
  Checkbox,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery, useMutation } from '@apollo/client'
import { CATETORY_SCENERYSPOT_TASK, TASK_QUESTION, SCENERYSPOT_TASKS } from 'constants/index'
import { Category, useCategories } from 'hooks/useCategories'
import { useSceneryspot } from 'hooks/useSceneryspot'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import Empty from 'components/Empty'
import { useAlert } from 'state/application/hooks'
import { PageHeader, Title, FormInput } from 'pages/styled'

const GET_QUESTIONS = gql`
  query GetQuestionBanks($sceneryspotId: String!) {
    questionBanks(sceneryspot_id: $sceneryspotId) {
        id
        sceneryspot_id
        question
        options
        answer
        necessary
        points
        status
      }
  }
`

const ADD_QUESTION = gql`
  mutation CreateQuestionBank($input: NewQuestionBank!) {
    createQuestionBank(input: $input) {
      id
    }
  }
`

const UPDATE_QUESTION = gql`
  mutation UpdateQuestionBank($input: UpdateQuestionBank!) {
    updateQuestionBank(input: $input) {
      succed
      message
    }
  }
`

const DELETE_QUESTION = gql`
  mutation UpdateQuestionBank($id: ID!) {
    updateQuestionBank(input: {id: $id, status: 4}) {
      succed
      message
    }
  }
`

interface Question {
  id?: string
  sceneryspot_id: string
  question: string
  options: string
  answer: string
  start_time: number
  end_time: number
  necessary: boolean
  points: number
  status: number
}

const initialQuestion: Question = {
  id: undefined,
  sceneryspot_id: '',
  question: '',
  options: '',
  answer: '',
  start_time: 0,
  end_time: 0,
  necessary: true,
  points: 0,
  status: 1,
}

interface State {
  value?: Question
  open: boolean
}

function useQuestions(sceneryspotId: string) {
  const [questions, setQuestions] = useState<Question[] | undefined>(undefined)
  const { data, loading } = useQuery(GET_QUESTIONS, { variables: { sceneryspotId }, fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (data) {
      setQuestions(data.questionBanks)
    }
  }, [data])

  return { questions, loading }
}

function useSave({ value, sceneryspotId, onCompleted } : { value?: Question, sceneryspotId: string, onCompleted?: (data: any) => void }) {
  const add = useMutation(ADD_QUESTION, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createQuestionBank)
    },
    refetchQueries: [
      { query: GET_QUESTIONS, variables: { sceneryspotId } },
      "GetQuestionBanks",
    ]
  })

  const update = useMutation(UPDATE_QUESTION, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateQuestionBank)
    },
    refetchQueries: [
      { query: GET_QUESTIONS, variables: { sceneryspotId } },
      "GetQuestionBanks",
    ]
  })

  return value?.id ? update : add
}

function QuestionModal({ value, sceneryspotId, ...props } : {
  value?: Question,
  sceneryspotId: string,
} & DialogProps) {
  const { onClose, open } = props
  const alert = useAlert()

  const [values, setValues] = useState<Question>({ 
    ...initialQuestion, 
    sceneryspot_id: sceneryspotId,
  })
  const isValid = values.question.length > 0

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
        setValues({ ...initialQuestion, sceneryspot_id: sceneryspotId })
      }
    }
  }, [open, value])

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  const handleChange = (prop: keyof Question) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target

    if (prop === 'status') {
        setValues({ ...values, [prop]: checked ? 2 : 1 })
        return
    }

    setValues({ ...values, [prop]: value })
  }

  const handleOK = () => {
    const { 
      id,
      sceneryspot_id,
      question, 
      options, 
      answer,
      start_time,
      end_time,
      necessary,
      points, 
      status,
    } = values

    const input = values.id ? { 
      id,
      question, 
      options, 
      answer,
      start_time,
      end_time,
      necessary,
      points, 
      status,
    } : {
      sceneryspot_id,
      question, 
      options, 
      answer,
      start_time,
      end_time,
      necessary,
      points, 
      status,
    }

    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <DialogTitle>{value ? "修改问题" : "添加问题"}</DialogTitle>
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"问题"}</Typography>
          <FormInput 
            fullWidth 
            id="question-input"
            value={values.question}
            onChange={handleChange("question")}
          />
          <FormControlLabel 
            control={<Checkbox checked={values.status === 2} onChange={handleChange('status')} />} 
            label="在景区的电子围栏内完成任务"
            sx={{ '& .MuiTypography-root': { margin: '0 !important' } }}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"选项"}</Typography>
          <FormInput 
            fullWidth 
            multiline
            rows={2}
            id="options-input"
            value={values.options}
            onChange={handleChange('options')}
          />
          <FormHelperText id="options-text">
            {"多个选项请用（;）分隔"}
          </FormHelperText>
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"答案"}</Typography>
          <FormInput 
            fullWidth 
            id="answer-input"
            value={values.answer}
            onChange={handleChange("answer")}
          />
        </FormControl>
        <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"积分"}</Typography>
          <FormInput 
            fullWidth 
            id="points-input"
            value={values.points}
            onChange={handleChange("points")}
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

export default function QuestionTask({
  match: {
    params: { id }
  },
}: RouteComponentProps<{ id: string }>) {
  const history = useHistory()
  const alert = useAlert()
  const categories = useCategories(CATETORY_SCENERYSPOT_TASK)
  const sceneryspot = useSceneryspot(id)
  const { questions, loading } = useQuestions(id)

  const [values, setValues] = useState<State>({
    value: undefined,
    open: false
  })

  const handleChange = (category: Category) => () => {
    history.push(`/place/${id}/${SCENERYSPOT_TASKS[category.id]}`)
  }

  const handleAdd = () => {
    setValues({ ...values, value: undefined, open: true })
  }

  const handleUpdate = (value: Question) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values , value: undefined, open: false })
  }

  const [deleteValues, setDeleteValues] = useState<{ value?: { id: string, name: string }, open: boolean }>({ open: false })
  const [deleteTrek] = useMutation(DELETE_QUESTION, {
    refetchQueries: [
      { query: GET_QUESTIONS, variables: { sceneryspotId: id } },
      "GetQuestionBanks",
    ]
  })

  const handleDelete = (value: Question) => () => {
    const { id, question } = value
    if (id) {
      setDeleteValues({ value: { id, name: question }, open: true })
    }
  }

  const handleDeleteClose = (event: {}) => {
    setDeleteValues({ value: undefined, open: false })
  }
  
  const handleDeleteConfirm = (value?: { id: string }) => {
    if (value) {
      const { id } = value
      deleteTrek({ variables: { id }})
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.updateQuestionBank
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
            <Link underline="hover" color="inherit" href="#/place-navigation">{"景区任务"}</Link>
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
            {"添加问答"}
          </Button>
        </Grid>
      </PageHeader>
      <QuestionModal {...values} sceneryspotId={id}  onClose={handleClose} />
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
                color={ v.id === TASK_QUESTION ? 'primary' : undefined} 
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
                    <TableCell>{"答题任务"}</TableCell>
                    <TableCell>{"获得积分"}</TableCell>
                    <TableCell>{""}</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {questions ? questions.map((row: any) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{row.question}</Typography>
                    <Typography variant='caption'>{row.answer}</Typography>
                  </TableCell>
                  <TableCell scope="row" component="th">
                    <Typography variant='subtitle2'>{row.points}</Typography>
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
              )) : (
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell scope='row' align='center' colSpan={3}>
                    <Empty />
                  </TableCell>
                </TableRow>
              )}
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