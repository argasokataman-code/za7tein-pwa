// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Documentation() {
  const [active, setActive] = useState(0)

  const goTo = (index: number, id: string) => {
    setActive(index)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const copyCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const code = e.currentTarget.closest('.doc-code-wrap')?.querySelector('pre')?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <>
    <div className="app-shell">
      <div className="doc-root">
        <div className="doc-topbar">
          <span className="doc-topbar-logo">
            Sa7tein
          </span>
          <button className="doc-hamburger" aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
        </div>
        <div className="doc-overlay " />
        <aside className="doc-sidebar ">
          <div className="doc-sidebar-logo">
            <span className="doc-logo-mark">
              Sa7tein
            </span>
            <span className="doc-logo-sub">
              Documentation
            </span>
          </div>
          <div className="doc-sidebar-version">
            <span className="doc-version-badge">
              v2.0.0
            </span>
            <span>
              React 19 · Vite · TypeScript
            </span>
          </div>
          <nav className="doc-nav">
            <div className="doc-nav-label">
              Contents
            </div>
            <button className={`doc-nav-item ${active === 0 ? "active" : ""}`} onClick={() => goTo(0, "introduction")}>
              <span className="doc-nav-num">
                01
              </span>
              Introduction
            </button>
            <button className={`doc-nav-item ${active === 1 ? "active" : ""}`} onClick={() => goTo(1, "whats-new")}>
              <span className="doc-nav-num">
                02
              </span>
              What Changed
            </button>
            <button className={`doc-nav-item ${active === 2 ? "active" : ""}`} onClick={() => goTo(2, "pages")}>
              <span className="doc-nav-num">
                03
              </span>
              Pages &amp; Routes
            </button>
            <button className={`doc-nav-item ${active === 3 ? "active" : ""}`} onClick={() => goTo(3, "file-structure")}>
              <span className="doc-nav-num">
                04
              </span>
              File Structure
            </button>
            <button className={`doc-nav-item ${active === 4 ? "active" : ""}`} onClick={() => goTo(4, "installation")}>
              <span className="doc-nav-num">
                05
              </span>
              Installation
            </button>
            <button className={`doc-nav-item ${active === 5 ? "active" : ""}`} onClick={() => goTo(5, "route-protection")}>
              <span className="doc-nav-num">
                06
              </span>
              Route Protection
            </button>
            <button className={`doc-nav-item ${active === 6 ? "active" : ""}`} onClick={() => goTo(6, "state")}>
              <span className="doc-nav-num">
                07
              </span>
              State Management
            </button>
            <button className={`doc-nav-item ${active === 7 ? "active" : ""}`} onClick={() => goTo(7, "pwa")}>
              <span className="doc-nav-num">
                08
              </span>
              PWA Setup
            </button>
            <button className={`doc-nav-item ${active === 8 ? "active" : ""}`} onClick={() => goTo(8, "styling")}>
              <span className="doc-nav-num">
                09
              </span>
              Styling System
            </button>
            <button className={`doc-nav-item ${active === 9 ? "active" : ""}`} onClick={() => goTo(9, "forms")}>
              <span className="doc-nav-num">
                10
              </span>
              Form Validation
            </button>
            <button className={`doc-nav-item ${active === 10 ? "active" : ""}`} onClick={() => goTo(10, "components")}>
              <span className="doc-nav-num">
                11
              </span>
              Key Components
            </button>
            <button className={`doc-nav-item ${active === 11 ? "active" : ""}`} onClick={() => goTo(11, "backend")}>
              <span className="doc-nav-num">
                12
              </span>
              Backend Integration
            </button>
          </nav>
        </aside>
        <main className="doc-main">
          <div className="doc-hero">
            <div className="doc-hero-eyebrow">
              Documentation
            </div>
            <h1 className="doc-hero-title">
              Sa7tein 
              <span>
                PWA
              </span>
              <br />
              Developer Guide
            </h1>
            <p className="doc-hero-desc">
              Panduan lengkap PWA marketplace makanan hyperlocal Sa7tein. Setiap layar, route, slice, dan komponen — terdokumentasi.
            </p>
            <div className="doc-hero-tags">
              <span className="doc-hero-tag">
                React 19 + Vite
              </span>
              <span className="doc-hero-tag">
                React 19
              </span>
              <span className="doc-hero-tag">
                TypeScript
              </span>
              <span className="doc-hero-tag">
                Redux Toolkit
              </span>
              <span className="doc-hero-tag">
                SCSS
              </span>
              <span className="doc-hero-tag">
                PWA
              </span>
              <span className="doc-hero-tag">
                Zod
              </span>
              <span className="doc-hero-tag">
                React Hook Form
              </span>
            </div>
          </div>
          <section id="introduction" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                01
              </span>
              <h2 className="doc-section-title">
                Introduction
              </h2>
            </div>
            <p className="doc-p">
              <strong style={{ color: "var(--text)" }}>
                Sa7tein
              </strong>
               is the full React 19 + Vite conversion of the original Sa7tein PWA HTML prototype. Every screen has been rebuilt as a React Server Component or Client Component inside the App Router.
            </p>
            <p className="doc-p">
              The app covers the complete food delivery user journey end-to-end:
            </p>
            <div className="doc-grid">
              <div className="doc-card">
                <div className="doc-card-title">
                  Onboarding
                </div>
                <div className="doc-card-sub">
                  Splash, carousel, account setup wizard
                </div>
              </div>
              <div className="doc-card">
                <div className="doc-card-title">
                  Authentication
                </div>
                <div className="doc-card-sub">
                  Sign in, sign up, forgot password, OTP
                </div>
              </div>
              <div className="doc-card">
                <div className="doc-card-title">
                  Discovery
                </div>
                <div className="doc-card-sub">
                  Home, search, filters, menu detail, favorites
                </div>
              </div>
              <div className="doc-card">
                <div className="doc-card-title">
                  Order &amp; Checkout
                </div>
                <div className="doc-card-sub">
                  Cart, address, payment, tracking, rating
                </div>
              </div>
              <div className="doc-card">
                <div className="doc-card-title">
                  Profile &amp; Settings
                </div>
                <div className="doc-card-sub">
                  Photo, password, notifications, PIN, security
                </div>
              </div>
              <div className="doc-card">
                <div className="doc-card-title">
                  Payments
                </div>
                <div className="doc-card-sub">
                  Wallet, add card, billing address, email verify
                </div>
              </div>
              <div className="doc-card">
                <div className="doc-card-title">
                  PWA
                </div>
                <div className="doc-card-sub">
                  Installable, offline-capable, service worker
                </div>
              </div>
              <div className="doc-card">
                <div className="doc-card-title">
                  40+ Screens
                </div>
                <div className="doc-card-sub">
                  Full parity with HTML prototype
                </div>
              </div>
            </div>
          </section>
          <section id="whats-new" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                02
              </span>
              <h2 className="doc-section-title">
                What Changed from HTML Version
              </h2>
            </div>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Area
                    </th>
                    <th>
                      HTML Version
                    </th>
                    <th>
                      Sa7tein (React)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Routing
                    </td>
                    <td>
                      window.location.href / &lt;a href&gt;
                    </td>
                    <td>
                      react-router-dom — useNavigate(), &lt;Link&gt;
                    </td>
                  </tr>
                  <tr>
                    <td>
                      State
                    </td>
                    <td>
                      sessionStorage / localStorage manually
                    </td>
                    <td>
                      Redux Toolkit + redux-persist
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Auth
                    </td>
                    <td>
                      None
                    </td>
                    <td>
                      Middleware-based route protection via Edge cookie
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Validation
                    </td>
                    <td>
                      Inline JS checks
                    </td>
                    <td>
                      React Hook Form + Zod schemas
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Navigation
                    </td>
                    <td>
                      Full page reload on every link
                    </td>
                    <td>
                      Client-side navigation — no reloads
                    </td>
                  </tr>
                  <tr>
                    <td>
                      PWA
                    </td>
                    <td>
                      service-worker.js + HTML registration
                    </td>
                    <td>
                      public/sw.js + ServiceWorkerRegistrar component
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Images
                    </td>
                    <td>
                      &lt;img&gt; tags
                    </td>
                    <td>
                      &lt;img&gt; dengan object-fit: cover
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Favorites
                    </td>
                    <td>
                      Not persisted
                    </td>
                    <td>
                      Redux slice, persisted to localStorage
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Cart
                    </td>
                    <td>
                      Not persisted
                    </td>
                    <td>
                      Redux slice, persisted to localStorage
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Error handling
                    </td>
                    <td>
                      alert() dialogs
                    </td>
                    <td>
                      react-hot-toast throughout
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Loading state
                    </td>
                    <td>
                      None
                    </td>
                    <td>
                      Global skeleton (loading.tsx) on every route
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section id="pages" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                03
              </span>
              <h2 className="doc-section-title">
                Pages &amp; Routes
              </h2>
            </div>
            <p className="doc-p">
              All routes are inside 
              <code className="doc-inline">
                src/app/
              </code>
              . Route groups 
              <code className="doc-inline">
                (auth)
              </code>
               and 
              <code className="doc-inline">
                (main)
              </code>
               apply different layouts.
            </p>
            <h3 className="doc-h3">
              Entry &amp; Onboarding
            </h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Route
                    </th>
                    <th>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /
                      </code>
                    </td>
                    <td>
                      Entry point → redirects to /signin or /home
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /onboarding
                      </code>
                    </td>
                    <td>
                      Splash + carousel
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /account-setup
                      </code>
                    </td>
                    <td>
                      5-step wizard (language, location, photo, finish)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="doc-h3">
              Authentication — (auth) group
            </h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Route
                    </th>
                    <th>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /signin
                      </code>
                    </td>
                    <td>
                      Sign in form
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /signup
                      </code>
                    </td>
                    <td>
                      Sign up form
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /forgot-password
                      </code>
                    </td>
                    <td>
                      Email input for reset
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /forgot-password-otp
                      </code>
                    </td>
                    <td>
                      OTP verification
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /create-password
                      </code>
                    </td>
                    <td>
                      New password form
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /verification
                      </code>
                    </td>
                    <td>
                      Email verification
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="doc-h3">
              Order &amp; Checkout — (main) group
            </h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Route
                    </th>
                    <th>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /checkout
                      </code>
                    </td>
                    <td>
                      Cart review
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /address-selection
                      </code>
                    </td>
                    <td>
                      Pick delivery address
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /payment-selection
                      </code>
                    </td>
                    <td>
                      Pick payment method
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /order-placed
                      </code>
                    </td>
                    <td>
                      Order placed (auto-advances)
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /order-tracking
                      </code>
                    </td>
                    <td>
                      Map tracking view
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /order-arrived
                      </code>
                    </td>
                    <td>
                      Order arrived + confetti
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /order-delivered
                      </code>
                    </td>
                    <td>
                      Tiba confirmation
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /rating-driver
                      </code>
                    </td>
                    <td>
                      5-star driver rating
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="doc-h3">
              Profile &amp; Settings — (main) group
            </h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Route
                    </th>
                    <th>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /profile
                      </code>
                    </td>
                    <td>
                      Profile hub
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /profile/personal-data
                      </code>
                    </td>
                    <td>
                      Edit name, email, phone, DOB
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /profile/add-profile-photo
                      </code>
                    </td>
                    <td>
                      Change avatar
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /profile/change-password
                      </code>
                    </td>
                    <td>
                      Change password
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /profile/notifications
                      </code>
                    </td>
                    <td>
                      Notification toggles
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /profile/wallet
                      </code>
                    </td>
                    <td>
                      Payment account overview
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /profile/wallet/add-new-card
                      </code>
                    </td>
                    <td>
                      Add card (details step)
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /profile/wallet/add-card-address
                      </code>
                    </td>
                    <td>
                      Billing address step
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="doc-h3">
              Merchant Console — /merchant group
            </h3>
            <p>
              A separate role shell for merchants, distinct from the customer app.
              Merchant auth (<code className="doc-inline">/merchant/signin</code> and{' '}
              <code className="doc-inline">/merchant/signup</code>) is separate from customer auth{' '}
              (<code className="doc-inline">/signin</code>).
              It uses its own bottom nav (<code className="doc-inline">MerchantBottomNav</code>)
              and is entirely mock-data driven (no backend or auth).
              All routes are prefixed with <code className="doc-inline">/merchant</code>
              {' '}so they don't collide with the 46 customer routes.
            </p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Route
                    </th>
                    <th>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /merchant/signin
                      </code>
                    </td>
                    <td>
                      Masuk merchant (email + password)
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /merchant/signup
                      </code>
                    </td>
                    <td>
                      Daftar toko
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /merchant/pending
                      </code>
                    </td>
                    <td>
                      Menunggu persetujuan Super Admin
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /merchant
                      </code>
                    </td>
                    <td>
                      Dashboard: toggle buka/tutup, kuota harian, statistik order
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /merchant/orders
                      </code>
                    </td>
                    <td>
                      Antrean order: tab status, terima/tolak, estimasi masak 15–30 menit
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /merchant/couriers
                      </code>
                    </td>
                    <td>
                      Kelola kurir khusus toko (maksimal 3)
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="doc-inline">
                        /merchant/settings
                      </code>
                    </td>
                    <td>
                      Setelan toko: jam operasional, paket/kuota, rekening
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Merchant screens reuse <code className="doc-inline">JourneyLine</code> from{' '}
              <code className="doc-inline">src/components/OrderStageScreen.tsx</code> and data
              from <code className="doc-inline">src/data/merchant.ts</code> and{' '}
              <code className="doc-inline">src/data/merchantOrders.ts</code>.
              Navigation is handled by <code className="doc-inline">MerchantBottomNav</code>.
            </p>
          </section>
          <section id="file-structure" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                04
              </span>
              <h2 className="doc-section-title">
                File Structure
              </h2>
            </div>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  bash
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`sa7tein-pwa/
│
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (vite-plugin-pwa)
│   └── assets/
│       ├── img/               # Gambar, ikon
│       └── fonts/             # Manrope (self-hosted)
│
└── src/
    ├── main.tsx               # Entry — Redux Provider + PersistGate
    ├── App.tsx                # Router + toaster
    │
    ├── pages/                 # 50 layar
    │
    ├── components/
    │   ├── layout/            # BottomNav, HomeIndicator
    │   └── ui/                # FavoriteButton, BackButton
    │
    ├── store/
    │   ├── index.ts           # configureStore + redux-persist
    │   └── slices/            # auth, cart, favorites, ui, accountSetup
    │
    ├── hooks/                 # useAppStore, useOtpInput, useLeafletMap
    ├── lib/schemas.ts         # Skema Zod
    ├── data/                  # Data contoh (foods, reviews, user)
    └── styles/                # tokens, fonts, reboot, app, modules, docs`}</code>
              </pre>
            </div>
          </section>
          <section id="installation" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                05
              </span>
              <h2 className="doc-section-title">
                Installation &amp; Getting Started
              </h2>
            </div>
            <h3 className="doc-h3">
              Prerequisites
            </h3>
            <ul className="doc-list">
              <li>
                Node.js 18 or higher
              </li>
              <li>
                npm 9+
              </li>
            </ul>
            <h3 className="doc-h3">
              Install &amp; Run
            </h3>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  bash
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`npm install
npm run dev`}</code>
              </pre>
            </div>
            <div className="doc-info">
              <strong>
                Note:
              </strong>
               The app starts with 
              <code>
                isAuthenticated: true
              </code>
               and 
              <code>
                MOCK_USER
              </code>
               pre-loaded so you can browse all screens immediately without signing in.
            </div>
            <h3 className="doc-h3">
              Production Build
            </h3>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  bash
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`npm run build
npm start`}</code>
              </pre>
            </div>
            <div className="doc-info">
              <strong>
                PWA tip:
              </strong>
               Always test PWA features (manifest, sw.js, offline) with a production build — service workers don't register in dev mode.
            </div>
          </section>
          <section id="route-protection" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                06
              </span>
              <h2 className="doc-section-title">
                Route Protection
              </h2>
            </div>
            <p className="doc-p">
              <code className="doc-inline">
                middleware.ts
              </code>
               runs on the Edge Runtime before every request. It cannot access Redux or localStorage — only cookies. The 
              <code className="doc-inline">
                useAuthCookie
              </code>
               hook bridges the gap.
            </p>
            <h3 className="doc-h3">
              Auth Flow
            </h3>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  typescript
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`// 1. User logs in → Redux: isAuthenticated = true
// 2. useAuthCookie → writes: document.cookie = "delivo_auth=true"
// 3. User navigates to /checkout
// 4. middleware reads cookie → passes through ✓

// Logout
dispatch(logout());
// useAuthCookie detects false → clears cookie
// middleware blocks all protected routes immediately`}</code>
              </pre>
            </div>
            <h3 className="doc-h3">
              Route Groups
            </h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Group
                    </th>
                    <th>
                      Routes
                    </th>
                    <th>
                      Behavior
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="doc-badge doc-badge--muted">
                        Public
                      </span>
                    </td>
                    <td>
                      /signin, /signup, /forgot-password*, /onboarding
                    </td>
                    <td>
                      Always accessible
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="doc-badge doc-badge--yellow">
                        Guest-only
                      </span>
                    </td>
                    <td>
                      Auth pages
                    </td>
                    <td>
                      Logged-in users redirected to /home
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="doc-badge doc-badge--green">
                        Protected
                      </span>
                    </td>
                    <td>
                      Everything else
                    </td>
                    <td>
                      Unauthenticated → /signin?from=...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section id="state" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                07
              </span>
              <h2 className="doc-section-title">
                State Management
              </h2>
            </div>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Slice
                    </th>
                    <th>
                      Persisted Key
                    </th>
                    <th>
                      Persisted Fields
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      cart
                    </td>
                    <td>
                      delivo:cart
                    </td>
                    <td>
                      items, selectedAddressId, selectedPaymentId
                    </td>
                  </tr>
                  <tr>
                    <td>
                      favorites
                    </td>
                    <td>
                      delivo:favorites
                    </td>
                    <td>
                      ids
                    </td>
                  </tr>
                  <tr>
                    <td>
                      accountSetup
                    </td>
                    <td>
                      delivo:accountSetup
                    </td>
                    <td>
                      currentScreen, selectedLanguage, profilePhoto, isSetupCompleted
                    </td>
                  </tr>
                  <tr>
                    <td>
                      auth
                    </td>
                    <td>
                      not persisted
                    </td>
                    <td>
                      mirrored to delivo_auth cookie
                    </td>
                  </tr>
                  <tr>
                    <td>
                      ui
                    </td>
                    <td>
                      not persisted
                    </td>
                    <td>
                      notificationCount, locationLabel, cartBadgeCount
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="doc-h3">
              Dispatch Examples
            </h3>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  typescript
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { addItem } from "@/store/slices/cartSlice";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import { setLocationLabel } from "@/store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";

const dispatch = useAppDispatch();

dispatch(addItem({ id, name, price, quantity: 1, image }));
dispatch(toggleFavorite(foodId));
dispatch(setLocationLabel("5th Ave, New York"));
dispatch(logout());`}</code>
              </pre>
            </div>
            <div className="doc-info">
              <strong>
                PersistGate matters:
              </strong>
               Without it, components render once with empty Redux defaults before rehydration — causing cart guard to redirect users and auth guard to see isAuthenticated: false.
            </div>
          </section>
          <section id="pwa" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                08
              </span>
              <h2 className="doc-section-title">
                PWA Setup
              </h2>
            </div>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      File
                    </th>
                    <th>
                      Location
                    </th>
                    <th>
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      manifest.json
                    </td>
                    <td>
                      public/
                    </td>
                    <td>
                      App metadata, icons, display mode
                    </td>
                  </tr>
                  <tr>
                    <td>
                      sw.js
                    </td>
                    <td>
                      public/
                    </td>
                    <td>
                      Service worker — caching strategies
                    </td>
                  </tr>
                  <tr>
                    <td>
                      ServiceWorkerRegistrar.tsx
                    </td>
                    <td>
                      src/components/pwa/
                    </td>
                    <td>
                      Registers SW on mount
                    </td>
                  </tr>
                  <tr>
                    <td>
                      offline/page.tsx
                    </td>
                    <td>
                      src/app/offline/
                    </td>
                    <td>
                      Offline fallback page
                    </td>
                  </tr>
                  <tr>
                    <td>
                      next.config.ts
                    </td>
                    <td>
                      root
                    </td>
                    <td>
                      Headers so browser never caches sw.js
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="doc-h3">
              Caching Strategy
            </h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Request Type
                    </th>
                    <th>
                      Strategy
                    </th>
                    <th>
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Page navigation
                    </td>
                    <td>
                      Network-first → cache → /offline
                    </td>
                    <td>
                      Always fresh, offline fallback
                    </td>
                  </tr>
                  <tr>
                    <td>
                      /_next/static/*
                    </td>
                    <td>
                      Cache-first
                    </td>
                    <td>
                      Build hashes guarantee freshness
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Images, fonts
                    </td>
                    <td>
                      Cache-first
                    </td>
                    <td>
                      Rarely change
                    </td>
                  </tr>
                  <tr>
                    <td>
                      /api/*
                    </td>
                    <td>
                      Network-only
                    </td>
                    <td>
                      Never stale data
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section id="styling" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                09
              </span>
              <h2 className="doc-section-title">
                Styling System
              </h2>
            </div>
            <p className="doc-p">
              All partials are imported in 
              <code className="doc-inline">
                src/styles/_index.scss
              </code>
               via 
              <code className="doc-inline">
                @use
              </code>
              . Do not use 
              <code className="doc-inline">
                @import
              </code>
              .
            </p>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  scss
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`// src/styles/_index.scss
@use "base";
@use "onboarding";
@use "auth-styles";
@use "home";
@use "user-profile";
@use "skeleton";
@use "nextjs-fixes";  // ← always last`}</code>
              </pre>
            </div>
            <h3 className="doc-h3">
              Fluid Typography
            </h3>
            <p className="doc-p">
              All font sizes use 
              <code className="doc-inline">
                clamp()
              </code>
               — they scale smoothly between screen sizes with no media queries needed:
            </p>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  scss
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`$font-14: clamp(13px, 0.5vw + 11px, 14px);
$font-16: clamp(14px, 0.6vw + 12px, 16px);
$font-24: clamp(20px, 1.2vw + 16px, 24px);
// $font-10 through $font-64 all available`}</code>
              </pre>
            </div>
            <h3 className="doc-h3">
              Color Variables
            </h3>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  scss
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`$primary-color: #F15A37;   // Orange — all accents, buttons, active states
$bg-dark:       #000000;   // Page background
$text-light:    #ffffff;   // Primary text
$text-muted:    #697586;   // Placeholder, secondary text
$input-bg:      #1a1a1a99;
$input-border:  #3a3a3a;
$error-color:   #ff3b30;`}</code>
              </pre>
            </div>
          </section>
          <section id="forms" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                10
              </span>
              <h2 className="doc-section-title">
                Form Validation
              </h2>
            </div>
            <p className="doc-p">
              All forms use 
              <code className="doc-inline">
                react-hook-form
              </code>
               with 
              <code className="doc-inline">
                @hookform/resolvers/zod
              </code>
              . Schemas are in 
              <code className="doc-inline">
                src/lib/schemas.ts
              </code>
              .
            </p>
            <h3 className="doc-h3">
              Available Schemas
            </h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Schema
                    </th>
                    <th>
                      Fields
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      signInSchema
                    </td>
                    <td>
                      email, password
                    </td>
                  </tr>
                  <tr>
                    <td>
                      signUpSchema
                    </td>
                    <td>
                      name, email, password, confirmPassword (cross-field check)
                    </td>
                  </tr>
                  <tr>
                    <td>
                      forgotPasswordSchema
                    </td>
                    <td>
                      email
                    </td>
                  </tr>
                  <tr>
                    <td>
                      createPasswordSchema
                    </td>
                    <td>
                      password, confirmPassword
                    </td>
                  </tr>
                  <tr>
                    <td>
                      cardSchema
                    </td>
                    <td>
                      cardHolder, cardNumber (16 digits), cvv (3-4 digits), expiry (MM/YY)
                    </td>
                  </tr>
                  <tr>
                    <td>
                      billingSchema
                    </td>
                    <td>
                      street, city, state, zip
                    </td>
                  </tr>
                   <tr>
                    <td>
                      personalDataSchema
                    </td>
                    <td>
                      fullName, email, phone, dob?, gender?
                    </td>
                  </tr>
                  <tr>
                    <td>
                      merchantSignInSchema
                    </td>
                    <td>
                      email, password (akun merchant, terpisah dari customer)
                    </td>
                  </tr>
                  <tr>
                    <td>
                      merchantSignUpSchema
                    </td>
                    <td>
                      name, email, phone (opsional), password
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="doc-h3">
              Usage Pattern
            </h3>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  typescript
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "@/lib/schemas";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<SignInFormData>({
  resolver: zodResolver(signInSchema),
});`}</code>
              </pre>
            </div>
          </section>
          <section id="components" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                11
              </span>
              <h2 className="doc-section-title">
                Key Components Reference
              </h2>
            </div>
            <h3 className="doc-h3">
              BackButton
            </h3>
            <p className="doc-p">
              <code className="doc-inline">
                src/components/ui/BackButton.tsx
              </code>
            </p>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  tsx
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`<BackButton
  variant="default"  // "default" | "card" | "map" | "dark"
  behavior="smart"   // "smart" | "history" | "href"
  href="/home"       // fallback URL for "smart", target for "href"
/>`}</code>
              </pre>
            </div>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>
                      Behavior
                    </th>
                    <th>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      smart
                    </td>
                    <td>
                      router.back() if history exists, else router.push(href)
                    </td>
                  </tr>
                  <tr>
                    <td>
                      history
                    </td>
                    <td>
                      Always router.back()
                    </td>
                  </tr>
                  <tr>
                    <td>
                      href
                    </td>
                    <td>
                      Always router.push(href)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="doc-h3">
              FavoriteButton
            </h3>
            <p className="doc-p">
              <code className="doc-inline">
                src/components/ui/FavoriteButton.tsx
              </code>
            </p>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  tsx
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`<FavoriteButton
  id={item.id}      // food item ID
  name={item.name}  // used in toast message
  variant="card"    // "card" | "header"
/>`}</code>
              </pre>
            </div>
            <div className="doc-info">
              <strong>
                Important:
              </strong>
               Never nest 
              <code>
                &lt;FavoriteButton&gt;
              </code>
               inside a 
              <code>
                &lt;Link&gt;
              </code>
              . Use 
              <code>
                &lt;div onClick=&#123;() =&gt; router.push(...)&#125;&gt;
              </code>
               as the card wrapper instead. Button-inside-anchor is invalid HTML and causes page reloads on favorite clicks.
            </div>
            <h3 className="doc-h3">
              LocationPicker
            </h3>
            <p className="doc-p">
              <code className="doc-inline">
                src/components/ui/LocationPicker.tsx
              </code>
            </p>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  tsx
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`// In HomeClient.tsx header
<LocationPicker />
// Opens bottom sheet with GPS + saved addresses
// Dispatches setLocationLabel(address) to uiSlice

// Customize saved addresses at top of LocationPicker.tsx:
// Ikon memakai lucide (strokeWidth 1.75), bukan emoji.
const SAVED_ADDRESSES = [
  { id: "1", label: "Home", address: "44 Street Town, New York", icon: Home },
  { id: "2", label: "Work", address: "120 Business Ave, Manhattan", icon: Briefcase },
];`}</code>
              </pre>
            </div>
          </section>
          <section id="backend" className="doc-section">
            <div className="doc-section-header">
              <span className="doc-section-num">
                12
              </span>
              <h2 className="doc-section-title">
                Connecting a Real Backend
              </h2>
            </div>
            <p className="doc-p">
              The app runs fully on mock data. Here's where to swap each piece:
            </p>
            <h3 className="doc-h3">
              Authentication — disable mock user
            </h3>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  typescript
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`// src/store/slices/authSlice.ts
const initialState: AuthState = {
  user: null,              // was MOCK_USER
  isAuthenticated: false,  // was true
  isLoading: false,
};`}</code>
              </pre>
            </div>
            <h3 className="doc-h3">
              Middleware — JWT verification
            </h3>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  typescript
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`// middleware.ts — replace cookie check with JWT
import { jwtVerify } from "jose"; // Edge-compatible

const token = request.cookies.get("auth_token")?.value;
if (!token) return redirectToSignIn();

await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));`}</code>
              </pre>
            </div>
            <h3 className="doc-h3">
              Food data — RTK Query
            </h3>
            <div className="doc-code-wrap">
              <div className="doc-code-header">
                <span className="doc-code-lang">
                  typescript
                </span>
                <button className="doc-copy-btn" onClick={copyCode}>
                  Copy
                </button>
              </div>
              <pre className="doc-pre">
                <code>{`// src/store/api/foodApi.ts
export const foodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoods: builder.query<FoodItem[], void>({
      query: () => "/foods",
    }),
  }),
});`}</code>
              </pre>
            </div>
            <h3 className="doc-h3">
              Order tracking — WebSocket
            </h3>
            <p className="doc-p">
              The tracking pages simulate GPS movement with 
              <code className="doc-inline">
                setTimeout
              </code>
              . Replace with a WebSocket or polling endpoint from your delivery backend.
            </p>
          </section>
        </main>
      </div>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
