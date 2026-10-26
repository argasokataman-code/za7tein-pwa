/**
 * Refund penuh satu order online (§16.6) ↔ tabel `refunds`.
 *
 * Kontrak live (diverifikasi 2026-10-19): `id, order_id, amount_idr, method,
 * status, bank_name, account_number, idempotency_key, created_at, completed_at`.
 * Nominalnya **IDR** (bukan JOD seperti tabel uang lain) — README R-CURR-01 tetap
 * berlaku, tak ada konversi di sini.
 *
 * Baca/tulis memakai sesi **CS** (`refToken`): RLS `refunds` hanya membuka tulis
 * untuk peran ops (customer & merchant ditolak 403). Nominal di BE **IDR**.
 * `method` dan `status` di D1 bertipe TEXT tanpa CHECK: probe `POST /rest/v1/refunds`
 * ber-`method:'bank'` menjawab 201, jadi cabang BI-FAST tersimpan apa adanya.
 * `idempotency_key` unik per order+metode+nominal supaya retry tak menambah baris.
 * Semua tulis best-effort.
 */
import { jodToIdr } from '../data/currency'
import { DEMO_CUSTOMER_ID, ensureCustomerToken } from './orders'
import { refToken } from './reference'
import { apiEnabled, createWith, restWith } from './supabase'
import type { Refund, RefundMethod, RefundStatus } from '../types'

interface RefundRow {
  id: number
  order_id: number
  amount_idr: number
  method: string | null
  status: string | null
  bank_name: string | null
  account_number: string | null
  created_at: string
  completed_at: string | null
}

/** Nilai `refunds.method` ↔ `RefundMethod` UI. BE baru menerima `dana`. */
const OUT_METHOD: Record<RefundMethod, string> = { dana: 'dana', bank: 'bank' }
const IN_METHOD: Record<string, RefundMethod> = { dana: 'dana', bank: 'bank' }

/** Status BE ↔ UI; nilai tak dikenal jatuh ke `pending_refund`. */
const IN_STATUS: Record<string, RefundStatus> = {
  pending: 'pending_refund',
  pending_refund: 'pending_refund',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
}

function toRefund(row: RefundRow): Refund {
  return {
    id: `be-rf-${row.id}`,
    orderId: String(row.order_id),
    amountIdr: row.amount_idr,
    method: IN_METHOD[row.method ?? ''] ?? 'dana',
    status: IN_STATUS[row.status ?? ''] ?? 'pending_refund',
    bankName: row.bank_name ?? undefined,
    bankAccount: row.account_number ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  }
}

/** Refund terbaru satu order; `undefined` kalau belum ada barisnya. */
export async function fetchOrderRefund(orderId: string): Promise<Refund | undefined> {
  if (!apiEnabled) return undefined
  const oid = Number(orderId)
  if (!Number.isFinite(oid)) return undefined
  const token = await refToken()
  const rows = await restWith<RefundRow>(
    token,
    'refunds',
    `?select=*&order_id=eq.${oid}&order=id.desc&limit=1`,
  )
  return rows[0] ? toRefund(rows[0]) : undefined
}

/** Ajukan refund penuh. Best-effort: kembalikan baris yang tersimpan bila ada. */
export async function createRefund(input: {
  orderId: string
  amountIdr: number
  method: RefundMethod
  bankName?: string
  bankAccount?: string
}): Promise<Refund | undefined> {
  if (!apiEnabled) return undefined
  const oid = Number(input.orderId)
  if (!Number.isFinite(oid)) return undefined
  const token = await refToken()
  await createWith(token, 'refunds', {
    order_id: oid,
    amount_idr: input.amountIdr,
    method: OUT_METHOD[input.method],
    status: 'pending',
    bank_name: input.method === 'bank' ? (input.bankName ?? null) : null,
    account_number: input.method === 'bank' ? (input.bankAccount ?? null) : null,
    // Kunci idempoten: satu refund per order+metode+nominal, jadi tap ganda
    // atau retry setelah offline tidak menambah baris kedua (NFR-01).
    idempotency_key: `refund-${oid}-${OUT_METHOD[input.method]}-${input.amountIdr}`,
  })
  return fetchOrderRefund(input.orderId)
}

/**
 * Order online terbaru milik customer demo — sasaran refund kalau layar tak
 * diberi `?order=`. `code` mempersempit ke satu order yang disebut tautan, jadi
 * refund tidak jatuh ke order lain saat customer punya beberapa order.
 * ponytail: demo shortcut; begitu semua tautan refund membawa kode order, jalur
 * "terbaru" bisa dihapus.
 */
export async function fetchLatestRefundableOrder(code?: string): Promise<
  { id: string; code: string; amountIdr: number; method: RefundMethod | null } | undefined
> {
  if (!apiEnabled) return undefined
  const token = await ensureCustomerToken()
  const filter = code ? `&code=eq.${encodeURIComponent(code)}` : ''
  const rows = await restWith<{
    id: number
    code: string
    total_jod: number
    payment_method: string | null
    payment_status: string | null
  }>(
    token,
    'orders',
    `?select=id,code,total_jod,payment_method,payment_status&customer_id=eq.${DEMO_CUSTOMER_ID}${filter}&order=created_at.desc&limit=1`,
  )
  const row = rows[0]
  if (!row) return undefined
  // COD tidak lewat refund (§16.6: tunai sudah di tangan kurir).
  const method: RefundMethod | null = row.payment_method === 'cod' ? null : 'dana'
  return { id: String(row.id), code: row.code, amountIdr: jodToIdr(row.total_jod), method }
}
