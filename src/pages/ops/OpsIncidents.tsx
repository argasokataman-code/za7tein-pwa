import toast from 'react-hot-toast'

import { OpsShell } from '../../components/layout/OpsShell'
import { disputeStatusLabel } from '../../data/admin'
import { INCIDENT_CATEGORIES, ruleById } from '../../data/rules'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { resolveIncident } from '../../store/slices/opsSlice'

/**
 * Tangani insiden (M10, §18). Insiden satu order: pelapor, kategori, jumlah
 * bukti gambar, dan rule yang berlaku. Ops memutuskan — kompensasi/punishment
 * mengikuti rule yang dipilih merchant pada order itu (`ruleForOrder()`),
 * bukan dikarang di layar ini.
 */
export default function OpsIncidents() {
  const dispatch = useAppDispatch()
  const incidents = useAppSelector((s) => s.ops.incidents)

  const categoryLabel = (categoryId: string) =>
    INCIDENT_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId

  const decide = (id: string, resolved: boolean) => {
    dispatch(
      resolveIncident({
        id,
        status: resolved ? 'resolved' : 'rejected',
        decision: resolved ? 'Kompensasi per rule berlaku' : 'Tidak cukup bukti',
      }),
    )
    toast.success(resolved ? 'Insiden diselesaikan' : 'Insiden ditolak')
  }

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Insiden per order</p>
        <p className="sa-card-sub">
          Keputusan mengikuti rule yang berlaku pada order. Setiap tindakan tercatat di audit trail.
        </p>
      </section>

      <section className="sa-card">
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Pelapor</th>
                <th>Kategori</th>
                <th>Bukti</th>
                <th>Rule</th>
                <th>Status</th>
                <th aria-label="Aksi" />
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => {
                const rule = incident.ruleId ? ruleById(incident.ruleId) : undefined
                const open = incident.status === 'open' || incident.status === 'investigating'
                return (
                  <tr key={incident.id}>
                    <td>
                      <strong>{incident.orderId}</strong>
                      <span className="sa-table-sub">{incident.filedAt}</span>
                    </td>
                    <td>{incident.reporter}</td>
                    <td>{categoryLabel(incident.categoryId)}</td>
                    <td>{incident.photoCount} foto</td>
                    <td>{rule ? rule.code : '—'}</td>
                    <td>
                      <span className={`sa-chip${open ? ' is-off' : ' is-ok'}`}>
                        {disputeStatusLabel[incident.status]}
                      </span>
                    </td>
                    <td>
                      {open ? (
                        <div className="sa-actions">
                          <button
                            type="button"
                            className="sa-btn sa-btn--primary sa-btn--small"
                            onClick={() => decide(incident.id, true)}
                          >
                            Selesaikan
                          </button>
                          <button
                            type="button"
                            className="sa-btn sa-btn--small"
                            onClick={() => decide(incident.id, false)}
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="sa-table-sub">{incident.decision}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </OpsShell>
  )
}
