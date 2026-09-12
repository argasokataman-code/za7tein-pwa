// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

export default function CreatePin() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header ">
              <Link className="back-btn-profile" aria-label="Go back" to="/security">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
              <h1 className="profile-flow-title">
                Create Pin
              </h1>
            </header>
            <main className="wallet-main verify-main">
              <h2 className="verify-heading">
                Please create your 4-digit Pin
              </h2>
              <div className="pin-boxes">
                <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 1" data-i="0" type="text" value="" />
                <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 2" data-i="1" type="text" value="" />
                <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 3" data-i="2" type="text" value="" />
                <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 4" data-i="3" type="text" value="" />
              </div>
              <button type="button" className="btn-profile-primary">
                Verify
              </button>
            </main>
          </div>
          <div className="numpad">
            <button type="button" className="numpad-btn">
              1
            </button>
            <button type="button" className="numpad-btn">
              2
            </button>
            <button type="button" className="numpad-btn">
              3
            </button>
            <button type="button" className="numpad-btn">
              4
            </button>
            <button type="button" className="numpad-btn">
              5
            </button>
            <button type="button" className="numpad-btn">
              6
            </button>
            <button type="button" className="numpad-btn">
              7
            </button>
            <button type="button" className="numpad-btn">
              8
            </button>
            <button type="button" className="numpad-btn">
              9
            </button>
            <button type="button" className="numpad-btn numpad-empty" />
            <button type="button" className="numpad-btn">
              0
            </button>
            <button type="button" className="numpad-btn numpad-back" aria-label="Backspace">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
