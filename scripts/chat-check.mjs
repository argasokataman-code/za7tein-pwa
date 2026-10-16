// Self-check aturan group chat per order (M7, PRD §20.1, CUS-26, COU-07).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/chat-check.mjs
import assert from 'node:assert/strict'

import {
  chatParticipants,
  chatStatusFor,
  courierJoinKind,
  courierJoinedInhouse,
  courierJoinedPartner,
  hasChatThread,
} from '../src/data/chat.ts'

const ctx = (over = {}) => ({
  customerName: 'Dimas Ardianto',
  merchantName: 'Warung Sate Pak Ali',
  courierName: 'Budi Santoso',
  batchAssigned: false,
  partnerApproved: false,
  orderState: 'active',
  ...over,
})

const joined = (p) =>
  chatParticipants(p)
    .filter((x) => x.joined)
    .map((x) => x.role)

// Chat dibuka saat order dibuat: peserta awal customer + merchant, kurir BELUM.
assert.deepEqual(joined(ctx()), ['customer', 'merchant'])

// Kurir inhouse gabung setelah batch di-assign.
assert.deepEqual(joined(ctx({ batchAssigned: true })), ['customer', 'merchant', 'kurir'])

// Kurir partner gabung setelah assignment di-approve.
assert.deepEqual(joined(ctx({ partnerApproved: true })), ['customer', 'merchant', 'kurir'])

// Kurir yang belum gabung tetap punya slot, tapi ditandai belum masuk.
const belum = chatParticipants(ctx()).find((p) => p.role === 'kurir')
assert.equal(belum?.joined, false)

// Satu thread per order: daftar peserta selalu tiga peran, tidak menumpuk.
assert.equal(chatParticipants(ctx({ batchAssigned: true })).length, 3)

// Status thread: batal/tolak menutup langsung; selesai menutup (durasi OPEN-20).
assert.deepEqual(chatStatusFor('active'), { status: 'open' })
assert.deepEqual(chatStatusFor('done'), { status: 'closed', reason: 'completed' })
assert.deepEqual(chatStatusFor('cancelled'), { status: 'closed', reason: 'cancelled' })

// Batch belum di-assign (courierId null) = kurir belum memegang order.
assert.equal(courierJoinedInhouse(null), false)
assert.equal(courierJoinedInhouse({ courierId: null, orderIds: ['o-1'] }), false)

// Batch di-assign: hanya order yang ada di batch itu yang punya kurir.
assert.equal(courierJoinedInhouse({ courierId: 'cr-1', orderIds: ['o-1'] }, 'o-1'), true)
assert.equal(courierJoinedInhouse({ courierId: 'cr-1', orderIds: ['o-1'] }, 'o-2'), false)

// Tanpa id order (layar demo), batch ter-assign sudah cukup.
assert.equal(courierJoinedInhouse({ courierId: 'cr-1', orderIds: ['o-1'] }), true)

// Partner: hanya `approved` yang membuat kurir masuk thread.
assert.equal(courierJoinedPartner([]), false)
assert.equal(courierJoinedPartner([{ status: 'pending' }, { status: 'rejected' }]), false)
assert.equal(courierJoinedPartner([{ status: 'pending' }, { status: 'approved' }]), true)

// Jalur masuk kurir ditentukan jenis pengantaran, bukan ditebak.
assert.equal(courierJoinKind('regular'), 'inhouse')
assert.equal(courierJoinKind('quick'), 'partner')
assert.equal(courierJoinKind(undefined), null)

// Thread tidak ada sebelum order dibuat.
assert.equal(hasChatThread(null, null), false)
assert.equal(hasChatThread({ id: '9' }, null), true)
assert.equal(hasChatThread(null, 9), true)

console.log('chat-check: OK')
