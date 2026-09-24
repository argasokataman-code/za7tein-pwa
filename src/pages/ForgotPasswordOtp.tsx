import { ChevronLeft, Delete, Mail } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useOtpInput } from '../hooks/useOtpInput'
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','back']

export default function ForgotPasswordOtp() {
  const otp = useOtpInput(6)
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <div className="auth-page">
        <div className="screen active">
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-12 d-flex flex-column">
                <div className="back-button">
                  <button type="button" className="btn-back" aria-label="Back" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="verify-content-compact text-center">
                  <div className="icon-wrapper" style={{ marginBottom: "16px" }}>
                    <div className="email-icon" style={{ width: "80px", height: "80px", background: "rgba(241,90,55, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0px auto" }}>
                      <Mail size={40} strokeWidth={1.75} color="var(--orange-ink)" />
                    </div>
                  </div>
                  <h1 className="verify-title-small">
                    Please Enter OTP
                  </h1>
                  <p className="verify-subtitle-small">
                    Enter the 6 digit code we sent by email
                  </p>
                  <div className="code-inputs-compact">
                  {otp.values.map((value, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otp.refs.current[i] = el
                      }}
                      className="otp-box"
                      maxLength={1}
                      inputMode="numeric"
                      aria-label={`Digit ${i + 1}`}
                      type="text"
                      value={value}
                      onChange={(e) => otp.handleChange(i, e.target.value)}
                      onKeyDown={(e) => otp.handleKeyDown(i, e.key)}
                    />
                  ))}
                  </div>
                  <button className="btn btn-primary btn-verify-small" onClick={() => otp.isComplete ? (toast.success("OTP verified!"), navigate('/create-password')) : toast.error('Enter all 6 digits')}>
                    Verify
                  </button>
                  <p className="resend-text-small" style={{ marginTop: "16px", color: "rgb(156, 163, 175)", fontSize: "13px" }}>
                    Didn't receive the code? 
                    <button type="button" onClick={() => toast.success("Code resent!")} style={{ background: "none", borderWidth: "medium", borderStyle: "none", borderColor: "currentcolor", borderImage: "none", color: "#F15A37", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="numpad">
            {DIGITS.map((d, i) =>
              d === '' ? (
                // Spacer grid, bukan kontrol. Dulu elemen ini <button>, jadi
                // bisa difokus keyboard padahal tidak melakukan apa pun.
                  <span key={`empty-${i}`} className="numpad-btn numpad-empty" aria-hidden="true" />
              ) : d === 'back' ? (
                <button key="back" type="button" className="numpad-btn numpad-back" aria-label="Backspace" onClick={otp.handleNumpadBackspace}>
                  <Delete size={22} strokeWidth={1.75} />
                </button>
              ) : (
                <button key={d} type="button" className="numpad-btn" onClick={() => otp.handleNumpadInput(d)}>
                  {d}
                </button>
              ),
            )}
          </div>
          <div className="home-indicator " />
        </div>
      </div>
    </div>
    </>
  )
}
