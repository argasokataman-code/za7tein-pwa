import { CheckCircle2, Image, MapPinned } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { AdminBottomNav } from '../components/layout/AdminBottomNav'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { depositStatusLabel, jod, tenantStatusLabel } from '../data/admin'
import { activeZonesLabel } from '../data/merchant'
import { approveDeposit, rejectOnboarding } from '../store/slices/adminSlice'
import type { AdminTenant } from '../types'

export default function AdminOnboarding() {
  const dispatch = useAppDispatch()
  const tenants = useAppSelector((s) => s.admin.tenants)

  const pending = tenants.filter((t) => t.tenantStatus === 'pending')
  const reviewed = tenants.filter((t) => t.tenantStatus !== 'pending')

  return (
    <div className="app-shell">
      <main className="admin-page">
        <AdminPageHeader eyebrow="Antrean tenant" title="Onboarding" />

        <section className="admin-card">
          <p className="admin-card-title">Aturan approve deposit</p>
          <p className="admin-card-sub">
            Verifikasi transfer masuk dulu, baru deposit jadi <strong>held</strong> dan merchant
            aktif. Jangan aktifkan merchant selama deposit masih <strong>unpaid</strong>.
          </p>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Menunggu review {pending.length > 0 ? `(${pending.length})` : ''}</h2>
          {pending.length === 0 ? (
            <p className="admin-empty">Tidak ada tenant menunggu review.</p>
          ) : (
            pending.map((tenant) => (
              <article key={tenant.id} className="admin-card">
                <div className="admin-card-head">
                  <div>
                    <p className="admin-card-title">{tenant.name}</p>
                    <p className="admin-card-sub">
                      {tenant.owner} · {tenant.submittedAt}
                    </p>
                  </div>
                  <span className="admin-badge admin-badge--pending">
                    {tenantStatusLabel[tenant.tenantStatus]}
                  </span>
                </div>

                <ul className="admin-detail-rows">
                  <li>
                    <MapPinned size={16} strokeWidth={1.75} aria-hidden="true" />
                    {tenant.city} · radius {tenant.deliveryConfig.maxKm} km · zona{' '}
                    {activeZonesLabel(tenant.deliveryConfig)}
                  </li>
                  <li>
                    <Image size={16} strokeWidth={1.75} aria-hidden="true" />
                    {tenant.photoCount} foto tempat usaha
                  </li>
                  <li>
                    <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
                    Deposit {jod(tenant.deposit)} · {depositStatusLabel[tenant.depositStatus]}
                  </li>
                </ul>

                {tenant.depositStatus === 'unpaid' ? (
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        dispatch(approveDeposit({ id: tenant.id }))
                        toast.success('Deposit held — merchant diaktifkan')
                      }}
                    >
                      Verifikasi transfer
                    </button>
                    <button
                      type="button"
                      className="admin-btn-ghost"
                      onClick={() => {
                        dispatch(rejectOnboarding({ id: tenant.id }))
                        toast.error('Onboarding ditolak')
                      }}
                    >
                      Tolak onboarding
                    </button>
                  </div>
                ) : (
                  <p className="admin-note">
                    Deposit sudah {depositStatusLabel[tenant.depositStatus]} — merchant aktif.
                  </p>
                )}
              </article>
            ))
          )}
        </section>

        {reviewed.length > 0 ? (
          <section className="admin-section">
            <h2 className="admin-section-title">Sudah diputuskan</h2>
            {reviewed.map((tenant: AdminTenant) => (
              <div key={tenant.id} className="admin-history">
                <div>
                  <p className="admin-card-title">{tenant.name}</p>
                  <p className="admin-card-sub">
                    Deposit {depositStatusLabel[tenant.depositStatus]}
                  </p>
                </div>
                <span className={`admin-badge admin-badge--${tenant.tenantStatus}`}>
                  {tenantStatusLabel[tenant.tenantStatus]}
                </span>
              </div>
            ))}
          </section>
        ) : null}

        <p className="admin-note">
          Queue ini adalah feeder F16 (onboarding merchant). Repo ini front-end saja: approve di
          sini hanya mengubah state tampilan.
        </p>
      </main>
      <AdminBottomNav />
    </div>
  )
}
