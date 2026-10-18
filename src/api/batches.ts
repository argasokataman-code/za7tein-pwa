/**
 * Batch kurir inhouse ↔ tabel `batches` D1 (baca saja).
 *
 * Tabelnya sudah diekspos Worker (`GET /rest/v1/batches`) dan `orders.batch_id`
 * menyimpan keanggotaan order. Yang belum ada: endpoint **tulis** — jadi panel
 * batch masih membuat/mengubah batch di Redux (lihat `batchSlice`), dan modul ini
 * hanya **menghidrasi** batch nyata dari BE supaya batch yang ada di D1 kelihatan.
 */
import { BATCH_COUNTDOWN_SECONDS } from '../data/batch'
import type { Batch, BatchStatus, MerchantOrder } from '../types'
import { DEMO_MERCHANT_ID } from './orders'
import { rest } from './supabase'

interface BatchRow {
  id: number
  merchant_id: number
  courier_id: number | null
  status: string
  eta_prepare_seconds: number | null
  eta_delivery_seconds: number | null
  sla_prepare_deadline: string | null
  route: string | null
  order_count: number | null
  created_at: string
}

/**
 * Status batch D1 → status FE. D1 memakai kosakata sendiri (`prepare` sejauh
 * pengamatan) yang tidak sama dengan `BatchStatus`; `prepare` = batch sedang
 * disiapkan/menerima order → `countdown`. Status asing jatuh ke `awaiting_courier`
 * (aman: tidak bisa digabung, tidak menawarkan tutup-lebih-awal).
 */
const BATCH_STATUS_FROM_DB: Record<string, BatchStatus> = {
  prepare: 'countdown',
  delivering: 'delivering',
  done: 'done',
}

/** `route` D1 = JSON array id order numerik (`[838,832,…]`) → id FE (`api-838`). */
function routeOrderIds(row: BatchRow): string[] {
  if (!row.route) return []
  try {
    const parsed: unknown = JSON.parse(row.route)
    return Array.isArray(parsed) ? parsed.map((id) => `api-${String(id)}`) : []
  } catch {
    return []
  }
}

/**
 * `courier_id` BE numerik → id kurir FE. Registri kurir repo ini memakai `cr-N`
 * (`merchant.ts`), jadi angka mentah tak akan pernah cocok dan panel selalu
 * menulis "Kurir belum ditugaskan" padahal batch-nya sudah punya kurir.
 * ponytail: asumsi konvensi `cr-N`; saat endpoint kurir nyata masuk, cocokkan
 * lewat kolom BE-nya, bukan lewat prefiks.
 */
function courierIdFromApi(beId: number | null): string | null {
  return beId == null ? null : `cr-${beId}`
}

/** Sisa hitung mundur dari `sla_prepare_deadline`; deadline belum ada → nilai demo. */
function remainingSeconds(deadline: string | null): number {
  if (!deadline) return BATCH_COUNTDOWN_SECONDS
  const left = Math.round((new Date(deadline).getTime() - Date.now()) / 1000)
  return Number.isFinite(left) ? Math.max(0, left) : BATCH_COUNTDOWN_SECONDS
}

export function toMerchantBatch(row: BatchRow, orders: MerchantOrder[]): Batch {
  const fromRoute = routeOrderIds(row)
  const orderIds =
    fromRoute.length > 0
      ? fromRoute
      : orders.filter((order) => order.batchId === String(row.id)).map((order) => order.id)
  return {
    id: String(row.id),
    merchantId: String(row.merchant_id),
    courierId: courierIdFromApi(row.courier_id),
    orderIds,
    status: BATCH_STATUS_FROM_DB[row.status] ?? 'awaiting_courier',
    estimateMinutes: Math.round((row.eta_delivery_seconds ?? 0) / 60),
    countdownSeconds: remainingSeconds(row.sla_prepare_deadline),
    // Rute D1 adalah hasil auto-sort kurir; `routeOrder` FE hanya urutan manual.
    autoSort: true,
    routeOrder: [],
    createdAt: row.created_at,
  }
}

/**
 * Batch milik satu merchant. `orders` dipakai sebagai cadangan anggota bila
 * `route` kosong — sumber utamanya tetap `orders.batch_id`.
 */
export async function fetchMerchantBatches(
  merchantId: number | string = DEMO_MERCHANT_ID,
  orders: MerchantOrder[] = [],
): Promise<Batch[]> {
  const rows = await rest<BatchRow>(
    'batches',
    `?select=id,merchant_id,courier_id,status,eta_prepare_seconds,eta_delivery_seconds,sla_prepare_deadline,route,order_count,created_at&merchant_id=eq.${merchantId}&order=id.desc`,
  )
  return rows.map((row) => toMerchantBatch(row, orders))
}
