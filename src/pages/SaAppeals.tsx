import { Scale } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import { RESOLUTIONS, moneyFromJod } from '../data/admin'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { decideAppeal } from '../store/slices/adminSlice'
import type { Dispute, DisputeResolution } from '../types'

/**
 * Banding sengketa. Putusan level-1 tetap milik CS; SA hanya meninjau ulang
 * (keputusan PO 2026-09-23). Karena itu tiap kartu menampilkan putusan CS
 * sebagai konteks sebelum SA memutuskan, dan keputusan SA wajib memilih satu
 * dari empat resolusi yang sama, bukan menulis putusan bebas.
 */
function AppealCard({ dispute }: { dispute: Dispute }) {
  const dispatch = useAppDispatch()
  const [resolution, setResolution] = useState<DisputeResolution>(
    dispute.resolution ?? 'refund_full',
  )
  const appeal = dispute.appeal
  if (!appeal) return null

  const decided = Boolean(appeal.verdict)
  const csVerdict = RESOLUTIONS.find((r) => r.id === dispute.resolution)?.label ?? 'Tanpa resolusi'

  return (
    <article className="sa-card">
      <div className="sa-card-head">
        <div>
          <p className="sa-card-title">
            {dispute.orderCode} · {dispute.merchant}
          </p>
          <p className="sa-card-sub">
            Diajukan {appeal.requestedBy === 'customer' ? 'customer' : 'merchant'}{' '}
            {appeal.requestedAt} · nilai {moneyFromJod(dispute.amount)}
          </p>
        </div>
        <span className={`sa-chip${decided ? ' is-ok' : ''}`}>
          {decided
            ? appeal.verdict === 'upheld'
              ? 'Putusan CS diperkuat'
              : 'Putusan CS diubah'
            : 'Menunggu tinjauan SA'}
        </span>
      </div>

      <ul className="sa-kv">
        <li>
          <span>Putusan level-1 CS</span>
          <span>{csVerdict}</span>
        </li>
        <li>
          <span>Alasan banding</span>
          <span>{appeal.note}</span>
        </li>
        {appeal.decidedAt ? (
          <li>
            <span>Ditinjau SA</span>
            <span>{appeal.decidedAt}</span>
          </li>
        ) : null}
      </ul>

      {decided ? null : (
        <>
          <div className="sa-perm-group">
            <p className="sa-perm-group-title">Putusan pengganti (kalau diubah)</p>
            <ul className="sa-perm-list">
              {RESOLUTIONS.map((option) => (
                <li key={option.id}>
                  <label className="sa-perm">
                    <input
                      type="radio"
                      name={`appeal-${dispute.id}`}
                      checked={resolution === option.id}
                      onChange={() => setResolution(option.id)}
                    />
                    <span>
                      {option.label}
                      <em className="sa-perm-effect"> {option.effect}</em>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="sa-actions">
            <button
              type="button"
              className="sa-btn sa-btn--primary"
              onClick={() => {
                dispatch(decideAppeal({ id: dispute.id, verdict: 'upheld' }))
                toast.success(`${dispute.orderCode}: putusan CS diperkuat`)
              }}
            >
              <Scale size={16} strokeWidth={1.75} aria-hidden="true" />
              Perkuat putusan CS
            </button>
            <button
              type="button"
              className="sa-btn"
              onClick={() => {
                dispatch(decideAppeal({ id: dispute.id, verdict: 'overturned', resolution }))
                toast.success(`${dispute.orderCode}: putusan diubah, entry ledger baru dicatat`)
              }}
            >
              Ubah putusan
            </button>
          </div>
        </>
      )}
    </article>
  )
}

export default function SaAppeals() {
  const disputes = useAppSelector((s) => s.admin.disputes)
  const withAppeal = disputes.filter((d) => d.appeal)
  const pending = withAppeal.filter((d) => !d.appeal?.verdict)
  const decided = withAppeal.filter((d) => d.appeal?.verdict)

  return (
    <SuperAdminShell>
      <section className="sa-card">
        <p className="sa-card-label">Menunggu tinjauan SA</p>
        <p className="sa-card-sub">
          {pending.length} banding · putusan level-1 CS tetap berlaku sampai SA memutuskan.
        </p>
      </section>

      {pending.length === 0 ? (
        <p className="sa-empty">Tidak ada banding yang menunggu. Antrean bersih.</p>
      ) : (
        pending.map((dispute) => <AppealCard key={dispute.id} dispute={dispute} />)
      )}

      <section className="sa-card">
        <p className="sa-card-label">Sudah ditinjau</p>
        {decided.length === 0 ? (
          <p className="sa-empty">Belum ada banding yang diputuskan.</p>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Merchant</th>
                  <th scope="col">Pengaju</th>
                  <th scope="col">Putusan SA</th>
                  <th scope="col">Ditinjau</th>
                </tr>
              </thead>
              <tbody>
                {decided.map((dispute) => (
                  <tr key={dispute.id}>
                    <td className="sa-nowrap">{dispute.orderCode}</td>
                    <td>{dispute.merchant}</td>
                    <td>{dispute.appeal?.requestedBy === 'customer' ? 'Customer' : 'Merchant'}</td>
                    <td>
                      <span className={`sa-chip${dispute.appeal?.verdict === 'upheld' ? ' is-ok' : ' is-off'}`}>
                        {dispute.appeal?.verdict === 'upheld' ? 'Diperkuat' : 'Diubah'}
                      </span>
                    </td>
                    <td className="sa-nowrap">{dispute.appeal?.decidedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="sa-note">
          Mengubah putusan menambah satu entry ledger baru (append-only), putusan CS sebelumnya
          tidak dihapus, jadi jejaknya tetap bisa diaudit.
        </p>
      </section>
    </SuperAdminShell>
  )
}
