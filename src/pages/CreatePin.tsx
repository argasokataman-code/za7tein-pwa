import { ChevronLeft, Delete } from 'lucide-react'
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
                  <ChevronLeft size={24} strokeWidth={1.75} />
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
                  // Spacer grid, bukan kontrol. Dulu elemen ini <button>, jadi
                  // bisa difokus keyboard padahal tidak melakukan apa pun.
                  <span key={`empty-${i}`} className="numpad-btn numpad-empty" aria-hidden="true" />
                ) : d === 'back' ? (
                  <button
                    key="back"
                    type="button"
                    className="numpad-btn numpad-back"
                    aria-label="Backspace"
                    onClick={pin.handleNumpadBackspace}
                  >
                    <Delete size={22} strokeWidth={1.75} />
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
    </>
  )
}
