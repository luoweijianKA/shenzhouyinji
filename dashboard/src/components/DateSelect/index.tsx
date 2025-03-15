import React from "react"
import { useTranslation } from "react-i18next"
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
 } from "@mui/material"
import { SelectChangeEvent } from "@mui/material/Select"

export default function DateSelect({
  value,
  options,
  onChange 
}: { value?: string,  options: string[], onChange?: (value: string) => void }) {
  const { t } = useTranslation()

  const handleChange = (event: SelectChangeEvent) => {
    const { value } = event.target
    onChange && onChange(value)
  }

  console.log({ value})
 
  return (
    <FormControl>
      <InputLabel id="date-select-label">{t("Draw Date")}</InputLabel>
      <Select
        labelId="date-select-label"
        size="small"
        id="date-select"
        value={value}
        label={t("Draw Date")}
        sx={{
          minWidth: "150px",
        }}
        onChange={handleChange}
      >
      <MenuItem value={undefined}>
        <em>{t("All")}</em>
      </MenuItem>
      {options.map((opt: any) => (
        <MenuItem key={opt} value={opt}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>{opt}</Typography>
        </MenuItem>
      ))}
      </Select>
    </FormControl>
  )
}