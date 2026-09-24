import { AlertTriangle, ListChecks, Scale, ShieldCheck, Signal, Store } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { AdminBottomNav } from '../components/layout/AdminBottomNav'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { aggregateLiability, liabilityGap, moneyFromJod, money, openDisputeCount, pendingTenantCount, totalLiability } from '../data/admin'
import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { clearEscalation } from '../store/slices/adminSlice'
import type { AdminEscalation } from '../types'

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const storedLiability = useAppSelector((s) => s.admin.liability)
  const walletIdr = useAppSelector((s) => s.wallet.balance.balance)
  const escalations = useAppSelector((s) => s.admin.escalations)
  const tenants = useAppSelector((s) => s.admin.tenants)
  const disputes = useAppSelector((s) => s.admin.disputes)
  // Batal order menulis refund ke ledger, jadi konfirmasi dulu (audit 006 #4).
  const [cancelTarget, setCancelTarget] = useState<AdminEscalation | null>(null)

  // Agregat ikut wallet demo yang hidup, bukan angka statis (M9/M11).
  const liability = aggregateLiability(storedLiability, walletIdr)
  const total = totalLiability(liability)
  const gap = liabilityGap(liability)
  const underFunded = gap < 0

  return (
    <div className="app-shell">
      <main className="admin-page">
        <AdminPageHeader eyebrow="Panel admin · CS" title="Ringkasan" />

        {/* Kartu surface, bukan oranye penuh: lihat catatan di _admin.scss
            (audit 006 #1). Note dan kurs sengaja di luar kartu. */}
        <section className="admin-card">
          <p className="admin-card-sub">Kewajiban platform</p>
          <p className="admin-liability-total">{moneyFromJod(total)}</p>
          <p className="admin-card-sub">
            Saldo wallet yang belum di-payout: customer + merchant + tips kurir.
          </p>

          <ul className="admin-liability-rows">
            <li>
              <span>Wallet customer</span>
              <span>{moneyFromJod(liability.customerWallets)}</span>
            </li>
            <li>
              <span>Wallet merchant</span>
              <span>{moneyFromJod(liability.merchantWallets)}</span>
            </li>
            <li>
              <span>Tips kurir</span>
              <span>{moneyFromJod(liability.courierTips)}</span>
            </li>
            <li>
              <span>Saldo Xendit (mock)</span>
              <span>{moneyFromJod(liability.xenditBalance)}</span>
            </li>
          </ul>

          <p className={`admin-flag ${underFunded ? 'is-warning' : 'is-ok'}`}>
            {underFunded ? <AlertTriangle size={16} strokeWidth={1.75} aria-hidden="true" /> : <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />}
            {underFunded
              ? `Saldo Xendit kurang ${moneyFromJod(Math.abs(gap))} dari total liability.`
              : `Saldo Xendit cukup (sisa ${moneyFromJod(gap)}).`}
          </p>
        </section>

        <p className="admin-note">
          Gaji kurir tidak masuk hitungan ini: kurir digaji merchant, yang lewat platform hanya
          tips (C-06). Porsi wallet customer diselaraskan dengan wallet demo yang sedang aktif
          ({money(walletIdr)}), jadi top-up, hold, dan settlement ikut menggeser angka di
          atas.
        </p>
        <ExchangeRateNote />

        <section className="admin-stats">
          <Link className="admin-stat" to="/onboarding">
            <ListChecks size={20} strokeWidth={1.75} aria-hidden="true" />
            <span className="admin-stat-value">{pendingTenantCount(tenants)}</span>
            <span className="admin-stat-label">Tenant menunggu review</span>
          </Link>
          <Link className="admin-stat" to="/disputes">
            <Scale size={20} strokeWidth={1.75} aria-hidden="true" />
            <span className="admin-stat-value">{openDisputeCount(disputes)}</span>
            <span className="admin-stat-label">Sengketa terbuka</span>
          </Link>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Alert SLA masuk</h2>
          {escalations.length === 0 ? (
            <p className="admin-empty">Tidak ada alert. Semua order dalam SLA.</p>
          ) : (
            escalations.map((alert) => (
              <article key={alert.id} className="admin-card admin-alert">
                <div className="admin-row">
                  <Signal size={20} strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <p className="admin-card-title">
                      {alert.orderCode} · lewat {alert.minutesLate} menit
                    </p>
                    <p className="admin-card-sub">{alert.merchant}</p>
                  </div>
                </div>
                <p className="admin-card-sub">{alert.detail}</p>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      dispatch(clearEscalation({ id: alert.id }))
                      toast.success('Merchant ditindak, alert ditutup')
                    }}
                  >
                    Tindak merchant
                  </button>
                  <button
                    type="button"
                    className="admin-btn-ghost"
                    onClick={() => setCancelTarget(alert)}
                  >
                    Batalkan order
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="admin-card">
          <div className="admin-row">
            <Store size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="admin-card-title">Master tenant</p>
              <p className="admin-card-sub">
                Approval, suspend, dan blacklist COD ada di tab Merchant.
              </p>
            </div>
          </div>
        </section>

        <ConfirmSheet
          open={cancelTarget !== null}
          title="Batalkan order?"
          body={`Order ${cancelTarget?.orderCode ?? ''} dibatalkan dan refund dicatat sebagai 1 entry ledger append-only yang tidak bisa ditarik kembali.`}
          confirmLabel="Batalkan order"
          confirmClass="admin-btn-ghost"
          onConfirm={() => {
            if (!cancelTarget) return
            dispatch(clearEscalation({ id: cancelTarget.id }))
            setCancelTarget(null)
            toast.success('Order dibatalkan, refund dicatat di ledger')
          }}
          onClose={() => setCancelTarget(null)}
        />
      </main>
      <AdminBottomNav />
    </div>
  )
}
