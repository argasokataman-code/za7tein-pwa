/**
 * Langganan kuota merchant (§17) ↔ tabel `quota_subscriptions` + `quota_packages`.
 *
 * Kontrak live (diverifikasi 2026-10-17):
 *  - `quota_subscriptions`: `id, merchant_id, kind, package_id, quota_total,
 *    quota_used, quota_reserved, period_start, period_end, status, created_at`.
 *  - `quota_packages`: `id, kind, label, quota, period, price_jod, active`.
 *
 * Nama jenis BE beda dari UI: BE `order` / `order_cod`, UI `order` / `cod`.
 * `period` BE `day`/`week` → `days` UI (1/7). Baca/tulis lewat sesi merchant
 * (RLS: baris milik merchant sendiri).
 */
import { merchantToken } from './reference'
import { apiEnabled, createWithReturn, restWith } from './supabase'
import type { QuotaKind, QuotaPackage, QuotaSubscription } from '../types'

interface SubscriptionRow {
  id: number
  merchant_id: number
  kind: string
  package_id: number | null
  quota_total: number
  quota_used: number
  quota_reserved: number
  period_start: string
  period_end: string
  status: string
}

interface PackageRow {
  id: number
  kind: string
  label: string
  quota: number
  period: string
  price_jod: number
  active: boolean
}

const IN_KIND: Record<string, QuotaKind> = { order: 'order', order_cod: 'cod' }
const OUT_KIND: Record<QuotaKind, string> = { order: 'order', cod: 'order_cod' }

const PERIOD_DAYS: Record<string, number> = { day: 1, week: 7, month: 30 }

function toSubscription(row: SubscriptionRow): QuotaSubscription {
  return {
    id: `be-q-${row.id}`,
    merchantId: String(row.merchant_id),
    kind: IN_KIND[row.kind] ?? 'order',
    quota: row.quota_total,
    used: row.quota_used,
    reserved: row.quota_reserved,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    active: row.status === 'active',
  }
}

function toPackage(row: PackageRow): QuotaPackage {
  return {
    id: `be-pkg-${row.id}`,
    kind: IN_KIND[row.kind] ?? 'order',
    units: row.quota,
    days: PERIOD_DAYS[row.period] ?? 1,
    priceJod: row.price_jod,
  }
}

/** Langganan kuota satu merchant; baris `active` maupun tidak ikut (status ikut dikirim). */
export async function fetchQuotaSubscriptions(merchantId: string): Promise<QuotaSubscription[]> {
  if (!apiEnabled) return []
  const token = await merchantToken()
  const rows = await restWith<SubscriptionRow>(
    token,
    'quota_subscriptions',
    `?select=*&merchant_id=eq.${merchantId}&order=id.desc`,
  )
  return rows.map(toSubscription)
}

/** Paket kuota yang bisa dibeli (§17). */
export async function fetchQuotaPackages(): Promise<QuotaPackage[]> {
  if (!apiEnabled) return []
  const token = await merchantToken()
  const rows = await restWith<PackageRow>(
    token,
    'quota_packages',
    '?select=*&active=is.true&order=id.asc',
  )
  return rows.map(toPackage)
}

/**
 * Beli satu paket → baris `quota_subscriptions` baru ber-status `active`.
 * Kembalikan langganan tersimpan supaya layar bisa langsung menampilkannya.
 */
export async function purchaseQuotaPackage(input: {
  merchantId: string
  packageId: string
  kind: QuotaKind
  units: number
  days: number
}): Promise<QuotaSubscription | undefined> {
  if (!apiEnabled) return undefined
  const token = await merchantToken()
  const start = new Date()
  const end = new Date(start.getTime() + input.days * 24 * 60 * 60 * 1000)
  const rows = await createWithReturn<SubscriptionRow>(
    token,
    'quota_subscriptions',
    {
      merchant_id: Number(input.merchantId),
      kind: OUT_KIND[input.kind],
      package_id: Number(/^be-pkg-(\d+)$/.exec(input.packageId)?.[1] ?? NaN),
      quota_total: input.units,
      quota_used: 0,
      quota_reserved: 0,
      period_start: start.toISOString(),
      period_end: end.toISOString(),
      status: 'active',
    },
    'id,merchant_id,kind,package_id,quota_total,quota_used,quota_reserved,period_start,period_end,status',
  )
  return rows[0] ? toSubscription(rows[0]) : undefined
}
