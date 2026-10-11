import { CheckCircle2, MapPinned } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { AdminKpi } from '../components/admin/AdminKpi'
import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { EvidencePhotos } from '../components/admin/EvidencePhotos'
import { AdminShell } from '../components/layout/AdminShell'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'
import { depositStatusLabel, tenantStatusLabel } from '../data/admin'
import { activeZonesLabel } from '../data/merchant'
import { approveDeposit, rejectOnboarding } from '../store/slices/adminSlice'
import type { AdminTenant } from '../types'

export default function AdminOnboarding() {
  const { moneyFromJod } = useMoney()
  const dispatch = useAppDispatch()
  const tenants = useAppSelector((s) => s.admin.tenants)
  // Tolak onboarding membatalkan pengajuan, jadi konfirmasi dulu (audit 017 F-05).
  const [pendingReject, setPendingReject] = useState<string | null>(null)

  const pending = tenants.filter((t) => t.tenantStatus === 'pending')
  const reviewed = tenants.filter((t) => t.tenantStatus !== 'pending')
  const active = tenants.filter((t) => t.tenantStatus === 'approved')
  const inactive = tenants.filter((t) => t.tenantStatus === 'suspended' || t.tenantStatus === 'blacklisted')
  const rejectTenant = pendingReject ? tenants.find((t) => t.id === pendingReject) : undefined

  return (
    <AdminShell>
      <main className="admin-page">
        <AdminPageHeader
          eyebrow="Antrean tenant"
          title="Onboarding"
          subtitle="Persetujuan tenant baru sebelum merchant aktif berjualan."
        />

        <div className="admin-kpi">
          <AdminKpi label="Total tenant" value={tenants.length} sub="Terdaftar" />
          <AdminKpi label="Menunggu review" value={pending.length} sub="Perlu keputusan" />
          <AdminKpi label="Aktif" value={active.length} sub="Deposit held" />
          <AdminKpi
            label="Tidak aktif"
            value={inactive.length}
            sub="Suspend / blacklist"
            tone={inactive.length > 0 ? 'warning' : undefined}
          />
        </div>

        <section className="admin-card admin-card--wide">
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
                    <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
                    Deposit {moneyFromJod(tenant.deposit)} · {depositStatusLabel[tenant.depositStatus]}
                  </li>
                </ul>

                <EvidencePhotos
                  photos={tenant.photos ?? []}
                  emptyLabel="Tanpa foto tempat usaha"
                  label="Foto tempat usaha"
                />

                {tenant.depositStatus === 'unpaid' ? (
                  <div className="admin-actions admin-actions--stack">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        dispatch(approveDeposit({ id: tenant.id }))
                        toast.success('Deposit held, merchant diaktifkan')
                      }}
                    >
                      Verifikasi transfer
                    </button>
                    <button
                      type="button"
                      className="admin-btn-ghost"
                      onClick={() => setPendingReject(tenant.id)}
                    >
                      Tolak onboarding
                    </button>
                  </div>
                ) : (
                  <p className="admin-note">
                    Deposit sudah {depositStatusLabel[tenant.depositStatus]}; merchant aktif.
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

        <div className="admin-footnote">
          <p className="admin-note">
            Antrean ini memberi umpan ke onboarding merchant. Repo ini front-end saja, jadi
            approve di sini hanya mengubah tampilan.
          </p>
        </div>

        {rejectTenant ? (
          <ConfirmSheet
            open
            title="Tolak onboarding?"
            body={`Pengajuan ${rejectTenant.name} ditolak. Deposit tetap unpaid dan merchant tidak diaktifkan.`}
            confirmLabel="Tolak onboarding"
            confirmClass="admin-btn-ghost"
            onConfirm={() => {
              dispatch(rejectOnboarding({ id: rejectTenant.id }))
              setPendingReject(null)
              toast.error('Onboarding ditolak')
            }}
            onClose={() => setPendingReject(null)}
          />
        ) : null}
      </main>
    </AdminShell>
  )
}
