// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <>
    <div className="app-shell">
      <div className="page-module___8aEwW__pwaNotification page-module___8aEwW__show" role="alert" aria-live="polite">
        <p className="page-module___8aEwW__pwaText">
          <strong>
            Download the app
          </strong>
           — Install Delivo PWA for a better experience.
        </p>
        <div className="page-module___8aEwW__pwaActions">
          <button type="button" className="page-module___8aEwW__pwaInstallBtn">
            Install
          </button>
          <button type="button" className="page-module___8aEwW__pwaDismissBtn" aria-label="Dismiss">
            ×
          </button>
        </div>
      </div>
      <div className="page-module___8aEwW__body">
        <p className="page-module___8aEwW__brand">
          Delivo
        </p>
        <h1 className="page-module___8aEwW__title">
          Delivo - PWA NEXT.JS Template
        </h1>
        <p className="page-module___8aEwW__subtitle">
          Mobile-first PWA template for food delivery: onboarding, auth, home, orders, profile, payments &amp; help. Dark theme with orange accent.
        </p>
        <ul className="page-module___8aEwW__features">
          <li>
            Next.js
          </li>
          <li>
            Typescript
          </li>
          <li>
            Redux Toolkit
          </li>
          <li>
            PWA Ready
          </li>
          <li>
            Sass
          </li>
          <li>
            50+ Pages
          </li>
          <li>
            Reusable Components
          </li>
          <li>
            Bootstrap ready
          </li>
          <li>
            Easy to Edit
          </li>
          <li>
            User Friendly Design
          </li>
        </ul>
        <div className="page-module___8aEwW__buttons">
          <Link className="page-module___8aEwW__btn page-module___8aEwW__btnPrimary" to="/onboarding">
            View Demo
          </Link>
          <Link className="page-module___8aEwW__btn page-module___8aEwW__btnOutline" target="_blank" to="/documentation">
            Documentation
          </Link>
          <a className="page-module___8aEwW__btn page-module___8aEwW__btnOutline" target="_blank" href="https://delivo-dashboard-nextjs.vercel.app">
            Dashboard
          </a>
        </div>
        <div className="page-module___8aEwW__viewbox">
          <p className="page-module___8aEwW__viewboxTitle">
            View Demo
          </p>
          <p className="page-module___8aEwW__viewboxSubtitle">
            Click the button to preview
          </p>
          <div className="page-module___8aEwW__phoneFrame">
            <div className="page-module___8aEwW__phoneScreen">
              <iframe src="/onboarding" title="Delivo PWA Live Preview" />
            </div>
          </div>
          <Link className="page-module___8aEwW__btn page-module___8aEwW__btnPrimary" to="/onboarding">
            Live Preview
          </Link>
        </div>
        <div className="page-module___8aEwW__scan">
          <p className="page-module___8aEwW__scanTitle">
            Scan to view on your mobile device
          </p>
          <img alt="QR Code to open Delivo on mobile" width={120} height={120} className="page-module___8aEwW__qr" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https%3A%2F%2Fdelivo-pwa.netlify.app%2F" style={{  }} />
          <p className="page-module___8aEwW__scanTitle">
            Scan to view on your mobile device
          </p>
        </div>
        <div className="page-module___8aEwW__preview">
          <p className="page-module___8aEwW__previewTitle">
            View Demo
          </p>
          <p className="page-module___8aEwW__previewText">
            Click to open the app preview
          </p>
          <Link className="page-module___8aEwW__btn page-module___8aEwW__btnPrimary" to="/onboarding">
            Live Preview
          </Link>
        </div>
        <p className="page-module___8aEwW__credit">
          by dalonext
        </p>
      </div>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
