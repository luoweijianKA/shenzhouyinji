import React, { useState, useEffect } from 'react'
import {
    Autocomplete,
    TextField,
    Checkbox,
 } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { gql, useQuery } from '@apollo/client'

const GET_CAMPS = gql`
  query GetCamps($eventId: String!) {
    camps(event_id: $eventId) {
      id
      name
    }
  }
`

interface Camp {
  id: string
  name: string
}

interface CampSelectProps {
  eventId: string
  value?: Camp[],
  onChange?: (value: Camp[] | null) => void
}

export default function CampSelect(props: CampSelectProps) {
  const { eventId, value, onChange } = props
  const [options, setOptions] = useState<readonly Camp[]>([])
  const { data } = useQuery(GET_CAMPS, { variables: { eventId }, fetchPolicy: "no-cache" })
  
  useEffect(() => {
    (async () => {
      if (data) {
        setOptions([...data.camps])
      }
    })()
  }, [data])

  const handleChange = (event: any, newValue: Camp[] | null) => {
    console.log({ event, newValue})
    onChange && onChange(newValue)
  }

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      id="camp-select"
      size="small"
      limitTags={1}
      options={options}
      getOptionLabel={(option) => option.name}
      value={value}
      onChange={handleChange}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.name}
        </li>
      )}
      style={{ width: "100%" }}
      renderInput={(params) => (
        <TextField {...params} label={"阵营"} placeholder={""} />
      )}
    />
  )
}