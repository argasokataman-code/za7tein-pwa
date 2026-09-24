import { ArrowRight, Bell, CircleHelp, CreditCard, FileText, Globe, LockKeyhole, MapPin, Shield, UserRound, Wallet } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/layout/BottomNav'
import { InstallAppCard } from '../components/ui/InstallAppCard'
import { money } from '../data/currency'
import { logout } from '../store/slices/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'

import toast from 'react-hot-toast'

export default function Profile() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const walletAvailable = useAppSelector((s) => s.wallet.balance.available)
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Berhasil keluar')
    navigate('/signin')
  }
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
                  <div className="jenny-wilson" style={{ fontWeight: "700", fontSize: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
              <section className="wallet-balance-card wallet-balance-card--compact" aria-label="Saldo Sa7tein">
                <Link className="wallet-balance-compact-text" to="/wallet" style={{ textDecoration: "none" }}>
                  <span className="wallet-balance-label">Saldo tersedia</span>
                  <span className="wallet-balance-value">{money(walletAvailable)}</span>
                </Link>
                <Link className="wallet-balance-cta" to="/wallet/top-up">
                  <Wallet size={18} strokeWidth={1.75} />
                  Top-up
                </Link>
              </section>
              <section aria-label="Setelan akun umum">
                <h2 className="general">
                  Umum
                </h2>
                <div className="content">
                  <Link className="item-list" aria-label="Edit Profil" to="/personal-data">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <UserRound size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Edit Profil
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
                  <Link className="item-list" aria-label="Ganti Kata Sandi" to="/change-password">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <LockKeyhole size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Ganti Kata Sandi
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Notifikasi" to="/notification-settings">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <Bell size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Notifikasi
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="" aria-label="3 unread" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "18px", height: "18px", padding: "0px 4px", borderRadius: "10px", fontSize: "10px", fontWeight: "700", lineHeight: "1", background: "var(--sa7tein-orange)", color: "var(--on-brand)" }}>
                        3
                      </span>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Keamanan" to="/security">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <Shield size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Keamanan
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Bahasa" to="/language">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <Globe size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Bahasa
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Metode Pembayaran" to="/payment-account">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <CreditCard size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Metode Pembayaran
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                </div>
              </section>
              <section aria-label="Preferensi">
                <h2 className="preferencess">
                  Preferensi
                </h2>
                <div className="input-fill2">
                  <Link className="item-list" aria-label="Ketentuan dan Kebijakan" to="/privacy-policy">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <FileText size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Ketentuan &amp; Kebijakan
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                  <Link className="item-list" aria-label="Bantuan &amp; Dukungan" to="/help-center">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <CircleHelp size={20} strokeWidth={1.75} />
                      </div>
                      <span className="edit-profile">
                        Bantuan &amp; Dukungan
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowRight size={20} strokeWidth={1.75} className="arrow-right" />
                    </div>
                  </Link>
                </div>
              </section>
              <InstallAppCard />

              <div className="profile-logout-wrap">
                <button type="button" className="btn-logout" onClick={() => setShowLogout(true)}>
                  Keluar
                </button>
              </div>
            </div>
          </div>
          <div className={`profile-modal-overlay${showLogout ? ' is-open' : ''}`} aria-labelledby="logout-modal-title" aria-hidden={!showLogout}>
            <div className="profile-modal">
              <div className="sheet-handle" />
              <h2 className="profile-modal-title" id="logout-modal-title">
                Yakin mau keluar?
              </h2>
              <p className="profile-modal-text">
                Kamu akan kembali ke layar masuk.
              </p>
              <div className="profile-modal-actions">
                <button type="button" className="btn-profile-outline" onClick={() => setShowLogout(false)}>
                  Batal
                </button>
                <button type="button" className="btn-profile-primary" onClick={handleLogout}>
                  Keluar
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
