import type { Batch, BatchStatus, MerchantOrder } from '../types'

/**
 * Aturan batch kurir inhouse (PRD §8, BR-B01..B13). Fungsi murni, tanpa React —
 * dipakai konsol merchant untuk membuat/mengisi batch dan ditahan oleh
 * `scripts/batch-check.mjs`. Repo ini mock: hitung mundur hanya nilai yang
 * ditampilkan, bukan penghitung nyata yang berjalan (AGENTS.md §1).
 */

/** Batas keras jumlah order per batch (BR-B04). Tidak bisa diperpanjang. */
export const MAX_BATCH_ORDERS = 24

/** Estimasi hitung mundur batch baru, detik. Nilai demo, bukan angka PRD. */
export const BATCH_COUNTDOWN_SECONDS = 25 * 60

export const BATCH_STATUS_LABEL: Record<BatchStatus, string> = {
  countdown: 'Hitung mundur',
  closed: 'Ditutup lebih awal',
  awaiting_courier: 'Menunggu kurir',
  assigned: 'Kurir ditugaskan',
  delivering: 'Dalam pengantaran',
  done: 'Selesai',
}

/** Tahap kerja batch di layar merchant, urut dari lahir sampai tuntas. */
export type BatchTabId = 'countdown' | 'waiting' | 'assigned' | 'delivering' | 'done'

/** Filter daftar batch: satu tahap, atau semua tahap sekaligus. */
export type BatchTabFilter = 'all' | BatchTabId

/**
 * Tab daftar batch. `Semua` ada karena tab tahap saja bisa membuat layar
 * tampak kosong padahal batchnya ada (mis. semua batch sudah lewat tahap
 * Hitung mundur): pemilik melihat "0 / 0 / 0 / 0 / 22" lalu menyangka
 * kategorinya kurang. Tab tahap tetap ada sebagai saringan kerja.
 */
export const BATCH_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'countdown', label: 'Hitung mundur' },
  { id: 'waiting', label: 'Menunggu kurir' },
  { id: 'assigned', label: 'Ditugaskan' },
  { id: 'delivering', label: 'Diantar' },
  { id: 'done', label: 'Selesai' },
] as const satisfies readonly { id: BatchTabFilter; label: string }[]

/** Batch yang masih boleh menerima order baru: hitung mundur berjalan & belum penuh. */
export function joinableBatches(batches: Batch[]): Batch[] {
  return batches.filter(
    (batch) => batch.status === 'countdown' && batch.orderIds.length < MAX_BATCH_ORDERS,
  )
}

export function batchIsFull(batch: Batch): boolean {
  return batch.orderIds.length >= MAX_BATCH_ORDERS
}

/** Sisa kapasitas batch; 0 saat penuh (BR-B04). */
export function batchCapacityLeft(batch: Batch): number {
  return Math.max(0, MAX_BATCH_ORDERS - batch.orderIds.length)
}

/** Hitung mundur ringkas: `25 mnt`, `1 j 05 m`, atau `selesai`. */
export function countdownLabel(seconds: number): string {
  if (seconds <= 0) return 'selesai'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} mnt`
  const hours = Math.floor(minutes / 60)
  return `${hours} j ${String(minutes % 60).padStart(2, '0')} m`
}

/** Order batch yang benar-benar ada di state (batch bisa menyebut id yang sudah hilang). */
export function batchOrders(batch: Batch, orders: MerchantOrder[]): MerchantOrder[] {
  return orders.filter((order) => batch.orderIds.includes(order.id))
}

/**
 * Order dianggap sudah packing bila merchant menandainya (`packed`, toggle lokal)
 * **atau** statusnya sudah melewati dapur. BE tidak menyimpan `packed`, tapi order
 * yang sudah `diantar`/`tiba`/`selesai` mustahil tidak dipacking — tanpa turunan
 * ini, order tuntas dari BE tertulis "Belum packing" di kartu batch.
 */
export function orderPacked(order: MerchantOrder): boolean {
  if (order.packed) return true
  return order.status === 'diantar' || order.status === 'tiba' || order.status === 'selesai'
}

/**
 * Order yang sudah dibatalkan/ditolak tidak lagi dikerjakan dapur. Dipakai untuk
 * mengeluarkannya dari hitungan "belum packing" dan syarat mulai lebih awal:
 * order batal tidak butuh packing dan tidak boleh menahan batch.
 */
export function orderCanceled(order: MerchantOrder): boolean {
  return order.status === 'batal' || order.status === 'ditolak'
}

/** Semua order batch sudah ditandai packing (syarat mulai lebih awal, BR-B09). */
export function batchAllPacked(batch: Batch, orders: MerchantOrder[]): boolean {
  const list = batchOrders(batch, orders)
  return list.length > 0 && list.every((order) => orderCanceled(order) || orderPacked(order))
}

/**
 * Batch boleh mulai lebih awal bila sudah ditutup lebih awal **dan** semua
 * ordernya selesai packing (BR-B09). Tanpa keduanya, kurir menunggu hitung
 * mundur selesai.
 */
export function canStartEarly(batch: Batch, orders: MerchantOrder[]): boolean {
  return batch.status === 'closed' && batchAllPacked(batch, orders)
}

/**
 * Nomor tampilan batch, dibaca dari idnya (`batch-3` atau `3` → `3`) supaya
 * stabil walau urutan array berubah. D1 memakai id numerik, state lokal memakai
 * `batch-N`; keduanya harus terbaca. `null` bila id bukan angka.
 */
export function batchNumber(batchId: string | undefined): number | null {
  const match = /^(?:batch-)?(\d+)$/.exec(String(batchId ?? ''))
  return match ? Number(match[1]) : null
}

/**
 * Batch selesai = semua ordernya sudah `selesai`. Status tersimpan batch berhenti
 * di `delivering` (tidak ada penulis `done` di slice merchant), jadi keadaan
 * selesai ini **turunan** dari order, bukan kolom.
 */
export function batchIsDone(batch: Batch, orders: MerchantOrder[]): boolean {
  const list = batchOrders(batch, orders)
  return list.length > 0 && list.every((order) => order.status === 'selesai' || orderCanceled(order))
}

/**
 * Tahap batch untuk tab. `closed` dan `awaiting_courier` satu tab karena
 * keduanya sama-sama menunggu kurir; kartu tetap membawa status aslinya.
 */
export function batchTabId(batch: Batch, orders: MerchantOrder[]): BatchTabId {
  if (batchIsDone(batch, orders) || batch.status === 'done') return 'done'
  if (batch.status === 'closed' || batch.status === 'awaiting_courier') return 'waiting'
  if (batch.status === 'assigned') return 'assigned'
  if (batch.status === 'delivering') return 'delivering'
  return 'countdown'
}

/** Peringkat tahap untuk urutan kerja: yang masih berjalan selalu di atas riwayat. */
const TAB_RANK: Record<BatchTabId, number> = {
  countdown: 0,
  waiting: 1,
  assigned: 2,
  delivering: 3,
  done: 4,
}

/**
 * Urutan daftar batch untuk merchant: tahap aktif dulu (Hitung mundur →
 * Selesai), lalu id terbaru di dalam tahap yang sama.
 *
 * Query BE memakai `order=id.desc`, yaitu urutan pembuatan tanpa melihat
 * tahap, sehingga batch yang masih berjalan bisa mendarat di bawah tumpukan
 * batch riwayat bernomor besar. Urutan tampilan tidak boleh diserahkan ke
 * urutan baris query.
 */
export function sortBatchesForWork(batches: Batch[], orders: MerchantOrder[]): Batch[] {
  return [...batches].sort((a, b) => {
    const rank = TAB_RANK[batchTabId(a, orders)] - TAB_RANK[batchTabId(b, orders)]
    if (rank !== 0) return rank
    return (batchNumber(b.id) ?? -1) - (batchNumber(a.id) ?? -1)
  })
}

export function batchesForTab(
  batches: Batch[],
  orders: MerchantOrder[],
  tab: BatchTabFilter,
): Batch[] {
  if (tab === 'all') return batches
  return batches.filter((batch) => batchTabId(batch, orders) === tab)
}

/** Jumlah order batch yang sudah packing. */
export function batchPackedCount(batch: Batch, orders: MerchantOrder[]): number {
  return batchOrders(batch, orders).filter(orderPacked).length
}

/** Persentase kapasitas batch terisi, dibulatkan; cocok dengan label `n/24 order`. */
export function batchProgress(batch: Batch, orders: MerchantOrder[]): number {
  const list = batchOrders(batch, orders)
  if (list.length === 0) return 0
  return Math.round((list.length / MAX_BATCH_ORDERS) * 100)
}

/** Id batch baru: nomor bebas terkecil, supaya tak menabrak batch yang ada. */
export function nextBatchId(batches: Batch[]): string {
  const taken = new Set(batches.map((batch) => batch.id))
  let n = 1
  while (taken.has(`batch-${n}`)) n += 1
  return `batch-${n}`
}
