import { Bike, Clock, Route } from 'lucide-react'
import { useState } from 'react'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { PARTNER_SELF_ID } from '../data/marketplace'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { approveAssignment, rejectAssignment } from '../store/slices/partnerSlice'
import type { CourierPartnerStatus } from '../types'

const STATUS_LABEL: Record<CourierPartnerStatus, string> = {
  offline: 'Offline, belum menerima assignment',
  available: 'Available, masuk antrean dispatch',
  reserved: 'Reserved, menunggu keputusanmu',
  busy: 'Busy, sedang mengantar satu order',
}

/** Nada chip status; token peran yang sudah ada, bukan warna baru (DNA). */
const STATUS_TONE: Record<CourierPartnerStatus, string> = {
  offline: 'is-off',
  available: 'is-available',
  reserved: 'is-reserved',
  busy: 'is-busy',
}

const ASSIGN_LABEL = {
  pending: 'Menunggu respons',
  approved: 'Diterima',
  rejected: 'Ditolak',
  expired: 'Kedaluwarsa',
} as const

const stamp = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Layar kurir partner (PRD §9.3/§9.5, flow f26). Satu order per waktu: kurir
 * menerima assignment dari aplikator, lalu **approve** atau **reject ber-alasan**
 * (COU-18, submit aktif setelah alasan diisi). Statusnya offline/available/
 * reserved/busy dan berubah mengikuti respons.
 *
 * Mock: penjadwalan dispatch nyata (OPEN-11) dan hukuman SP tidak dibangun di
 * sini, jadi assignment yang tampil adalah **data demo**, bukan kiriman dispatch
 * sungguhan. Itu ditandai lewat `PlatformNotice`, bukan dipura-purakan.
 */
export default function CourierPartner() {
  const dispatch = useAppDispatch()
  const partner = useAppSelector((s) =>
    s.partner.partners.find((p) => p.id === PARTNER_SELF_ID),
  )
  const assignments = useAppSelector((s) =>
    s.partner.assignments.filter((a) => a.partnerId === PARTNER_SELF_ID),
  )

  const pending = assignments.filter((a) => a.status === 'pending')
  const history = assignments.filter((a) => a.status !== 'pending')
  const status: CourierPartnerStatus = partner?.status ?? 'offline'

  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const closeReject = () => {
    setRejectId(null)
    setReason('')
  }

  const confirmReject = () => {
    if (!rejectId || !reason.trim()) return
    dispatch(rejectAssignment({ id: rejectId, reason: reason.trim() }))
    closeReject()
  }

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow="Kurir partner" title="Tugas partner" back="/" />

        <section className="courier-card" aria-label="Status kurir partner">
          <div className="courier-row">
            <Bike size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">{partner?.name ?? 'Kurir partner'}</p>
              <p className="courier-card-sub">Satu order per waktu, dikelola aplikator</p>
            </div>
          </div>
          <p className={`courier-partner-status ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</p>
          {partner ? (
            <p className="courier-card-sub">
              {partner.completedToday} order selesai hari ini
              {partner.warningLetters > 0 ? ` · ${partner.warningLetters} SP aktif` : ''}
            </p>
          ) : null}
        </section>

        <PlatformNotice message="Dispatch otomatis (OPEN-11) dan hukuman SP dikelola ops, belum dibangun. Assignment di layar ini data demo, bukan kiriman dispatch nyata." />

        <section className="courier-section">
          <h2 className="courier-section-title">
            Menunggu respons {pending.length > 0 ? `(${pending.length})` : ''}
          </h2>
          {pending.length === 0 ? (
            <p className="courier-empty">Belum ada assignment baru.</p>
          ) : (
            pending.map((assignment) => (
              <article key={assignment.id} className="courier-card">
                <div className="courier-row">
                  <Route size={20} strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <p className="courier-card-title">Order {assignment.orderId}</p>
                    <p className="courier-card-sub">Dikirim {stamp(assignment.sentAt)}</p>
                  </div>
                </div>
                <div className="courier-partner-actions">
                  <button
                    type="button"
                    className="courier-primary"
                    onClick={() => dispatch(approveAssignment({ id: assignment.id }))}
                  >
                    Terima
                  </button>
                  <button
                    type="button"
                    className="courier-btn-ghost"
                    onClick={() => setRejectId(assignment.id)}
                  >
                    Tolak
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="courier-section">
          <h2 className="courier-section-title">Riwayat assignment</h2>
          {history.length === 0 ? (
            <p className="courier-empty">Belum ada riwayat assignment.</p>
          ) : (
            history.map((assignment) => (
              <article key={assignment.id} className="courier-card">
                <div className="courier-row">
                  <Clock size={20} strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <p className="courier-card-title">Order {assignment.orderId}</p>
                    <p className="courier-card-sub">
                      {ASSIGN_LABEL[assignment.status]}
                      {assignment.respondedAt ? ` · ${stamp(assignment.respondedAt)}` : ''}
                    </p>
                    {assignment.rejectReason ? (
                      <p className="courier-card-sub">Alasan: {assignment.rejectReason}</p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <ConfirmSheet
        open={rejectId !== null}
        title="Tolak assignment"
        body="Alasan wajib diisi. Kurir yang menolak berulang bisa dikenai SP (COU-18)."
        confirmLabel="Kirim alasan"
        confirmDisabled={!reason.trim()}
        onConfirm={confirmReject}
        onClose={closeReject}
      >
        <label className="sheet-field-label" htmlFor="partner-reject-reason">
          Alasan penolakan
        </label>
        <textarea
          id="partner-reject-reason"
          className="sheet-textarea"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Contoh: sedang di luar radius"
        />
      </ConfirmSheet>

      <CourierBottomNav />
    </div>
  )
}
