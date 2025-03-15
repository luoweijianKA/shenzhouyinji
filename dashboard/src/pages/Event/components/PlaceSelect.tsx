import React, { useState, useEffect } from 'react'
import {
    Autocomplete,
    TextField,
    Checkbox,
 } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { Sceneryspot } from 'hooks/useSceneryspot'

interface PlaceSelectProps {
  value?: Sceneryspot[],
  sceneryspotOptions?: Sceneryspot[]
  onChange?: (value: Sceneryspot[] | null) => void
}

export default function PlaceSelect(props: PlaceSelectProps) {
  const { value, sceneryspotOptions, onChange } = props
  const [options, setOptions] = useState<readonly Sceneryspot[]>([])

  useEffect(() => {
    (async () => {
      if (sceneryspotOptions) {
        setOptions([...sceneryspotOptions])
      }
    })()
  }, [sceneryspotOptions])

  const handleChange = (event: any, newValue: Sceneryspot[] | null) => {
    onChange && onChange(newValue)
  }

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      id="place-select"
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
        <TextField {...params} label={"打卡景区"} placeholder={""} />
      )}
    />
  )
}