import { 
  Bell,
  Image, 
  Trash, 
  User,
  Map,
  MapPin, 
  Navigation, 
  Package, 
  File, 
  Plus, 
  List,
  Menu, 
  Award,
  Link,
  Edit,
  Search,
  Settings,
  Users,
  Maximize,
  Tag,
  Gift,
  CreditCard,
  FileText,
  MapPin as FenceIcon,
} from 'react-feather'

export const KEYS = {
  ACCESS_TOKEN: 'access_token'
}

export const HOUR = 3600
export const DAY = 24 * 3600

export const OPTION_ALL = 'ALL'
export const DEFAULT_CURRENCY = 'VNĐ'

export const ACCESS_TOKEN = localStorage.getItem(KEYS.ACCESS_TOKEN)
export const ContextPath = `${process.env.REACT_APP_CONTEXT_PATH}`

export const asadmin = (scopes?: string[]) => {
  return scopes && scopes.length > 0 && scopes.indexOf('ADMINISTRATOR') > -1
}

export const MENUS = [
  { 
    label: "MENU_ANNOUNCEMENT",
    value: 131075,
    childrens: [
      { label: "MENU_ANNOUNCEMENT_LIST", value: 1, url: "/announcement", icon: Bell },
    ]
  },
  { 
    label: "MENU_PHOTO",
    value: 262396,
    childrens: [
      { label: "MENU_PHOTO_REVIEW", value: 4, url: "/photo-review", icon: Image },
      { label: "MENU_PHOTO_LIST", value: 8, url: "/photo", icon: Image },
      { label: "MENU_PHOTO_RECYCLE", value: 16, url: "/photo-recycle", icon: Trash },
    ]
  },
  { 
    label: "MENU_PLACE",
    value: 57344,
    childrens: [
      { label: "MENU_PLACE_CATEGORY", value: 8192, url: "/place-category", icon: File },
      { label: "MENU_PLACE_LIST", value: 16384, url: "/place", icon: MapPin },
      { label: "MENU_PLACE_NAVIGATION", value: 32768, url: "/place-navigation", icon: Navigation },
      { label: "MENU_PLACE_TASK", value: 32768, url: "/place-task", icon: Package },
      { label: "MENU_PLACE_AWARD", value: 32768, url: "/place-award", icon: Menu },
    ]
  },
  { 
    label: "MENU_EVENT",
    value: 589824,
    childrens: [
      { label: "MENU_EVENT_CATEGORY", value: 8192, url: "/event-category", icon: File },
      { label: "MENU_EVENT_LIST", value: 65536, url: "/event", icon: List },
      { label: "MENU_EVENT_ADD", value: 524288, url: "/event/add", icon: Plus },
      { label: "MENU_EVENT_DETAILS", value: 524288, url: "/event-details", icon: Menu },
      { label: "MENU_EVENT_AWARD", value: 524288, url: "/event-award", icon: Menu },
    ]
  },
  { 
    label: "MENU_USER",
    value: 589824,
    childrens: [
      { label: "MENU_USER_LIST", value: 65536, url: "/user", icon: User },
    ]
  },
  { 
    label: "MENU_BADGE",
    value: 589824,
    childrens: [
      { label: "MENU_BADGE_LIST", value: 65536, url: "/badge", icon: Award },
    ]
  },
  { 
    label: "MENU_PASSPORT",
    value: 589824,
    childrens: [
      { label: "MENU_PASSPORT_LIST", value: 65536, url: "/passport", icon: File },
      { label: "MENU_PASSPORT_PUBLISH", value: 65536, url: "/passport-publish", icon: File },
      { label: "MENU_PASSPORT_HISTORY", value: 65536, url: "/passport-history", icon: File },
      { label: "MENU_PASSPORT_BIND", value: 65536, url: "/passport/bind", icon: Link },
      { label: "MENU_PASSPORT_EXCHANGE", value: 65536, url: "/passport/exchange", icon: Edit },
      { label: "MENU_PASSPORT_SEARCH", value: 65536, url: "/passport/search", icon: Search },
    ]
  },
  {
    label: "MENU_TRENDY_GIFT",
    value: 589824,
    childrens: [
      { label: "MENU_EXCHANGE_VOUCHER", value: 65536, url: "/trendy-gift/exchange-voucher", icon: Gift },
      { label: "MENU_DISCOUNT_VOUCHER", value: 65536, url: "/trendy-gift/discount-voucher", icon: CreditCard },
      { label: "MENU_EXCHANGE_RECORD", value: 65536, url: "/trendy-gift/exchange-record", icon: FileText },
      { label: "MENU_DISCOUNT_RECORD", value: 65536, url: "/trendy-gift/discount-record", icon: FileText },
      { label: "MENU_GEO_FENCE", value: 65536, url: "/trendy-gift/geo-fence", icon: FenceIcon },
    ]
  },
  {
    label: "MENU_SETTINGS",
    value: 589824,
    childrens: [
      { label: "MENU_SETTINGS_CONFIGS", value: 65536, url: "/settings", icon: Settings, roles: ['ROOT'] },
      { label: "MENU_SETTINGS_USER", value: 65536, url: "/settings/system-user", icon: Users, roles: ['ROOT'] },
      { label: "MENU_SETTINGS_LOG", value: 65536, url: "/settings/log", icon: File, roles: ['ROOT'] },
      { label: "MENU_SETTINGS_QRCODE", value: 65536, url: "/settings/qrcode", icon: Maximize },
      { label: "MENU_SETTINGS_TAG", value: 65536, url: "/settings/user-tag", icon: Tag },
      { label: "MENU_SETTINGS_PLACE", value: 65536, url: "/settings/check-in-tag", icon: MapPin },
      { label: "MENU_SETTINGS_MAP", value: 65536, url: "/settings/check-in-map", icon: Map },
    ]
  },
]

export enum Week {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export const AllWeeks: Week[] = [
  Week.MONDAY, 
  Week.TUESDAY, 
  Week.WEDNESDAY, 
  Week.THURSDAY, 
  Week.FRIDAY,
  Week.SATURDAY,
  Week.SUNDAY,
]

export const CATETORY_SCENERYSPOT_TASK = '9dca5b0b-49b5-4b5a-8f99-199eb236f07c'
export const TASK_TREK = '95e1fa0f-40b5-4ae9-84ec-4e65c24e7f7d'
export const TASK_QUESTION = '0db57a33-ab01-449c-961b-2c1015f35496'
export const TASK_SHARE = '00e19ddf-6af6-4d8a-889f-a4dc6a030c02'
export const TASK_ART = '62127eeb-29b7-461a-a065-ae62cc5201aa'
export const TASK_CHECKIN = 'd64b951d-1c06-4254-b88b-4a0459caac4d'

export type Task = 'trek' | 'question' | 'share' | 'art' | 'check-in'

export const SCENERYSPOT_TASKS: { [key: string]: Task } = {
  [TASK_TREK]: 'trek',
  [TASK_QUESTION]: 'question',
  [TASK_SHARE]: 'share',
  [TASK_ART]: 'art',
  [TASK_CHECKIN]: 'check-in'
}
