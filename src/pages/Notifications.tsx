// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

export default function Notifications() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow">
            <header className="profile-flow-header ">
              <Link className="back-btn-profile" aria-label="Go back" to="/profile">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
              <h1 className="profile-flow-title">
                Notifications
              </h1>
            </header>
            <main className="profile-flow-main">
              <div className="notifications-list">
                <div className="notification-row">
                  <span className="notification-label">
                    Notifications
                  </span>
                  <label className="toggle-wrap" htmlFor="toggle-notifications">
                    <input id="toggle-notifications" className="toggle-input" type="checkbox" checked />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="notification-row">
                  <span className="notification-label">
                    Sound
                  </span>
                  <label className="toggle-wrap" htmlFor="toggle-sound">
                    <input id="toggle-sound" className="toggle-input" type="checkbox" />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="notification-row">
                  <span className="notification-label">
                    Vibrate
                  </span>
                  <label className="toggle-wrap" htmlFor="toggle-vibrate">
                    <input id="toggle-vibrate" className="toggle-input" type="checkbox" />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="notification-row">
                  <span className="notification-label">
                    Special Offers
                  </span>
                  <label className="toggle-wrap" htmlFor="toggle-offers">
                    <input id="toggle-offers" className="toggle-input" type="checkbox" checked />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="notification-row">
                  <span className="notification-label">
                    Payments
                  </span>
                  <label className="toggle-wrap" htmlFor="toggle-payments">
                    <input id="toggle-payments" className="toggle-input" type="checkbox" />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="notification-row">
                  <span className="notification-label">
                    Cashback
                  </span>
                  <label className="toggle-wrap" htmlFor="toggle-cashback">
                    <input id="toggle-cashback" className="toggle-input" type="checkbox" />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="notification-row">
                  <span className="notification-label">
                    App Updates
                  </span>
                  <label className="toggle-wrap" htmlFor="toggle-updates">
                    <input id="toggle-updates" className="toggle-input" type="checkbox" checked />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <button type="button" className="btn-profile-primary" onClick={() => { toast.success("Settings saved!"); navigate('/profile') }}>
                Save
              </button>
            </main>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
