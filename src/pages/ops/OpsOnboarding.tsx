import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { OpsShell } from '../../components/layout/OpsShell'
import { depositStatusLabel, tenantStatusLabel } from '../../data/admin'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { approveDeposit, rejectOnboarding } from '../../store/slices/adminSlice'

/**
 * Verifikasi onboarding tenant (M10). Ops meninjau pengajuan merchant dan
 * memverifikasi deposit COD (3,50 JOD) sebelum toko aktif.
 *
 * Memakai **slice admin yang sama** dengan panel CS — bukan menyalin antrean.
 * Approve/reject menulis lewat aksi yang sudah ada, sehingga jembatan audit
 * (aksi CS/ops tercatat di audit trail SA) tetap berlaku tanpa duplikasi.
 */
export default function OpsOnboarding() {
  const dispatch = useAppDispatch()
  const tenants = useAppSelector((s) => s.admin.tenants)

  const pending = tenants.filter((t) => t.tenantStatus === 'pending')
  const rest = tenants.filter((t) => t.tenantStatus !== 'pending')

  const decide = (id: string, name: string, approve: boolean) => {
    if (approve) {
      dispatch(approveDeposit({ id }))
      toast.success(`${name} disetujui, deposit jadi held`)
    } else {
      dispatch(rejectOnboarding({ id }))
      toast.success(`${name} ditolak`)
    }
  }

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Menunggu keputusan</p>
        <p className="sa-card-sub">
          Setujui setelah deposit COD terverifikasi; tolak bila data tempat usaha tidak lengkap.
        </p>
      </section>

      {pending.length === 0 ? (
        <section className="sa-card">
          <p className="sa-empty">Tidak ada tenant yang menunggu.</p>
        </section>
      ) : (
        <section className="sa-card">
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Kota</th>
                  <th>Foto</th>
                  <th>Deposit</th>
                  <th>Status</th>
                  <th aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {pending.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <strong>{tenant.name}</strong>
                      <span className="sa-table-sub">{tenant.owner}</span>
                    </td>
                    <td>{tenant.city}</td>
                    <td>{tenant.photoCount} foto</td>
                    <td>{depositStatusLabel[tenant.depositStatus]}</td>
                    <td>{tenantStatusLabel[tenant.tenantStatus]}</td>
                    <td>
                      <div className="sa-actions">
                        <button
                          type="button"
                          className="sa-btn sa-btn--primary sa-btn--small"
                          onClick={() => decide(tenant.id, tenant.name, true)}
                        >
                          <Check size={15} strokeWidth={1.75} aria-hidden="true" /> Setujui
                        </button>
                        <button
                          type="button"
                          className="sa-btn sa-btn--small"
                          onClick={() => decide(tenant.id, tenant.name, false)}
                        >
                          <X size={15} strokeWidth={1.75} aria-hidden="true" /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {rest.length > 0 ? (
        <section className="sa-card">
          <p className="sa-card-label">Sudah diputuskan</p>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Kota</th>
                  <th>Deposit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <strong>{tenant.name}</strong>
                      <span className="sa-table-sub">{tenant.owner}</span>
                    </td>
                    <td>{tenant.city}</td>
                    <td>{depositStatusLabel[tenant.depositStatus]}</td>
                    <td>{tenantStatusLabel[tenant.tenantStatus]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </OpsShell>
  )
}
