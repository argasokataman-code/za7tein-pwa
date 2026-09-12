import { ChevronLeft, Mail } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import { useOtpInput } from '../hooks/useOtpInput'

export default function Verification() {
  const otp = useOtpInput(6)
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <div className="auth-page">
        <div className="auth-page">
          <div className="screen active">
            <div className="container h-100">
              <div className="row h-100">
                <div className="col-12 d-flex flex-column justify-content-between">
                  <div className="back-button">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                      <ChevronLeft size={24} strokeWidth={1.75} />
                    </button>
                  </div>
                  <div className="verify-content text-center">
                    <div className="icon-wrapper">
                      <div className="email-icon">
                        <Mail size={60} strokeWidth={1.75} color="var(--on-brand)" />
                      </div>
                    </div>
                    <h1 className="verify-title">
                      Please Verify Your Email
                    </h1>
                    <p className="verify-subtitle">
                      Enter the 6 digit code we sent by email
                    </p>
                    <div className="code-inputs">
                      {otp.values.map((value, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otp.refs.current[i] = el
                          }}
                          inputMode="numeric"
                          maxLength={1}
                          className="code-input"
                          aria-label={`Digit ${i + 1}`}
                          type="text"
                          value={value}
                          onChange={(e) => otp.handleChange(i, e.target.value)}
                          onKeyDown={(e) => otp.handleKeyDown(i, e.key)}
                        />
                      ))}
                    </div>
                    <button className="btn btn-primary btn-verify" onClick={() => otp.isComplete ? (toast.success("Email verified successfully!"), navigate('/signin')) : toast.error('Enter all 6 digits')}>
                      Verify
                    </button>
                    <p className="resend-text">
                      You can resend the code in 
                      <span className="countdown">
                        58
                      </span>
                       seconds
                    </p>
                  </div>
                  <div />
                </div>
              </div>
            </div>
            <div className="home-indicator " />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
