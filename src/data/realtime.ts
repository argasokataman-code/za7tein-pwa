/**
 * Katalog event realtime + matriks audiens (PRD aktif `sa7tein-mvp-2026-10-11`
 * §19, NFR-05/06, ARC-08). Fungsi murni: "event apa ke siapa" tinggal di sini
 * supaya seluruh baris §19 bisa diuji tanpa browser.
 *
 * **Nama event tidak dikarang.** §19 memakai label Indonesia dan tidak menetapkan
 * nama event; kontrak snake_case baru muncul di kolom event `analysis.md`. Jadi
 * kunci baris di sini adalah **label §19 apa adanya**, dan `kontrak` hanya diisi
 * kalau namanya benar-benar terdokumentasi (kalau tidak: `undefined`).
 *
 * Matriks §19 sendiri ditulis sebagai **Usulan untuk divalidasi bersama ERD** —
 * jadi ini catatan kebutuhan, bukan kontrak final BE.
 *
 * Kolom `ops` di §19 **bukan** audience `cs` inbox (panel CS /admin): §19 memakai
 * istilah Ops untuk aplikator internal (M10). Pemetaan keduanya belum diputuskan.
 */

/** Kolom audiens §19. `others` = "customer lain" (bisa banyak penerima). */
export type RealtimeAudience = 'customer' | 'merchant' | 'courier' | 'ops' | 'others'

export interface RealtimeRow {
  /** Label baris §19 apa adanya — sengaja bukan slug buatan sendiri. */
  label: string
  /** Pihak yang menerima event ini (§19). */
  audience: RealtimeAudience[]
  /** Kualifikasi dari sel matriks (mis. "ETA", "bila terlibat"). */
  catatan?: Partial<Record<RealtimeAudience, string>>
  /** Nama snake_case yang **terdokumentasi**; kosong = belum ada, jangan dikarang. */
  kontrak?: string
}

/** Versi kontrak pesan WebSocket (NFR-06) — satu tempat, dipakai URL socket. */
export const WS_MESSAGE_VERSION = '1.0.0'

/** Prefiks topik Phoenix; topik sebenarnya = `${WS_TOPIC_PREFIX}${topik}`. */
export const WS_TOPIC_PREFIX = 'realtime:public:'

/**
 * Topik yang **dilanggan kode saat ini**. Harus himpunan bagian dari daftar topik
 * di `docs/design/flows/INDEX.json` (`contract.realtime.topics`) — diuji
 * `scripts/realtime-check.mjs`, supaya dokumen dan kode tak bisa melenceng.
 */
export const WS_SUBSCRIBED_TOPICS = ['orders'] as const

export const REALTIME_ROWS: RealtimeRow[] = [
  {
    label: 'Order dibuat dan dibayar',
    audience: ['customer', 'merchant'],
  },
  {
    label: 'Order dibatalkan atau ditolak',
    audience: ['customer', 'merchant'],
  },
  {
    label: 'Order di-accept, beserta estimasi batch atau estimasi prepare',
    audience: ['customer', 'merchant', 'courier'],
  },
  {
    label: 'Order masuk batch; urutan rute berubah',
    audience: ['customer', 'merchant', 'courier'],
    catatan: { customer: 'ETA' },
  },
  {
    label: 'Order selesai di-packing',
    audience: ['customer', 'merchant', 'courier'],
  },
  {
    label: 'Batch di-assign, ditutup, hitung mundur selesai, atau masuk status tunggu',
    audience: ['customer', 'merchant', 'courier'],
    catatan: { customer: 'customer di batch' },
  },
  {
    label: 'Permintaan dan persetujuan mulai lebih awal',
    audience: ['merchant', 'courier'],
  },
  {
    label: 'Delivery dimulai; lokasi kurir; kurir hampir sampai',
    audience: ['customer', 'merchant', 'courier'],
    kontrak: 'courier_location',
  },
  {
    label: 'Order selesai; payout; refund; pending refund',
    audience: ['customer', 'merchant', 'courier', 'ops'],
    catatan: { customer: 'refund', merchant: 'payout', courier: 'payout' },
  },
  {
    label: 'Pesan chat',
    audience: ['customer', 'merchant', 'courier'],
    kontrak: 'chat_message',
  },
  {
    label: 'Dispute dibuka atau diputus',
    audience: ['customer', 'merchant', 'courier', 'ops'],
    catatan: { customer: 'bila terlibat', merchant: 'bila terlibat', courier: 'bila terlibat' },
  },
  {
    label: 'SP diterbitkan',
    audience: ['courier', 'ops'],
    catatan: { courier: 'kurir partner' },
    kontrak: 'sp_issued',
  },
  {
    label: 'Merchant buka atau tutup; tersembunyi/tampil kembali karena kuota',
    audience: ['merchant', 'others'],
  },
  {
    label: 'Ketersediaan menu, variant, atau nilai attribute berubah',
    audience: ['merchant', 'others'],
  },
  {
    label: 'Rating atau review baru',
    audience: ['merchant', 'others'],
  },
  {
    label: 'Ketersediaan Quick berubah',
    audience: ['ops', 'others'],
    catatan: { others: 'yang punya cart' },
  },
  {
    label: 'Kurs harian diperbarui',
    audience: ['ops', 'others'],
    catatan: { others: 'yang punya cart' },
  },
  {
    label: 'Program marketing baru atau berubah',
    audience: ['merchant', 'ops', 'others'],
    catatan: { merchant: 'pemilik program' },
  },
  {
    label: 'Merchant baru meng-cover alamat default',
    audience: ['others'],
    catatan: { others: 'customer terkait' },
  },
  {
    label: 'Kuota order atau kuota order COD menipis atau habis',
    audience: ['merchant', 'ops'],
    kontrak: 'quota_consumed',
  },
  {
    label: 'Usulan tag disetujui atau ditolak',
    audience: ['merchant', 'ops'],
  },
  {
    label: 'Kurir partner approve, reject, atau tidak merespons assignment',
    audience: ['customer', 'merchant', 'courier', 'ops'],
    catatan: { customer: 'status', courier: 'kurir partner terkait' },
  },
]

/**
 * Audiens satu baris §19. `null` = label itu **tidak ada** di katalog: lebih baik
 * kelihatan daripada diam-diam dianggap tak berhak (A6).
 */
export function eventAudience(label: string): RealtimeAudience[] | null {
  const row = REALTIME_ROWS.find((r) => r.label === label)
  return row ? row.audience : null
}

/** Baris §19 yang memang sampai ke peran ini. */
export function eventsFor(audience: RealtimeAudience): RealtimeRow[] {
  return REALTIME_ROWS.filter((r) => r.audience.includes(audience))
}
