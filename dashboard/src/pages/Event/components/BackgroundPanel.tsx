import React, { useState, useEffect } from 'react'
import { Plus, X } from 'react-feather'
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardMedia,
  IconButton,
  CircularProgress
 } from '@mui/material'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useUpload } from 'components/UploadFile'
import { useAlert } from 'state/application/hooks'

const GET_EVENT_SETTINGS = gql`
  query GetEventSettings($id: ID!) {
    eventSettings(id: $id)
  }
`

const UPDATE_EVENT_SETTINGS = gql`
  mutation UpdateEventSettings($id: ID!, $settings: Map!) {
    updateEventSettings(id: $id, settings: $settings)
  }
`

interface BackgroundProps {
  value?: string
  preview?: boolean
  tag?: string
  accept?: string
  onChange?:  (value: string) => void
}

function Background(props: BackgroundProps) {
  const { value, preview, tag, accept, onChange } = props
  const [values, setValues] = useState<{files: FileList | null, uri: string}>({ files: null, uri: "" })

  const { data, loading } = useUpload(values.files, preview ?? true, tag)

  useEffect(() => {
    if (data) {
      const { rawUri, previewUri } = data.file    
      const value = previewUri && previewUri.length > 0 ? previewUri : rawUri
      onChange && onChange(value ?? "")
    }
  }, [data])

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { validity, files } = event.target
    if (validity.valid && files) {
      setValues({ ...values, files })
    }
  }

  const handleDelete = () => {
     onChange && onChange("")
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px dashed #bbb',
        borderRadius: '20px',
        height: '180px',
        margin: '1rem',
      }}
    >
      {value && value.length > 0 ? (
         <Card elevation={0} sx={{
          width: '100%',
          height: '100%',
          borderRadius: '20px',
          border: 0,
         }}>
          <CardHeader
            sx={{
              position: 'relative',
              float: 'right',
              p: 1,
            }}
            action={
              <IconButton size="small" color="primary" aria-label="删除" onClick={handleDelete}>
                <X />
              </IconButton>
            }
          />
        <CardMedia
          sx={{ height: '100%' }}
          image={`${process.env.REACT_APP_RESOURCES_DOMAIN}` + value}
        />
        </Card>
      ) : (
        <IconButton 
          color="info" 
          size="small" 
          aria-label="upload" 
          component="label" 
          edge="end" 
          disabled={loading}
        >
          <input hidden accept={accept ?? "image/*"} type="file" name="myFile" onChange={handleUpload} />
          {loading ? (<CircularProgress />) : (<Plus />)}
        </IconButton>
      )}
    </Box>
  )
}

interface BackgroundPanelProps {
  value: { id: string }
  index: number
  hidden: boolean
}

interface State {
  id: string
  markBackgrouds: string[]
}

export default function BackgroundPanel(props: BackgroundPanelProps) {
  const { value, index, hidden, ...other } = props
  const alert = useAlert()
  const { data } = useQuery(GET_EVENT_SETTINGS, { variables: { id: value.id }, fetchPolicy: "no-cache" })
  const [updateEventSettings] = useMutation(UPDATE_EVENT_SETTINGS)
  const [values, setValues] = useState<State>({ id: value.id, markBackgrouds: ['', '', ''] })

  useEffect(() => {
    if (data) {
      const { markBackgrouds } = data.eventSettings
      setValues({ ...values, markBackgrouds: markBackgrouds && markBackgrouds.length > 0 ? markBackgrouds : ['', '', ''] })
    }
  }, [data])

  useEffect(() => {
     setValues({ ...values, id: value.id })
  }, [value])

  const handleBackgroudChange = (i: number) => (value: string) => {
    const { id, markBackgrouds } = values
    markBackgrouds[i] = value
    updateEventSettings({ variables: { id, settings: { markBackgrouds  } }})
    .then(({ data }) => {
      if (data) {
        const { markBackgrouds } = data.updateEventSettings
        setValues({ ...values, markBackgrouds: markBackgrouds && markBackgrouds.length > 0 ? markBackgrouds : ['', '', '']})
      }
    })
    .catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <div
      role="tabpanel"
      hidden={hidden}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {!hidden && (
         <Grid container sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexFlow: 'row wrap',
            width: '100%',
            p: 3,
        }}>
          {values.markBackgrouds.map((value, i) => (
            <Grid item sm={4} key={i}>
              <Background value={value} onChange={handleBackgroudChange(i)} />
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  )
}