import { ArrowUpRight, Coins, Lock, ScrollText, ShieldAlert, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
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
import { auditKindLabel, gstFoodFor, profitBalance, switchMeta, taxReports } from '../data/superadmin'
import { useAppSelector } from '../hooks/useAppStore'

/**
 * Ringkasan konsol SA. Satu fokus per layar (senior-fe lever): saldo keuntungan
 * platform — dana yang boleh ditarik SA — ditampilkan besar, dan tepat di
 * sebelahnya kewajiban platform yang justru tidak boleh disentuh. Dua angka ini
 * paling mudah tertukar, jadi urutannya sengaja berdampingan.
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
  const gap = liabilityGap(liability)
  const lastReport = taxReports[taxReports.length - 1]
  const activeOperators = operators.filter((o) => o.status === 'active').length
  const downSwitches = switchMeta.filter((s) => !switches[s.key])

  return (
    <SuperAdminShell>
      <section className="sa-hero">
        <article className="sa-card sa-card--brand">
          <p className="sa-card-label">Saldo keuntungan platform</p>
          <p className="sa-card-value">{moneyFromJod(balance)}</p>
          <p className="sa-card-sub">
            Fee {profit.feeGrossJod} JOD terkumpul − biaya {profit.costJod} JOD − PPh final{' '}
            {profit.pphFinalJod} JOD − penarikan sebelumnya.
          </p>
          <Link className="sa-card-action" to="/profit">
            Kelola & tarik keuntungan
            <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </article>

        <article className="sa-card">
          <p className="sa-card-label">
            <Lock size={14} strokeWidth={1.75} aria-hidden="true" /> Kewajiban platform (dana user)
          </p>
          <p className="sa-card-value sa-card-value--plain">{moneyFromJod(totalLiability(liability))}</p>
          <ul className="sa-kv">
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
          </ul>
          <p className="sa-card-sub">
            Ini bukan milik SA. Selisih terhadap saldo Xendit{' '}
            {gap < 0 ? `kurang ${moneyFromJod(Math.abs(gap))}` : `sisa ${moneyFromJod(gap)}`} —
            top-up dan payout jalan sendiri oleh sistem.
          </p>
        </article>
      </section>

      <section className="sa-stats">
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
          <p className="sa-card-label">Status kill switch</p>
          <div className="sa-chips">
            {switchMeta.map((meta) => (
              <span
                key={meta.key}
                className={`sa-chip${switches[meta.key] ? ' is-ok' : ' is-off'}`}
              >
                {switches[meta.key] ? meta.onLabel : meta.offLabel}
              </span>
            ))}
          </div>
          <p className="sa-card-sub">
            {downSwitches.length === 0
              ? 'Semua jalur berjalan normal.'
              : `${downSwitches.length} jalur sedang dihentikan — order atau payout bisa terdampak.`}
          </p>
          <Link className="sa-link" to="/switches">
            Buka kill switch
          </Link>
        </article>

        <article className="sa-card">
          <p className="sa-card-label">
            <Coins size={14} strokeWidth={1.75} aria-hidden="true" /> Pajak periode berjalan
          </p>
          <ul className="sa-kv">
            <li>
              <span>{lastReport.period}</span>
              <span>{lastReport.orders} order</span>
            </li>
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
            Tarif final menunggu konsultan pajak (OQ-2/3/4, OQ-17/18) — angka ini placeholder.
          </p>
          <Link className="sa-link" to="/tax">
            Lihat laporan lengkap
          </Link>
        </article>
      </section>

      <section className="sa-card">
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
      </section>

      <ExchangeRateNote />
    </SuperAdminShell>
  )
}
