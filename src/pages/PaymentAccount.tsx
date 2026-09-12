// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

import toast from 'react-hot-toast'

export default function PaymentAccount() {
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
                Payment Account
              </h1>
            </header>
            <main className="wallet-main">
              <Link className="wallet-item wallet-item-link" to="/your-card">
                <div className="wallet-item-icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width={22} height={16} rx="2" />
                    <path d="M1 10h22" />
                  </svg>
                </div>
                <div className="wallet-item-left">
                  <span className="wallet-item-title">
                    Your Card
                  </span>
                  <span className="wallet-item-sub">
                    View and manage your cards
                  </span>
                </div>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <div className="wallet-item">
                <div className="wallet-item-icon">
                  <img alt="Apple Pay" width={24} height={24} src="/assets/img/icon/icon1.png" style={{ color: "transparent" }} />
                </div>
                <div className="wallet-item-left">
                  <span className="wallet-item-title">
                    Apple Pay
                  </span>
                  <span className="wallet-item-sub">
                    Connected
                  </span>
                </div>
                <button type="button" className="wallet-badge remove" onClick={() => { toast.success("Default payment method") }}>
                  Remove
                </button>
              </div>
              <div className="wallet-item">
                <div className="wallet-item-icon">
                  <img alt="Google Pay" width={24} height={24} src="/assets/img/icon/icon2.png" style={{ color: "transparent" }} />
                </div>
                <div className="wallet-item-left">
                  <span className="wallet-item-title">
                    Google Pay
                  </span>
                  <span className="wallet-item-sub">
                    Connected
                  </span>
                </div>
                <button type="button" className="wallet-badge remove" onClick={() => { toast.success("Default payment method") }}>
                  Remove
                </button>
              </div>
              <div className="wallet-item">
                <div className="wallet-item-icon">
                  <img alt="PayPal" width={24} height={24} src="/assets/img/icon/icon3.png" style={{ color: "transparent" }} />
                </div>
                <div className="wallet-item-left">
                  <span className="wallet-item-title">
                    PayPal
                  </span>
                  <span className="wallet-item-sub">
                    Unconnected
                  </span>
                </div>
                <button type="button" className="wallet-badge connect" onClick={() => { toast.success("Default payment method") }}>
                  Connect
                </button>
              </div>
              <Link className="btn-profile-primary wallet-footer-btn" to="/profile/add-new-card" style={{ marginTop: "24px" }}>
                Add New Card
              </Link>
            </main>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
