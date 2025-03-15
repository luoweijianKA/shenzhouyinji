import {
    styled,
    Grid,
    Typography,
    Card,
    TableCell,
    Button,
    OutlinedInput,
    Accordion,
    Box,
    Select,
    InputBase,
 } from '@mui/material'
import { alpha } from '@mui/material/styles'

export const PageHeader = styled(Grid)(() => ({
  boxSizing: 'border-box',
  display: 'flex',
  flexFlow: 'row wrap',
  width: '100%',
  padding: '1rem'
}))

export const Title = styled(Typography)(() => ({
  letterSpacing: 0,
  fontSize: '1.875rem',
  fontFamily:'"DM Sans", sans-serif',
  fontWeight: 700,
  lineHeight: 1.25,
}))

export const SubTitle = styled(Typography)(() => ({
  margin: 0,
  letterSpacing: 0,
  fontSize: '1.125rem',
  fontWeight: 500,
  lineHeight: 1.5,
}))

export const LinkButton = styled(Button)((theme) => ({
  "&:hover": {
    color: "#FFF",
  }
}))

export const StyledCard = styled(Card)(() => ({
  backgroundColor: 'rgb(255, 255, 255)',
  color: 'rgba(0, 0, 0, 0.87)',
  transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  overflow: 'hidden',
  borderRadius: '20px',
  padding: '14px',
  margin: '15px',
  boxShadow: 'rgb(90 114 123 / 11%) 0px 7px 30px 0px',
}))

export const StyledCell = styled(TableCell)(() => ({
    border: '1px solid rgba(224, 224, 224, 1)',
    fontSize: '0.75rem',
    padding: '0.25rem',
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: '600',
}))

export const StickyTableCell = styled(TableCell)(() => ({
    position: "sticky",
    left: 0,
    background: "white",
    border: '1px solid rgba(224, 224, 224, 1)',
    minWidth: '158px',
    padding: '0.375rem 0.75rem',
    textAlign: 'right',

    '.MuiFormControlLabel-label': {
        fontSize: '0.75rem',
    }
}))

export const StyledOutlinedInput = styled(OutlinedInput)(() => ({
  '& .MuiOutlinedInput-notchedOutline': {
      '& > legend': {
          float: 'left !important',
      }
  },
  '& .MuiOutlinedInput-input': {
    padding: '0 0.375rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    height: '1.5rem',
  }
}))

export const StyledAccordion = styled(Accordion)(() => ({
  backgroundColor: 'rgb(255, 255, 255)',
  color: 'rgba(0, 0, 0, 0.87)',
  transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  overflow: 'hidden',
  borderRadius: '20px',
  padding: '14px',
  margin: '15px',
  boxShadow: 'rgb(90 114 123 / 11%) 0px 7px 30px 0px',

  "&:first-of-type": {
    borderRadius: '20px',
    margin: '1rem',
  },

  "&:last-of-type": {
    borderRadius: '20px',
    margin: '1rem',
  },

  "&.Mui-expanded": {
    margin: '1rem',

    "&:first-of-type": {
      margin: '1rem',
    }
  }
}))

export const StyledSelect = styled(Select)(() => ({
  minWidth: '212px',

  '& .MuiOutlinedInput-input': {
    padding: '0.375rem 0.75rem',
    textAlign: 'left',
  },

  '& .MuiOutlinedInput-notchedOutline': {
    '& > legend': {
    float: 'left !important',
    }
  }
}))

export const ProgressWrapper = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 'calc(100vh - 130px)',
}))

export const DatePickerWrapper = styled(Box)(({ theme }) => ({
  '& .MuiFormControl-root': {
    width: '100%',
  },

  '& .MuiIconButton-root': {
    padding: '0.25rem',
    marginRight: '0.5rem',

    '& > .MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
    }
  },

  [theme.breakpoints.up('sm')]: {
    '& .MuiFormControl-root': {
      width: '180px',
    },

    '& .MuiOutlinedInput-input': {
      fontSize: '1rem',
      padding: '8.5px 14px',
      paddingRight: 0,
      height: '1.4375rem',
    },
  },
}))

export const FormInput = styled(InputBase)(({ theme }) => ({
  padding: 0,
  'label + &': {
    marginTop: theme.spacing(3),
  },
  '& .MuiInputBase-input': {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
    border: '1px solid #ced4da',
    fontSize: '0.875rem',
    padding: '10px 12px',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '&:focus': {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}));