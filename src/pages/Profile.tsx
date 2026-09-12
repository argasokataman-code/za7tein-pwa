// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import { logout } from '../store/slices/authSlice'
import { useAppDispatch } from '../hooks/useAppStore'

import toast from 'react-hot-toast'

export default function Profile() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  return (
    <>
    <div className="app-shell">
      <main style={{ paddingBottom: "80px" }}>
        <div className="my-account">
          <div className="my-account-scroll">
            <div className="main-frame">
              <Link className="profile-header-block profile-header-link" aria-label="Edit profile for Jenny Wilson" to="/personal-data" style={{ textDecoration: "none" }}>
                <img alt="Jenny Wilson" width={64} height={64} className="avatar-image-60" src="/assets/img/profile.png" style={{ color: "transparent" }} />
                <div className="auto-layout-vertical" style={{ flex: "1 1 0%", minWidth: "0px" }}>
                  <div className="jenny-wilson" style={{ color: "rgb(255, 255, 255)", fontWeight: "700", fontSize: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Jenny Wilson
                  </div>
                  <div className="wilson-09-gail-com" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    wilson@09gail.com
                  </div>
                </div>
                <span className="profile-header-chevron">
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FD6931" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <section aria-label="General account settings">
                <h2 className="general">
                  General
                </h2>
                <div className="content">
                  <Link className="item-list" aria-label="Edit Profile" to="/personal-data">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(206, 210, 230)" }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span className="edit-profile">
                        Edit Profile
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-right">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Change Password" to="/change-password">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(206, 210, 230)" }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width={18} height={11} rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <span className="edit-profile">
                        Change Password
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-right">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Notifications" to="/notifications">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(206, 210, 230)" }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                      <span className="edit-profile">
                        Notifications
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="" aria-label="3 unread" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "18px", height: "18px", padding: "0px 4px", borderRadius: "10px", fontSize: "10px", fontWeight: "700", lineHeight: "1", background: "rgb(253, 105, 49)", color: "rgb(255, 255, 255)" }}>
                        3
                      </span>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-right">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Security" to="/security">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(206, 210, 230)" }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <span className="edit-profile">
                        Security
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-right">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Language" to="/language">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(206, 210, 230)" }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <span className="edit-profile">
                        Language
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-right">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Payment Account" to="/payment-account">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(206, 210, 230)" }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width={22} height={16} rx="2" />
                          <path d="M1 10h22" />
                        </svg>
                      </div>
                      <span className="edit-profile">
                        Payment Account
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-right">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </section>
              <section aria-label="Preferences">
                <h2 className="preferencess">
                  Preferences
                </h2>
                <div className="input-fill2">
                  <Link className="item-list" aria-label="Legal and Policies" to="/privacy-policy">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(206, 210, 230)" }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                      </div>
                      <span className="edit-profile">
                        Legal and Policies
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-right">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Help & Support" to="/help-center">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(206, 210, 230)" }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                        </svg>
                      </div>
                      <span className="edit-profile">
                        Help &amp; Support
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-right">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </section>
              <div className="profile-logout-wrap">
                <button type="button" className="btn-logout" onClick={() => { dispatch(logout()); toast.success('Logged out'); navigate('/signin') }}>
                  Log out
                </button>
              </div>
            </div>
          </div>
          <div className="profile-modal-overlay" aria-labelledby="logout-modal-title" style={{ position: "fixed", inset: "0px", zIndex: "9999", display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0, 0, 0, 0)", transition: "background 0.3s" }}>
            <div className="profile-modal profile-modal-exit" style={{ width: "100%", maxWidth: "480px", background: "rgb(26, 26, 26)", borderRadius: "24px 24px 0px 0px", paddingTop: "20px", paddingRight: "24px", paddingBottom: "calc(32px + env(safe-area-inset-bottom))", paddingLeft: "24px" }}>
              <div style={{ width: "40px", height: "4px", background: "rgba(255, 255, 255, 0.2)", borderRadius: "2px", margin: "0px auto 28px" }} />
              <h2 className="profile-modal-title" id="logout-modal-title" style={{ marginBottom: "8px" }}>
                Are you sure you want to logout?
              </h2>
              <p className="profile-modal-text" style={{ marginBottom: "28px" }}>
                You will be returned to the sign‑in screen.
              </p>
              <div className="profile-modal-actions" style={{ display: "flex", gap: "12px" }}>
                <button type="button" className="btn-profile-outline" style={{ flex: "1 1 0%" }} onClick={() => navigate('/add-profile-photo')}>
                  Cancel
                </button>
                <button type="button" className="btn-profile-primary" style={{ flex: "1 1 0%", opacity: "1", cursor: "pointer" }} onClick={() => { dispatch(logout()); toast.success('Logged out'); navigate('/signin') }}>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
        <nav className="bottom-nav">
          <Link className="nav-item " to="/home">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span>
              Home
            </span>
          </Link>
          <Link className="nav-item " to="/checkout">
            <span style={{ position: "relative", display: "inline-flex" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag">
                <path d="M16 10a4 4 0 0 1-8 0" />
                <path d="M3.103 6.034h17.794" />
                <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
              </svg>
            </span>
            <span>
              My Order
            </span>
          </Link>
          <Link className="nav-item " to="/favorites">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart">
              <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            </svg>
            <span>
              Favorites
            </span>
          </Link>
          <Link className="nav-item active" to="/profile">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>
              Profile
            </span>
          </Link>
        </nav>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
