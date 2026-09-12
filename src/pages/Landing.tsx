// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

import { useState } from 'react'

import toast from 'react-hot-toast'

export default function Landing() {
  const [showBanner, setShowBanner] = useState(true)
  return (
    <>
    <div className="app-shell">
      {showBanner && (
        <div className="page-module___8aEwW__pwaNotification page-module___8aEwW__show" role="alert" aria-live="polite">
        <p className="page-module___8aEwW__pwaText">
          <strong>
            Pasang aplikasi
          </strong>
           — Install Sa7tein PWA untuk pengalaman lebih cepat.
        </p>
        <div className="page-module___8aEwW__pwaActions">
          <button type="button" className="page-module___8aEwW__pwaInstallBtn" onClick={() => toast.success("Pakai menu browser untuk memasang Sa7tein")}>
            Install
          </button>
          <button type="button" className="page-module___8aEwW__pwaDismissBtn" aria-label="Dismiss" onClick={() => setShowBanner(false)}>
            ×
          </button>
        </div>
      </div>
      )}
      <div className="page-module___8aEwW__body">
        <p className="page-module___8aEwW__brand">
          Sa7tein
        </p>
        <h1 className="page-module___8aEwW__title">
          Sa7tein — PWA Marketplace Makanan Hyperlocal
        </h1>
        <p className="page-module___8aEwW__subtitle">
          Marketplace makanan berbasis PWA tanpa install Play Store. Pesan dalam radius 2 km,
          bayar COD atau transfer manual, ongkir 100% masuk ke merchant.
        </p>
        <ul className="page-module___8aEwW__features">
          <li>
            PWA · Tanpa Install
          </li>
          <li>
            React + Vite
          </li>
          <li>
            Redux Toolkit
          </li>
          <li>
            Web Push API
          </li>
          <li>
            Zona Radius 2 km
          </li>
          <li>
            COD &amp; Transfer
          </li>
          <li>
            Kurir Toko
          </li>
          <li>
            50+ Halaman
          </li>
          <li>
            Peta &amp; Geofence
          </li>
          <li>
            Ramah Satu Tangan
          </li>
        </ul>
        <div className="page-module___8aEwW__buttons">
          <Link className="page-module___8aEwW__btn page-module___8aEwW__btnPrimary" to="/onboarding">
            Lihat Demo
          </Link>
          <Link className="page-module___8aEwW__btn page-module___8aEwW__btnOutline" to="/documentation">
            Dokumentasi
          </Link>
        </div>
        <div className="page-module___8aEwW__viewbox">
          <p className="page-module___8aEwW__viewboxTitle">
            Pratinjau
          </p>
          <p className="page-module___8aEwW__viewboxSubtitle">
            Klik tombol untuk melihat
          </p>
          <div className="page-module___8aEwW__phoneFrame">
            <div className="page-module___8aEwW__phoneScreen">
              <iframe src="/onboarding" title="Pratinjau Sa7tein PWA" />
            </div>
          </div>
          <Link className="page-module___8aEwW__btn page-module___8aEwW__btnPrimary" to="/onboarding">
            Buka Pratinjau
          </Link>
        </div>
        <div className="page-module___8aEwW__preview">
          <p className="page-module___8aEwW__previewTitle">
            Mulai Pesan
          </p>
          <p className="page-module___8aEwW__previewText">
            Toko, kurir, dan pelanggan terhubung dalam satu alur.
          </p>
          <Link className="page-module___8aEwW__btn page-module___8aEwW__btnPrimary" to="/onboarding">
            Buka Aplikasi
          </Link>
        </div>
      </div>
    </div>
    </>
  )
}
