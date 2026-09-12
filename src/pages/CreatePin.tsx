// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { useOtpInput } from '../hooks/useOtpInput'

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

export default function CreatePin() {
  const navigate = useNavigate()
  const pin = useOtpInput(4)

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="wallet-page">
            <div className="wallet-flow">
              <header className="profile-flow-header ">
                <Link className="back-btn-profile" aria-label="Go back" to="/security">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </Link>
                <h1 className="profile-flow-title">Create Pin</h1>
              </header>
              <main className="wallet-main verify-main">
                <h2 className="verify-heading">Please create your 4-digit Pin</h2>
                <div className="pin-boxes">
                  {pin.values.map((value, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        pin.refs.current[i] = el
                      }}
                      className="otp-box"
                      maxLength={1}
                      inputMode="numeric"
                      aria-label={`Digit ${i + 1}`}
                      type="text"
                      value={value}
                      onChange={(e) => pin.handleChange(i, e.target.value)}
                      onKeyDown={(e) => pin.handleKeyDown(i, e.key)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-profile-primary"
                  onClick={() =>
                    pin.isComplete
                      ? navigate('/pin-success')
                      : toast.error('Enter all 4 digits')
                  }
                >
                  Verify
                </button>
              </main>
            </div>
            <div className="numpad">
              {DIGITS.map((d, i) =>
                d === '' ? (
                  <button key={`empty-${i}`} type="button" className="numpad-btn numpad-empty" />
                ) : d === 'back' ? (
                  <button
                    key="back"
                    type="button"
                    className="numpad-btn numpad-back"
                    aria-label="Backspace"
                    onClick={pin.handleNumpadBackspace}
                  >
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                      <line x1={18} y1={9} x2={12} y2={15} />
                      <line x1={12} y1={9} x2={18} y2={15} />
                    </svg>
                  </button>
                ) : (
                  <button
                    key={d}
                    type="button"
                    className="numpad-btn"
                    onClick={() => pin.handleNumpadInput(d)}
                  >
                    {d}
                  </button>
                ),
              )}
            </div>
          </div>
        </main>
      </div>
      <div
        data-rht-toaster=""
        style={{ position: 'fixed', zIndex: 9999, inset: 16, pointerEvents: 'none' }}
      />
    </>
  )
}
