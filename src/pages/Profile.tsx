import {
  Bell,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  Globe,
  History,
  LockKeyhole,
  MapPin,
  Pencil,
  RefreshCw,
  Shield,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useState, type ComponentType, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/layout/BottomNav'
import { InstallAppCard } from '../components/ui/InstallAppCard'
import { APP_VERSION } from '../data/appInfo'
import { logout } from '../store/slices/authSlice'
import { selectUnreadCount } from '../store/slices/notificationsSlice'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useAppUpdate } from '../hooks/useAppUpdate'
import { useMoney } from '../hooks/useMoney'

import toast from 'react-hot-toast'

/**
 * Baris setelan — satu bentuk untuk semua tautan dan tombol di halaman ini.
 * Ikon duduk di kotak aksen, label + subjudul di tengah, chevron di kanan.
 *
 * Dulu tiap baris adalah salinan markup yang sama dengan `style` inline
 * (sebelas kali), dan tiap perubahan harus diulang sebelas kali. Sekarang satu
 * komponen; `to` → tautan, tanpa `to` → tombol.
 */
interface ProfileRowProps {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  label: string
  sub: string
  to?: string
  onClick?: () => void
  disabled?: boolean
  trailing?: ReactNode
}

function ProfileRow({ icon: Icon, label, sub, to, onClick, disabled, trailing }: ProfileRowProps) {
  const body = (
    <>
      <span className="pf-row__icon" aria-hidden="true">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <span className="pf-row__text">
        <span className="pf-row__label">{label}</span>
        <span className="pf-row__sub">{sub}</span>
      </span>
      <span className="pf-row__trail">
        {trailing}
        <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
      </span>
    </>
  )

  if (to) {
    return (
      <Link className="pf-row" to={to} aria-label={label}>
        {body}
      </Link>
    )
  }

  return (
    <button type="button" className="pf-row" aria-label={label} onClick={onClick} disabled={disabled}>
      {body}
    </button>
  )
}

export default function Profile() {
  const { money } = useMoney()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const walletAvailable = useAppSelector((s) => s.wallet.balance.available)
  const user = useAppSelector((s) => s.auth.user)
  const unread = useAppSelector((s) => selectUnreadCount(s.notifications.items))
  const [showLogout, setShowLogout] = useState(false)
  const { checking: checkingUpdate, checkForUpdate } = useAppUpdate()

  // Identitas live dari sesi (`auth.user`, diisi dari tabel `users`). Nama
  // kosong (BE belum punya kolomnya) → tampilkan email sebagai identitas.
  const displayName = user?.name?.trim() || user?.email || 'Akun'
  const displaySub = user?.name?.trim() ? user.email : user?.phone ?? ''

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Berhasil keluar')
    navigate('/signin')
  }

  return (
    <div className="app-shell">
      <main className="pf">
        <div className="my-account">
          <div className="my-account-scroll">
            <div className="main-frame">
              <Link className="pf-header s7-parallax--card" aria-label={`Edit profil ${displayName}`} to="/personal-data">
                <img
                  alt={user?.name || 'Foto profil'}
                  className="pf-header__avatar"
                  src={user?.avatar || '/assets/img/profile.png'}
                />
                <span className="pf-header__text">
                  <span className="pf-header__name">{displayName}</span>
                  {displaySub ? <span className="pf-header__sub">{displaySub}</span> : null}
                </span>
                <span className="pf-header__edit" aria-hidden="true">
                  <Pencil size={18} strokeWidth={1.75} />
                </span>
              </Link>

              <section className="wallet-balance-card wallet-balance-card--compact s7-parallax--card" aria-label="Saldo Sa7tein">
                <Link className="wallet-balance-compact-text" to="/wallet">
                  <span className="wallet-balance-label">Saldo tersedia</span>
                  <span className="wallet-balance-value">{money(walletAvailable)}</span>
                </Link>
                <Link className="wallet-balance-cta" to="/wallet/top-up">
                  <Wallet size={18} strokeWidth={1.75} />
                  Top-up
                </Link>
              </section>

              <section aria-label="Setelan akun umum">
                <h2 className="pf-section-title s7-parallax--title">Umum</h2>
                <div className="pf-card">
                  <ProfileRow icon={UserRound} label="Edit Profil" sub="Nama & nomor WhatsApp" to="/personal-data" />
                  <ProfileRow icon={MapPin} label="Alamat Pengantaran" sub="Kelola lokasi antar dan titik peta" to="/address-selection" />
                  <ProfileRow icon={History} label="Riwayat Pesanan" sub="Pesanan selesai & penilaian toko" to="/orders?tab=history" />
                  <ProfileRow icon={LockKeyhole} label="Ganti Kata Sandi" sub="Perbarui kata sandi akun" to="/change-password" />
                  <ProfileRow
                    icon={Bell}
                    label="Notifikasi"
                    sub="Atur pemberitahuan pesanan"
                    to="/notification-settings"
                    trailing={
                      unread > 0 ? (
                        <span className="pf-row__badge" aria-label={`${unread} belum dibaca`}>
                          {unread}
                        </span>
                      ) : null
                    }
                  />
                  <ProfileRow icon={Shield} label="Keamanan" sub="Kunci & verifikasi akun" to="/security" />
                  <ProfileRow icon={Globe} label="Bahasa" sub="Bahasa tampilan aplikasi" to="/language" />
                  <ProfileRow icon={CreditCard} label="Metode Pembayaran" sub="COD & transfer manual" to="/payment-account" />
                </div>
              </section>

              <section aria-label="Preferensi">
                <h2 className="pf-section-title s7-parallax--title">Preferensi</h2>
                <div className="pf-card">
                  <ProfileRow icon={FileText} label="Ketentuan & Kebijakan" sub="Syarat & privasi pengguna" to="/privacy-policy" />
                  <ProfileRow icon={CircleHelp} label="Bantuan & Dukungan" sub="Hubungi admin sa7tein" to="/help-center" />
                  <ProfileRow
                    icon={RefreshCw}
                    label={checkingUpdate ? 'Memeriksa…' : 'Cek pembaruan'}
                    sub="Cari versi terbaru aplikasi"
                    onClick={checkForUpdate}
                    disabled={checkingUpdate}
                    trailing={<span className="pf-row__ver">v{APP_VERSION}</span>}
                  />
                </div>
              </section>

              <InstallAppCard />

              <div className="pf-logout-wrap">
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
              <p className="profile-modal-text">Kamu akan kembali ke layar masuk.</p>
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
  )
}
