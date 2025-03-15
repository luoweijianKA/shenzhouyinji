import React, { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import { Variant } from "@mui/material/styles/createTypography"

interface ClockProps {
  times: number
  variant?: Variant
}

export default function Clock(props: ClockProps) {
  const [times, setTimes] = useState<number>(props.times)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimes(times + 1)
    }, 1000)

    return () => {
      // clean up timer
      clearInterval(timer)
    }
  }, [times])

  const format = (time: number) => {
    if (time <= 0) {
      return "--"
    }

    const pad = (value: number) => `${value}`.padStart(2, "0")

    const dt = new Date(time * 1000)

    const year = dt.getFullYear()
    const month = pad(dt.getMonth() + 1)
    const date = pad(dt.getDate())
    const hours = pad(dt.getHours() - (dt.getHours() > 12 ? 12 : 0))
    const minutes = pad(dt.getMinutes())
    const seconds = pad(dt.getSeconds())
    const suffix = dt.getHours() > 12 ? "PM" : "AM"

    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds} ${suffix}`
  }

  return (
    <Typography variant={props.variant ?? "body2"}>
      {format(times)}
      {' GMT+' + (0 - new Date().getTimezoneOffset() / 60)}
    </Typography>)
}