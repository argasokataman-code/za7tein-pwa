import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { StoreProvider } from './store/provider'
import Home from './pages/Home'
import { Placeholder } from './pages/Placeholder'

/** Routes that already have a rebuilt screen. */
const built = new Set(['/home'])

/** Every route the app mirrors, in navigation order. */
const routes: { path: string; title: string; nav?: boolean }[] = [
  { path: '/', title: 'Delivo' },
  { path: '/onboarding', title: 'Onboarding' },
  { path: '/account-setup', title: 'Account Setup' },
  { path: '/signin', title: 'Sign In' },
  { path: '/signup', title: 'Sign Up' },
  { path: '/forgot-password', title: 'Forgot Password' },
  { path: '/forgot-password-otp', title: 'OTP Verification' },
  { path: '/create-password', title: 'Create Password' },
  { path: '/verification', title: 'Email Verification' },
  { path: '/home', title: 'Home', nav: true },
  { path: '/search', title: 'Search', nav: true },
  { path: '/filter', title: 'Filter' },
  { path: '/favorites', title: 'Favorites', nav: true },
  { path: '/menu-detail/:id', title: 'Menu Detail' },
  { path: '/checkout', title: 'Checkout', nav: true },
  { path: '/address-selection', title: 'Address Selection' },
  { path: '/payment-selection', title: 'Payment Selection' },
  { path: '/payment-amount', title: 'Payment Amount' },
  { path: '/order-placed', title: 'Order Placed' },
  { path: '/order-delivery', title: 'Order Delivery' },
  { path: '/order-tracking', title: 'Order Tracking' },
  { path: '/order-arrived', title: 'Order Arrived' },
  { path: '/order-delivered', title: 'Order Delivered' },
  { path: '/order-success', title: 'Order Success' },
  { path: '/rating-driver', title: 'Rating Driver' },
  { path: '/profile', title: 'Profile', nav: true },
  { path: '/personal-data', title: 'Personal Data' },
  { path: '/add-profile-photo', title: 'Profile Photo' },
  { path: '/change-password', title: 'Change Password' },
  { path: '/create-pin', title: 'Create PIN' },
  { path: '/pin-success', title: 'PIN Success' },
  { path: '/security', title: 'Security' },
  { path: '/language', title: 'Language' },
  { path: '/notifications', title: 'Notifications' },
  { path: '/payment-account', title: 'Payment Account' },
  { path: '/your-card', title: 'Your Card' },
  { path: '/add-new-card', title: 'Add New Card' },
  { path: '/add-card', title: 'Add Card' },
  { path: '/add-card-address', title: 'Billing Address' },
  { path: '/reviews', title: 'Reviews' },
  { path: '/faq', title: 'FAQ' },
  { path: '/help-center', title: 'Help Center' },
  { path: '/privacy-policy', title: 'Privacy Policy' },
  { path: '/documentation', title: 'Documentation' },
  { path: '/offline', title: 'Offline' },
]

function AppRoutes() {
  return (
    <Routes>
      {routes.map(({ path, title, nav }) =>
        built.has(path) ? (
          <Route key={path} path={path} element={<Home />} />
        ) : (
          <Route key={path} path={path} element={<Placeholder title={title} withNav={nav} />} />
        ),
      )}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1a', color: '#fff' } }} />
    </StoreProvider>
  )
}
