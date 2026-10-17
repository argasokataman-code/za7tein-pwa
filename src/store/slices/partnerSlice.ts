import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockAssignments, mockCourierPartners } from '../../data/marketplace'
import type { CourierAssignment, CourierPartner, CourierPartnerStatus } from '../../types'

interface PartnerState {
  partners: CourierPartner[]
  assignments: CourierAssignment[]
}

const initialState: PartnerState = {
  partners: mockCourierPartners,
  assignments: mockAssignments,
}

/**
 * Kurir partner + assignment (PRD §9.3, §9.5). Kurir partner dikelola aplikator,
 * satu order per waktu; system me-reserve sejak assignment dikirim sampai
 * approve/reject. Tidak merespons sampai prepare selesai = SP + off (COU-17).
 * Repo ini mock: penjadwalan dispatch nyata (OPEN-11) tidak diimplementasikan.
 */
const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {
    setPartnerStatus(state, action: PayloadAction<{ partnerId: string; status: CourierPartnerStatus }>) {
      const partner = state.partners.find((p) => p.id === action.payload.partnerId)
      if (partner) partner.status = action.payload.status
    },
    /** Dispatch mengirim assignment; kurir ter-reserve sampai responden. */
    sendAssignment(state, action: PayloadAction<{ orderId: string; partnerId: string }>) {
      const partner = state.partners.find((p) => p.id === action.payload.partnerId)
      if (partner) partner.status = 'reserved'
      state.assignments.unshift({
        id: `assign-${state.assignments.length + 1}-${Date.now()}`,
        orderId: action.payload.orderId,
        partnerId: action.payload.partnerId,
        status: 'pending',
        sentAt: new Date().toISOString(),
      })
    },
    /** Approve: kurir jadi busy sampai order selesai (§9.3). */
    approveAssignment(state, action: PayloadAction<{ id: string }>) {
      const assignment = state.assignments.find((a) => a.id === action.payload.id)
      if (!assignment || assignment.status !== 'pending') return
      assignment.status = 'approved'
      assignment.respondedAt = new Date().toISOString()
      const partner = state.partners.find((p) => p.id === assignment.partnerId)
      if (partner) partner.status = 'busy'
    },
    /** Reject wajib ber-alasan (COU-18); reservasi dilepas (§9.5). */
    rejectAssignment(state, action: PayloadAction<{ id: string; reason: string }>) {
      const assignment = state.assignments.find((a) => a.id === action.payload.id)
      if (!assignment || assignment.status !== 'pending') return
      if (!action.payload.reason.trim()) return
      assignment.status = 'rejected'
      assignment.rejectReason = action.payload.reason
      assignment.respondedAt = new Date().toISOString()
      const partner = state.partners.find((p) => p.id === assignment.partnerId)
      if (partner) partner.status = 'available'
    },
    /**
     * Prepare habis tanpa respons (COU-17, §9.5): assignment `expired`, mitra
     * **offline**, dan order dilempar ke **pengganti**. Di produksi dipicu BE
     * (`expire_assignments()`), bukan tombol kurir — layar kurir hanya
     * menampilkan akibatnya. SP tidak dijatuhkan di sini: penerbitnya masih
     * UNRESOLVED (OPS-10) sehingga pemanggil memakai `issueWarningLetter`
     * terpisah, persis seperti dua aktor di flow `f26` Q06.
     *
     * ponytail: pemilihan pengganti di sini hanya "mitra lain yang tidak offline
     * dan tidak busy". Aturan antrean (idle terlama, batas jarak, tie-break)
     * milik `dispatch_courier()` (§9.4, OPEN-11) dan tidak boleh diputuskan FE.
     */
    expireAssignment(state, action: PayloadAction<{ id: string }>) {
      const assignment = state.assignments.find((a) => a.id === action.payload.id)
      if (!assignment || assignment.status !== 'pending') return
      assignment.status = 'expired'
      assignment.respondedAt = new Date().toISOString()
      const partner = state.partners.find((p) => p.id === assignment.partnerId)
      if (partner) partner.status = 'offline'
      const replacement = state.partners.find(
        (p) => p.id !== assignment.partnerId && p.status !== 'offline' && p.status !== 'busy',
      )
      if (!replacement) return
      replacement.status = 'reserved'
      assignment.replacedBy = replacement.id
      state.assignments.unshift({
        id: `assign-${state.assignments.length + 1}-${Date.now()}`,
        orderId: assignment.orderId,
        partnerId: replacement.id,
        status: 'pending',
        sentAt: new Date().toISOString(),
      })
    },
    /** SP kurir partner (COU-17, OPS-10); tercatat sebagai punishment (§18). */
    issueWarningLetter(state, action: PayloadAction<{ partnerId: string }>) {
      const partner = state.partners.find((p) => p.id === action.payload.partnerId)
      if (partner) partner.warningLetters += 1
    },
    /** Ganti daftar mitra dengan kurir partner BE (API menimpa mock bila ada). */
    replacePartners(state, action: PayloadAction<CourierPartner[]>) {
      state.partners = action.payload
    },
  },
})

export const {
  setPartnerStatus,
  sendAssignment,
  approveAssignment,
  rejectAssignment,
  expireAssignment,
  issueWarningLetter,
  replacePartners,
} = partnerSlice.actions
export default partnerSlice.reducer
