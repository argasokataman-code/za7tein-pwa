import { ArrowRight } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'
import { BackButton } from '../components/ui/BackButton'
import { CurrencyToggle } from '../components/ui/CurrencyToggle'

export default function Security() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header ">
              <BackButton className="back-btn-profile" to="/profile" />
              <h1 className="profile-flow-title">
                Security
              </h1>
              <CurrencyToggle />
            </header>
            <main className="wallet-main">
              <div className="security-list">
                <div className="security-row">
                  <span className="security-row-label">
                    Remember Password
                  </span>
                  <label className="toggle-wrap">
                    <input className="toggle-input" type="checkbox" defaultChecked />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="security-row">
                  <span className="security-row-label">
                    Face ID
                  </span>
                  <label className="toggle-wrap">
                    <input className="toggle-input" type="checkbox" defaultChecked />
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
                  <ArrowRight size={20} strokeWidth={1.75} />
                </Link>
              </div>
              <button type="button" className="btn-profile-primary wallet-footer-btn" onClick={() => { toast.success("Settings saved!"); navigate('/profile') }}>
                Save
              </button>
            </main>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
