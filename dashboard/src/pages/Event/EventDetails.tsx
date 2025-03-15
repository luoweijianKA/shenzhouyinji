import React, { useState, useMemo, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Search, RefreshCw } from 'react-feather'
import {
  Grid,
  Typography,
  Breadcrumbs,
  Stack,
  Chip,
  Link,
  FormControl,
  OutlinedInput,
  Card,
  Box,
  Tabs,
  Tab,
 } from '@mui/material'
import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { PageWrapper } from 'theme/components'
import { Sceneryspot } from 'hooks/useSceneryspot'
import Loading from 'components/Loading'
import { Title, PageHeader, LinkButton } from 'pages/styled'
import CampPanel from './components/CampPanel'
import BadgePanel from './components/BadgePanel'
import HonorPanel from './components/HonorPanel'
import UserPanel from './components/UserPanel'
import SharePanel from './components/SharePanel'
import RankingPanel from './components/RankingPanel'
import TaskPanel from './components/TaskPanel'
import BackgroundPanel from './components/BackgroundPanel'
import MenuPanel from './components/MenuPanel'

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      name
      status
    }
  }
`

const GET_EVENT_SCENERYSPOTS = gql`
  query GetEventSceneryspots($id: String!) {
    eventSceneryspots(event_id: $id) {
      scenery_spot_id
    }
  }
`

const GET_SCENERYSPOTS = gql`
  query GetSceneryspots($input: [String!]!) {
    sceneryspotsByIDs(ids: $input) {
      id
      name
    }
  }
`

const 

enum Status {
  InProcess = 1,
  Close = 2,
}

const StatusLabels: { [key in Status]: string } = {
  [Status.InProcess]: "进行中",
  [Status.Close]: "已结束",
}

const StatusColors: { [key in Status]: string } = {
  [Status.InProcess]: "#00C292",
  [Status.Close]: "#E46A76",
}

interface Event {
  id: string,
  name: string,
  sceneryspots: string,
  status: Status,
}

interface State {
  event?: Event
  tab: number
}

function tabProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

function useSceneryspots(input?: string[]): Sceneryspot[] | undefined {
  const [result, setResult] = useState<Sceneryspot[] | undefined>(undefined)
  const [getSceneryspots, { data }] = useLazyQuery(GET_SCENERYSPOTS, { fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (input && input.length > 0) {
      getSceneryspots({ variables: { input }})
    }
  }, [getSceneryspots, input])

  useEffect(() => {
    if (data) {
      setResult(data.sceneryspotsByIDs)
    }
  }, [data])

  return result
}

function useEventSceneryspots(id?: string): Sceneryspot[] | undefined {
  const [input, setInput] = useState<string[]>([])
  const [getEventSceneryspots, { data }] = useLazyQuery(GET_EVENT_SCENERYSPOTS, { fetchPolicy: "no-cache" })
  const result = useSceneryspots(input)
  
   useEffect(() => {
    if (id) {
      getEventSceneryspots({ variables: { id }})
    }
  }, [getEventSceneryspots, id])

  useEffect(() => {
    if (data) {
      const input: string[] = data.eventSceneryspots.map(({ scenery_spot_id }: { scenery_spot_id: string }) => scenery_spot_id)
      setInput(input)
    }
  }, [data])

  if (input.length === 0) {
    return []
  }

  return result
}

export default function EventDetails({
  history
}: RouteComponentProps) {
  // const eventRows = useMemo(() => {
  //   return [
  //     { id: "1", displayOrder: 1, pic: "/images/202209231011224353.jpg", name: "粤享山水", sceneryspots: "广东望天湖旅游度假区, 金水台温泉小镇, 古龙峡景区, 梅州市客天下景区, 万绿湖风景区, 经律论文化旅游小镇", start: "2022/11/25", end: "2023/12/31", status: Status.InProcess },
  //     { id: "2", displayOrder: 2, pic: "/images/202207241402245470.jpg", name: "红色印迹", sceneryspots: "东江纵队纪念馆, 莲花山公园邓小平雕像广场, 广州农民运动讲习所旧址, 中国共产党第三次全国代表大会会址, 雷州青年运河纪念馆, 万山海战遗址, 中央红色交通线旧址, 红军长征粤北纪念馆, 叶剑英纪念馆, 红宫红场旧址", start: "2022/6/20", end: "2022/6/25", status: Status.Close },
  //     { id: "3", displayOrder: 3, pic: "/images/202207241358208962.jpg", name: "见多识广", sceneryspots: "广东美术馆, 广州大剧院, 杨匏安旧居陈列馆, 中共三大会址纪念馆, 陈家祠, 珠江红船, 星海音乐厅, 广州塔, 广东省博物馆, 广东省立中山图书馆", start: "2022/5/1", end: "2022/5/3", status: Status.Close },
  //     { id: "4", displayOrder: 4, pic: "/images/202207241354070042.jpg", name: "丝路海潮", sceneryspots: "浪漫海岸, 湖光岩, 茂德公鼓城, 鼎龙湾, 螺岗小镇, 御水古温泉, 冼夫人故里, 阳江十八子, 海丝博物馆, 大角湾", start: "2022/7/30", end: "2022/12/31", status: Status.InProcess },
  //     { id: "5", displayOrder: 1, pic: "/images/202209231011224353.jpg", name: "见多识广续", sceneryspots: "广东美术馆, 广州大剧院, 杨匏安旧居陈列馆, 中共三大会址纪念馆, 陈家祠, 珠江红船, 星海音乐厅, 广州塔, 广东省博物馆, 广东省立中山图书馆", start: "2022/4/19", end: "2022/4/25", status: Status.Close },
  //     { id: "6", displayOrder: 2, pic: "/images/202207241402245470.jpg", name: "东莞测试1", sceneryspots: "中共三大会址纪念馆, 珠江红船, 星海音乐厅, 广州塔, 广东省博物馆, 广东省立中山图书馆", start: "2022/4/16", end: "2022/5/18", status: Status.Close },
  //     { id: "7", displayOrder: 3, pic: "/images/202207241358208962.jpg", name: "潮风汕韵", sceneryspots: "樟林古港, 南澳岛生态旅游区, 礐石风景名胜区, 中央红色交通线旧址, 小公园历史文化街区, 紫莲度假区, 百师园, 潮州牌坊街, 韩文公祠, 广济桥", start: "2022/3/12", end: "2022/4/12", status: Status.Close },
  //     { id: "8", displayOrder: 4, pic: "/images/202207241354070042.jpg", name: "遇见湾区", sceneryspots: "海纳农业, 红花湖, 观湖书院, 隐贤山庄, 南社古村, 海战博物馆, 七星岩, 鼎湖山, 阅江楼, 周文雍陈铁军烈士纪念馆, 古兜温泉, 开平立园, 星乐度, 日月贝, 长隆海洋王国, 迪茵湖, 中山温泉, 孙中山故里, 西樵山, 南风古灶, 祖庙, 平安金融中心云际观光层, 野生动物园, 欢乐谷, 正佳海洋世界, 陈家祠, 广州塔", start: "2022/3/12", end: "2022/3/28", status: Status.Close },
  //   ]
  // }, [])
  const { data, loading, refetch } = useQuery(GET_EVENTS, { fetchPolicy: "no-cache" })

  const eventRows: Event[] = useMemo(() => {
    if (data) {
      return data.events
        .map((v: any) => ({ ...v }))
        .sort((a: Event, b: Event) => b.name.localeCompare(a.name))
    }
    return []
  }, [data])

  const [values, setValues] = useState<State>({
    event: undefined,
    tab: 0
  })

  const eventSceneryspots = useEventSceneryspots(values.event?.id)

  const handleRefresh = () => {
    refetch()
  }

  const handleClick = (event: Event) => () => {
    setValues({ ...values, event })
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValues({ ...values, tab: newValue })
  };

  return (
    <PageWrapper>
      <PageHeader container>
        <Grid item xs={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">{"活动管理"}</Typography>
            {values.event && (<Link underline="hover" color="inherit" href="#/event-details">{values.event.name}</Link>)}
          </Breadcrumbs>
          <Title>{"活动详情"}</Title>
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
                placeholder="搜索活动"
                startAdornment={<Search />}
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
      {loading ? (<Loading />) : (
        <Grid container sx={{
          boxSizing: 'border-box',
          display: 'flex',
          flexFlow: 'row wrap',
          width: '100%',
          padding: '16px',
        }}>
          <Stack direction="row" spacing={2}>
            {eventRows && eventRows.map((row) => (
              <Chip 
                key={row.id} 
                label={row.name}
                color={values.event && values.event.id === row.id ? 'primary' : undefined} 
                onClick={handleClick(row)} 
              />
            ))}
          </Stack>
        </Grid>
      )}
      {values.event && (
        <Grid container sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexFlow: 'row wrap',
            width: '100%',
        }}>
            <Grid item xs={12} md={12} lg={4}>
                <Card sx={{
                    backgroundColor: "rgb(255, 255, 255)",
                    color: "rgba(0, 0, 0, 0.87)",
                    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    overflow: "hidden",
                    borderRadius: "20px",
                    margin: "15px",
                    boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
                    padding: "24px",
                }}>
                    <Typography variant="h2" sx={{
                      margin: "8px 0px 0px",
                      fontWeight: 500,
                      fontSize: "1.5rem",
                      lineHeight: 1.5,
                    }}>
                      {values.event.name}
                    </Typography>
                    {eventSceneryspots && eventSceneryspots.length > 0 && (
                      <React.Fragment>
                        <Typography variant="h6" sx={{
                          margin: "24px 0px 8px",
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                          fontWeight: 600,
                        }}>{"参与景点"}</Typography>
                        <Box sx={{
                          '> div': { mr: 1, mb: 1 }
                        }}>
                          {eventSceneryspots.map(v => (<Chip key={v.id} label={v.name} size="small" />))}
                        </Box>
                      </React.Fragment>
                    )}
                    <Box sx={{ display: 'flex',  alignItems: 'center', mt: 3 }}>
                        <Box sx={{ 
                            backgroundColor: StatusColors[values.event.status],
                            borderRadius: '100%',
                            height: '10px',
                            width: '10px',
                        }} />
                        <Typography variant="h6" sx={{
                            margin: '0 0 0 0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 400,
                            lineHeight: 1.57,  
                            color: 'rgb(119, 126, 137)',
                            textTransform: 'none',
                        }}>
                        {StatusLabels[values.event.status]}
                        </Typography>
                    </Box>
                </Card>
            </Grid>
            <Grid item xs={12} md={12} lg={8}>
                <Card sx={{
                    backgroundColor: "rgb(255, 255, 255)",
                    color: "rgba(0, 0, 0, 0.87)",
                    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    overflow: "hidden",
                    borderRadius: "20px",
                    margin: "15px",
                    boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
                    padding: "24px",
                }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                      value={values.tab}  
                      variant="scrollable"
                      scrollButtons={false}
                      onChange={handleChange} 
                      aria-label="event-tabs"
                    >
                      <Tab label="阵营管理" {...tabProps(0)} />
                      <Tab label="徽章管理" {...tabProps(1)} />
                      <Tab label="荣誉管理" {...tabProps(2)} />
                      <Tab label="参与用户" {...tabProps(3)} />
                      <Tab label="分享任务" {...tabProps(4)} />
                      <Tab label="排行打榜" {...tabProps(5)} />
                      <Tab label="临时任务" {...tabProps(6)} />
                      <Tab label="印迹背景" {...tabProps(7)} />
                      <Tab label="页面菜单" {...tabProps(8)} />
                    </Tabs>
                    </Box>
                    <CampPanel value={values.event} index={0} hidden={values.tab !== 0} />
                    <BadgePanel value={values.event} index={1} hidden={values.tab !== 1} />
                    <HonorPanel value={values.event} index={2} hidden={values.tab !== 2} />
                    <UserPanel value={values.event} index={3} hidden={values.tab !== 3} sceneryspotOptions={eventSceneryspots} />
                    <SharePanel value={values.event} index={4} hidden={values.tab !== 4} />
                    <RankingPanel value={values.event} index={5} hidden={values.tab !== 5} />
                    <TaskPanel value={values.event} index={6} hidden={values.tab !== 6} />
                    <BackgroundPanel value={values.event} index={7} hidden={values.tab !== 7} />
                    <MenuPanel value={values.event} index={8} hidden={values.tab !== 8} />
                </Card>
            </Grid>
        </Grid>
      )}
    </PageWrapper>
  )
}