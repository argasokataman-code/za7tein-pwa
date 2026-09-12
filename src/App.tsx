import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { StoreProvider } from './store/provider'

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

const routes: [string, React.ComponentType][] = [
  ['/', Landing],
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
  ['/documentation', Documentation],
  ['/offline', Offline],
]

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {routes.map(([path, Component]) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
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
