// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

export default function ForgotPasswordOtp() {
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
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className="verify-content-compact text-center">
                  <div className="icon-wrapper" style={{ marginBottom: "16px" }}>
                    <div className="email-icon" style={{ width: "80px", height: "80px", background: "rgba(253, 105, 49, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0px auto" }}>
                      <svg width={40} height={40} viewBox="0 0 60 60" fill="none">
                        <path d="M10 15L30 30L50 15" stroke="#fd6931" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="7" y="12" width={46} height={36} rx="4" stroke="#fd6931" strokeWidth="3" fill="none" />
                      </svg>
                    </div>
                  </div>
                  <h1 className="verify-title-small">
                    Please Enter OTP
                  </h1>
                  <p className="verify-subtitle-small">
                    Enter the 6 digit code we sent by email
                  </p>
                  <div className="code-inputs-compact">
                    <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 1" data-i="0" type="text" value="" />
                    <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 2" data-i="1" type="text" value="" />
                    <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 3" data-i="2" type="text" value="" />
                    <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 4" data-i="3" type="text" value="" />
                    <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 5" data-i="4" type="text" value="" />
                    <input className="otp-box" maxLength={1} inputMode="numeric" aria-label="Digit 6" data-i="5" type="text" value="" />
                  </div>
                  <button className="btn btn-primary btn-verify-small" onClick={() => { toast.success("OTP verified!"); navigate('/create-password') }}>
                    Verify
                  </button>
                  <p className="resend-text-small" style={{ marginTop: "16px", color: "rgb(156, 163, 175)", fontSize: "13px" }}>
                    Didn't receive the code? 
                    <button type="button" style={{ background: "none", borderWidth: "medium", borderStyle: "none", borderColor: "currentcolor", borderImage: "none", color: "rgb(253, 105, 49)", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            </div>
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
          <div className="home-indicator " />
        </div>
      </div>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
