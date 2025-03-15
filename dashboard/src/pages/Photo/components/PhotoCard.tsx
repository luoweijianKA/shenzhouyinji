import React, { useState } from 'react'
import {
  Typography,
  IconButton,
  Card,
  CardHeader,
  Avatar,
  CardContent,
  CardActions,
  ImageList,
  ImageListItem,
  Menu,
  MenuItem,
  CircularProgress,
 } from '@mui/material'
import { MapPin, MoreVertical } from 'react-feather'
import { useUpdatePhotoStatus } from 'hooks/usePhotos'
import { useAlert } from 'state/application/hooks'
import { formattedDate } from 'utils'

interface PhotoCardProps {
  id: string
  author: string
  avatar: string
  pics: string[]
  content: string
  timestamp: number
  location: string
  region: string
  sceneryspot: {
    id: string
    name: string
    address: string
  }
  status?: number
  onChange?: (id: string, status: number) => void
}

function srcset(image: string, width: number, height: number, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${width * cols}&h=${height * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${width * cols}&h=${
      height * rows
    }&fit=crop&auto=format&dpr=2 2x`,
  };
}

interface State {
  id: string
  status: number
}

export default function PhotoCard(props: PhotoCardProps) {
  const { id, status, onChange } = props
  const alert = useAlert()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [values, setValues] = useState<State>({ id, status: status ?? 0 })

  const [updatePhotoStatus, { loading }] = useUpdatePhotoStatus({ 
    status: status ?? 0,
    onCompleted: (data) => {
      console.log({ data, values })
      onChange && onChange(data, values.status)
    }
  })

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChange = (status: number) => () => {
    setAnchorEl(null)
    setValues({ ...values, status })
    updatePhotoStatus({ variables: { input: { id, status } }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <Card sx={{ 
      maxWidth: 345,
      transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
      overflow: "hidden",
      borderRadius: "0.5rem",
      margin: "15px",
      boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
      padding: "0",
    }}>
      <CardHeader
        avatar={
          <Avatar alt={props.author} src={process.env.REACT_APP_RESOURCES_DOMAIN + props.avatar} />
        }
        action={
          status && (
            <React.Fragment>
              <IconButton
                aria-label="more"
                id="more-button"
                aria-controls={open ? 'more-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                disabled={loading}
              >
                {loading ? (<CircularProgress size={24} />) : (<MoreVertical size={24} />)}
              </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                style: {
                  maxHeight: 48 * 4.5,
                  width: '20ch',
                },
              }}
            >
              {status !== 1 && status !== 3 && (
                <MenuItem onClick={handleChange(1)}>
                  {'取消审核'}
                </MenuItem>
              )}
              {status !== 2 && status !== 3 && (
                <MenuItem onClick={handleChange(2)}>
                  {'通过审核'}
                </MenuItem>
              )}
              {status !== 3 && (
                <MenuItem onClick={handleChange(3)}>
                  {'移到回收站'}
                </MenuItem>
              )}
              {status === 3 && (
                <MenuItem onClick={handleChange(1)}>
                  {'还原相册'}
                </MenuItem>
              )}
            </Menu>
            </React.Fragment>
          )
        }
        title={props.author}
        subheader={formattedDate(new Date(props.timestamp * 1000))}
      />
      {/* <CardMedia
        component="img"
        height="194"
        image={process.env.REACT_APP_RESOURCES_DOMAIN + props.pics[0]}
        alt={props.sceneryspot.name}
      /> */}
       <ImageList
      sx={{
        width: 345,
        height: 225,
        // Promote the list into its own layer in Chrome. This costs memory, but helps keeping high FPS.
        transform: 'translateZ(0)',
      }}
      rowHeight={200}
      gap={2}
    >
      {props.pics.map((item) => {
        const cols = 2
        const rows = 1

        return (
          <ImageListItem key={item} cols={cols} rows={rows}>
            <img
              {...srcset(process.env.REACT_APP_RESOURCES_DOMAIN + item, 345, 200, rows, cols)}
              alt={props.author}
              loading="lazy"
            />
          </ImageListItem>
        );
      })}
    </ImageList>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2">{props.sceneryspot.name}</Typography>
        <Typography variant="body2" color="text.secondary">{props.content}</Typography>
      </CardContent>
      {props.region && props.region.length > 0 && (
        <CardActions disableSpacing sx={{ p: 2, pt: 0 }} >
          <MapPin size={20} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>{props.region}</Typography>
        </CardActions>
      )}
    </Card>
  );
}