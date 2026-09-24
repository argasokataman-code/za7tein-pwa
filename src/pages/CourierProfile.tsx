import { Bike, Store, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { InstallAppCard } from '../components/ui/InstallAppCard'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockMerchant } from '../data/merchant'
import { courierSelf, isActiveTask } from '../data/courier'
import { toggleOnline } from '../store/slices/courierSlice'
import { logout } from '../store/slices/authSlice'

export default function CourierProfile() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isOnline = useAppSelector((s) => s.courier.isOnline)
  const tasks = useAppSelector((s) => s.courier.tasks)
  const active = tasks.filter(isActiveTask).length
  const [showLogout, setShowLogout] = useState(false)

  // Keluar = keluar dari akun lalu kembali ke layar masuk kurir. Memakai
  // `logout()` dari authSlice, sama seperti Profil customer dan Setelan merchant,
  // bukan state lokal baru.
  const handleLogout = () => {
    dispatch(logout())
    setShowLogout(false)
    navigate('/signin')
  }

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow="Akun" title="Profil" />

        <section className="courier-card courier-identity">
          <span className="courier-avatar" aria-hidden="true">
            <UserRound size={28} strokeWidth={1.75} />
          </span>
          <div>
            <p className="courier-card-title">{courierSelf.name}</p>
            <p className="courier-card-sub">{courierSelf.phone}</p>
          </div>
        </section>

        <section className="courier-card">
          <div className="courier-row">
            <Bike size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">
                {isOnline ? 'Siap menerima tugas' : 'Sedang tidak siap'}
              </p>
              <p className="courier-card-sub">{active} tugas berjalan</p>
            </div>
          </div>
          <button
            type="button"
            className={`courier-toggle ${isOnline ? 'is-on' : ''}`}
            onClick={() => dispatch(toggleOnline())}
          >
            {isOnline ? 'Jeda dulu' : 'Siap sekarang'}
          </button>
        </section>

        <section className="courier-card">
          <div className="courier-row">
            <Store size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">{mockMerchant.name}</p>
              <p className="courier-card-sub">
                Buka {mockMerchant.openTime}–{mockMerchant.closeTime}
              </p>
            </div>
          </div>
          <p className="courier-task-meta">
            Kurir toko ini eksklusif milik satu merchant (PRD bab 04).
          </p>
        </section>

        <InstallAppCard />

        <div className="courier-logout">
          <button type="button" className="btn-logout" onClick={() => setShowLogout(true)}>
            Keluar
          </button>
        </div>

        <p className="courier-note">
          Kurir masuk dengan nomor WA (E.164), dasar flow f21-account-auth + f16: kurir karyawan
          merchant yang direkrut setelah toko aktif (C-06). Sesi masih mock, repo ini front-end
          saja (AGENTS.md §1).
        </p>

        <ConfirmSheet
          open={showLogout}
          title="Keluar dari akun kurir?"
          body="Kamu kembali ke layar masuk. Tugas yang sedang berjalan tetap tersimpan di perangkat."
          confirmLabel="Keluar"
          confirmClass="courier-btn-ghost"
          onConfirm={handleLogout}
          onClose={() => setShowLogout(false)}
        />
      </main>
      <CourierBottomNav />
    </div>
  )
}
