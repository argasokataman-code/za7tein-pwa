// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

export default function YourCard() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header ">
              <Link className="back-btn-profile" aria-label="Go back" to="/payment-account">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
              <h1 className="profile-flow-title">
                Your Card
              </h1>
            </header>
            <main className="wallet-main your-card-main">
              <div className="your-card-list">
                <div className="card-option-row">
                  <div className="card-visual card-visual-dark">
                    <div className="card-visual-top">
                      <div className="card-balance-info">
                        <span className="card-visual-label">
                          Current Balance
                        </span>
                        <div className="card-visual-amount">
                          Rp4.570.800
                        </div>
                      </div>
                      <img alt="Mastercard" width={47} height={37} className="card-logo" src="/assets/img/card/mastercard.png" style={{ color: "transparent" }} />
                    </div>
                    <div className="card-visual-bottom">
                      <span className="card-number">
                        5294 2436 4780 9568
                      </span>
                      <span className="card-expiry">
                        12/24
                      </span>
                    </div>
                  </div>
                  <div className="card-option-meta">
                    <label className="card-checkbox-label">
                      <input className="card-radio" type="radio" value="1" checked name="defaultCard" />
                      <span className="card-checkbox-custom" />
                      <span className="use-default-text">
                        Use as default payment method
                      </span>
                    </label>
                  </div>
                </div>
                <div className="card-option-row">
                  <div className="card-visual card-visual-purple">
                    <div className="card-visual-top">
                      <div className="card-balance-info">
                        <span className="card-visual-label">
                          Current Balance
                        </span>
                        <div className="card-visual-amount">
                          Rp3.242.230
                        </div>
                      </div>
                      <img alt="Visa" width={47} height={37} className="card-logo" src="/assets/img/card/visa.png" style={{ color: "transparent" }} />
                    </div>
                    <div className="card-visual-bottom">
                      <span className="card-number">
                        9865 3567 4563 4235
                      </span>
                      <span className="card-expiry">
                        12/24
                      </span>
                    </div>
                  </div>
                  <div className="card-option-meta">
                    <label className="card-checkbox-label">
                      <input className="card-radio" type="radio" value="2" name="defaultCard" />
                      <span className="card-checkbox-custom" />
                      <span className="use-default-text">
                        Use as default payment method
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <Link className="btn-profile-primary wallet-footer-btn" to="/add-new-card">
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
