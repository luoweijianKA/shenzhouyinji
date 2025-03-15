import React from 'react'
import { 
  Typography,
  ListItem,
  ListItemText,
  Stack,
  Link,
} from '@mui/material'
import { ago } from 'utils'

export default function Notification({ value }: { 
  value: { id: string, title: string, message: string, timestamp: number } 
}) {
  return (
    <ListItem alignItems="flex-start">
      <ListItemText
        sx={{
          "& .MuiListItemText-root": {
            p: 0
          },
          "& .MuiListItemText-secondary": {
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            lineHeight: 1.5,
          },
        }}
        primary={
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Link underline="none" href={`#/notifications/${value.id}`}>
              <Typography 
                component="span" 
                variant="subtitle1" 
                color="text.primary"
                sx={{
                  margin: '0px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {value.title}
              </Typography>
            </Link>
          </Stack>
        }
        secondary={
          <Typography variant="caption">{ago(value.timestamp)}</Typography>
        }
      />
    </ListItem>
  )
}
