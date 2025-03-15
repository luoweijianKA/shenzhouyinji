import React, { useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { gql, useQuery, useMutation } from '@apollo/client'
import {
    Grid,
    Typography,
    Breadcrumbs,
    Link,
    Button,
    CardContent,
    FormControl,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { PageWrapper } from 'theme/components'
import { useAlert } from 'state/application/hooks'
import { Title, StyledCard, PageHeader, FormInput } from 'pages/styled'

const GET_ANNOUNCEMENT = gql`
  query GetNotification($id: String!) {
    notification(id: $id){
      id
      name
      content
      sender
      release_time
      blocking_time
      create_time
    }
  }
`

const UPDATE_ANNOUNCEMENT = gql`
  mutation UpdateNotification($input: NotificationInput!) {
    updateNotification(input: $input) {
      id
      name
      content
      release_time
    }
  }
`

interface State {
  id: string
  title: string
  content: string
  errorMessage?: string
}

export default function EditAnnouncement({
  match: {
    params: { id }
  },
  history
}: RouteComponentProps<{ id: string }>) {
  const { t } = useTranslation()
  const alert = useAlert()

  const [values, setValues] = useState<State>({
    id,
    title: "",
    content: "",
  })

  const { data } = useQuery(GET_ANNOUNCEMENT, { variables: { id }, fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (data) {
      const { id, name: title, content } = data.notification
      setValues({ id, title, content })
    }
  }, [data])

  const isValid = values.title.length > 0
  const [updateAnnouncement, { loading }] = useMutation(UPDATE_ANNOUNCEMENT, {
    onCompleted: () => {
      history.push("/announcement")
    },
    refetchQueries: [
      { query: GET_ANNOUNCEMENT, variables: { id } },
      "GetAnnouncement"
    ],
  })

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleSubmit = () => {
    if (isValid) {
      const { id, title, content } = values
      const input = { id, name: title, content } 
      updateAnnouncement({ variables: { input }}).catch(e => alert({ severity: "error", text: e.message }))
    }
  }

  return (
    <PageWrapper>
      <PageHeader container>
        <Grid item xs={8}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="#/announcement">{"公告管理"}</Link>
            <Typography color="text.primary">{"公告列表"}</Typography>
          </Breadcrumbs>
          <Title>{"编辑公告"}</Title>
        </Grid>
        <Grid item xs={4} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
          <Button variant="outlined" href="#/announcement">{t("Cancel")}</Button>
          <LoadingButton 
            disableElevation 
            variant="contained"
            disabled={!isValid}
            loading={loading}
            onClick={handleSubmit}
          >
            {t("Submit")}
          </LoadingButton>
        </Grid>
      </PageHeader>
      <StyledCard>
        <CardContent>
          <FormControl variant="standard" sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>{"标题"}</Typography>
            <FormInput 
              fullWidth
              id="title-input"  
              aria-describedby="title-helper-text"
              value={values.title}
              onChange={handleChange("title")}
            />
          </FormControl>
          <FormControl variant="standard" sx={{ width: "100%", mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>{"内容"}</Typography>
            <FormInput 
              fullWidth 
              multiline
              rows={4}
              id="content-input"  
              aria-describedby="content-helper-text"
              value={values.content}
              onChange={handleChange("content")}
            />
          </FormControl>
        </CardContent>
      </StyledCard>
    </PageWrapper>
  )
}