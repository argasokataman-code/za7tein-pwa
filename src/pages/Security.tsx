// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

export default function Security() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header ">
              <Link className="back-btn-profile" aria-label="Go back" to="/profile">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
              <h1 className="profile-flow-title">
                Security
              </h1>
            </header>
            <main className="wallet-main">
              <div className="security-list">
                <div className="security-row">
                  <span className="security-row-label">
                    Remember Password
                  </span>
                  <label className="toggle-wrap">
                    <input className="toggle-input" type="checkbox" checked />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="security-row">
                  <span className="security-row-label">
                    Face ID
                  </span>
                  <label className="toggle-wrap">
                    <input className="toggle-input" type="checkbox" checked />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="security-row">
                  <span className="security-row-label">
                    Biometric ID
                  </span>
                  <label className="toggle-wrap">
                    <input className="toggle-input" type="checkbox" />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <Link className="security-row security-row-link" to="/create-pin">
                  <span className="security-row-label">
                    Google Authentication
                  </span>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <button type="button" className="btn-profile-primary wallet-footer-btn">
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
