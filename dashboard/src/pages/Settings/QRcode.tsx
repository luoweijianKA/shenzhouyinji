import React, { useState, useMemo } from 'react'
import { RefreshCw, Search, X } from 'react-feather'
import QRCode from "react-qr-code"
import {
  Grid,
  Breadcrumbs,
  Typography,
  CardContent,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  OutlinedInput,
  DialogTitle,
  DialogContent,
  IconButton,
 } from '@mui/material'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { gql, useQuery } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import Loading from 'components/Loading'
import { PageHeader, Title, LinkButton, StyledCard } from 'pages/styled'

const GET_SCENERYSPOTS = gql`
  query GetSceneryspots {
    sceneryspots {
      id
      name
    }
  }
`

interface Sceneryspot {
  id: string
  name: string
}

interface State {
  value?: Sceneryspot
  open: boolean
  search: string
}

interface DialogTitleProps {
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X />
        </IconButton>
      ) : null}
    </DialogTitle>
  )
}

function QRCodeModal({ value, ...props } : { value?: Sceneryspot } & DialogProps) {
  const { onClose } = props

  const handleClose = (event: {}) => () => {
    onClose && onClose(event, "escapeKeyDown")
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <BootstrapDialogTitle onClose={handleClose({})}>
        {"打卡二维码"}
      </BootstrapDialogTitle>
      {value && (
        <DialogContent sx={{ 
          display: 'grid',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          textAlign: 'center',
          p: 3,
        }}>
          <QRCode 
            size={512}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={value.id}
          />
          <Typography variant="h5">{value.name}</Typography>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default function SceneryspotQRcode() {
  const [values, setValues] = useState<State>({ value: undefined, open: false, search: '' })
  const { data, loading, refetch } = useQuery(GET_SCENERYSPOTS, { fetchPolicy: "no-cache" })

  const sceneryspots: Sceneryspot[] = useMemo(() => {
    if (data) {
      return data.sceneryspots.map((v: any) => ({ ...v }))
    }
    return []
  }, [data])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, search: event.target.value })
  }
  
  const handleRefresh = () => {
    refetch()
  }

  const handleOpen = (value: Sceneryspot) => () => {
    setValues({ ...values, value, open: true })
  }

  const handleClose = (event: {}) => {
    setValues({ ...values, value: undefined, open: false })
  }  

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"系统管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"二维码打卡"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
            <FormControl>
              <OutlinedInput
                sx={{
                  "& .MuiOutlinedInput-input": {
                    padding: "8.5px 14px"
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    top: 0,
                    "& > legend": {
                      float: 'left !important',
                    }
                  }
                }}
                notched={false}
                placeholder="搜索景区"
                startAdornment={<Search />}
                onChange={handleSearch}
              />
            </FormControl>
            <LinkButton
              disableElevation
              variant="contained" 
              startIcon={<RefreshCw size={20}/>}
              onClick={handleRefresh}
            >
              {"刷新"}
            </LinkButton>
        </Grid>
        </PageHeader>
        <QRCodeModal  
          {...values}
          onClose={handleClose}
        />
        {!loading ? (
          <StyledCard>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{"景区"}</TableCell>
                      <TableCell>{"二维码"}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {sceneryspots.filter(row => row.name.indexOf(values.search) > -1).map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell scope="row" component="th">
                      <Typography variant='subtitle2'>{row.name}</Typography>
                    </TableCell>
                    <TableCell scope="row" component="th" sx={{
                      display: 'grid',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                      <QRCode 
                        size={60}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={row.id}
                        onClick={handleOpen(row)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        ) : (
          <Loading />
        )}
    </PageWrapper>
  )
}