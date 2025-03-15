import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: "#C00012",
      contrastText: '#FFF',
    },
    secondary: {
      main: "#066A73",
    },
    info: {
      main: "rgba(0, 0, 0, 0.65)",
    },
    error: {
      main: "#E4001D"
    }
  },
  typography: {
    fontFamily: "\"DM Sans\", sans-serif",
    fontSize: 14,
    caption: {
      color: "rgba(0, 0, 0, 0.54)",
    }
  }
})

export default theme