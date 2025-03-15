import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { gql, useMutation } from '@apollo/client'
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
// import { GET_ANNOUNCEMENTS } from 'constants/graphql'
import { PageWrapper } from 'theme/components'
import { useAlert } from 'state/application/hooks'
import { useAccountState } from 'state/account/hooks'
import { Title, StyledCard, PageHeader, FormInput } from 'pages/styled'

const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: NewNotification!) {
    createNotification(input: $input) {
      id
    }
  }
`

interface State {
  title: string
  content: string
  errorMessage?: string
}

export default function AddAnnouncement({
  history
}: RouteComponentProps) {
  const { t } = useTranslation()
  const { account } = useAccountState()
  const alert = useAlert()
  const [values, setValues] = useState<State>({
        title: "",
        content: "",
        errorMessage: undefined,
  })
  
  const isValid = values.title.length > 0

  const [craeteAnnouncement, { loading }] = useMutation(CREATE_NOTIFICATION, {
    onCompleted: () => {
      history.push("/announcement")
    },
    // refetchQueries: [
    //   { query: GET_ANNOUNCEMENTS },
    //   'GetAnnouncements'
    // ],
  })

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleSubmit = () => {
    if (isValid) {
      const timestamp = Math.floor(new Date().getTime() / 1000)
      const input = {
        name: values.title,
        "category_id": `${process.env.REACT_APP_CATEGOTRY_ANNOUNCEMENT}`,
        "content": values.content,
        "sender": account?.loginId ?? "",
        "release_time": timestamp,
        "blocking_time": timestamp + 7 * 24 * 3600
      }
      craeteAnnouncement({ variables: { input } }).catch(e => alert({ severity: "error", text: e.message }))
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
          <Title>{"新增公告"}</Title>
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
        <CardContent sx={{ 
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
            <Typography variant="subtitle2" sx={{ mb: 1 }}>{"标题"}</Typography>
            <FormInput 
              fullWidth 
              id="title-input"  
              aria-describedby="title-helper-text"
              value={values.title}
              onChange={handleChange("title")}
            />
          </FormControl>
          <FormControl variant="standard">
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