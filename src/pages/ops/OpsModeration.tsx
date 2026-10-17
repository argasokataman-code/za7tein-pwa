import { Check, X } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

import { decideOpsTag, fetchOpsTags } from '../../api/ops'
import { OpsShell } from '../../components/layout/OpsShell'
import { OPS_TAG_STATUS_LABEL } from '../../data/ops'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { decideTag, hydrateTags } from '../../store/slices/opsSlice'
import type { OpsTagStatus } from '../../types'

/**
 * Moderasi tag (M10, R-OPS). Merchant mengusulkan tag; ops menyetujui atau
 * menolaknya sebelum tag tampil di beranda. Antrean dibaca dari `merchant_tags`
 * (`proposed` = menunggu, `approved` = disetujui); keputusan menulis balik ke
 * baris yang sama. Kosong → seed mock dipertahankan.
 */
export default function OpsModeration() {
  const dispatch = useAppDispatch()
  const tags = useAppSelector((s) => s.ops.tags)

  useEffect(() => {
    void fetchOpsTags()
      .then((rows) => dispatch(hydrateTags(rows)))
      .catch(() => {})
  }, [dispatch])

  const decide = (id: string, label: string, status: OpsTagStatus) => {
    dispatch(decideTag({ id, status }))
    void decideOpsTag(id, status).catch(() => {})
    toast.success(`Tag "${label}" ${status === 'approved' ? 'disetujui' : 'ditolak'}`)
  }

  const pending = tags.filter((tag) => tag.status === 'pending')
  const decided = tags.filter((tag) => tag.status !== 'pending')

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Menunggu moderasi</p>
        <p className="sa-card-sub">
          Tag adalah label pencarian pembeli. Setujui yang menggambarkan toko dengan jujur; tolak yang
          menyesatkan atau duplikat.
        </p>
      </section>

      {pending.length === 0 ? (
        <section className="sa-card">
          <p className="sa-empty">Tidak ada tag yang menunggu.</p>
        </section>
      ) : (
        <section className="sa-chips">
          {pending.map((tag) => (
            <article key={tag.id} className="sa-card">
              <div className="sa-card-head">
                <div>
                  <p className="sa-card-title">{tag.label}</p>
                  <p className="sa-card-sub">
                    {tag.merchantName} · {tag.submittedAt}
                  </p>
                </div>
                <span className="sa-chip is-off">{OPS_TAG_STATUS_LABEL[tag.status]}</span>
              </div>
              <div className="sa-actions">
                <button
                  type="button"
                  className="sa-btn sa-btn--primary sa-btn--small"
                  onClick={() => decide(tag.id, tag.label, 'approved')}
                >
                  <Check size={15} strokeWidth={1.75} aria-hidden="true" /> Setujui
                </button>
                <button
                  type="button"
                  className="sa-btn sa-btn--small"
                  onClick={() => decide(tag.id, tag.label, 'rejected')}
                >
                  <X size={15} strokeWidth={1.75} aria-hidden="true" /> Tolak
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {decided.length > 0 ? (
        <section className="sa-card">
          <p className="sa-card-label">Sudah diputuskan</p>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Merchant</th>
                  <th>Keputusan</th>
                </tr>
              </thead>
              <tbody>
                {decided.map((tag) => (
                  <tr key={tag.id}>
                    <td>{tag.label}</td>
                    <td>{tag.merchantName}</td>
                    <td>
                      <span className={`sa-chip${tag.status === 'approved' ? ' is-ok' : ' is-off'}`}>
                        {OPS_TAG_STATUS_LABEL[tag.status]}
                      </span>
                    </td>
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
