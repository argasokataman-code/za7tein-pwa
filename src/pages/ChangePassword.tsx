// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
export default function ChangePassword() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow-page-scroll">
            <div className="profile-flow">
              <header className="profile-flow-header">
                <button type="button" className="btn-back" aria-label="Go back">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <h1 className="profile-flow-title">
                  Change Password
                </h1>
              </header>
              <main className="profile-flow-main">
                <p className="text-muted-profile">
                  Create a new password to secure your account.
                </p>
                <form className="auth-form">
                  <div className="form-group-profile mb-4">
                    <label className="form-label-profile">
                      Current Password
                    </label>
                    <div className="password-wrapper" style={{ position: "relative" }}>
                      <input className="form-input-profile pe-5" placeholder="Enter current password" type="password" name="currentPassword" />
                      <span className="password-toggle" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgb(105, 117, 134)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="form-group-profile mb-4">
                    <label className="form-label-profile">
                      New Password
                    </label>
                    <div className="password-wrapper" style={{ position: "relative" }}>
                      <input className="form-input-profile pe-5" placeholder="Enter new password" type="password" name="newPassword" />
                      <span className="password-toggle" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgb(105, 117, 134)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="form-group-profile mb-4">
                    <label className="form-label-profile">
                      Confirm New Password
                    </label>
                    <div className="password-wrapper" style={{ position: "relative" }}>
                      <input className="form-input-profile pe-5" placeholder="Confirm new password" type="password" name="confirmPassword" />
                      <span className="password-toggle" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgb(105, 117, 134)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <button type="submit" className="btn-profile-primary mt-4">
                    Save Password
                  </button>
                </form>
              </main>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
