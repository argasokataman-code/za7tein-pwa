// Single source of truth for the route index on /documentation.
// Mirrors the route tables in src/App.tsx — keep both in sync when adding a page.
// `base` is the router basename; `sample` is a concrete path used for the live
// link when the real route carries a param (e.g. /menu-detail/:id).

export interface DocShell {
  role: string
  url: string
  desc: string
}

// Entry points for each role shell — rendered as CTAs in the hero and in
// section "Pages & Routes" so the team can open the live UI in one click.
export const DOC_SHELLS: DocShell[] = [
  { role: 'Customer', url: '/customer/home', desc: 'PWA pembeli' },
  { role: 'Merchant', url: '/merchant', desc: 'Konsol merchant' },
  { role: 'Courier', url: '/courier', desc: 'Tampilan kurir' },
  { role: 'Admin (CS)', url: '/admin', desc: 'Panel CS' },
  { role: 'Super Admin', url: '/superadmin', desc: 'Website penuh non-PWA' },
  { role: 'Landing', url: '/', desc: 'Halaman publik' },
]

export interface DocRoute {
  path: string
  component: string
  desc: string
  /** Concrete path for the live link when `path` contains a param. */
  sample?: string
}

export interface DocRouteGroup {
  id: string
  title: string
  base: string
  rows: DocRoute[]
}

export const WEB_ROUTES: DocRoute[] = [
  { path: '/', component: 'Landing', desc: 'Public landing page' },
  { path: '/documentation', component: 'Documentation', desc: 'This documentation' },
]

export const CUSTOMER_GROUPS: DocRouteGroup[] = [
  {
    id: 'onboarding',
    title: 'Entry & Onboarding',
    base: '/customer',
    rows: [
      { path: '/onboarding', component: 'Onboarding', desc: 'Splash + carousel' },
      { path: '/account-setup', component: 'AccountSetup', desc: 'Layar kegagalan (error boundary)' },
    ],
  },
  {
    id: 'auth',
    title: 'Authentication',
    base: '/customer',
    rows: [
      { path: '/signin', component: 'SignIn', desc: 'Sign in form' },
      { path: '/signup', component: 'SignUp', desc: 'Sign up form' },
      { path: '/forgot-password', component: 'ForgotPassword', desc: 'Email input for reset' },
      { path: '/forgot-password-otp', component: 'ForgotPasswordOtp', desc: 'OTP verification' },
      { path: '/create-password', component: 'CreatePassword', desc: 'New password form' },
      { path: '/verification', component: 'Verification', desc: 'Email verification' },
    ],
  },
  {
    id: 'browse',
    title: 'Home & Browse',
    base: '/customer',
    rows: [
      { path: '/home', component: 'Home', desc: 'Customer home screen' },
      { path: '/search', component: 'Search', desc: 'Search merchants and food' },
      { path: '/filter', component: 'Filter', desc: 'Category and sort filters' },
      { path: '/favorites', component: 'Favorites', desc: 'Saved merchants and items' },
      { path: '/menu-detail/:id', sample: '/menu-detail/1', component: 'MenuDetail', desc: 'Item detail with modifiers (sample id: 1)' },
    ],
  },
  {
    id: 'order',
    title: 'Order & Checkout',
    base: '/customer',
    rows: [
      { path: '/checkout', component: 'Checkout', desc: 'Cart review + fee breakdown + gate saldo' },
      { path: '/address-selection', component: 'AddressSelection', desc: 'Pick delivery address' },
      { path: '/payment-selection', component: 'PaymentSelection', desc: 'Pick payment method' },
      { path: '/payment-amount', component: 'PaymentAmount', desc: 'Enter payment amount' },
      { path: '/order-placed', component: 'OrderPlaced', desc: 'Order placed + Journey Line (tahap dari store)' },
      { path: '/order-chat', component: 'OrderChat', desc: 'Chat with merchant/driver' },
      { path: '/order-arrived', component: 'OrderArrived', desc: 'Pesanan tiba + confetti → rating kurir' },
      { path: '/dispute', component: 'DisputeSubmit', desc: 'Ajukan sengketa (window 24 jam)' },
      { path: '/rating-driver', component: 'RatingDriver', desc: '5-star driver rating' },
    ],
  },
  {
    id: 'wallet',
    title: 'Wallet',
    base: '/customer',
    rows: [
      { path: '/wallet', component: 'WalletBalance', desc: 'Saldo available + pending' },
      { path: '/wallet/top-up', component: 'WalletTopUp', desc: 'Top-up mock Xendit VA/QRIS' },
      { path: '/wallet/payout', component: 'WalletPayout', desc: 'Riwayat payout' },
    ],
  },
  {
    id: 'profile',
    title: 'Profile & Settings',
    base: '/customer',
    rows: [
      { path: '/profile', component: 'Profile', desc: 'Profile hub' },
      { path: '/personal-data', component: 'PersonalData', desc: 'Edit name, email, phone, DOB' },
      { path: '/add-profile-photo', component: 'AddProfilePhoto', desc: 'Change avatar' },
      { path: '/change-password', component: 'ChangePassword', desc: 'Change password' },
      { path: '/create-pin', component: 'CreatePin', desc: 'Create security PIN' },
      { path: '/pin-success', component: 'PinSuccess', desc: 'PIN creation confirmation' },
      { path: '/security', component: 'Security', desc: 'Security settings' },
      { path: '/language', component: 'Language', desc: 'Language selection' },
      { path: '/notifications', component: 'Notifications', desc: 'Notification toggles' },
      { path: '/notification-settings', component: 'NotificationSettings', desc: 'Push subscription + WA fallback (mock)' },
    ],
  },
  {
    id: 'payment',
    title: 'Payment & Cards',
    base: '/customer',
    rows: [
      { path: '/payment-account', component: 'PaymentAccount', desc: 'Payment account overview' },
      { path: '/your-card', component: 'YourCard', desc: 'Saved card details' },
      { path: '/add-new-card', component: 'AddNewCard', desc: 'Add card (details step)' },
    ],
  },
  {
    id: 'info',
    title: 'Info Pages',
    base: '/customer',
    rows: [
      { path: '/reviews', component: 'Reviews', desc: 'User reviews' },
      { path: '/faq', component: 'Faq', desc: 'Frequently asked questions' },
      { path: '/help-center', component: 'HelpCenter', desc: 'Help center' },
      { path: '/privacy-policy', component: 'PrivacyPolicy', desc: 'Privacy policy' },
      { path: '/offline', component: 'Offline', desc: 'Offline fallback screen' },
    ],
  },
]

export const MERCHANT_GROUP: DocRouteGroup = {
  id: 'merchant',
  title: 'Merchant Console',
  base: '/merchant',
  rows: [
    { path: '/signin', component: 'MerchantSignIn', desc: 'Masuk merchant (email + password)' },
    { path: '/signup', component: 'MerchantSignUp', desc: 'Daftar toko' },
    { path: '/pending', component: 'MerchantPending', desc: 'Menunggu persetujuan tim CS' },
    { path: '/', component: 'MerchantDashboard', desc: 'Dashboard: toggle buka/tutup, kuota harian, statistik order' },
    { path: '/orders', component: 'MerchantOrders', desc: 'Antrean order: profil pembeli, tab status, terima/tolak' },
    { path: '/menu', component: 'MerchantMenu', desc: 'Menu & Stock: atur item, stok, ketersediaan' },
    { path: '/reviews', component: 'MerchantReviews', desc: 'Ulasan pembeli: baca & balas (di luar PRD aktif)' },
    { path: '/couriers', component: 'MerchantCouriers', desc: 'Kelola kurir khusus toko (maksimal 3)' },
    { path: '/settings', component: 'MerchantSettings', desc: 'Setelan toko: form edit + peta lokasi' },
    { path: '/dispute', component: 'DisputeSubmit', desc: 'Ajukan sengketa dari sisi merchant' },
  ],
}

export const COURIER_GROUP: DocRouteGroup = {
  id: 'courier',
  title: 'Courier Console',
  base: '/courier',
  rows: [
    { path: '/', component: 'CourierTasks', desc: 'Tugas: toggle siap/jeda, kartu tugas berjalan, riwayat' },
    { path: '/task/:id', sample: '/task/ct-1', component: 'CourierTaskDetail', desc: 'JourneyLine + stepper checkpoint + SLA + OTP (sample id: ct-1)' },
    { path: '/tips', component: 'CourierTips', desc: 'Tips: hanya tips yang jadi milik kurir (C-06)' },
    { path: '/profile', component: 'CourierProfile', desc: 'Profil kurir + status siap/jeda' },
  ],
}

export const ADMIN_GROUP: DocRouteGroup = {
  id: 'admin',
  title: 'Admin Panel (CS)',
  base: '/admin',
  rows: [
    { path: '/', component: 'AdminDashboard', desc: 'Ringkasan: liability agregat + flag saldo Xendit + alert SLA' },
    { path: '/onboarding', component: 'AdminOnboarding', desc: 'Queue tenant: review data, verifikasi deposit, tolak' },
    { path: '/disputes', component: 'AdminDisputes', desc: 'Queue sengketa: investigasi + 4 tombol resolusi' },
    { path: '/merchants', component: 'AdminMerchants', desc: 'Master tenant: suspend + blacklist COD (dua sisi)' },
    { path: '/ledger', component: 'AdminLedger', desc: 'Entry ledger append-only, tanpa edit/hapus' },
  ],
}

export const SUPERADMIN_GROUP: DocRouteGroup = {
  id: 'superadmin',
  title: 'Super Admin (SA) — website penuh non-PWA',
  base: '/superadmin',
  rows: [
    { path: '/', component: 'SaDashboard', desc: 'Ringkasan: chart tulis tangan (donut + bar)' },
    { path: '/zones', component: 'SaZones', desc: 'Master zona Hijazi / Syimali' },
    { path: '/roles', component: 'SaRoles', desc: 'Manajemen role & permission operator' },
    { path: '/audit', component: 'SaAudit', desc: 'Audit trail operator' },
    { path: '/tax', component: 'SaTax', desc: 'Laporan pajak aplikasi' },
    { path: '/profit', component: 'SaProfit', desc: 'Saldo keuntungan platform (net profit)' },
    { path: '/ledger', component: 'SaLedger', desc: 'Monitoring ledger detail (read-only)' },
    { path: '/appeals', component: 'SaAppeals', desc: 'Banding putusan sengketa level-1' },
    { path: '/switches', component: 'SaSwitches', desc: 'Kill switch / mode maintenance' },
  ],
}
