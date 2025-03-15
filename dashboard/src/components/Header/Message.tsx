import React, { useState, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  ListItemAvatar,
  Avatar,
  Badge,
  TextField,
  Autocomplete,
  CircularProgress,
  Divider,
 } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import LoadingButton from '@mui/lab/LoadingButton'
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client'
import { ago } from 'utils'
import { useAlert } from 'state/application/hooks'
import {useAccountState } from 'state/account/hooks'
import { FormInput } from 'pages/styled'

const GET_CONVERSATIONS = gql`
  query GetConversations($userId: String!) {
    userConversations(user_id: $userId) {
      id
      participant
      user_id
      user_name
      user_avatar
      content
      send_time
      read_time
      has_new
    }
  }
`

const GET_PARTICIPANT_CONVERSATIONS = gql`
  query GetParticipantConversations($participant: String!, $from: String) {
    conversationByParticipant(participant: $participant, from: $from) {
      id
      participant
      user_id
      user_name
      user_avatar
      content
      send_time
      read_time
      has_new
    }
  }
`

const CREATE_CONVERSATION = gql`
  mutation CreateConversation($input: NewConversation!) {
    createConversation(input: $input) {
      id
      participant
      user_id
      user_name
      user_avatar
      content
      send_time
      read_time
      has_new
    }
  }
`

const GET_CONTACTS = gql`
  query GetContacts($first: Int = 20, $after: ID, $last: Int = 20, $before: ID, $search: String) {
    accounts(
      first: $first
      after: $after
      last: $last
      before: $before
      search: $search
    ) {
      edges {
        node {
          id
          wechat
          wechat_name
          wechat_avatar
        }
      }
    }
  }
`

interface Conversation {
  id: string
  participant: string
  user_id: string
  user_name: string
  user_avatar: string
  content: string
  send_time: number
  read_time: number
}

interface Contact {
  user_id: string
  user_name: string
  user_avatar: string
}

interface State {
  contact?: Contact
  participant?: string
  to?: string
  content: string
}

function newConversationFirst(a: Conversation, b: Conversation) {
  return a.send_time - b.send_time
}

function useConversations(userId: string): Conversation[] | undefined  {
  const [result, setResult] = useState<Conversation[] | undefined>(undefined)
  const { data } = useQuery(GET_CONVERSATIONS, { variables: { userId }, fetchPolicy: "no-cache", pollInterval: 3000 })

  useEffect(() => {
    if (data) {
      setResult(data.userConversations)
    }
  }, [data])

  return result
}

function useParticipantConversations(participant?: string, from?: string): Conversation[] | undefined  {
  const [result, setResult] = useState<Conversation[] | undefined>(undefined)
  const [fetch, { data }] = useLazyQuery(GET_PARTICIPANT_CONVERSATIONS, { fetchPolicy: "no-cache", pollInterval: 3000 })

  useEffect(() => {
    if (participant && from) {
      fetch({ variables: { participant, from } })
    }
  }, [fetch, participant, from])

  useEffect(() => {
    if (data) {
      setResult(data.conversationByParticipant.sort(newConversationFirst))
    }
  }, [data])

  return result
}

function Contacts({ onChange }: { onChange?: (newValue: Contact | null) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<readonly Contact[]>([]);
  const [fetch, { loading, data }] = useLazyQuery(GET_CONTACTS, { fetchPolicy: "no-cache" })

  useEffect(() => {
    if (data) {
      const options: Contact[] = data.accounts.edges.map((v: any) => ({
        user_id: v.node.id,
        user_name: v.node.wechat_name,
        user_avatar: v.node.wechat_avatar
      }))
      setOptions([...options])
    }
  }, [data])

  useEffect(() => {
    let active = true;
    
    (async () => {
      if (active) {
        fetch({variables: { search }})
      }
    })();

    return () => {
      active = false;
    };
  }, [fetch, search]);

  useEffect(() => {
    if (!open) {
       fetch({variables: { search: "" }})
    }
  }, [open, fetch]);

  const handleChange = (event: any, newValue: string | Contact | null) => {
    if (typeof newValue !== 'string') {
      onChange && onChange(newValue)
    }
  }

  const handleInputChange = (event: any, newValue: string) => {
    setSearch(newValue)
  }

  return (
    <Autocomplete
      id="contacts"
      freeSolo
      sx={{ width: '100%' }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onChange={handleChange}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option, value) => option.user_id === value.user_id}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.user_name}
      renderOption={(props, option) => (
        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          <Avatar alt={option.user_name} sx={{ width: 24, height: 24, mr: 0.5 }} src={process.env.REACT_APP_RESOURCES_DOMAIN + option.user_avatar} />
          {option.user_name}
        </Box>
      )}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="添加新消息"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}

export default function Message({ ...props }: DialogProps) {
  const alert = useAlert()
  const { open, onClose } = props
  const { account } = useAccountState()
  const [values, setValues] = useState<State>({ participant: '1', content: '' })
  const [send, { loading }] = useMutation(CREATE_CONVERSATION, {
    onCompleted: (data) => {
      setValues({ ...values, content: '' })
    }
  })
  
  const isValid = values.participant && values.to && values.content.length > 0
  const conversations = useConversations(account?.id ?? "")
  const participantConversations = useParticipantConversations(values.participant, values.contact?.user_id)

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [prop]: event.target.value })
  }

  const handleClose = () => {
      onClose && onClose({}, "escapeKeyDown")
  }

  const handleSend= () => {
    if (values.participant && values.contact) {
      const input = {
        participant: values.participant,
        to: values.contact.user_id,
        content: values.content
      }
      send({ variables: { input } }).catch(e => {
        alert({ severity: "error", text: e.message })
      })
    }
  }

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
      setValues({ ...values, content: '' })
    }
  }, [open]);

  const handleContact = (contact: Contact | null) => {
    if (contact) {
      setValues({ ...values, contact: contact, participant: '1', to: contact.user_id, content: '' })
    }
  }

  const handleParticipant = (contact: Contact, participant: string) => () => {
    setValues({ ...values, contact, participant, to: contact.user_id, content: '' })
  }

  return (
    <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        scroll="paper"
        keepMounted={true}
        aria-labelledby="message-dialog-title"
        aria-describedby="message-dialog-description"
      >
        <DialogTitle id="message-dialog-title">{"消息"}</DialogTitle>
         <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers={true} sx={{ display: "flex", p: 0, height: "calc(100vh - 243px)" }}>
          <Box sx={{ width: 320, minWidth: 320, flexGrow: 0 }}>
            <Box sx={{ display: "flex", p: 2 }}>
              <Contacts onChange={handleContact} />
            </Box>
            {conversations && (
              <List sx={{ overflow: "auto",  height: "calc(100vh - 315px)" }}>
                {conversations.map((v, i) => (
                  <ListItem key={i} disablePadding alignItems="flex-start"
                    sx={{ 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                      '& .MuiListItemSecondaryAction-root': { top: 24 }
                    }}  
                    secondaryAction={
                    <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="caption"
                        color="text.primary"
                      >
                        {ago(v.send_time)}
                      </Typography>
                    }>
                    <ListItemButton onClick={handleParticipant({ ...v }, v.participant)}>
                      <ListItemAvatar>
                        <Badge variant="dot" invisible={v.read_time !== 0} color="primary">
                          <Avatar alt={v.user_name} src={process.env.REACT_APP_RESOURCES_DOMAIN + v.user_avatar} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
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
                              {v.user_name}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption">{v.content}</Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          <Drawer
            sx={{
              zIndex: 0,
              flex: '1 auto',
              width: '100%',
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                position: 'relative',
                p: 3,
              },
            }}
            variant="permanent"
            anchor="right"
          >
              <List sx={{ overflow: "auto",  height: "calc(100vh - 315px)" }}>
                {values.contact && (
                  <React.Fragment>
                    <ListItem disablePadding alignItems="center"
                    sx={{ mb: 1 }}>
                      <ListItemAvatar>
                        <Avatar alt={values.contact.user_name} src={process.env.REACT_APP_RESOURCES_DOMAIN + values.contact.user_avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Typography variant="h4" sx={{
                              margin: '0px',
                              fontSize: '1.125rem',
                              fontWeight: 600,
                              lineHeight: 1.8,
                            }}>
                              {values.contact.user_name}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                )}
                {participantConversations && participantConversations.map((v, i) => (
                  <ListItem key={i} disablePadding alignItems="flex-start"
                    sx={{
                      alignItems: 'flex-start',
                      mt: 0.5,
                      '& .MuiListItemSecondaryAction-root': { top: 24 }
                    }}  
                    secondaryAction={
                    <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="caption"
                        color="text.primary"
                      >
                        {ago(v.send_time)}
                      </Typography>
                    }>
                      <ListItemAvatar sx={{ minWidth: 32, mt: 0.5 }}>
                        <Avatar alt={v.user_name} sx={{ width: 24, height: 24 }} src={process.env.REACT_APP_RESOURCES_DOMAIN + v.user_avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
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
                              {v.user_name}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption">{v.content}</Typography>
                        }
                      />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormInput 
                    fullWidth 
                    id="msg-input"
                    value={values.content}
                    onKeyUp={(e) => { if (e.key === 'Enter') handleSend() } }
                    onChange={handleChange("content")}
                />
                <LoadingButton 
                  disableElevation 
                  variant="contained"
                  disabled={!isValid}
                  loading={loading}
                  onClick={handleSend}
                >
                  {"发送"}
                </LoadingButton>
              </Box>
          </Drawer>
        </DialogContent>
      </Dialog>
  )
}