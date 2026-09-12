import { ChevronLeft } from 'lucide-react'
// Preferensi notifikasi. Dipindah dari /notifications, karena rute itu
// seharusnya berarti kotak masuk — itulah yang dijanjikan tombol lonceng
// berbadge. Halaman ini yang ditautkan dari menu Profil.
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

const TOGGLES = [
  { id: 'notifications', label: 'Notifikasi', on: true },
  { id: 'sound', label: 'Suara', on: false },
  { id: 'vibrate', label: 'Getar', on: false },
  { id: 'offers', label: 'Promo & Penawaran', on: true },
  { id: 'payments', label: 'Pembayaran', on: false },
  { id: 'cashback', label: 'Cashback', on: false },
  { id: 'updates', label: 'Pembaruan Aplikasi', on: true },
] as const

export default function NotificationSettings() {
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow">
            <header className="profile-flow-header">
              <button
                type="button"
                className="back-btn-profile"
                aria-label="Kembali"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft size={24} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <h1 className="profile-flow-title">Pengaturan Notifikasi</h1>
            </header>

            <main className="profile-flow-main">
              <div className="notifications-list">
                {TOGGLES.map((t) => (
                  <div className="notification-row" key={t.id}>
                    <span className="notification-label">{t.label}</span>
                    <label className="toggle-wrap" htmlFor={`toggle-${t.id}`}>
                      <input
                        id={`toggle-${t.id}`}
                        className="toggle-input"
                        type="checkbox"
                        defaultChecked={t.on}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-profile-primary"
                onClick={() => {
                  toast.success('Pengaturan disimpan')
                  navigate('/profile')
                }}
              >
                Simpan
              </button>
            </main>
          </div>
        </div>
      </main>
    </div>
  )
}
