import { Link } from 'react-router-dom'

import { OpsShell } from '../../components/layout/OpsShell'
import { openDisputeCount, pendingTenantCount } from '../../data/admin'
import {
  activePenaltyCount,
  openIncidentCount,
  pendingTagCount,
} from '../../data/ops'
import { useAppSelector } from '../../hooks/useAppStore'

/**
 * Ringkasan panel ops (M10). Beban kerja ops dalam satu layar: apa yang
 * menunggu keputusan hari ini. Angka diturunkan dari slice, bukan ditulis dua
 * kali, supaya kartu ringkasan dan halaman antrean tak bisa berbeda.
 */
export default function OpsDashboard() {
  const tenants = useAppSelector((s) => s.admin.tenants)
  const disputes = useAppSelector((s) => s.admin.disputes)
  const incidents = useAppSelector((s) => s.ops.incidents)
  const tags = useAppSelector((s) => s.ops.tags)
  const penalties = useAppSelector((s) => s.ops.penalties)

  const queues = [
    {
      to: '/onboarding',
      label: 'Tenant menunggu verifikasi',
      value: pendingTenantCount(tenants),
    },
    { to: '/disputes', label: 'Sengketa terbuka', value: openDisputeCount(disputes) },
    { to: '/incidents', label: 'Insiden belum selesai', value: openIncidentCount(incidents) },
    { to: '/moderation', label: 'Tag menunggu moderasi', value: pendingTagCount(tags) },
    { to: '/penalties', label: 'SP berlaku', value: activePenaltyCount(penalties) },
  ]

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Antrean hari ini</p>
        <p className="sa-card-sub">
          Panel ini mock: aksi ops = state yang ditampilkan, tidak menyentuh uang atau order
          sungguhan. Yang perlu keputusan dikumpulkan di bawah.
        </p>
      </section>

      <section className="sa-stats">
        {queues.map((queue) => (
          <Link key={queue.to} className="sa-stat" to={queue.to}>
            <span className="sa-stat-value">{queue.value}</span>
            <span className="sa-stat-label">{queue.label}</span>
          </Link>
        ))}
      </section>

      <section className="sa-card">
        <p className="sa-card-label">Yang dikelola ops</p>
        <ul className="sa-kv">
          <li>
            <span>Kewajiban &amp; ledger</span>
            <Link className="sa-link" to="/liability">
              Saldo DANA, eksposur sengketa, arus dana
            </Link>
          </li>
          <li>
            <span>Merchant</span>
            <Link className="sa-link" to="/merchants">
              Registri tenant, suspend, blacklist COD
            </Link>
          </li>
          <li>
            <span>Rule sengketa</span>
            <Link className="sa-link" to="/rules">
              Katalog mitigasi, kompensasi, punishment
            </Link>
          </li>
          <li>
            <span>Aturan platform</span>
            <Link className="sa-link" to="/settings">
              Multiplier Quick, ambang notif, flat fee
            </Link>
          </li>
          <li>
            <span>Paket kuota</span>
            <Link className="sa-link" to="/quotas">
              Paket order &amp; order COD
            </Link>
          </li>
          <li>
            <span>Analytics &amp; log</span>
            <Link className="sa-link" to="/analytics">
              Aktivitas platform + audit aksi
            </Link>
          </li>
        </ul>
      </section>
    </OpsShell>
  )
}
