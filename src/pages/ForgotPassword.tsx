// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
export default function ForgotPassword() {
  return (
    <>
    <div className="app-shell">
      <div className="auth-page">
        <div className="screen active">
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-12 d-flex flex-column justify-content-center">
                <div className="back-button">
                  <button type="button" className="btn-back" aria-label="Back">
                    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                      <path d="M16.875 10H3.125" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8.75 4.375L3.125 10L8.75 15.625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className="auth-content">
                  <h1 className="auth-title">
                    Forgot Password
                  </h1>
                  <p className="auth-subtitle">
                    Enter your email address and we will help you restore your account.
                  </p>
                  <form className="auth-form" noValidate>
                    <div className="form-group">
                      <label className="form-label">
                        Email
                      </label>
                      <input className="form-control" placeholder="wilson@09gail.com" type="email" name="email" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-auth">
                      Send OTP
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="home-indicator " />
        </div>
      </div>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
