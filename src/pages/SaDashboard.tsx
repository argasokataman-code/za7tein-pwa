import { ArrowUpRight, Coins, Lock, ScrollText, ShieldAlert, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import { BarChart } from '../components/ui/BarChart'
import { CountUp } from '../components/ui/CountUp'
import { DonutChart } from '../components/ui/DonutChart'
import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import {
  aggregateLiability,
  liabilityGap,
  money,
  moneyFromJod,
  openDisputeCount,
  pendingTenantCount,
  totalLiability,
} from '../data/admin'
import {
  auditByDay,
  feeSeries,
  liabilitySegments,
  orderSeries,
  profitSegments,
} from '../data/dashboard'
import {
  auditKindLabel,
  gstFoodFor,
  profitBalance,
  switchIsDown,
  switchMeta,
  taxReports,
} from '../data/superadmin'
import { jod } from '../data/currency'
import { useAppSelector } from '../hooks/useAppStore'

/**
 * Ringkasan konsol SA.
 *
 * Dua bacaan untuk angka yang sama: nominalnya sebagai teks (kartu) dan
 * bentuknya sebagai chart (donut/bar). Dua angka yang paling mudah tertukar —
 * saldo keuntungan yang boleh ditarik dan kewajiban platform yang tidak boleh
 * disentuh — sengaja berdampingan, masing-masing dengan donut pembedahnya
 * supaya selisihnya terlihat, bukan cuma terbaca.
 */
export default function SaDashboard() {
  const profit = useAppSelector((s) => s.superAdmin.profit)
  const switches = useAppSelector((s) => s.superAdmin.switches)
  const operators = useAppSelector((s) => s.superAdmin.operators)
  const audit = useAppSelector((s) => s.superAdmin.audit)
  const tenants = useAppSelector((s) => s.admin.tenants)
  const disputes = useAppSelector((s) => s.admin.disputes)
  const storedLiability = useAppSelector((s) => s.admin.liability)
  const walletIdr = useAppSelector((s) => s.wallet.balance.balance)

  const balance = profitBalance(profit)
  const liability = aggregateLiability(storedLiability, walletIdr)
  const liabilityTotal = totalLiability(liability)
  const gap = liabilityGap(liability)
  const lastReport = taxReports[taxReports.length - 1]
  const activeOperators = operators.filter((o) => o.status === 'active').length
  const downSwitches = switchMeta.filter((meta) => switchIsDown(meta.key, switches))

  const feeSplit = profitSegments(profit)
  const liabilitySplit = liabilitySegments(liability)

  return (
    <SuperAdminShell>
      <section className="sa-hero sa-hero--money">
        <article className="sa-card sa-card--brand sa-card--glow">
          <p className="sa-card-label">Saldo keuntungan platform</p>
          <p className="sa-card-value">
            <CountUp value={balance} format={moneyFromJod} />
          </p>
          <p className="sa-card-sub">
            Fee terkumpul {moneyFromJod(profit.feeGrossJod)} dikurangi biaya operasional, PPh
            final, dan penarikan sebelumnya. Hanya dana ini yang boleh ditarik SA.
          </p>
          <Link className="sa-card-action" to="/profit">
            Kelola &amp; tarik keuntungan
            <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </article>

        <article className="sa-card sa-card--glow">
          <p className="sa-card-label">Ke mana fee platform pergi</p>
          <div className="chart-split">
            <DonutChart
              segments={feeSplit}
              ariaLabel="Komposisi fee platform"
              centerValue={jod(profit.feeGrossJod)}
              centerLabel="fee terkumpul"
            />
            <ul className="chart-legend">
              {feeSplit.map((segment) => (
                <li key={segment.label}>
                  <span
                    className={`chart-legend-dot chart-tone-bg--${segment.tone}`}
                    aria-hidden="true"
                  />
                  <span className="chart-legend-label">{segment.label}</span>
                  <span className="chart-legend-value">{moneyFromJod(segment.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="sa-hero sa-hero--money">
        <article className="sa-card sa-card--glow">
          <p className="sa-card-label">
            <Lock size={14} strokeWidth={1.75} aria-hidden="true" /> Kewajiban platform (dana user)
          </p>
          <p className="sa-card-value sa-card-value--plain">
            <CountUp value={liabilityTotal} format={moneyFromJod} />
          </p>
          <p className="sa-card-sub">
            Ini bukan milik SA. Selisih terhadap saldo Xendit{' '}
            {gap < 0 ? `kurang ${moneyFromJod(Math.abs(gap))}` : `sisa ${moneyFromJod(gap)}`}.
            Top-up dan payout jalan sendiri oleh sistem.
          </p>
        </article>

        <article className="sa-card sa-card--glow">
          <p className="sa-card-label">Komposisi kewajiban</p>
          <div className="chart-split">
            <DonutChart
              segments={liabilitySplit}
              ariaLabel="Komposisi kewajiban platform"
              centerValue={jod(liabilityTotal)}
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
                  <span className="chart-legend-value">{moneyFromJod(segment.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="sa-grid-2">
        <article className="sa-card">
          <p className="sa-card-label">Order per periode</p>
          <BarChart data={orderSeries(taxReports)} ariaLabel="Order per periode laporan pajak" />
          <p className="sa-card-sub">
            Periode bertanda * masih berjalan, batangnya belum penuh.
          </p>
        </article>

        <article className="sa-card">
          <p className="sa-card-label">
            <Coins size={14} strokeWidth={1.75} aria-hidden="true" /> Fee platform per periode (JOD)
          </p>
          <BarChart
            data={feeSeries(taxReports)}
            ariaLabel="Fee platform terkumpul per periode, JOD"
            tone="success"
            format={(value) => value.toFixed(0)}
          />
          <ul className="sa-kv">
            <li>
              <span>GST makanan (merchant, info)</span>
              <span>{money(gstFoodFor(lastReport.salesIdr))}</span>
            </li>
            <li>
              <span>PPh final fee platform</span>
              <span>{moneyFromJod(lastReport.pphFinalJod)}</span>
            </li>
          </ul>
          <p className="sa-card-sub">
            Tarif final menunggu konsultan pajak (OQ-2/3/4, OQ-17/18), angka ini placeholder.
          </p>
          <Link className="sa-link" to="/tax">
            Lihat laporan lengkap
          </Link>
        </article>
      </section>

      <section className="sa-stats">
        <Link className={`sa-stat sa-stat--${downSwitches.length === 0 ? 'ok' : 'off'}`} to="/switches">
          <span className="sa-stat-dot" aria-hidden="true" />
          <span className="sa-stat-value">
            {downSwitches.length === 0 ? 'Normal' : `${downSwitches.length} mati`}
          </span>
          <span className="sa-stat-label">Jalur kill switch</span>
        </Link>
        <Link className="sa-stat" to="/audit">
          <ScrollText size={18} strokeWidth={1.75} aria-hidden="true" />
          <span className="sa-stat-value">{audit.length}</span>
          <span className="sa-stat-label">Baris audit trail</span>
        </Link>
        <Link className="sa-stat" to="/roles">
          <Users size={18} strokeWidth={1.75} aria-hidden="true" />
          <span className="sa-stat-value">{activeOperators}</span>
          <span className="sa-stat-label">Operator aktif</span>
        </Link>
        <Link className="sa-stat" to="/admin">
          <ShieldAlert size={18} strokeWidth={1.75} aria-hidden="true" />
          <span className="sa-stat-value">
            {pendingTenantCount(tenants)} · {openDisputeCount(disputes)}
          </span>
          <span className="sa-stat-label">Antrean CS: tenant · sengketa</span>
        </Link>
      </section>

      <section className="sa-grid-2">
        <article className="sa-card">
          <p className="sa-card-label">Audit trail terbaru</p>
          <ul className="sa-feed">
            {audit.slice(0, 5).map((entry) => (
              <li key={entry.id}>
                <span className={`sa-dot sa-dot--${entry.actorRole}`} aria-hidden="true" />
                <span className="sa-feed-copy">
                  <strong>{entry.action}</strong>
                  <span>
                    {entry.target} · {entry.actor} · {auditKindLabel[entry.kind]}
                  </span>
                </span>
                <span className="sa-feed-at">{entry.at}</span>
              </li>
            ))}
          </ul>
          <Link className="sa-link" to="/audit">
            Semua aktivitas
          </Link>
        </article>

        <article className="sa-card">
          <p className="sa-card-label">Aktivitas audit per hari</p>
          <BarChart
            data={auditByDay(audit)}
            ariaLabel="Jumlah aksi audit per hari"
            tone="muted"
            compact
          />
          <p className="sa-card-sub">
            {audit.length} aksi tercatat. Aksi CS masuk lewat jalur audit yang sama, tidak ada yang
            lolos dari pengawasan SA.
          </p>
        </article>
      </section>

      <ExchangeRateNote />
    </SuperAdminShell>
  )
}
