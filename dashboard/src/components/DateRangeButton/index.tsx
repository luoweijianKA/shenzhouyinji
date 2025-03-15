import React from "react"
import { useTranslation } from "react-i18next"
import { MoreVertical } from "react-feather"
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material"
import { toDate } from "utils"

const today = Math.floor(toDate(new Date()).getTime() / 1000)
const yesterday = today - (24 * 3600)
const week = new Date().setTime(today - (new Date().getDay() *  24 * 3600))
const month = new Date().setTime(today - ((new Date().getDate() - 1) *  24 * 3600))

const options = [
  { label: "Today", value: [today, today] },
  { label: "Yesterday", value: [yesterday, yesterday] },
  { label: "This Week", value: [week, week + (6 * 24 * 3600)] },
  { label: "Last Week", value: [week - (7 * 24 * 3600), week - (24 * 3600)] },
  { label: "This Month", value: [month, month + (29 * 24 * 3600)] },
  { label: "Last Month", value: [month - (30 * 24 * 3600), month - (24 * 3600)] },
]

export default function DateRangeButton({ onChange }: { onChange?: (value: number[]) => void }) {
  const { t } = useTranslation()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChange = (value: number[]) => () => {
    setAnchorEl(null)
    onChange && onChange(value)
  }

  return (
    <React.Fragment>
      <IconButton
        aria-label={t("date-range")}
        id="date-range-button"
        aria-controls={open ? "date-range-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertical />
      </IconButton>
      <Menu
        id="date-range-menu"
        MenuListProps={{ "aria-labelledby": "date-range-button" }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
          width: "20ch",
          },
        }}
        >
        {options.map((option) => (
          <MenuItem key={option.label} onClick={handleChange(option.value)}>
            <Typography variant="body2">{t(option.label)}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  )
}