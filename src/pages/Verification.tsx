// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
export default function Verification() {
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
                    <button className="btn-back">
                      <svg width={24} height={24} viewBox="0 0 24 24">
                        <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="verify-content text-center">
                    <div className="icon-wrapper">
                      <div className="email-icon">
                        <svg width={60} height={60} viewBox="0 0 60 60">
                          <path d="M10 15L30 30L50 15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="7" y="12" width={46} height={36} rx="4" stroke="white" strokeWidth="3" fill="none" />
                        </svg>
                      </div>
                    </div>
                    <h1 className="verify-title">
                      Please Verify Your Email
                    </h1>
                    <p className="verify-subtitle">
                      Enter the 6 digit code we sent by email
                    </p>
                    <div className="code-inputs">
                      <input inputMode="numeric" maxLength={1} className="code-input" type="text" value="" />
                      <input inputMode="numeric" maxLength={1} className="code-input" type="text" value="" />
                      <input inputMode="numeric" maxLength={1} className="code-input" type="text" value="" />
                      <input inputMode="numeric" maxLength={1} className="code-input" type="text" value="" />
                      <input inputMode="numeric" maxLength={1} className="code-input" type="text" value="" />
                      <input inputMode="numeric" maxLength={1} className="code-input" type="text" value="" />
                    </div>
                    <button className="btn btn-primary btn-verify">
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
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
