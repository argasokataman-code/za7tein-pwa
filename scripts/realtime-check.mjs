// Self-check katalog event realtime + kontrak ber-versi (M7, PRD §19, NFR-05/06).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/realtime-check.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  REALTIME_ROWS,
  WS_MESSAGE_VERSION,
  WS_SUBSCRIBED_TOPICS,
  WS_TOPIC_PREFIX,
  eventAudience,
  eventsFor,
} from '../src/data/realtime.ts'

// Matriks §19 punya 22 baris; seluruhnya harus ada di katalog.
assert.equal(REALTIME_ROWS.length, 22, 'katalog harus memuat seluruh 22 baris §19')
const labels = REALTIME_ROWS.map((r) => r.label)
assert.equal(new Set(labels).size, labels.length, 'label §19 tak boleh duplikat')
for (const row of REALTIME_ROWS) {
  assert.ok(row.audience.length > 0, `${row.label}: tiap baris §19 punya minimal satu penerima`)
  for (const catatan of Object.keys(row.catatan ?? {})) {
    assert.ok(
      row.audience.includes(catatan),
      `${row.label}: catatan "${catatan}" harus menempel pada audiens yang menerima`,
    )
  }
}

// A6: event sensitif tidak boleh sampai ke peran yang tak berhak.
assert.deepEqual(eventAudience('SP diterbitkan'), ['courier', 'ops'], 'SP hanya ke kurir (partner) + ops')
assert.ok(!eventAudience('SP diterbitkan').includes('customer'))
assert.deepEqual(eventAudience('Merchant baru meng-cover alamat default'), ['others'])
assert.deepEqual(eventAudience('Permintaan dan persetujuan mulai lebih awal'), ['merchant', 'courier'])
assert.deepEqual(eventAudience('Delivery dimulai; lokasi kurir; kurir hampir sampai'), [
  'customer',
  'merchant',
  'courier',
])
// Tidak ada fans-out ke `others` kecuali yang memang publik (§19: publik = buka/
// tutup, menu, rating, Quick, kurs, program, merchant baru).
const toOthers = REALTIME_ROWS.filter((r) => r.audience.includes('others')).map((r) => r.label)
assert.equal(toOthers.length, 7, 'hanya 7 baris §19 yang menyentuh customer lain')
// Label tak dikenal → null, bukan diam-diam "tak berhak".
assert.equal(eventAudience('event karangan'), null)

// Dua arah: penyaring per peran dan pencarian label harus sepakat.
for (const row of REALTIME_ROWS) {
  for (const audience of row.audience) {
    assert.ok(
      eventsFor(audience).some((r) => r.label === row.label),
      `${row.label}: eventsFor('${audience}') harus memuat baris ini`,
    )
  }
}
assert.ok(!eventsFor('ops').some((r) => r.label === 'Pesan chat'), 'chat bukan urusan ops')
// Jumlah per kolom harus sama dengan tabel §19 (bukti transkrip lengkap, bukan
// cuma "ada beberapa baris").
assert.equal(eventsFor('customer').length, 11)
assert.equal(eventsFor('merchant').length, 18)
assert.equal(eventsFor('courier').length, 11)
assert.equal(eventsFor('ops').length, 9)
assert.equal(eventsFor('others').length, 7)

// A4/NFR-06: versi kontrak pesan, dan kode ⇄ dokumen harus sepakat.
assert.match(WS_MESSAGE_VERSION, /^\d+\.\d+\.\d+$/, 'versi kontrak pesan harus semver')
const index = JSON.parse(readFileSync('docs/design/flows/INDEX.json', 'utf8'))
const contract = index.contract.realtime
assert.ok(contract, 'INDEX.json harus punya blok contract.realtime')
assert.equal(
  contract.message_version,
  WS_MESSAGE_VERSION,
  'versi di kode harus sama dengan versi di dokumen kontrak (NFR-06)',
)
for (const topic of WS_SUBSCRIBED_TOPICS) {
  assert.ok(contract.topics.includes(topic), `topik "${topic}" yang dilanggan harus ada di kontrak`)
}
assert.deepEqual(
  contract.subscribed_now,
  [...WS_SUBSCRIBED_TOPICS],
  'topik yang didaftar di dokumen harus sama dengan yang dilanggan kode',
)
assert.equal(WS_TOPIC_PREFIX, 'realtime:public:', 'prefiks topik Phoenix tak boleh berubah tanpa kontrak')

console.log('realtime-check: OK')
