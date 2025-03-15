import React, { useState, useMemo, useEffect } from 'react'
import {
  Grid,
  Breadcrumbs,
  Typography,
  CardContent,
  FormControl,
  CardHeader,
  CardActions,
  FormHelperText,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
 } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { gql, useQuery, useMutation } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import UploadFile from 'components/UploadFile'
import SelectModal from 'components/Modal/SelectModal'
import DeleteConfirmModal from 'components/Modal/DeleteConfirmModal'
import { useAlert } from 'state/application/hooks'
import { PageHeader, Title, StyledCard, FormInput } from 'pages/styled'

const GET_CONFIGS = gql`
  query GetConfigs{
    configs
  }
`

const UPDATE_CONFIGS = gql`
  mutation UpdateConfigs($input: Map!) {
    updateConfigs(input: $input)
  }
`

const RESTORE = gql`
  mutation Restore($restore: Restore!, $input: [ID!]) {
    restore(restore: $restore, input: $input) {
      succed
      message
    }
  }
`

const EXPORT = gql`
  mutation Export($export: Export!) {
    export(export: $export) {
      succed
      message
    }
  }
`

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      name
      status
    }
  }
`

interface Row {
  id: string
  name: string
  description: string
  value: string
}

interface Event {
  id: string
  name: string
}

const exports: Row[] = [
  { id: '1', name: '会员数据', description: '导出所有会员数据', value: 'USER' },
  { id: '2', name: '护照数据', description: '导出所有激活的护照数据', value: 'PASSPORT' },
]

const restores: Row[] = [
  { id: '1', name: '景区数据还原', description: '景区，导航，任务等', value: 'SCENERYSPOT' },
  { id: '2', name: '活动数据还原', description: '活动相关所有数据', value: 'EVENT' },
  { id: '3', name: '用户数据还原', description: '用户注册，绑定，积分等', value: 'USER' },
  { id: '4', name: '任务数据还原', description: '用户任务数据', value: 'TASK' },
  { id: '5', name: '徽章数据还原', description: '交易信息', value: 'BADGE' },
  { id: '6', name: '互动数据还原', description: '点赞，评论，邮件等', value: 'LIKE' },
  { id: '7', name: '积分清零', description: '阵营积分，用户积分', value: 'POINTS' },
  { id: '8', name: '消息还原', description: '清除重置消息信息(包含客服消息, 徽章交换信息)', value: 'CONVERSATION' },
]

function useEvents(): Event[] {
  const { data } = useQuery(GET_EVENTS, { fetchPolicy: "no-cache" })

  return useMemo(() => {
    if (data) {
      return data.events
    }
    return []
  }, [data])
}

function ExportData() {
  const alert = useAlert()
  const [value, setValue] = useState<{[key: string]: boolean}>({})
  const [exportData, { loading }] = useMutation(EXPORT)

  const handleExport = (row: Row) => () => {
    setValue({ ...value, [row.value]: true})
    exportData({ variables: { export: row.value }})
      .then(({ data }) => {
        if (data) {
          const { succed, message } = data.export
          if (succed) {
            alert({ severity: "success", text: '已成功导出数据！' })
            window.open(process.env.REACT_APP_RESOURCES_DOMAIN + message)
            return
          }
          alert({ severity: "error", text: message })
        }
      })
      .catch((e) => alert({ severity: "error", text: e.message }))
      .finally(() => setValue({ ...value, [row.value]: false}))
  }

  return (
    <StyledCard>
      <CardHeader
        title={
          <Typography variant="h3" sx={{
            margin: 0,
            fontWeight: 500,
            fontSize: '1.125rem',
            lineHeight: 1.5,
          }}>
            {'数据导出'}
          </Typography>
        }
      />
      <CardContent>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableBody>
              {exports.map((row) => (
                <TableRow key={row.value} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell scope="row" component="th" sx={{ pl: 0 }}>
                    <Typography variant='body2'>{row.name}</Typography>
                    <Typography variant='caption'>{row.description}</Typography>
                  </TableCell>
                    <TableCell scope="row" align="right" sx={{ pr: 0 }}>
                      <LoadingButton 
                        disableElevation 
                        variant="outlined"
                        size="small"
                        loading={loading && value[row.value]}
                        disabled={loading && value[row.value]}
                        onClick={handleExport(row)}
                      >
                      {'导出'}
                    </LoadingButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </StyledCard>
  )
}

function RestoreCard() {
  const alert = useAlert()
  const events = useEvents()
  const [values, setValues] = useState<{ value?: Row, open: boolean }>({
    value: undefined,
    open: false
  })
  const [restore, { loading }] = useMutation(RESTORE)

  const handleRestore = (value: Row) => () => {
    setValues({ ...values, value, open: value?.value !== 'CONVERSATION' })
  }
  
  const handleRestoreConfirm = (value: ({ id: string, name: string } | undefined)[])  => {
    const v = values.value
    setValues({ ...values, value: undefined, open: false })
    if (v && value.length > 0) {
      restore({ variables: { restore: v.value, input: value.map(v => v?.id) }})
        .then(({ data }) => {
          if (data) {
            const { succed, message } = data.restore
            if (succed) {
              alert({ severity: "success", text: '已成功还原数据！' })
              return
            }
            alert({ severity: "error", text: message })
          }
          
        })
        .catch((e) => alert({ severity: "error", text: e.message }))
        .finally(() => setValues({ ...values, value: undefined, open: false }))
    }
  }

  const handleRestoreConversationConfirm = (value?: { id: string, name: string }) => {
    handleRestoreConfirm([value])
  }

  const handleClose = (event: {}) => {
    setValues({ ...values, value: undefined, open: false })
  }

  return (
    <StyledCard>
      <CardHeader
        title={
          <Typography variant="h3" sx={{
            margin: 0,
            fontWeight: 500,
            fontSize: '1.125rem',
            lineHeight: 1.5,
          }}>
            {'系统还原'}
          </Typography>
        }
      />
      <CardContent>
        <SelectModal open={values.open} options={events} onClose={handleClose} onConfirm={handleRestoreConfirm} />
        <DeleteConfirmModal open={values.value?.value === 'CONVERSATION'} value={{id: "", name: "消息"}} onClose={handleClose} onConfirm={handleRestoreConversationConfirm} />
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableBody>
              {restores.map((row) => (
                <TableRow key={row.value} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell scope="row" component="th" sx={{ pl: 0 }}>
                    <Typography variant='body2'>{row.name}</Typography>
                    <Typography variant='caption'>{row.description}</Typography>
                  </TableCell>
                    <TableCell scope="row" align="right" sx={{ pr: 0 }}>
                      <LoadingButton 
                        disableElevation 
                        variant="outlined"
                        size="small"
                        loading={loading && values.value && values.value.value === row.value}
                        disabled={!!values.value}
                        onClick={handleRestore(row)}
                      >
                      {'还原数据'}
                    </LoadingButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </StyledCard>
  )
}

interface Service {
  name: string,
  icon: string,
  url: string
}

interface State {
  appName: string
  appLogo: string
  eventAlertDuration: string
  passportGuideUrl: string
  passportBackground: string
  barrageDuration: string
  barrageFont: string
  words: string
  sharePhotographTimes: string
  markerShowMedia: string
  tweetBackground: string
  services: Service[]
}

export default function Settings() {
  const alert = useAlert()
  const [values, setValues] = useState<State>({
    appName: '',
    appLogo: '',
    eventAlertDuration: '',
    passportGuideUrl: '',
    passportBackground: '',
    barrageDuration: '15',
    barrageFont: '16',
    words: '',
    sharePhotographTimes: '3',
    markerShowMedia: '',
    tweetBackground: '',
    services: [
      { name: '特色美食', icon: '../../assets/icons/chi.png', url: '../../sceneryspot/pages/serviceItem/index?type=吃' },
      { name: '酒店民宿', icon: '../../assets/icons/zhu.png', url: '../../sceneryspot/pages/serviceItem/index?type=住' },
      { name: '交通停车', icon: '../../assets/icons/xin.png', url: '../../sceneryspot/pages/serviceItem/index?type=行' },
      { name: '景点推荐', icon: '../../assets/icons/you.png', url: '../../sceneryspot/pages/serviceItem/index?type=游' },
      { name: '特色购购', icon: '../../assets/icons/gou.png', url: '../../sceneryspot/pages/serviceItem/index?type=购' },
      { name: '特色游玩', icon: '../../assets/icons/yu.png', url: '../../sceneryspot/pages/serviceItem/index?type=娱' },
      { name: '彩蛋任务', icon: '../../assets/icons/li.png', url: '/pages/task/temporary/index' },
      { name: '护照领取', icon: '../../assets/icons/lin.png', url: '/pages/passport/guides/index' },
      { name: '护照领取', icon: '../../assets/icons/lin.png', url: '/pages/passport/guides/index' }
    ]
  })

  const { data } = useQuery(GET_CONFIGS, { fetchPolicy: "no-cache" })
  const [updateConfigs, { loading }] = useMutation(UPDATE_CONFIGS)

  useEffect(() => {
    if (data) {
      setValues({ ...values, ...{ ...data.configs, services: JSON.parse(data.configs.services) } })
    }
  }, [data])

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleUpload = (prop: keyof State) => (value: string) => {
    setValues({ ...values, [prop]: value })
  }

   const handleServiceChange = (prop: keyof Service, index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    values.services[index][prop] = event.target.value
    setValues({ ...values, services: values.services })
  }

   const handleServiceIconChange = (index: number) => (value: string) => {
    console.log(value)
    values.services[index].icon = value
    setValues({ ...values, services: values.services })
  }

  const handleSubmit = () => {
    updateConfigs({ variables: { input: { ...values, services: JSON.stringify(values.services) } }})
      .then(({ data }) => {
        if (data) {
          setValues({ ...values, ...{ ...data.updateConfigs, services: JSON.parse(data.updateConfigs.services) } })
        }
        alert({ severity: "success", text: '设置已更改成功' })
      })
      .catch((e) => alert({ severity: "error", text: e.message }))
  }

  return (
    <PageWrapper>
        <PageHeader container >
          <Grid item xs={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">{"系统管理"}</Typography>
            </Breadcrumbs>
            <Title variant='h1'>{"系统设置"}</Title>
          </Grid>
          <Grid item xs={8} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
        </Grid>
        </PageHeader>
          <StyledCard>
            <CardHeader
              title={
                <Typography variant="h3" sx={{
                  margin: 0,
                  fontWeight: 500,
                  fontSize: '1.125rem',
                  lineHeight: 1.5,
                }}>
                  {'常规设置'}
                </Typography>
              }
            />
            <CardContent  sx={{ 
              "& .MuiFormControl-root": { 
                width: "100%", 
                ":not(:first-of-type)": { 
                  mt: 2
                },
                "& .MuiTypography-root": {
                  mb: 1
                }
              }
            }}>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"小程序名称"}</Typography>
                <FormInput 
                  fullWidth
                  id="app-name-input"
                  value={values.appName}
                  onChange={handleChange("appName")}
                />
              </FormControl>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"小程序 Logo"}</Typography>
                <UploadFile preview={false} value={values.appLogo} onChange={handleUpload("appLogo")} />
              </FormControl>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"活动弹窗"}</Typography>
                <FormInput 
                  fullWidth
                  id="event-alert-duration-input"
                  value={values.eventAlertDuration}
                  onChange={handleChange("eventAlertDuration")}
                />
                <FormHelperText id="words-text">
                  {"活动弹出窗口的持续时间，以秒为单位"}
                </FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"弹幕速度"}</Typography>
                <FormInput 
                  fullWidth
                  id="barrage-duration-input"
                  value={values.barrageDuration}
                  onChange={handleChange("barrageDuration")}
                />
                <FormHelperText id="words-text">
                  {"数值越大弹，幕速度越慢"}
                </FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"弹幕字体"}</Typography>
                <FormInput 
                  fullWidth
                  id="barrage-font-input"
                  value={values.barrageFont}
                  onChange={handleChange("barrageFont")}
                />
                <FormHelperText id="words-text">
                  {"字体单位为像素(px)"}
                </FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"拍照次数"}</Typography>
                <FormInput 
                  fullWidth
                  id="barrage-font-input"
                  value={values.sharePhotographTimes}
                  onChange={handleChange("sharePhotographTimes")}
                />
                <FormHelperText id="words-text">
                  {"设置印迹分享的限定拍照次数"}
                </FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"打卡演示"}</Typography>
                <UploadFile accept="*/*" preview={false} value={values.markerShowMedia} onChange={handleUpload("markerShowMedia")} />
                <FormHelperText id="words-text">
                  {"上传打卡演示的视频"}
                </FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"印迹背景"}</Typography>
                <UploadFile accept="*/*" preview={false} value={values.tweetBackground} onChange={handleUpload("tweetBackground")} />
                <FormHelperText id="words-text">
                  {"设置小程序首页印迹分享&印迹地图的图片背景"}
                </FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"领取码背景"}</Typography>
                <UploadFile accept="*/*" preview={false} value={values.passportBackground} onChange={handleUpload("passportBackground")} />
                <FormHelperText id="words-text">
                  {"设置护照领取码的背景图片"}
                </FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <Typography variant="subtitle2">{"服务链接"}</Typography>
                <Box sx={{ flexGrow: 1 }}>
                  {values.services.map((service, index) => (
                    <Grid container spacing={1} sx={{ mb: 1 }} key={index}>
                      <Grid item xs>
                         <FormInput 
                            fullWidth
                            id="service-name"
                            placeholder=""
                            value={service.name}
                            onChange={handleServiceChange("name", index)}
                          />
                      </Grid>
                      <Grid item xs={5}>
                        <UploadFile accept="*/*" preview={false} value={service.icon} onChange={handleServiceIconChange(index)} />
                      </Grid>
                      <Grid item xs={5}>
                        <FormInput 
                          fullWidth
                          id="service-url"
                          placeholder="https://"
                          value={service.url}
                          onChange={handleServiceChange("url", index)}
                        />
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </FormControl>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 1 }}>
              <LoadingButton 
                disableElevation 
                variant="outlined"
                loading={loading}
                disabled={loading}
                onClick={handleSubmit}
              >
              {'更改设置'}
            </LoadingButton>
            </CardActions>
          </StyledCard>
        <ExportData />
        <RestoreCard />
    </PageWrapper>
  )
}