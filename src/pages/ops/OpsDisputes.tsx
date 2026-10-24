import { FileSearch, ShieldQuestion } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { AdminKpi } from '../../components/admin/AdminKpi'
import { EvidencePhotos } from '../../components/admin/EvidencePhotos'
import { OpsShell } from '../../components/layout/OpsShell'
import { ConfirmSheet } from '../../components/ui/ConfirmSheet'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useMoney } from '../../hooks/useMoney'
import { RESOLUTIONS, disputeStatusLabel } from '../../data/admin'
import { resolveDispute, startInvestigation } from '../../store/slices/adminSlice'
import type { Dispute, DisputeResolution } from '../../types'

/**
 * Panjang minimum catatan putusan. Ini **bentuk** validasi, bukan aturan bisnis:
 * angka pastinya (dan window 24 jam) belum ditetapkan PRD aktif (OQ-29), jadi
 * UI hanya menuntut catatan yang cukup panjang, tidak mengunci nilainya.
 */
const DECISION_NOTE_MIN = 10

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
  const { moneyFromJod } = useMoney()
  const decided = dispute.status === 'resolved' || dispute.status === 'rejected'
  // Putusan menulis ledger, jadi ketuk kedua terjadi di sheet (audit 006 #4).
  const [pending, setPending] = useState<DisputeResolution | null>(null)
  const [note, setNote] = useState('')
  const noteTooShort = note.trim().length < DECISION_NOTE_MIN

  function openDecision(resolution: DisputeResolution) {
    setPending(resolution)
    setNote('')
  }

  function confirmDecide() {
    if (!pending || noteTooShort) return
    dispatch(resolveDispute({ id: dispute.id, resolution: pending, percent }))
    toast.success(
      pending === 'no_action'
        ? 'Sengketa ditolak, tanpa ubah saldo'
        : 'Putusan diterapkan: 1 entry ledger dicatat',
    )
    setPending(null)
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
        Merchant: {dispute.merchant} · nilai order {moneyFromJod(dispute.amount)}
      </p>
      <p className="admin-dispute-reason">
        <strong>{dispute.category}.</strong> {dispute.reason}
      </p>

      <EvidencePhotos
        photos={dispute.photos ?? []}
        emptyLabel="Tanpa foto bukti"
        label="Foto bukti sengketa"
      />

      {decided ? (
        <p className="admin-note">
          Putusan: {RESOLUTIONS.find((r) => r.id === dispute.resolution)?.label ?? '-'}
          {dispute.partialPercent ? ` (${dispute.partialPercent}%)` : ''}.
        </p>
      ) : dispute.status === 'open' ? (
        <div className="admin-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              dispatch(startInvestigation({ id: dispute.id }))
              toast.success('Investigasi dibuka, hold tetap dibekukan')
            }}
          >
            <FileSearch size={16} strokeWidth={1.75} aria-hidden="true" />
            Buka investigasi
          </button>
        </div>
      ) : (
        <div className="admin-resolutions">
          <p className="admin-note">Pilih putusan. Refund sebagian mengatur persentasenya di dialog.</p>
          {RESOLUTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              // Satu tindakan dominan (refund sebagian), sisanya outline; tolak
              // tetap ghost (audit 015 #9).
              className={
                item.id === 'no_action'
                  ? 'admin-btn-ghost'
                  : item.id === 'refund_partial'
                    ? 'btn btn-primary'
                    : 'admin-btn-outline'
              }
              onClick={() => openDecision(item.id)}
            >
              {item.label}
              <span className="admin-res-effect">
                {item.id === 'refund_partial'
                  ? `${percent}% ke customer, sisanya cair ke merchant`
                  : item.effect}
              </span>
            </button>
          ))}
        </div>
      )}

      <ConfirmSheet
        open={pending !== null}
        title={RESOLUTIONS.find((r) => r.id === pending)?.label ?? 'Terapkan putusan'}
        body={
          pending === 'no_action'
            ? 'Tanpa ubah saldo: tidak ada entry ledger untuk putusan ini.'
            : 'Putusan ini menambah 1 entry ledger append-only dan tidak bisa ditarik kembali.'
        }
        confirmLabel="Terapkan putusan"
        confirmClass={pending === 'no_action' ? 'admin-btn-ghost' : 'btn-primary'}
        confirmDisabled={noteTooShort}
        onConfirm={confirmDecide}
        onClose={() => setPending(null)}
      >
        {pending === 'refund_partial' ? (
          <>
            <label className="admin-field" htmlFor={`refund-${dispute.id}`}>
              Refund sebagian: {percent}%
            </label>
            <input
              id={`refund-${dispute.id}`}
              className="admin-range"
              type="range"
              min={10}
              max={90}
              step={5}
              value={percent}
              onChange={(event) => onPercent(Number(event.target.value))}
            />
          </>
        ) : null}

        <label className="admin-field" htmlFor={`decision-note-${dispute.id}`}>
          Alasan putusan
        </label>
        <textarea
          id={`decision-note-${dispute.id}`}
          className="admin-textarea"
          value={note}
          placeholder="Tuliskan dasar putusan; ikut disimpan sebagai catatan audit."
          aria-invalid={noteTooShort}
          aria-describedby={`decision-note-help-${dispute.id}`}
          onChange={(event) => setNote(event.target.value)}
        />
        <p id={`decision-note-help-${dispute.id}`} className="admin-hint">
          Wajib, minimal {DECISION_NOTE_MIN} karakter ({note.trim().length}/{DECISION_NOTE_MIN}).
          Persentase refund dan window 24 jam belum final (OQ-29).
        </p>
      </ConfirmSheet>
    </article>
  )
}

export default function OpsDisputes() {
  const disputes = useAppSelector((s) => s.admin.disputes)
  const [percent, setPercent] = useState<Record<string, number>>({})
  const isDesktop = useMediaQuery('(min-width: 901px)')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = disputes.find((d) => d.id === selectedId) ?? disputes[0]
  const open = disputes.filter((d) => d.status === 'open').length
  const investigating = disputes.filter((d) => d.status === 'investigating').length
  const resolved = disputes.filter((d) => d.status === 'resolved').length
  const rejected = disputes.filter((d) => d.status === 'rejected').length

  const renderCard = (dispute: Dispute) => (
    <DisputeCard
      key={dispute.id}
      dispute={dispute}
      percent={percent[dispute.id] ?? 50}
      onPercent={(value) => setPercent((prev) => ({ ...prev, [dispute.id]: value }))}
    />
  )

  return (
    <OpsShell>
      <div className="admin-page">
        <div className="admin-kpi">
          <AdminKpi label="Baru" value={open} sub="Belum ditangani" tone={open > 0 ? 'warning' : undefined} />
          <AdminKpi label="Investigasi" value={investigating} sub="Hold dibekukan" />
          <AdminKpi label="Diputuskan" value={resolved} sub="Selesai" />
          <AdminKpi label="Ditolak" value={rejected} sub="Tanpa ubah saldo" />
        </div>

        <section className="admin-card admin-card--wide">
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

        {/* Desktop (>=901px): master-detail, antrean di kiri + detail terpilih di
            kanan. Di ponsel tetap kartu bertumpuk. Cabang render, bukan CSS,
            karena dua susunan DOM memang berbeda. */}
        {isDesktop ? (
          <section className="admin-disputes">
            <div className="admin-disputes-queue">
              <h2 className="admin-section-title">Antrean ({disputes.length})</h2>
              {disputes.length === 0 ? (
                <p className="admin-empty">Tidak ada sengketa.</p>
              ) : (
                disputes.map((dispute) => {
                  const active = selected?.id === dispute.id
                  return (
                    <button
                      key={dispute.id}
                      type="button"
                      className={active ? 'admin-disputes-item is-active' : 'admin-disputes-item'}
                      aria-current={active}
                      onClick={() => setSelectedId(dispute.id)}
                    >
                      <span className="admin-disputes-item__code">{dispute.orderCode}</span>
                      <span className="admin-disputes-item__party">{dispute.party}</span>
                      <span className={`admin-badge admin-badge--${dispute.status}`}>
                        {disputeStatusLabel[dispute.status]}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
            <div className="admin-disputes-detail">
              {selected ? renderCard(selected) : <p className="admin-empty">Belum ada sengketa.</p>}
            </div>
          </section>
        ) : (
          <section className="admin-section">
            <h2 className="admin-section-title">Antrean ({disputes.length})</h2>
            {disputes.length === 0 ? (
              <p className="admin-empty">Tidak ada sengketa.</p>
            ) : (
              disputes.map(renderCard)
            )}
          </section>
        )}

        <div className="admin-footnote">
          <p className="admin-note">
            Form “Ajukan Sengketa” ada di sisi customer (layar pesanan tiba) dan merchant (order
            selesai); kiriman masuk ke antrean ini.
          </p>
        </div>
      </div>
    </OpsShell>
  )
}
