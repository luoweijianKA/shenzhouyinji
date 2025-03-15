import React, { useMemo, useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client'
import {
  Grid,
  Typography,
  Breadcrumbs,
  Button,
  CardContent,
  FormControl,
  FormHelperText,
  Autocomplete,
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
 } from '@mui/material'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import LoadingButton from '@mui/lab/LoadingButton'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import cnLocale from 'date-fns/locale/zh-CN'
import { today } from "utils"
import { PageWrapper } from 'theme/components'
import { Sceneryspot } from 'hooks/useSceneryspot'
import UploadFile from 'components/UploadFile'
import { useAlert } from 'state/application/hooks'
import { Title, StyledCard, PageHeader, FormInput, DatePickerWrapper } from 'pages/styled'

const GET_CATEGORIES = gql`
  query GetCategories {
    categoriesByParentID(id: "774496be-227a-11ef-a7c1-e43d1ad7d220") {
      id
      name
      sort
    }
  }
`

const GET_SCENERYSPOTS = gql`
  query GetSceneryspots {
    sceneryspots {
      id
      name
    }
  }
`

const GET_EVENT = gql`
  query GetEvent($id: String!) {
    event(id: $id) {
      id
      code
      name
      start_time
      end_time
      introduction
      images
      step
      status
      create_time
      enable_award
      category_id
    }
    eventSceneryspots(event_id: $id) {
      scenery_spot_id
    }
  }
`
const CREATE_EVENT = gql`
  mutation CreateEvent($input: NewEvent!) {
    createEvent(input: $input) {
      id
    }
  }
`

const UPDATE_EVENT = gql`
  mutation UpdateEvent($input: UpdateEvent!) {
    updateEvent(input: $input) {
      succed
      message
    }
  }
`

const CREATE_EVENT_SCENERYSPOTS = gql`
  mutation CreateEventSceneryspot($input: InputEventSceneryspot!) {
    createEventScenerySpots(input: $input) {
      scenery_spot_id
    }
  }
`

const REMOVE_EVENT_SCENERYSPOTS = gql`
  mutation RemoveEventSceneryspot($input: InputEventSceneryspot!) {
    removeEventScenerySpots(input: $input) {
      succed
      message
    }
  }
`

interface Event {
  id?: string
  code: string
  name: string
  start_time: number
  end_time: number
  introduction: string
  images: string
  step: string
  status: number
  create_time: number
  enable_award: boolean
  category_id: string
  scenerySpots: { scenery_spot_id: string }[]
}

// const places = [
//   { name: '旅游度假区' },
//   { name: '粤北12' },
//   { name: '粤北11' },
//   { name: '粤北10' },
//   { name: '广东望天湖旅游度假区' },
//   { name: '金水台温泉小镇' },
//   { name: '梅州市客天下景区' },
//   { name: '万绿湖风景区' },
//   { name: '经律论文化旅游小镇' },
//   { name: '海纳农业' },
//   { name: '红花湖' },
//   { name: '观湖书院' },
//   { name: '隐贤山庄' },
//   { name: '南社古村' },
//   { name: '海战博物馆' },
//   { name: '七星岩' },
//   { name: '鼎湖山' },
//   { name: '阅江楼' },
//   { name: '周文雍陈铁军烈士纪念馆' },
//   { name: '古兜温泉' },
//   { name: '开平立园' },
//   { name: '星乐度' },
//   { name: '日月贝' },
//   { name: '长隆海洋王国' },
//   { name: '迪茵湖' },
//   { name: '中山温泉' },
//   { name: '孙中山故里' },
//   { name: '西樵山' },
//   { name: '南风古灶' },
//   { name: '祖庙' },
//   { name: '平安金融中心云际观光层' },
//   { name: '野生动物园' },
//   { name: '欢乐谷' },
//   { name: '正佳海洋世界' },
//   { name: '东江纵队纪念馆' },
//   { name: '莲花山公园邓小平雕像广场' },
//   { name: '广州农民运动讲习所旧址' },
//   { name: '中国共产党第三次全国代表大会会址' },
//   { name: '雷州青年运河纪念馆' },
//   { name: '万山海战遗址' },
//   { name: '中央红色交通线旧址' },
//   { name: '红军长征粤北纪念馆' },
//   { name: '叶剑英纪念馆' },
//   { name: '红宫红场旧址' },
//   { name: '浪漫海岸' },
//   { name: '湖光岩' },
//   { name: '广东美术馆' },
//   { name: '广州大剧院' },
//   { name: '杨匏安旧居陈列馆' },
//   { name: '中共三大会址纪念馆' },
//   { name: '南澳岛生态旅游区' },
//   { name: '礐石风景名胜区' },
//   { name: '中央红色交通线旧址' },
//   { name: '小公园历史文化街区' },
//   { name: '紫莲度假区' },
//   { name: '百师园' },
//   { name: '潮州牌坊街' },
//   { name: '韩文公祠' },
//   { name: '广济桥' },
//   { name: '茂德公鼓城' },
//   { name: '鼎龙湾' },
//   { name: '螺岗小镇' },
//   { name: '御水古温泉' },
//   { name: '陈家祠' },
//   { name: '珠江红船' },
//   { name: '冼夫人故里' },
//   { name: '星海音乐厅' },
//   { name: '广州塔' },
//   { name: '广东省博物馆' },
//   { name: '广东省立中山图书馆' },
//   { name: '阳江十八子' },
//   { name: '海丝博物馆' },
//   { name: '大角湾' },
//   { name: '春湾石林景区' },
//   { name: '凌霄岩' },
//   { name: '汕头小公园' },
//   { name: '丹霞山' },
// ]

function useSceneryspots(): Sceneryspot[] | undefined {
  const [result, setResult] = useState<Sceneryspot[] | undefined>(undefined)
  const { data } = useQuery(GET_SCENERYSPOTS, { fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (data) {
      setResult(data.sceneryspots)
    }
  }, [data])

  return result
}

function useEvent(id?: string): Event | undefined {
  const [result, setResult] = useState<Event | undefined>(undefined)
  const [getEvent, { data }] = useLazyQuery(GET_EVENT, { fetchPolicy: "no-cache" })
  
  useEffect(() => {
    if (id) {
      getEvent({ variables: { id } })
    }
  }, [id])

  useEffect(() => {
    if (data) {
      const { event, eventSceneryspots } = data
      setResult({
        ...event,
        scenerySpots: eventSceneryspots,
      })
    }
  }, [data])

  return result
}

function useSave({ value, onCompleted } : { value?: { id?: string }, onCompleted?: (data: any) => void }) {
  const add = useMutation(CREATE_EVENT, {
    onCompleted: () => {
      onCompleted && add[1].data && onCompleted(add[1].data.createEvent)
    },
  })

  const update = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      onCompleted && update[1].data && onCompleted(update[1].data.updateEvent)
    },
  })

  return value?.id ? update : add
}

function useUpdateSceneryspots(): (event_id: string, sceneryspots: string[], newSceneryspots: string[]) => void {
  const [createEventSceneryspots] = useMutation(CREATE_EVENT_SCENERYSPOTS)
  const [removeEventSceneryspots] = useMutation(REMOVE_EVENT_SCENERYSPOTS)

  return (event_id: string, sceneryspots: string[], newSceneryspots: string[]) => {
    sceneryspots.forEach(scenery_spot_id => {
      removeEventSceneryspots({ variables: { input:  { event_id, scenery_spot_id } }})
    })
    newSceneryspots.forEach(scenery_spot_id => {
      createEventSceneryspots({ variables: { input:  { event_id, scenery_spot_id } }})
    })
  }
}

function SceneryspotSelect({ sceneryspots, value, onChange }: { 
  sceneryspots?: Sceneryspot[], 
  value: Sceneryspot[] | null,
  onChange?: (value: Sceneryspot[] | null) => void,
}) {
  const [options, setOptions] = useState<readonly Sceneryspot[]>([])
  
  useEffect(() => {
    (async () => {
      if (sceneryspots) {
        setOptions([...sceneryspots])
      }
    })()
  }, [sceneryspots])

  const handleChange = (event: any, newValue: Sceneryspot[] | null) => {
    console.log({ event, newValue})
    onChange && onChange(newValue)
  }

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      id="sceneryspot-select"
      sx={{
        '& .MuiOutlinedInput-notchedOutline': {
          top: 0,
          '& > legend': {
              float: 'left !important',
          }
        },
      }}
      options={options ?? []}
      getOptionLabel={(option) => option.name}
      value={value ?? []}
      onChange={handleChange}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label="" placeholder="景区" />
      )}
    />
  );
}

interface State {
  id?: string
  code: string
  name: string
  status: number
  start: number
  end: number
  logo: string
  banner: string
  badgeStyle: string
  badgeBackground: string
  notice: string
  sceneryspots: string[]
  description: string
  enableAward: boolean
  categoryId: string
  errorMessage?: string
}

interface Option {
  label: string
  value: string
}

const time = Math.floor(today().getTime() / 1000)
const initialState: State = {
  id: undefined,
  code: "",
  name: "",
  status: 1,
  start: time,
  end: time + (7 * 24 * 3600 - 1),
  logo: "",
  banner: "",
  badgeStyle: "",
  badgeBackground: "",
  notice: "",
  sceneryspots: [],
  description: "",
  enableAward: false,
  categoryId: "",
  errorMessage: undefined,
}

export default function AddEvent({
  match: {
    params: { id }
  },
  history
}: RouteComponentProps<{ id?: string }>) {
  const { t } = useTranslation()
  const alert = useAlert()
  const sceneryspots = useSceneryspots()
  const event = useEvent(id)
  const updateSceneryspots = useUpdateSceneryspots()

  const [values, setValues] = useState<State>({ ...initialState, id })
  const [removeSceneryspots, setRemoveSceneryspots] = useState<string[]>([])

  const { data } = useQuery(GET_CATEGORIES, { fetchPolicy: "no-cache" })
  const categories: Option[] = useMemo(() => {
    if (data) {
      return data.categoriesByParentID
        .sort((a: any, b: any) => b.sort - a.sort)
        .map((v: any) => ({ label: v.name, value: v.id }))
    }
    return []
  }, [data])

  useEffect(() => {
    if (event) {
      const images = event.images.split(',')
      setValues({ 
        ...values,
        code: event.code,
        name: event.name,
        status: event.status,
        start: event.start_time,
        end: event.end_time,
        logo: images[0],
        banner: images[1],
        badgeStyle: images[2],
        badgeBackground: images[3],
        notice: images[4],
        sceneryspots: event.scenerySpots.map((v: any) => v.scenery_spot_id),
        description: event.introduction,
        enableAward: event.enable_award,
        categoryId: event.category_id
      })
    }
  }, [event])

  const isValid = values.name.length > 0

  const [save, { loading }] = useSave({
    value: { id } ,
    onCompleted: (data) => {
      if (data) {
        const eventId = id ?? data.id
        if (eventId) {
          updateSceneryspots(eventId, removeSceneryspots, values.sceneryspots)
        }
        history.push("/event")
      }
    }
  })

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleCategory = (event: SelectChangeEvent) => {
    setValues({ ...values, categoryId: event.target.value })
  }

  const handleAwardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, enableAward: event.target.checked })
  }

  const handleUpload = (prop: keyof State) => (value: string) => {
    setValues({ ...values, [prop]: value })
  }

  const handleSubmit = () => {
    const { 
      id,
      code,
      name,
      status,
      start: start_time,
      end: end_time,
      description: introduction,
      enableAward: enable_award,
      categoryId: category_id,
    } = values
    const images = [values.logo, values.banner, values.badgeStyle, values.badgeBackground, values.notice].join(",")
    const step = ''
    const input = id ? {
      id,
      code,
      name,
      start_time,
      end_time,
      introduction,
      images,
      step,
      status,
      enable_award,
      category_id,
    } : {
      code,
      name,
      start_time,
      end_time,
      introduction,
      images,
      step,
      status,
      enable_award,
      category_id,
    }

    save({ variables: { input }}).catch((e) => alert({ severity: "error", text: e.message }))
  }

  const handleSceneryspot = (value: Sceneryspot[] | null) => {
    if (value) {
      const sceneryspots = value.map((v: Sceneryspot) => v.id)
      setRemoveSceneryspots(values.sceneryspots.filter(v => sceneryspots.indexOf(v) === -1))
      setValues({ ...values, sceneryspots })
    }
  }

  const selectedSceneryspots: Sceneryspot[] = useMemo(() => {
    if (sceneryspots) {
      return sceneryspots.filter((v: Sceneryspot) => values.sceneryspots.indexOf(v.id) > -1)
    }
    return []
  }, [sceneryspots, values])

  return (
    <PageWrapper>
      <PageHeader container>
        <Grid item xs={8}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography color="text.primary">{"活动管理"}</Typography>
          </Breadcrumbs>
          <Title>{id ? "修改活动" : "新增活动"}</Title>
        </Grid>
        <Grid item xs={4} sx={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" }}>
          <Button disableElevation variant="outlined" href='#/event'>{t("Cancel")}</Button>
          <LoadingButton 
            disableElevation 
            variant="contained"
            disabled={!isValid}
            loading={loading}
            onClick={handleSubmit}
          >
            {t("Submit")}
          </LoadingButton>
        </Grid>
      </PageHeader>
      <StyledCard>
        <CardContent sx={{ 
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
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={cnLocale}>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"活动编号"}</Typography>
            <FormInput 
              fullWidth
              id="code-input"  
              value={values.code}
              onChange={handleChange("code")}
            />
          </FormControl>
          <FormControl variant="standard">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{"活动分类"}</Typography>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={values.categoryId}
              size="small"
              variant="outlined"
              notched={true}
              onChange={handleCategory}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  top: 0,
                  "& > legend": {
                      float: "left !important",
                  }
                },
              }}
            >
              {categories.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"活动标题"}</Typography>
            <FormInput 
              fullWidth
              id="name-input"  
              value={values.name}
              onChange={handleChange("name")}
            />
            <FormControlLabel 
              control={<Checkbox checked={values.enableAward} onChange={handleAwardChange} />} 
              label="奖励"
              sx={{ '& .MuiTypography-root': { margin: '0 !important' } }}
            />
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"开始时间"}</Typography>
            <DatePickerWrapper>
              <DesktopDatePicker
                inputFormat="yyyy-MM-dd"
                value={values.start * 1000}
                onChange={(val) => val && setValues({ ...values, start: Math.floor(val / 1000) })}
                renderInput={(params) => <TextField {...params} />}
              />
            </DatePickerWrapper>
            <FormHelperText id="start-helper-text">
              {"如：2023-01-01"}
            </FormHelperText>
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"结束时间"}</Typography>
            <DatePickerWrapper>
              <DesktopDatePicker
                inputFormat="yyyy-MM-dd"
                value={values.end * 1000}
                onChange={(val) => val && setValues({ ...values, end: Math.floor(val / 1000) })}
                renderInput={(params) => <TextField {...params} />}
              />
            </DatePickerWrapper>
            <FormHelperText id="end-helper-text">
               {"如：2023-01-01"}
            </FormHelperText>
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"活动LOGO"}</Typography>
            <UploadFile preview={true} tag={"logo"} value={values.logo} onChange={handleUpload("logo")} />
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"宣传照片"}</Typography>
            <UploadFile preview={true} value={values.banner} onChange={handleUpload("banner")} />
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"徽章样式"}</Typography>
            <UploadFile preview={true} value={values.badgeStyle} onChange={handleUpload("badgeStyle")} />
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"徽章背景"}</Typography>
            <UploadFile preview={true} value={values.badgeBackground} onChange={handleUpload("badgeBackground")} />
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"活动弹窗"}</Typography>
            <UploadFile preview={true} value={values.notice} onChange={handleUpload("notice")} />
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"参与景区"}</Typography>
            <SceneryspotSelect sceneryspots={sceneryspots} value={selectedSceneryspots} onChange={handleSceneryspot} />
          </FormControl>
          <FormControl variant="standard">
            <Typography variant="subtitle2">{"介绍"}</Typography>
            <FormInput 
              fullWidth 
              multiline
              rows={4}
              defaultValue="https://" 
              id="description-input"  
              aria-describedby="description-helper-text"
              value={values.description}
              onChange={handleChange("description")}
            />
          </FormControl>
          </LocalizationProvider>
        </CardContent>
      </StyledCard>
    </PageWrapper>
  )
}