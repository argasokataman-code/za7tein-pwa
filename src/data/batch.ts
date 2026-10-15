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

/** Semua order batch sudah ditandai packing (syarat mulai lebih awal, BR-B09). */
export function batchAllPacked(batch: Batch, orders: MerchantOrder[]): boolean {
  const list = batchOrders(batch, orders)
  return list.length > 0 && list.every((order) => order.packed)
}

/**
 * Batch boleh mulai lebih awal bila sudah ditutup lebih awal **dan** semua
 * ordernya selesai packing (BR-B09). Tanpa keduanya, kurir menunggu hitung
 * mundur selesai.
 */
export function canStartEarly(batch: Batch, orders: MerchantOrder[]): boolean {
  return batch.status === 'closed' && batchAllPacked(batch, orders)
}

/** Id batch baru: nomor bebas terkecil, supaya tak menabrak batch yang ada. */
export function nextBatchId(batches: Batch[]): string {
  const taken = new Set(batches.map((batch) => batch.id))
  let n = 1
  while (taken.has(`batch-${n}`)) n += 1
  return `batch-${n}`
}
