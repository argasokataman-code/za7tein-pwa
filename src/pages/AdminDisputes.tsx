import { Camera, FileSearch, ShieldQuestion } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { AdminBottomNav } from '../components/layout/AdminBottomNav'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { RESOLUTIONS, disputeStatusLabel, jod } from '../data/admin'
import { resolveDispute, startInvestigation } from '../store/slices/adminSlice'
import type { Dispute, DisputeResolution } from '../types'

/** Satu kartu sengketa: bukti dulu, baru tombol putusan (F8). */
function DisputeCard({
  dispute,
  percent,
  onPercent,
}: {
  dispute: Dispute
  percent: number
  onPercent: (value: number) => void
}) {
  const dispatch = useAppDispatch()
  const decided = dispute.status === 'resolved' || dispute.status === 'rejected'

  function decide(resolution: DisputeResolution) {
    dispatch(resolveDispute({ id: dispute.id, resolution, percent }))
    toast.success(
      resolution === 'no_action'
        ? 'Sengketa ditolak — tanpa ubah saldo'
        : 'Putusan diterapkan — 1 entry ledger dicatat',
    )
  }

  return (
    <article className="admin-card">
      <div className="admin-card-head">
        <div>
          <p className="admin-card-title">{dispute.orderCode}</p>
          <p className="admin-card-sub">
            {dispute.party} · {dispute.filedAt} · oleh {dispute.filedBy === 'customer' ? 'customer' : 'merchant'}
          </p>
        </div>
        <span className={`admin-badge admin-badge--${dispute.status}`}>
          {disputeStatusLabel[dispute.status]}
        </span>
      </div>

      <p className="admin-card-sub">
        Merchant: {dispute.merchant} · nilai order {jod(dispute.amount)}
      </p>
      <p className="admin-dispute-reason">
        <strong>{dispute.category}.</strong> {dispute.reason}
      </p>
      <p className="admin-detail-inline">
        <Camera size={16} strokeWidth={1.75} aria-hidden="true" />
        {dispute.photoCount > 0 ? `${dispute.photoCount} foto bukti` : 'Tanpa foto bukti'}
      </p>

      {decided ? (
        <p className="admin-note">
          Putusan: {RESOLUTIONS.find((r) => r.id === dispute.resolution)?.label ?? '—'}
          {dispute.partialPercent ? ` (${dispute.partialPercent}%)` : ''}.
        </p>
      ) : dispute.status === 'open' ? (
        <div className="admin-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              dispatch(startInvestigation({ id: dispute.id }))
              toast.success('Investigasi dibuka — hold tetap dibekukan')
            }}
          >
            <FileSearch size={16} strokeWidth={1.75} aria-hidden="true" />
            Buka investigasi
          </button>
        </div>
      ) : (
        <div className="admin-resolutions">
          <label htmlFor={`partial-${dispute.id}`}>
            Refund sebagian: {percent}%
          </label>
          <input
            id={`partial-${dispute.id}`}
            type="range"
            min={10}
            max={90}
            step={5}
            value={percent}
            onChange={(event) => onPercent(Number(event.target.value))}
          />
          {RESOLUTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === 'no_action' ? 'admin-btn-ghost' : 'btn btn-primary'}
              onClick={() => decide(item.id)}
            >
              {item.label}
              <span className="admin-res-effect">{item.effect}</span>
            </button>
          ))}
          <p className="admin-note">
            Persentase refund sebagian dan window 24 jam belum final (OQ-29) — slider ini state
            tampilan, bukan aturan yang dikunci.
          </p>
        </div>
      )}
    </article>
  )
}

export default function AdminDisputes() {
  const disputes = useAppSelector((s) => s.admin.disputes)
  const [percent, setPercent] = useState<Record<string, number>>({})

  return (
    <div className="app-shell">
      <main className="admin-page">
        <AdminPageHeader eyebrow="Queue CS" title="Sengketa" />

        <section className="admin-card">
          <div className="admin-row">
            <ShieldQuestion size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="admin-card-title">Hold dibekukan sampai ada putusan</p>
              <p className="admin-card-sub">
                Order disputed tidak boleh settle final. Tiap putusan menambah satu entry ledger
                append-only.
              </p>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Antrean ({disputes.length})</h2>
          {disputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              percent={percent[dispute.id] ?? 50}
              onPercent={(value) => setPercent((prev) => ({ ...prev, [dispute.id]: value }))}
            />
          ))}
        </section>

        <p className="admin-note">
          Form “Ajukan Sengketa” ada di sisi customer (layar pesanan tiba) dan merchant (order
          selesai); kiriman masuk ke antrean ini.
        </p>
      </main>
      <AdminBottomNav />
    </div>
  )
}
