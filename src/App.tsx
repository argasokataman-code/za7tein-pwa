import { Toaster } from 'react-hot-toast'
import { useEffect, type ComponentType } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { StoreProvider } from './store/provider'
import { MobileDeviceFrame } from './components/layout/MobileDeviceFrame'

import AccountSetup from './pages/AccountSetup'
import AddCard from './pages/AddCard'
import AddCardAddress from './pages/AddCardAddress'
import AddNewCard from './pages/AddNewCard'
import AddProfilePhoto from './pages/AddProfilePhoto'
import AddressSelection from './pages/AddressSelection'
import AdminDashboard from './pages/AdminDashboard'
import AdminDisputes from './pages/AdminDisputes'
import AdminLedger from './pages/AdminLedger'
import AdminMerchants from './pages/AdminMerchants'
import AdminOnboarding from './pages/AdminOnboarding'
import ChangePassword from './pages/ChangePassword'
import Checkout from './pages/Checkout'
import CourierProfile from './pages/CourierProfile'
import CourierTaskDetail from './pages/CourierTaskDetail'
import CourierTasks from './pages/CourierTasks'
import CourierTips from './pages/CourierTips'
import CreatePassword from './pages/CreatePassword'
import CreatePin from './pages/CreatePin'
import DisputeSubmit from './pages/DisputeSubmit'
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
import WalletBalance from './pages/WalletBalance'
import WalletPayout from './pages/WalletPayout'
import WalletTopUp from './pages/WalletTopUp'
import YourCard from './pages/YourCard'

// Tiap peran punya prefix URL sendiri dan BrowserRouter basename sendiri, jadi
// satu deployment bisa melayani beberapa PWA yang diinstall terpisah.
const ROLE_BASES = ['/customer', '/merchant', '/courier', '/admin'] as const
type RoleBase = (typeof ROLE_BASES)[number]

function roleFromPath(pathname: string): RoleBase | null {
  return (
    ROLE_BASES.find(
      (base) => pathname === base || pathname.startsWith(`${base}/`),
    ) ?? null
  )
}

const webRoutes: [string, ComponentType][] = [
  ['/', Landing],
  ['/documentation', Documentation],
]

// Pelanggan — dipasang di /customer/*.
const customerRoutes: [string, ComponentType][] = [
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
  ['/dispute', DisputeSubmit],
  ['/rating-driver', RatingDriver],
  ['/profile', Profile],
  ['/wallet', WalletBalance],
  ['/wallet/top-up', WalletTopUp],
  ['/wallet/payout', WalletPayout],
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

// Merchant — dipasang di /merchant/*.
const merchantRoutes: [string, ComponentType][] = [
  ['/signin', MerchantSignIn],
  ['/signup', MerchantSignUp],
  ['/pending', MerchantPending],
  ['/', MerchantDashboard],
  ['/orders', MerchantOrders],
  ['/menu', MerchantMenu],
  ['/reviews', MerchantReviews],
  ['/couriers', MerchantCouriers],
  ['/settings', MerchantSettings],
  ['/dispute', DisputeSubmit],
]

// Kurir — dipasang di /courier/*. Tanpa layar login: PRD aktif tidak punya
// requirement auth kurir (C-06: kurir karyawan merchant, dikelola merchant).
const courierRoutes: [string, ComponentType][] = [
  ['/', CourierTasks],
  ['/task/:id', CourierTaskDetail],
  ['/tips', CourierTips],
  ['/profile', CourierProfile],
]

// Panel admin (CS) — dipasang di /admin/*. Shell-nya sama dengan role lain (430px).
// Super Admin BUKAN ini: ia role terpisah, kelak berupa website penuh non-PWA
// (scope UNRESOLVED). Lihat docs/product/prd/decision-irbid-mvp.md 2026-09-23.
const adminRoutes: [string, ComponentType][] = [
  ['/', AdminDashboard],
  ['/onboarding', AdminOnboarding],
  ['/disputes', AdminDisputes],
  ['/merchants', AdminMerchants],
  ['/ledger', AdminLedger],
]

interface RoleRouterProps {
  basename: string
  routes: [string, ComponentType][]
  home: string
}

function RoleRouter({ basename, routes, home }: RoleRouterProps) {
  return (
    <BrowserRouter basename={basename}>
      <MobileDeviceFrame>
        <Routes>
          {routes.map(([path, Component]) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<Navigate to={home} replace />} />
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
        <Route path="/app" element={<LegacyAppRedirect />} />
        <Route path="/app/*" element={<LegacyAppRedirect />} />
        {customerRoutes.map(([path]) => (
          <Route key={`legacy-${path}`} path={path} element={<LegacyAppRedirect />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// Tautan lama: /app/* dan jalur polos (/home, /signin) menuju peran yang benar.
function LegacyAppRedirect() {
  useEffect(() => {
    const { pathname, search, hash } = window.location
    const target = pathname.startsWith('/app')
      ? pathname.replace(/^\/app\/merchant/, '/merchant').replace(/^\/app/, '/customer')
      : `/customer${pathname}`
    window.location.replace(`${target}${search}${hash}`)
  }, [])
  return null
}

export default function App() {
  const role = roleFromPath(window.location.pathname)

  useEffect(() => {
    const splash = document.getElementById('boot-splash')
    if (!splash) return
    const frame = requestAnimationFrame(() => splash.remove())
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <StoreProvider>
      {role === '/customer' ? (
        <RoleRouter basename="/customer" routes={customerRoutes} home="/home" />
      ) : role === '/merchant' ? (
        <RoleRouter basename="/merchant" routes={merchantRoutes} home="/" />
      ) : role === '/courier' ? (
        <RoleRouter basename="/courier" routes={courierRoutes} home="/" />
      ) : role === '/admin' ? (
        <RoleRouter basename="/admin" routes={adminRoutes} home="/" />
      ) : (
        <WebsiteRouter />
      )}
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
