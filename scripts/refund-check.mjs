// Self-check logika status refund tanpa browser.
//
// Kenapa ada: layar refund memakai `pending_refund` untuk "belum dikirim",
// sementara BE menyimpan `pending` untuk "sudah terkirim". Kalau nilai BE dipakai
// balik, form terbuka lagi dan refund bisa dikirim dua kali (idempotency_key
// mencegah baris ganda, tapi UX-nya tetap salah).
import assert from 'node:assert/strict'

import { savedRefundStatus } from '../src/data/refund.ts'

// Sudah terkirim (BE `pending` → `pending_refund` di layar) tidak boleh membuka form.
assert.equal(savedRefundStatus('pending_refund'), 'processing')

// Status yang sudah maju dipertahankan.
assert.equal(savedRefundStatus('processing'), 'processing')
assert.equal(savedRefundStatus('completed'), 'completed')

// Status di luar tiga langkah (`failed`) tidak boleh menunjuk langkah -1.
assert.equal(savedRefundStatus('failed'), 'processing')

console.log('refund-check OK')
