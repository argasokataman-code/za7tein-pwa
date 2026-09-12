// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

export default function Language() {
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
                Language
              </h1>
            </header>
            <main className="profile-flow-main">
              <div className="language-section">
                <div className="language-section-label">
                  Suggested
                </div>
                <div className="language-list">
                  <label className="language-option">
                    <span className="language-name">
                      English (US)
                    </span>
                    <input className="language-radio" type="radio" value="en-US" checked name="language" />
                    <span className="language-radio-ui" />
                  </label>
                  <label className="language-option">
                    <span className="language-name">
                      English (UK)
                    </span>
                    <input className="language-radio" type="radio" value="en-GB" name="language" />
                    <span className="language-radio-ui" />
                  </label>
                </div>
              </div>
              <div className="language-section">
                <div className="language-section-label">
                  Others
                </div>
                <div className="language-list">
                  <label className="language-option">
                    <span className="language-name">
                      Hindi
                    </span>
                    <input className="language-radio" type="radio" value="hi" name="language" />
                    <span className="language-radio-ui" />
                  </label>
                  <label className="language-option">
                    <span className="language-name">
                      Spanish
                    </span>
                    <input className="language-radio" type="radio" value="es" name="language" />
                    <span className="language-radio-ui" />
                  </label>
                  <label className="language-option">
                    <span className="language-name">
                      Arabic
                    </span>
                    <input className="language-radio" type="radio" value="ar" name="language" />
                    <span className="language-radio-ui" />
                  </label>
                  <label className="language-option">
                    <span className="language-name">
                      Bengali
                    </span>
                    <input className="language-radio" type="radio" value="bn" name="language" />
                    <span className="language-radio-ui" />
                  </label>
                </div>
              </div>
              <button type="button" className="btn-profile-primary" onClick={() => { toast.success("Language updated!"); navigate('/profile') }}>
                Change
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
