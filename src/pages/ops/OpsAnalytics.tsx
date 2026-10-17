import { OpsShell } from '../../components/layout/OpsShell'
import { BarChart } from '../../components/ui/BarChart'
import { auditByDay, feeSeries } from '../../data/dashboard'
import { auditKindLabel, taxReports } from '../../data/superadmin'
import { jod } from '../../data/currency'
import { useAppSelector } from '../../hooks/useAppStore'

/**
 * Analytics & log (M10, R-NFR). Ops memantau aktivitas platform dan meninjau
 * audit trail aksi. Grafik memakai seri yang sudah dihitung modul dashboard
 * (satu sumber dengan konsol SA), sedangkan feed audit membaca slice SA —
 * aksi ops/CS sudah mengalir ke sana lewat jembatan audit di `store/index.ts`.
 */
export default function OpsAnalytics() {
  const audit = useAppSelector((s) => s.superAdmin.audit)

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Aktivitas platform</p>
        <p className="sa-card-sub">Fee platform terkumpul dan aksi ops per hari.</p>
      </section>

      <section className="sa-grid-2">
        <article className="sa-card">
          <p className="sa-card-title">Fee platform per periode</p>
          <BarChart data={feeSeries(taxReports)} ariaLabel="Fee platform per periode" format={jod} />
        </article>
        <article className="sa-card">
          <p className="sa-card-title">Aksi ops per hari</p>
          <BarChart data={auditByDay(audit)} ariaLabel="Aksi ops per hari" tone="muted" />
        </article>
      </section>

      <section className="sa-card">
        <p className="sa-card-label">Audit trail</p>
        <ul className="sa-feed">
          {audit.map((entry) => (
            <li key={entry.id} className="sa-feed-copy">
              <span className="sa-feed-at">{entry.at}</span>
              <strong>{auditKindLabel[entry.kind]}</strong> · {entry.action}
              <span className="sa-table-sub">
                {entry.actor} → {entry.target}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </OpsShell>
  )
}
