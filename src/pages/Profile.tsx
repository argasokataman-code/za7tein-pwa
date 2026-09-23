import { ArrowRight, Bell, CircleHelp, CreditCard, FileText, Globe, LockKeyhole, MapPin, Shield, UserRound, Wallet } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/layout/BottomNav'
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
              <Link className="profile-header-block profile-header-link" aria-label="Edit profile for Dimas Ardianto" to="/personal-data" style={{ textDecoration: "none" }}>
                <img alt="Dimas Ardianto" width={64} height={64} className="avatar-image-60" src="/assets/img/profile.png" style={{ color: "transparent" }} />
                <div className="auto-layout-vertical" style={{ flex: "1 1 0%", minWidth: "0px" }}>
                  <div className="jenny-wilson" style={{ color: "var(--on-brand)", fontWeight: "700", fontSize: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Dimas Ardianto
                  </div>
                  <div className="wilson-09-gail-com" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    dimas@sa7tein.id
                  </div>
                </div>
                <span className="profile-header-chevron">
                  <ArrowRight size={20} strokeWidth={1.75} />
                </span>
              </Link>
              <section aria-label="General account settings">
                <h2 className="general">
                  General
                </h2>
                <div className="content">
                  <Link className="item-list" aria-label="Edit Profile" to="/personal-data">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <UserRound size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Edit Profile
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Alamat Pengantaran" to="/address-selection">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <MapPin size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Alamat Pengantaran
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Change Password" to="/change-password">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <LockKeyhole size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Change Password
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Notification settings" to="/notification-settings">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <Bell size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Notifications
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="" aria-label="3 unread" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "18px", height: "18px", padding: "0px 4px", borderRadius: "10px", fontSize: "10px", fontWeight: "700", lineHeight: "1", background: "var(--sa7tein-orange)", color: "var(--on-brand)" }}>
                        3
                      </span>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Security" to="/security">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <Shield size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Security
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Language" to="/language">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <Globe size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Language
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Saldo Sa7tein" to="/wallet">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <Wallet size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Saldo Sa7tein
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Payment Account" to="/payment-account">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <CreditCard size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Payment Account
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
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
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <FileText size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Legal and Policies
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Help & Support" to="/help-center">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <CircleHelp size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Help &amp; Support
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
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
          <div className="profile-modal-overlay" aria-labelledby="logout-modal-title" style={{ position: "fixed", inset: "0px", zIndex: "9999", display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(32, 32, 32, 0.45)", transition: "background 0.3s" }}>
            <div className="profile-modal profile-modal-exit" style={{ width: "100%", maxWidth: "480px", background: "var(--surface)", borderRadius: "var(--radius-lg) var(--radius-lg) 0px 0px", paddingTop: "20px", paddingRight: "24px", paddingBottom: "calc(32px + env(safe-area-inset-bottom))", paddingLeft: "24px" }}>
              <div style={{ width: "40px", height: "4px", background: "var(--border-strong)", borderRadius: "2px", margin: "0px auto 28px" }} />
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
        <BottomNav />
      </main>
    </div>
    </>
  )
}
