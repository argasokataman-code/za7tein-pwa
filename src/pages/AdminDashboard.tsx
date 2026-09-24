import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Lock, Scale, ShieldCheck, Signal, Store } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { AdminBottomNav } from '../components/layout/AdminBottomNav'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { DonutChart } from '../components/ui/DonutChart'
import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { InstallAppCard } from '../components/ui/InstallAppCard'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { aggregateLiability, liabilityGap, ledgerTypeLabel, money, moneyFromJod, openDisputeCount, pendingTenantCount, totalLiability } from '../data/admin'
import { disputeExposure, ledgerFlow, ledgerTypeBars, liabilitySegments } from '../data/dashboard'
import { jod } from '../data/currency'
import { clearEscalation } from '../store/slices/adminSlice'
import type { AdminEscalation } from '../types'

/**
 * Ringkasan panel CS.
 *
 * Bacaan: konsol operasi CS untuk platform ops, native mode, utility style,
 * dial ENERGY 1 / RHYTHM 2 / MOTION 1 / DENSITY 3 / FEEL 1. Satu kolom,
 * DENSITY 3 karena tugas layar ini memang memantau: komposisi uang → eksposur
 * → arus → antrean.
 *
 * Semua angka diturunkan dari `adminSlice` yang sudah ada (lihat
 * `data/dashboard.ts`) — nol mock baru. Yang CS **tidak** pegang (pajak,
 * profit/penarikan, audit trail, kill switch; milik SA) tidak ditampilkan
 * apa pun, tidak dipalsukan (HG-12).
 */
export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const storedLiability = useAppSelector((s) => s.admin.liability)
  const walletIdr = useAppSelector((s) => s.wallet.balance.balance)
  const escalations = useAppSelector((s) => s.admin.escalations)
  const tenants = useAppSelector((s) => s.admin.tenants)
  const disputes = useAppSelector((s) => s.admin.disputes)
  const ledger = useAppSelector((s) => s.admin.ledger)
  const riskFlags = useAppSelector((s) => s.admin.customerRiskFlags)
  // Batal order menulis refund ke ledger, jadi konfirmasi dulu (audit 006 #4).
  const [cancelTarget, setCancelTarget] = useState<AdminEscalation | null>(null)

  // Agregat ikut wallet demo yang hidup, bukan angka statis (M9/M11).
  const liability = aggregateLiability(storedLiability, walletIdr)
  const total = totalLiability(liability)
  const gap = liabilityGap(liability)
  const underFunded = gap < 0

  const liabilitySplit = liabilitySegments(liability)
  const exposure = disputeExposure(disputes)
  const exposureTotal = disputes.reduce((sum, dispute) => sum + dispute.amount, 0)
  const flow = ledgerFlow(ledger)
  const typeBars = ledgerTypeBars(ledger)
  const maxType = Math.max(...typeBars.map((bar) => bar.value), 1)
  const investigating = disputes.filter((dispute) => dispute.status === 'investigating').length

  return (
    <div className="app-shell">
      <main className="admin-page">
        <AdminPageHeader eyebrow="Panel admin · CS" title="Ringkasan" />

        {/* 1 — Kartu liability: --surface (DNA baris 15); donut komposisi yang
            membawa warna, deret yang sama dengan konsol SA. Nilai segmen cukup
            JOD (kontrak plan-admin: nominal konsol dalam JOD), pasangan
            Rp·JOD tetap di angka total dan catatan kurs. */}
        <section className="admin-card">
          <p className="admin-card-sub">Kewajiban platform</p>
          <p className="admin-liability-total">{moneyFromJod(total)}</p>
          <p className="admin-card-sub">
            Saldo wallet yang belum di-payout: customer + merchant + tips kurir.
          </p>
          <div className="chart-split">
            <DonutChart
              segments={liabilitySplit}
              ariaLabel="Komposisi kewajiban platform"
              centerValue={jod(total)}
              centerLabel="total kewajiban"
            />
            <ul className="chart-legend">
              {liabilitySplit.map((segment) => (
                <li key={segment.label}>
                  <span
                    className={`chart-legend-dot chart-tone-bg--${segment.tone}`}
                    aria-hidden="true"
                  />
                  <span className="chart-legend-label">{segment.label}</span>
                  <span className="chart-legend-value">{jod(segment.value)}</span>
                </li>
              ))}
            </ul>
          </div>

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

        {/* 2 — Statline antrean menggantikan dua kartu statistik kotak lama:
            baris tanpa kotak, semua angka membuka halaman kerjanya. */}
        <nav className="admin-statline" aria-label="Antrean CS">
          <Link to="/onboarding">
            <strong>{pendingTenantCount(tenants)}</strong> Tenant
          </Link>
          <Link to="/disputes">
            <strong>{openDisputeCount(disputes)}</strong> Sengketa
          </Link>
          <Link to="/disputes">
            <strong>{investigating}</strong> Investigasi
          </Link>
          <Link to="/merchants">
            <strong>{riskFlags.length}</strong> riskFlag
          </Link>
        </nav>

        {/* 3 — Eksposur sengketa: berapa uang yang mengendap di antrean
            putusan, per status. Nol kasus = empty state, bukan donut 0. */}
        <section className="admin-card">
          <div className="admin-row">
            <Scale size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="admin-card-title">Eksposur sengketa</p>
              <p className="admin-card-sub">
                Nilai order per status; uang baru berpindah setelah putusan.
              </p>
            </div>
          </div>
          {exposure.length > 0 ? (
            <div className="chart-split">
              <DonutChart
                segments={exposure}
                ariaLabel="Eksposur sengketa per status"
                centerValue={jod(exposureTotal)}
                centerLabel="nilai sengketa"
              />
              <ul className="chart-legend">
                {exposure.map((segment) => (
                  <li key={segment.label}>
                    <span
                      className={`chart-legend-dot chart-tone-bg--${segment.tone}`}
                      aria-hidden="true"
                    />
                    <span className="chart-legend-label">{segment.label}</span>
                    <span className="chart-legend-value">{jod(segment.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="admin-empty">Tidak ada sengketa, tidak ada eksposur.</p>
          )}
          <Link className="admin-link" to="/disputes">
            Buka queue sengketa
          </Link>
        </section>

        {/* 4 — Buku besar: arus masuk/keluar + nominal per jenis entry sebagai
            baris horizontal (label panjang tumpang tindih di bar vertikal). */}
        <section className="admin-card">
          <div className="admin-row">
            <Lock size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="admin-card-title">Buku besar</p>
              <p className="admin-card-sub">
                {ledger.length} entry append-only, diurutkan menurut arah dana.
              </p>
            </div>
          </div>
          <ul className="admin-kv">
            <li>
              <span>Masuk (credit)</span>
              <span>{jod(flow.credit)}</span>
            </li>
            <li>
              <span>Keluar (debit)</span>
              <span>{jod(flow.debit)}</span>
            </li>
            <li>
              <span>Bersih</span>
              <span>{jod(flow.net)}</span>
            </li>
          </ul>
          <ul className="admin-rank">
            {typeBars.map((bar) => (
              <li key={bar.label}>
                <span className="admin-rank-name">{bar.label}</span>
                <span className="admin-rank-bar" aria-hidden="true">
                  <span
                    className="chart-tone-bg--brand"
                    style={{ width: `${(bar.value / maxType) * 100}%` }}
                  />
                </span>
                <span className="admin-rank-value">{jod(bar.value)}</span>
              </li>
            ))}
          </ul>
          <Link className="admin-link" to="/ledger">
            Semua entry
          </Link>
        </section>

        {/* 5 — Mutasi terbaru: lima entry pertama, markup baris yang sama
            dengan layar Ledger (satu sumber tampilan, bukan salinan). */}
        <section className="admin-card">
          <p className="admin-card-title">Mutasi terbaru</p>
          <p className="admin-card-sub">Lima entry terakhir yang juga terlihat di Ledger.</p>
          {ledger.slice(0, 5).map((entry) => (
            <div key={entry.id} className="admin-ledger-row">
              <span className={`admin-ledger-icon is-${entry.direction}`} aria-hidden="true">
                {entry.direction === 'credit' ? (
                  <ArrowDownLeft size={16} strokeWidth={1.75} />
                ) : (
                  <ArrowUpRight size={16} strokeWidth={1.75} />
                )}
              </span>
              <div className="admin-ledger-copy">
                <p className="admin-card-title">
                  {ledgerTypeLabel[entry.type]} · {entry.ref}
                </p>
                <p className="admin-card-sub admin-ledger-memo">{entry.memo}</p>
                <p className="admin-card-sub">{entry.at}</p>
              </div>
              <span className={`admin-ledger-amount is-${entry.direction}`}>
                {entry.direction === 'credit' ? '+' : '−'}
                {jod(entry.amount)}
              </span>
            </div>
          ))}
        </section>

        {/* 6 — Alert SLA tetap; batal order tetap lewat konfirmasi. */}
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

        {/* 7 — Kartu Master tenant tetap singkat: angka detailnya ada di
            statline dan halaman masing-masing. */}
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

        <InstallAppCard />

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
