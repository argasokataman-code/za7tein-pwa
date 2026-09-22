import { Bike, Store, UserRound } from 'lucide-react'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockMerchant } from '../data/merchant'
import { courierSelf, isActiveTask } from '../data/courier'
import { toggleOnline } from '../store/slices/courierSlice'

export default function CourierProfile() {
  const dispatch = useAppDispatch()
  const isOnline = useAppSelector((s) => s.courier.isOnline)
  const tasks = useAppSelector((s) => s.courier.tasks)
  const active = tasks.filter(isActiveTask).length

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

        <p className="courier-note">
          Login kurir belum ada di PRD aktif (UNRESOLVED-by-absence) — kurir dikelola merchant
          sebagai karyawan (C-06), jadi tab ini menampilkan identitas dan status saja.
        </p>
      </main>
      <CourierBottomNav />
    </div>
  )
}
