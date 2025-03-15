import React from "react"
import {
  Box,
  Typography,
 } from "@mui/material"

export default function Empty() {
  return (
    <Box sx={{ 
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "135px",
    }}>
      <Typography variant="body2">{"暂无数据"}</Typography>
    </Box>
  )
 }