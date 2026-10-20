import { Bike, Clock, Route, Timer } from 'lucide-react'
import { useState } from 'react'

import {
  respondPartnerAssignment,
  setPartnerAvailability,
} from '../api/partner'
import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { useApiPartner } from '../hooks/useApiPartner'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import {
  approveAssignment,
  expireAssignment,
  issueWarningLetter,
  rejectAssignment,
  setPartnerStatus,
} from '../store/slices/partnerSlice'
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
 * Mock: penjadwalan dispatch nyata (OPEN-11) belum ada, jadi assignment yang
 * tampil adalah **data demo**, bukan kiriman dispatch sungguhan — ditandai lewat
 * `PlatformNotice`, bukan dipura-purakan. Cabang "tanpa respons" (Q06) bisa
 * dilihat lewat tombol simulasi; di produksi ia dipicu BE dan SP-nya dijatuhkan
 * ops (penerbit masih UNRESOLVED).
 */
export default function CourierPartner() {
  const dispatch = useAppDispatch()
  useApiPartner()
  const partners = useAppSelector((s) => s.partner.partners)
  const selfId = useAppSelector((s) => s.partner.selfId)
  const partner = partners.find((p) => p.id === selfId)
  const assignments = useAppSelector((s) =>
    s.partner.assignments.filter((a) => a.partnerId === selfId),
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

  /** BE dulu best-effort, state lokal tetap jadi tampilan (mock-first repo). */
  const accept = (id: string) => {
    dispatch(approveAssignment({ id }))
    if (!partner) return
    void respondPartnerAssignment(id, 'approved')
      .then(() => setPartnerAvailability(partner.id, 'busy'))
      .catch(() => {})
  }

  const confirmReject = () => {
    if (!rejectId || !reason.trim()) return
    const id = rejectId
    dispatch(rejectAssignment({ id, reason: reason.trim() }))
    if (partner) {
      void respondPartnerAssignment(id, 'rejected', reason.trim())
        .then(() => setPartnerAvailability(partner.id, 'available'))
        .catch(() => {})
    }
    closeReject()
  }

  /** Hanya saat tidak memegang order: reserved/busy berarti ada order berjalan. */
  const canToggle = status === 'offline' || status === 'available'
  const toggleAvailability = () => {
    if (!partner || !canToggle) return
    const next: CourierPartnerStatus = status === 'offline' ? 'available' : 'offline'
    dispatch(setPartnerStatus({ partnerId: partner.id, status: next }))
    void setPartnerAvailability(partner.id, next).catch(() => {})
  }

  /**
   * Q06: prepare habis tanpa respons. Dipicu **BE** (`expire_assignments()`),
   * bukan aksi kurir, dan SP dijatuhkan **ops** (§18, penerbit UNRESOLVED) —
   * demo memainkan keduanya supaya akibatnya terlihat: assignment kedaluwarsa,
   * order pindah ke pengganti, mitra jadi offline, SP tercatat.
   */
  const simulateExpire = (id: string) => {
    dispatch(expireAssignment({ id }))
    if (partner) dispatch(issueWarningLetter({ partnerId: partner.id }))
  }

  const nameOf = (partnerId?: string) =>
    partners.find((p) => p.id === partnerId)?.name ?? null

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow="Kurir partner" title="Tugas partner" />

        <section className="courier-card" aria-label="Status kurir partner">
          <div className="courier-row">
            <Bike size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">{partner?.name ?? 'Kurir partner'}</p>
              <p className="courier-card-sub">Satu order per waktu, dikelola aplikator</p>
            </div>
          </div>
          <p className={`courier-partner-status ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</p>
          {canToggle ? (
            <button
              type="button"
              className="courier-partner-availability"
              onClick={toggleAvailability}
            >
              {status === 'offline' ? 'Masuk antrean' : 'Istirahat'}
            </button>
          ) : null}
          {partner ? (
            <p className="courier-card-sub">
              {partner.activeOrders} order aktif
              {partner.warningLetters > 0 ? ` · ${partner.warningLetters} SP aktif` : ''}
            </p>
          ) : null}
        </section>

        <PlatformNotice message="Status dan assignment mitra disimpan ke BE (couriers + dispatch_assignments). Dispatch otomatis (OPEN-11) dan penerbit SP belum diputuskan ops (§18); tombol simulasi hanya memainkan akibat cabang tanpa respons di layar ini." />

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
                    className="btn btn-primary"
                    onClick={() => accept(assignment.id)}
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
                <p className="courier-sla-note">
                  Jendela respons sepanjang estimasi prepare. Di produksi, prepare habis
                  tanpa respons dipicu BE (expire_assignments()): order dicari pengganti,
                  mitra jadi offline, dan ops menjatuhkan SP.
                </p>
                <button
                  type="button"
                  className="courier-partner-sim"
                  onClick={() => simulateExpire(assignment.id)}
                >
                  <Timer size={16} strokeWidth={1.75} aria-hidden="true" />
                  Simulasikan prepare habis
                </button>
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
                    {assignment.status === 'expired' ? (
                      <>
                        <p className="courier-card-sub">SP dicatat ke mitra (COU-17)</p>
                        <p className="courier-card-sub">
                          {nameOf(assignment.replacedBy)
                            ? `Diganti oleh ${nameOf(assignment.replacedBy)}`
                            : 'Belum ada pengganti'}
                        </p>
                      </>
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
