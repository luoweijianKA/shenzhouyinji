import React, { useState, useEffect } from "react"
import { Paperclip } from 'react-feather'
import {
  InputAdornment,
  IconButton,
  OutlinedInput,
  Tooltip,
  CircularProgress,
 } from "@mui/material"
 import axios from 'axios'

 interface File {
  name: string
  rawUri: string
  previewUri: string
 }

 export function useUpload(files: FileList | null, preview?: boolean, tag?: string) {
  const [values, setValues] = useState<{ data: { file: File } | null, error: string | null, loading: boolean }>({
    data: null,
    error: null,
    loading: false,
  })

   useEffect(() => {
    if (files && files.length > 0) {
      setValues({ ...values, loading: true })

      const headers = { "Content-Type": "multipart/form-data" }
      const data = new FormData()
      data.append("file", files[0])
      data.append("preview", preview ? "true": "false")
      if (tag) {
         data.append("tag", tag)
      }

      axios({ method: "POST", url: `${process.env.REACT_APP_BACKEND_URL}/upload`, data, headers })
        .then(({ data, status }) => {
          if (status === 200) {
            setValues({ ...values, data })
          }
        })
        .catch((error) => setValues({ ...values, error: error.message }))
        .finally(() => setValues({ ...values, loading: false }))
    }
   }, [files])

   return { ...values }
}

interface UploadFileProps {
  preview?: boolean
  tag?: string
  value?: string
  accept?: string
  onChange?:  (value: string) => void
}

interface State {
  files: FileList | null
  uri: string
}

export default function UploadFile(props: UploadFileProps) {
  const { preview, tag, value, accept, onChange } = props
  const [values, setValues] = useState<State>({ files: null, uri: "" })

  const { data, loading } = useUpload(values.files, preview, tag)

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(event.target.value)
  }


  return (
    <OutlinedInput 
      fullWidth
      size="small"
      id="upload-input"  
      aria-describedby="upload-helper-text"
      sx={{
        "& .MuiOutlinedInput-notchedOutline": {
            top: 0,
            "& > legend": {
                float: "left !important",
            }
        },
      }}
      value={value}
      endAdornment={
        <InputAdornment position="end">
          <Tooltip title={"上传文件"} arrow>
            <IconButton 
              color="info" 
              size="small" 
              aria-label="upload" 
              component="label" 
              edge="end" 
              disabled={loading}
            >
              <input hidden accept={accept ?? "image/*"} type="file" name="myFile" onChange={handleUpload} />
              {loading ? (<CircularProgress size={18} />) : (<Paperclip size={18} />)}
            </IconButton>
          </Tooltip>
        </InputAdornment>
      }
      onChange={handleChange}
    />
  )
}