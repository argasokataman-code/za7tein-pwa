// Self-check aturan kurir partner (M6, PRD §9.3/§9.5, COU-15..18, §18).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/partner-check.mjs
// Tanpa framework: assert pertama yang gagal sudah menunjuk komponennya.
import assert from 'node:assert/strict'

import reducer, {
  approveAssignment,
  expireAssignment,
  hydratePartnerBoard,
  issueWarningLetter,
  rejectAssignment,
} from '../src/store/slices/partnerSlice.ts'
import { PARTNER_SELF_ID, mockAssignments, mockCourierPartners } from '../src/data/marketplace.ts'
import {
  sqlIso,
  toAssignment,
  toAssignmentStatus,
  toPartner,
} from '../src/api/partner.ts'

const seed = () => ({ partners: mockCourierPartners, assignments: mockAssignments })
const self = PARTNER_SELF_ID
const partnerOf = (state, id = self) => state.partners.find((p) => p.id === id)
const pendingOf = (state, id = self) =>
  state.assignments.filter((a) => a.partnerId === id && a.status === 'pending')

// Seed: satu assignment menunggu untuk "aku", plus dua mitra lain (satu busy).
assert.equal(pendingOf(seed()).length, 1)
assert.equal(partnerOf(seed()).status, 'available')

// Reject tanpa alasan = tidak dijalankan (COU-18): status & reservasi tak berubah.
const emptyReason = reducer(seed(), rejectAssignment({ id: 'assign-1', reason: '   ' }))
assert.equal(emptyReason.assignments[0].status, 'pending', 'alasan kosong tak menolak assignment')
assert.equal(partnerOf(emptyReason).status, 'available')

// Reject ber-alasan: tercatat + reservasi dilepas (§9.5).
const rejected = reducer(seed(), rejectAssignment({ id: 'assign-1', reason: 'di luar radius' }))
assert.equal(rejected.assignments[0].status, 'rejected')
assert.equal(rejected.assignments[0].rejectReason, 'di luar radius')
assert.ok(rejected.assignments[0].respondedAt, 'waktu respons tercatat')
assert.equal(partnerOf(rejected).status, 'available', 'reservasi dilepas saat menolak')

// Approve: kurir jadi busy dan tak ada assignment kedua (COU-15 satu order per waktu).
const approved = reducer(seed(), approveAssignment({ id: 'assign-1' }))
assert.equal(approved.assignments[0].status, 'approved')
assert.equal(partnerOf(approved).status, 'busy')
assert.equal(pendingOf(approved).length, 0, 'satu order per waktu: tak ada pending kedua')

// SP (COU-17, §18) tercatat sebagai punishment.
const warned = reducer(seed(), issueWarningLetter({ partnerId: self }))
assert.equal(partnerOf(warned).warningLetters, partnerOf(seed()).warningLetters + 1)

// Q06 tanpa respons: kedaluwarsa + mitra offline + pengganti ter-reserve.
const expired = reducer(seed(), expireAssignment({ id: 'assign-1' }))
assert.equal(expired.assignments.find((a) => a.id === 'assign-1').status, 'expired')
assert.ok(expired.assignments.find((a) => a.id === 'assign-1').respondedAt)
assert.equal(partnerOf(expired).status, 'offline', 'mangkir → status off (§9.5)')
const replacement = expired.assignments.find((a) => a.partnerId !== self)
assert.ok(replacement, 'order dilempar ke pengganti')
assert.equal(replacement.orderId, 'ord-3', 'pengganti menangani order yang sama')
assert.equal(replacement.status, 'pending')
assert.equal(expired.assignments.find((a) => a.id === 'assign-1').replacedBy, replacement.partnerId)
assert.equal(partnerOf(expired, replacement.partnerId).status, 'reserved', 'pengganti ter-reserve')
assert.equal(pendingOf(expired, replacement.partnerId).length, 1)

// Tanpa kandidat pengganti: assignment tetap kedaluwarsa, mitra tetap off, tak ada
// order yang berpindah tangan (jalur sisa = Q10/P5, bukan ditebak di FE).
const noCandidateSeed = seed()
const noCandidate = reducer(
  {
    partners: noCandidateSeed.partners.map((p) =>
      p.id === self ? p : { ...p, status: 'busy' },
    ),
    assignments: noCandidateSeed.assignments,
  },
  expireAssignment({ id: 'assign-1' }),
)
assert.equal(noCandidate.assignments.length, 1, 'tak ada pengganti → tak ada assignment baru')
assert.equal(noCandidate.assignments[0].replacedBy, undefined)
assert.equal(partnerOf(noCandidate).status, 'offline')

// Assignment yang sudah direspons tak bisa kedaluwarsa lagi (guard).
const twice = reducer(approved, expireAssignment({ id: 'assign-1' }))
assert.equal(twice.assignments[0].status, 'approved', 'assignment final tak berubah')

// — Pemetaan BE ↔ layar (src/api/partner.ts) —
// `reserved` = menunggu respons; status asing tidak ditampilkan sebagai pending.
assert.equal(toAssignmentStatus('reserved'), 'pending')
assert.equal(toAssignmentStatus('approved'), 'approved')
assert.equal(toAssignmentStatus('lain'), null)
assert.equal(sqlIso('2026-10-20 01:38:44'), '2026-10-20T01:38:44Z')
assert.equal(sqlIso(null), null)
assert.equal(sqlIso('2026-10-20T01:38:44.000Z'), '2026-10-20T01:38:44.000Z')

const beRow = {
  id: 7,
  user_id: 28,
  name: 'Rani Saputra',
  phone: '+962790000001',
  availability: 'unavailable',
  active_order_count: 2,
  last_seen_at: '2026-10-20 01:00:00',
  created_at: '2026-10-01 00:00:00',
}
const mappedPartner = toPartner(beRow, 2, true)
assert.equal(mappedPartner.id, '7')
assert.equal(mappedPartner.status, 'reserved', 'ada assignment menunggu → reserved')
assert.equal(mappedPartner.activeOrders, 2, 'active_order_count = order aktif, bukan selesai')
assert.equal(mappedPartner.warningLetters, 2, 'SP aktif dari punishments')
assert.equal(toPartner(beRow, 0, false).status, 'offline', 'unavailable → offline')

const mappedAssignment = toAssignment({
  id: 9,
  order_id: 42,
  courier_id: 7,
  status: 'rejected',
  reject_reason: 'di luar radius',
  reserved_at: '2026-10-20 01:00:00',
  responded_at: '2026-10-20 01:02:00',
})
assert.deepEqual(mappedAssignment, {
  id: '9',
  orderId: '42',
  partnerId: '7',
  status: 'rejected',
  sentAt: '2026-10-20T01:00:00Z',
  respondedAt: '2026-10-20T01:02:00Z',
  rejectReason: 'di luar radius',
})
assert.equal(
  toAssignment({
    id: 1,
    order_id: 1,
    courier_id: 7,
    status: 'aneh',
    reject_reason: null,
    reserved_at: null,
    responded_at: null,
  }),
  null,
)

// Board BE menimpa mock: identitas sesi + assignment nyata, mock dibuang.
const hydrated = reducer(
  seed(),
  hydratePartnerBoard({ partner: mappedPartner, assignments: [mappedAssignment] }),
)
assert.equal(hydrated.selfId, '7')
assert.equal(hydrated.assignments.length, 1)
assert.equal(hydrated.assignments[0].orderId, '42')
assert.equal(partnerOf(hydrated, '7').status, 'reserved')

console.log('partner-check: OK')
