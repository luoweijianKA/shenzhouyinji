import React, { Suspense, useMemo, useCallback } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { styled, Snackbar, Alert } from '@mui/material'
import Slide, { SlideProps } from '@mui/material/Slide'
import { ThemeProvider } from '@mui/material/styles'
import Header from 'components/Header'
import Sidebar from 'components/Sidebar'
import Loading from 'components/Loading'
import Maintenance from './Maintenance'
import Dashboard from './Dashboard'
import ChangePassword from './ChangePassword'
import Announcement from './Announcement'
import AddAnnouncement from './Announcement/AddAnnouncement'
import EditAnnouncement from './Announcement/EditAnnouncement'
import Photo from './Photo'
import PhotoReview from './Photo/Review'
import PhotoRecycle from './Photo/Recycle'
import Message from './Message'
import MessageReview from './Message/Review'
import Place from './Place'
import PlaceCategory from './Place/Category'
import PlaceNavigation from './Place/Navigation'
import PlaceNavigationDetails from './Place/NavigationDetails'
import PlaceTrekTask from './Place/TrekTask'
import PlaceQuestionTask from './Place/QuestionTask'
import PlaceShareTask from './Place/ShareTask'
import PlaceArtTask from './Place/ArtTask'
import PlaceCheckInTask from './Place/CheckInTask'
import PlaceTask from './Place/Task'
import PlaceAward from './Place/Award'
import Event from './Event'
import EventCategory from './Event/Category'
import AddEvent from './Event/AddEvent'
import EventDetails from './Event/EventDetails'
import EventAward from './Event/EventAward'
import User from './User'
import UserDetails from './User/UserDetails'
import Badge from './Badge'
import BadgeDetails from './Badge/BadgeDetails'
import Passport from './Passport'
import PassportList from './Passport/List'
import PassportPublish from './Passport/Publish'
import PassportBindHistory from './Passport/BindHistory'
import PassportBind from './Passport/PassportBind'
import PassportExchange from './Passport/PassportExchange'
import PassportSearch from './Passport/PassportSearch'
import PassportDetails from './Passport/PassportDetails'
import Settings from './Settings'
import SettingsSystemUser from './Settings/SystemUser'
import SettingsQRcode from './Settings/QRcode'
import SettingsUserTag from './Settings/UserTag'
import SettingsCheckInTag from './Settings/CheckInTag'
import SettingsMap from './Settings/Map'
import SettingsLog from './Settings/Log'
import SignIn from './SignIn'
import ExchangeVoucher from './TrendyGift/ExchangeVoucher'
import DiscountVoucher from './TrendyGift/DiscountVoucher'
import ExchangeRecord from './TrendyGift/ExchangeRecord'
import DeductionRecord from './TrendyGift/DeductionRecord'
import { useAccountState } from 'state/account/hooks'
import { ApplicationStatus, ApplicationModal } from '../state/application/actions'
import { useApplicationState, useModalOpen, useAlert } from '../state/application/hooks'
import theme from './theme'
import ElectronicFence from "./TrendyGift/ElectronicFence";

const drawerWidth = 265

const AppWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  overflow: 'hidden',
  width: '100%',
}))

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: '24px',
  }),
}));

const activedRoutes = [
  {
    path: '/dashboard',
    component: Dashboard,
    exact: true,
    strict: true,
  },
  {
    path: '/change-password',
    component: ChangePassword,
    exact: true,
    strict: true,
  },
  {
    path: '/announcement',
    component: Announcement,
    exact: true,
    strict: true,
  },
  {
    path: '/announcement/add',
    component: AddAnnouncement,
    exact: true,
    strict: true,
  },
  {
    path: '/announcement/:id',
    component: EditAnnouncement,
    exact: true,
    strict: true,
  },
  {
    path: '/photo',
    component: Photo,
    exact: true,
    strict: true,
  },
  {
    path: '/photo-review',
    component: PhotoReview,
    exact: true,
    strict: true,
  },
  {
    path: '/photo-recycle',
    component: PhotoRecycle,
    exact: true,
    strict: true,
  },
  {
    path: '/message',
    component: Message,
    exact: true,
    strict: true,
  },
  {
    path: '/message-review',
    component: MessageReview,
    exact: true,
    strict: true,
  },
  {
    path: '/place',
    component: Place,
    exact: true,
    strict: true,
  },
  {
    path: '/place-category',
    component: PlaceCategory,
    exact: true,
    strict: true,
  },
   {
    path: '/place-navigation',
    component: PlaceNavigation,
    exact: true,
    strict: true,
  },
  {
    path: '/place/:id/navigation',
    component: PlaceNavigationDetails,
    exact: true,
    strict: true,
  },
  {
    path: '/place/:id/trek',
    component: PlaceTrekTask,
    exact: true,
    strict: true,
  },
  {
    path: '/place/:id/question',
    component: PlaceQuestionTask,
    exact: true,
    strict: true,
  },
  {
    path: '/place/:id/share',
    component: PlaceShareTask,
    exact: true,
    strict: true,
  },
  {
    path: '/place/:id/art',
    component: PlaceArtTask,
    exact: true,
    strict: true,
  },
  {
    path: '/place/:id/check-in',
    component: PlaceCheckInTask,
    exact: true,
    strict: true,
  },
  {
    path: '/place-task',
    component: PlaceTask,
    exact: true,
    strict: true,
  },
  {
    path: '/place-award',
    component: PlaceAward,
    exact: true,
    strict: true,
  },
  {
    path: '/event-category',
    component: EventCategory,
    exact: true,
    strict: true,
  },
  {
    path: '/event',
    component: Event,
    exact: true,
    strict: true,
  },
  {
    path: '/event/add',
    component: AddEvent,
    exact: true,
    strict: true,
  },
  {
    path: '/event/:id',
    component: AddEvent,
    exact: true,
    strict: true,
  },
  {
    path: '/event-details',
    component: EventDetails,
    exact: true,
    strict: true,
  },
  {
    path: '/event-details/:id',
    component: EventDetails,
    exact: true,
    strict: true,
  },
  {
    path: '/event-award',
    component: EventAward,
    exact: true,
    strict: true,
  },
  {
    path: '/user',
    component: User,
    exact: true,
    strict: true,
  },
  {
    path: '/user/:id',
    component: UserDetails,
    exact: true,
    strict: true,
  },
  {
    path: '/badge',
    component: Badge,
    exact: true,
    strict: true,
  },
  {
    path: '/badge/:id',
    component: BadgeDetails,
    exact: true,
    strict: true,
  },
  {
    path: '/passport',
    component: Passport,
    exact: true,
    strict: true,
  },
  {
    path: '/passport-publish',
    component: PassportPublish,
    exact: true,
    strict: true,
  },
  {
    path: '/passport-history',
    component: PassportBindHistory,
    exact: true,
    strict: true,
  },
  {
    path: '/passport/bind',
    component: PassportBind,
    exact: true,
    strict: true,
  },
  {
    path: '/passport/exchange',
    component: PassportExchange,
    exact: true,
    strict: true,
  },
  {
    path: '/passport/search',
    component: PassportSearch,
    exact: true,
    strict: true,
  },
  {
    path: '/passport/search/:id',
    component: PassportDetails,
    exact: true,
    strict: true,
  },
  {
    path: '/passport/:id',
    component: PassportList,
    exact: true,
    strict: true,
  },
  {
    path: '/settings',
    component: Settings,
    exact: true,
    strict: true,
  },
  {
    path: '/settings/system-user',
    component: SettingsSystemUser,
    exact: true,
    strict: true,
  },
  {
    path: '/settings/qrcode',
    component: SettingsQRcode,
    exact: true,
    strict: true,
  },
  {
    path: '/settings/user-tag',
    component: SettingsUserTag,
    exact: true,
    strict: true,
  },
  {
    path: '/settings/check-in-tag',
    component: SettingsCheckInTag,
    exact: true,
    strict: true,
  },
  {
    path: '/settings/check-in-map',
    component: SettingsMap,
    exact: true,
    strict: true,
  },
  {
    path: '/settings/log',
    component: SettingsLog,
    exact: true,
    strict: true,
  },
  {
    path: '/trendy-gift/exchange-voucher',
    component: ExchangeVoucher,
    exact: true,
    strict: true,
  },
  {
    path: '/trendy-gift/discount-voucher',
    component: DiscountVoucher,
    exact: true,
    strict: true,
  },
  {
    path: '/trendy-gift/exchange-record',
    component: ExchangeRecord,
    exact: true,
    strict: true,
  },
  {
    path: '/trendy-gift/discount-record',
    component: DeductionRecord,
    exact: true,
    strict: true,
  },
  {
    path: '/trendy-gift/geo-fence',
    component: ElectronicFence,
    exact: true,
    strict: true,
  }
]

function AuthRoute({ actived, ...rest }: { actived: boolean }) {
  return actived ? <Route {...rest} /> : <Redirect to={{ pathname: '/' }} />
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export default function App() {
  const { status, message} = useApplicationState()
  const alert = useAlert()
  const { account } = useAccountState()
  const open = useModalOpen(ApplicationModal.NAV)

  const routes = useMemo(() => {
    if (account) {
      return activedRoutes.map(route => <AuthRoute key={route.path} {...route} actived={!!account} />)
    }
    return undefined
  }, [account])

  const handleCloseMessage = useCallback((event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    alert(undefined)
  }, [alert])

  return (
    <Suspense fallback={null}>
      <AppWrapper>
        <ThemeProvider theme={theme}>
        {status === ApplicationStatus.UPDATING && (<Loading />)}
        {status === ApplicationStatus.MAINTENANCE && (<Maintenance />)}
        {status === ApplicationStatus.READY && (
          account ? (
            <React.Fragment>
              <Header />
              <Sidebar />
              <Main open={open}>
                <Switch>
                  {routes}
                  <Route exact strict render={props => <Dashboard />} />
                </Switch>
              </Main>
              {message && (
                <Snackbar
                  open={!!message}
                  autoHideDuration={3000}
                  onClose={handleCloseMessage}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  TransitionComponent={SlideTransition}
                >
                  <Alert onClose={handleCloseMessage} severity={message?.severity} sx={{ width: '100%' }}>{message?.text}</Alert>
                </Snackbar>
              )}
            </React.Fragment>
          ) : (
            <SignIn />
          )
        )}
        </ThemeProvider>
      </AppWrapper>
    </Suspense>
  );
}
