// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useState } from 'react'

import toast from 'react-hot-toast'

import { useNavigate } from 'react-router-dom'

export default function Onboarding() {
  const navigate = useNavigate()
  const [showBanner, setShowBanner] = useState(true)
  return (
    <>
    <div className="app-shell">
      {showBanner && (
        <div className="PwaPasangBanner-module-scss-module__ziTC8q__wrapper PwaPasangBanner-module-scss-module__ziTC8q__show">
        <p className="PwaPasangBanner-module-scss-module__ziTC8q__text">
          <strong>
            Pasang aplikasi
          </strong>
           — Pasang Sa7tein PWA untuk pengalaman lebih cepat.
        </p>
        <div className="PwaPasangBanner-module-scss-module__ziTC8q__actions">
          <button className="PwaPasangBanner-module-scss-module__ziTC8q__installBtn" onClick={() => toast.success("Use your browser menu to install Sa7tein")}>
            Pasang
          </button>
          <button className="PwaPasangBanner-module-scss-module__ziTC8q__dismissBtn" aria-label="Dismiss" onClick={() => setShowBanner(false)}>
            ×
          </button>
        </div>
      </div>
      )}
      <div className="screen active">
        <div className="onboarding-image onboarding-image-1" />
        <div className="onboarding-overlay" />
        <div className="container h-100">
          <div className="row h-100">
            <div className="col-12 d-flex flex-column justify-content-end">
              <div className="onboarding-content">
                <h2 className="onboarding-title" style={{ whiteSpace: "pre-line" }}>
                  Makan enak, kapan saja, di mana saja
                </h2>
                <p className="onboarding-description">
                  Jelajahi pilihan makanan, pesan dalam hitungan detik, dan nikmati antar cepat sampai ke pintu kamu.
                </p>
                <div className="pagination-dots">
                  <span className="dot active" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <button className="btn btn-primary btn-continue" onClick={() => { navigate('/signin') }}>
                  Lanjut
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="home-indicator " />
      </div>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
