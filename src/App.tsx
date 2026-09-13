import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { StoreProvider } from './store/provider'
import { MobileDeviceFrame } from './components/layout/MobileDeviceFrame'

import AccountSetup from './pages/AccountSetup'
import AddCard from './pages/AddCard'
import AddCardAddress from './pages/AddCardAddress'
import AddNewCard from './pages/AddNewCard'
import AddProfilePhoto from './pages/AddProfilePhoto'
import AddressSelection from './pages/AddressSelection'
import ChangePassword from './pages/ChangePassword'
import Checkout from './pages/Checkout'
import CreatePassword from './pages/CreatePassword'
import CreatePin from './pages/CreatePin'
import Documentation from './pages/Documentation'
import Faq from './pages/Faq'
import Favorites from './pages/Favorites'
import Filter from './pages/Filter'
import ForgotPassword from './pages/ForgotPassword'
import ForgotPasswordOtp from './pages/ForgotPasswordOtp'
import HelpCenter from './pages/HelpCenter'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Language from './pages/Language'
import MenuDetail from './pages/MenuDetail'
import MerchantCouriers from './pages/MerchantCouriers'
import MerchantDashboard from './pages/MerchantDashboard'
import MerchantMenu from './pages/MerchantMenu'
import MerchantOrders from './pages/MerchantOrders'
import MerchantPending from './pages/MerchantPending'
import MerchantReviews from './pages/MerchantReviews'
import MerchantSettings from './pages/MerchantSettings'
import MerchantSignIn from './pages/MerchantSignIn'
import MerchantSignUp from './pages/MerchantSignUp'
import NotificationSettings from './pages/NotificationSettings'
import Notifications from './pages/Notifications'
import Offline from './pages/Offline'
import Onboarding from './pages/Onboarding'
import OrderArrived from './pages/OrderArrived'
import OrderChat from './pages/OrderChat'
import OrderDelivered from './pages/OrderDelivered'
import OrderDelivery from './pages/OrderDelivery'
import OrderPlaced from './pages/OrderPlaced'
import OrderSuccess from './pages/OrderSuccess'
import OrderTracking from './pages/OrderTracking'
import PaymentAccount from './pages/PaymentAccount'
import PaymentAmount from './pages/PaymentAmount'
import PaymentSelection from './pages/PaymentSelection'
import PersonalData from './pages/PersonalData'
import PinSuccess from './pages/PinSuccess'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Profile from './pages/Profile'
import RatingDriver from './pages/RatingDriver'
import Reviews from './pages/Reviews'
import Search from './pages/Search'
import Security from './pages/Security'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Verification from './pages/Verification'
import YourCard from './pages/YourCard'

const APP_BASENAME = '/app'

const webRoutes: [string, React.ComponentType][] = [
  ['/', Landing],
  ['/documentation', Documentation],
]

const appRoutes: [string, React.ComponentType][] = [
  ['/onboarding', Onboarding],
  ['/account-setup', AccountSetup],
  ['/signin', SignIn],
  ['/signup', SignUp],
  ['/forgot-password', ForgotPassword],
  ['/forgot-password-otp', ForgotPasswordOtp],
  ['/create-password', CreatePassword],
  ['/verification', Verification],
  ['/home', Home],
  ['/search', Search],
  ['/filter', Filter],
  ['/favorites', Favorites],
  ['/menu-detail/:id', MenuDetail],
  ['/merchant/signin', MerchantSignIn],
  ['/merchant/signup', MerchantSignUp],
  ['/merchant/pending', MerchantPending],
  ['/merchant', MerchantDashboard],
  ['/merchant/orders', MerchantOrders],
  ['/merchant/menu', MerchantMenu],
  ['/merchant/reviews', MerchantReviews],
  ['/merchant/couriers', MerchantCouriers],
  ['/merchant/settings', MerchantSettings],
  ['/checkout', Checkout],
  ['/address-selection', AddressSelection],
  ['/payment-selection', PaymentSelection],
  ['/payment-amount', PaymentAmount],
  ['/order-placed', OrderPlaced],
  ['/order-chat', OrderChat],
  ['/order-delivery', OrderDelivery],
  ['/order-tracking', OrderTracking],
  ['/order-arrived', OrderArrived],
  ['/order-delivered', OrderDelivered],
  ['/order-success', OrderSuccess],
  ['/rating-driver', RatingDriver],
  ['/profile', Profile],
  ['/personal-data', PersonalData],
  ['/add-profile-photo', AddProfilePhoto],
  ['/change-password', ChangePassword],
  ['/create-pin', CreatePin],
  ['/pin-success', PinSuccess],
  ['/security', Security],
  ['/language', Language],
  ['/notifications', Notifications],
  ['/notification-settings', NotificationSettings],
  ['/payment-account', PaymentAccount],
  ['/your-card', YourCard],
  ['/add-new-card', AddNewCard],
  ['/add-card', AddCard],
  ['/add-card-address', AddCardAddress],
  ['/reviews', Reviews],
  ['/faq', Faq],
  ['/help-center', HelpCenter],
  ['/privacy-policy', PrivacyPolicy],
  ['/offline', Offline],
]

function AppRouter() {
  useEffect(() => {
    const splash = document.getElementById('boot-splash')
    if (!splash) return
    const frame = requestAnimationFrame(() => splash.remove())
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <BrowserRouter basename={APP_BASENAME}>
      <MobileDeviceFrame>
        <Routes>
          {appRoutes.map(([path, Component]) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </MobileDeviceFrame>
    </BrowserRouter>
  )
}

function WebsiteRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {webRoutes.map(([path, Component]) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        {appRoutes.map(([path]) => (
          <Route key={`legacy-${path}`} path={path} element={<LegacyAppRedirect />} />
        ))}
        <Route path="/merchant/*" element={<LegacyAppRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function LegacyAppRedirect() {
  useEffect(() => {
    window.location.replace(`/app${window.location.pathname}${window.location.search}${window.location.hash}`)
  }, [])
  return null
}

export default function App() {
  const isApp =
    window.location.pathname === APP_BASENAME ||
    window.location.pathname.startsWith(`${APP_BASENAME}/`)

  return (
    <StoreProvider>
      {isApp ? <AppRouter /> : <WebsiteRouter />}
      <Toaster
        position="top-center"
        containerStyle={{ maxWidth: 'var(--shell-max)', marginInline: 'auto' }}
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            fontSize: 'var(--text-sm)',
          },
        }}
      />
    </StoreProvider>
  )
}
