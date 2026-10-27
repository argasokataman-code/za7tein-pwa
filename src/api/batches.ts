/**
 * Batch kurir inhouse ↔ tabel `batches` D1 (baca **dan** tulis).
 *
 * Tabelnya diekspos Worker (`GET/POST/PATCH/DELETE /rest/v1/batches`) dan
 * `orders.batch_id` menyimpan keanggotaan order. Panel batch menulis lewat
 * modul ini supaya susunan batch (anggota, kurir, status) tetap ada saat
 * merchant pindah perangkat atau memuat ulang halaman — sebelumnya batch hanya
 * hidup di Redux/localStorage sehingga hilang di perangkat lain.
 */
import { BATCH_COUNTDOWN_SECONDS } from '../data/batch'
import type { Batch, BatchStatus, MerchantOrder } from '../types'
import { DEMO_MERCHANT_ID, ensureCourierToken, ensureMerchantToken } from './orders'
import { createWithReturn, patch, rest } from './supabase'

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
  closed: 'closed',
  assigned: 'assigned',
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

/** Status batch FE → nilai `batches.status` D1 (tanpa constraint; bebas nilai). */
const BATCH_STATUS_TO_DB: Record<BatchStatus, string> = {
  countdown: 'prepare',
  awaiting_courier: 'prepare',
  assigned: 'prepare',
  closed: 'closed',
  delivering: 'delivering',
  done: 'done',
}

/** `api-839` → `839`; id seed non-numerik → `NaN` (dilewati). */
const numericOrderId = (id: string) => Number(String(id).replace(/\D/g, ''))

export interface NewBatchInput {
  orderIds: string[]
  estimateMinutes: number
  merchantId?: number | string
}

/**
 * Buat batch di BE dan kembalikan id-nya (angka, dipakai sebagai id FE supaya
 * dua perangkat menunjuk baris yang sama). `null` = gagal; pemanggil memakai
 * id lokal sebagai cadangan.
 */
export async function createBatchOnBe({
  orderIds,
  estimateMinutes,
  merchantId = DEMO_MERCHANT_ID,
}: NewBatchInput): Promise<number | null> {
  const route = orderIds.map(numericOrderId).filter((id) => Number.isFinite(id))
  try {
    const token = await ensureMerchantToken()
    const rows = await createWithReturn<BatchRow>(token, 'batches', {
      merchant_id: Number(String(merchantId).replace(/\D/g, '')) || 1,
      courier_id: null,
      status: BATCH_STATUS_TO_DB.countdown,
      route: JSON.stringify(route),
      order_count: orderIds.length,
      eta_delivery_seconds: estimateMinutes * 60,
    })
    return rows?.[0]?.id ?? null
  } catch {
    return null
  }
}

/** Tulis perubahan batch ke BE (best-effort; UI tidak menunggu jaringan). */export async function patchBatchOnBe(
  batchId: string,
  patchRow: { courierId?: string | null; status?: BatchStatus; orderIds?: string[] },
): Promise<void> {
  const id = numericOrderId(batchId)
  if (!Number.isFinite(id)) return
  const body: Record<string, unknown> = {}
  if (patchRow.status) body.status = BATCH_STATUS_TO_DB[patchRow.status]
  if (patchRow.courierId !== undefined) {
    const cid = patchRow.courierId === null ? null : Number(String(patchRow.courierId).replace(/\D/g, ''))
    body.courier_id = Number.isFinite(cid) ? cid : null
  }
  if (patchRow.orderIds) {
    body.route = JSON.stringify(patchRow.orderIds.map(numericOrderId).filter(Number.isFinite))
    body.order_count = patchRow.orderIds.length
  }
  if (!Object.keys(body).length) return
  try {
    const token = await ensureMerchantToken()
    await patch(token, 'batches', `?id=eq.${id}`, body)
  } catch {
    /* best-effort */
  }
}

/** `sub` JWT = id user BE; `couriers.user_id` memakainya, bukan `couriers.id`. */
function jwtSubject(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return Number(payload?.sub)
  } catch {
    return NaN
  }
}

/**
 * Batch yang ditugaskan ke **kurir yang sedang masuk**: baris `batches` milik
 * `couriers.user_id = sub` yang belum `done`, terbaru dulu. Merchant menulis
 * baris ini (`createBatchOnBe` / `patchBatchOnBe`), jadi kurir membaca tugas
 * nyata — bukan batch seed. `null` = belum ada penugasan (atau BE mati).
 */
export async function fetchCourierBatch(): Promise<Batch | null> {
  const token = await ensureCourierToken()
  const uid = jwtSubject(token)
  if (!Number.isFinite(uid)) return null
  const couriers = await rest<{ id: number }>('couriers', `?select=id&user_id=eq.${uid}&limit=1`)
  const courierId = couriers[0]?.id
  if (!courierId) return null
  const rows = await rest<BatchRow>(
    'batches',
    `?select=id,merchant_id,courier_id,status,eta_prepare_seconds,eta_delivery_seconds,sla_prepare_deadline,route,order_count,created_at&courier_id=eq.${courierId}&status=neq.done&order=id.desc&limit=1`,
  )
  return rows[0] ? toMerchantBatch(rows[0], []) : null
}

/** Kurir menekan "Mulai antar" → status batch di BE ikut berubah. */
export async function startBatchOnBe(batchId: string): Promise<void> {
  const token = await ensureCourierToken()
  const id = numericOrderId(batchId)
  if (!Number.isFinite(id)) return
  try {
    await patch(token, 'batches', `?id=eq.${id}`, { status: BATCH_STATUS_TO_DB.delivering })
  } catch {
    /* best-effort */
  }
}
