import React from "react"
import {
    Box,
    CircularProgress,
 } from "@mui/material"

export default function Loading({ height }: { height?: string}) {
  return (
    <Box sx={{ 
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: height ? height : "calc(100vh - 130px)",
    }}>
      <CircularProgress />
    </Box>
  )
 }