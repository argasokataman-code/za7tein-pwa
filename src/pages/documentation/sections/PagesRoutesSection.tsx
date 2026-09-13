import { DocSection } from '../DocSection'

interface Row {
  path: string
  component: string
  desc: string
}

function RouteTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <>
      <h3 className="doc-h3">{title}</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Path (under /app)</th>
              <th>Component</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.path}>
                <td><code className="doc-inline">{r.path}</code></td>
                <td><code className="doc-inline">{r.component}</code></td>
                <td>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const webRows: Row[] = [
  { path: '/', component: 'Landing', desc: 'Public landing page' },
  { path: '/documentation', component: 'Documentation', desc: 'This documentation' },
]

const onboardingRows: Row[] = [
  { path: '/onboarding', component: 'Onboarding', desc: 'Splash + carousel' },
  { path: '/account-setup', component: 'AccountSetup', desc: '5-step wizard (language, location, photo, finish)' },
]

const authRows: Row[] = [
  { path: '/signin', component: 'SignIn', desc: 'Sign in form' },
  { path: '/signup', component: 'SignUp', desc: 'Sign up form' },
  { path: '/forgot-password', component: 'ForgotPassword', desc: 'Email input for reset' },
  { path: '/forgot-password-otp', component: 'ForgotPasswordOtp', desc: 'OTP verification' },
  { path: '/create-password', component: 'CreatePassword', desc: 'New password form' },
  { path: '/verification', component: 'Verification', desc: 'Email verification' },
]

const browseRows: Row[] = [
  { path: '/home', component: 'Home', desc: 'Customer home screen' },
  { path: '/search', component: 'Search', desc: 'Search merchants and food' },
  { path: '/filter', component: 'Filter', desc: 'Category and sort filters' },
  { path: '/favorites', component: 'Favorites', desc: 'Saved merchants and items' },
  { path: '/menu-detail/:id', component: 'MenuDetail', desc: 'Item detail with modifiers' },
]

const orderRows: Row[] = [
  { path: '/checkout', component: 'Checkout', desc: 'Cart review' },
  { path: '/address-selection', component: 'AddressSelection', desc: 'Pick delivery address' },
  { path: '/payment-selection', component: 'PaymentSelection', desc: 'Pick payment method' },
  { path: '/payment-amount', component: 'PaymentAmount', desc: 'Enter payment amount' },
  { path: '/order-placed', component: 'OrderPlaced', desc: 'Order placed (auto-advances)' },
  { path: '/order-chat', component: 'OrderChat', desc: 'Chat with merchant/driver' },
  { path: '/order-delivery', component: 'OrderDelivery', desc: 'Delivery in progress' },
  { path: '/order-tracking', component: 'OrderTracking', desc: 'Map tracking view' },
  { path: '/order-arrived', component: 'OrderArrived', desc: 'Order arrived + confetti' },
  { path: '/order-delivered', component: 'OrderDelivered', desc: 'Tiba confirmation' },
  { path: '/order-success', component: 'OrderSuccess', desc: 'Order completion screen' },
  { path: '/rating-driver', component: 'RatingDriver', desc: '5-star driver rating' },
]

const profileRows: Row[] = [
  { path: '/profile', component: 'Profile', desc: 'Profile hub' },
  { path: '/personal-data', component: 'PersonalData', desc: 'Edit name, email, phone, DOB' },
  { path: '/add-profile-photo', component: 'AddProfilePhoto', desc: 'Change avatar' },
  { path: '/change-password', component: 'ChangePassword', desc: 'Change password' },
  { path: '/create-pin', component: 'CreatePin', desc: 'Create security PIN' },
  { path: '/pin-success', component: 'PinSuccess', desc: 'PIN creation confirmation' },
  { path: '/security', component: 'Security', desc: 'Security settings' },
  { path: '/language', component: 'Language', desc: 'Language selection' },
  { path: '/notifications', component: 'Notifications', desc: 'Notification toggles' },
  { path: '/notification-settings', component: 'NotificationSettings', desc: 'Detailed notification prefs' },
]

const paymentRows: Row[] = [
  { path: '/payment-account', component: 'PaymentAccount', desc: 'Payment account overview' },
  { path: '/your-card', component: 'YourCard', desc: 'Saved card details' },
  { path: '/add-new-card', component: 'AddNewCard', desc: 'Add card (details step)' },
  { path: '/add-card', component: 'AddCard', desc: 'Add card flow' },
  { path: '/add-card-address', component: 'AddCardAddress', desc: 'Billing address step' },
]

const infoRows: Row[] = [
  { path: '/reviews', component: 'Reviews', desc: 'User reviews' },
  { path: '/faq', component: 'Faq', desc: 'Frequently asked questions' },
  { path: '/help-center', component: 'HelpCenter', desc: 'Help center' },
  { path: '/privacy-policy', component: 'PrivacyPolicy', desc: 'Privacy policy' },
  { path: '/offline', component: 'Offline', desc: 'Offline fallback screen' },
]

const merchantRows: Row[] = [
  { path: '/merchant/signin', component: 'MerchantSignIn', desc: 'Masuk merchant (email + password)' },
  { path: '/merchant/signup', component: 'MerchantSignUp', desc: 'Daftar toko' },
  { path: '/merchant/pending', component: 'MerchantPending', desc: 'Menunggu persetujuan Super Admin' },
  { path: '/merchant', component: 'MerchantDashboard', desc: 'Dashboard: toggle buka/tutup, kuota harian, statistik order' },
  { path: '/merchant/orders', component: 'MerchantOrders', desc: 'Antrean order: profil pembeli, tab status, terima/tolak, estimasi masak' },
  { path: '/merchant/menu', component: 'MerchantMenu', desc: 'Menu & Stock: atur item, stok, ketersediaan' },
  { path: '/merchant/reviews', component: 'MerchantReviews', desc: 'Ulasan pembeli: baca & balas komentar per hidangan (di luar PRD aktif)' },
  { path: '/merchant/couriers', component: 'MerchantCouriers', desc: 'Kelola kurir khusus toko (maksimal 3)' },
  { path: '/merchant/settings', component: 'MerchantSettings', desc: 'Setelan toko: form edit nama/telepon/alamat, peta lokasi' },
]

export function PagesRoutesSection() {
  return (
    <DocSection id="pages" num="03" title="Pages & Routes">
      <p className="doc-p">
        Routes live in <code className="doc-inline">src/App.tsx</code> as flat{' '}
        <code className="doc-inline">[path, Component]</code> tuples. No route
        groups, no layout wrappers, no <code className="doc-inline">&lt;Outlet&gt;</code>.
      </p>
      <p className="doc-p">
        Two routers share the file. When pathname is{' '}
        <code className="doc-inline">/app</code> or starts with{' '}
        <code className="doc-inline">/app/</code>,{' '}
        <code className="doc-inline">AppRouter</code> handles it (BrowserRouter
        with <code className="doc-inline">basename="/app"</code>, wrapped in{' '}
        <code className="doc-inline">MobileDeviceFrame</code>). Otherwise{' '}
        <code className="doc-inline">WebsiteRouter</code> serves web routes and
        redirects legacy app paths via{' '}
        <code className="doc-inline">LegacyAppRedirect</code> (
        <code className="doc-inline">window.location.replace(&apos;/app&apos; + path)</code>).
      </p>
      <h3 className="doc-h3">Website Routes</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Component</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {webRows.map((r) => (
              <tr key={r.path}>
                <td><code className="doc-inline">{r.path}</code></td>
                <td><code className="doc-inline">{r.component}</code></td>
                <td>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RouteTable title="Entry & Onboarding" rows={onboardingRows} />
      <RouteTable title="Authentication" rows={authRows} />
      <RouteTable title="Home & Browse" rows={browseRows} />
      <RouteTable title="Order & Checkout" rows={orderRows} />
      <RouteTable title="Profile & Settings" rows={profileRows} />
      <RouteTable title="Payment & Cards" rows={paymentRows} />
      <RouteTable title="Info Pages" rows={infoRows} />
      <h3 className="doc-h3">Merchant Console</h3>
      <p className="doc-p">
        Separate role shell for merchants. Merchant auth (
        <code className="doc-inline">/merchant/signin</code> and{' '}
        <code className="doc-inline">/merchant/signup</code>) is separate from
        customer auth. Uses{' '}
        <code className="doc-inline">MerchantBottomNav</code> and is entirely
        mock-data driven. All routes prefixed with{' '}
        <code className="doc-inline">/merchant</code>.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Path (under /app)</th>
              <th>Component</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {merchantRows.map((r) => (
              <tr key={r.path}>
                <td><code className="doc-inline">{r.path}</code></td>
                <td><code className="doc-inline">{r.component}</code></td>
                <td>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        Merchant <code className="doc-inline">Menu & Stock</code> manages the
        shared Redux <code className="doc-inline">catalog</code> slice (also shown
        to customers). Data seed:{' '}
        <code className="doc-inline">src/data/catalog.ts</code>. Orders:{' '}
        <code className="doc-inline">src/data/merchant.ts</code> and{' '}
        <code className="doc-inline">src/data/merchantOrders.ts</code>.
      </p>
    </DocSection>
  )
}
