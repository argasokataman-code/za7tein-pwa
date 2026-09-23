import type {
  AuditEntry,
  ChartBar,
  ChartSegment,
  LiabilitySummary,
  ProfitState,
  TaxReportRow,
} from '../types'

import { withdrawnTotal } from './superadmin'

/**
 * Agregasi data-viz untuk Ringkasan konsol Super Admin.
 *
 * Fungsi murni: mengubah state yang **sudah ada** (`ProfitState`,
 * `LiabilitySummary`, `TaxReportRow[]`, `AuditEntry[]`) jadi deret yang bisa
 * digambar chart. Tidak ada angka baru dan tidak ada aturan bisnis di sini —
 * repo ini front-end saja (AGENTS.md §1), dan setiap nominal tetap berasal dari
 * mock yang sama dengan yang dipakai tabel/kartu.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/** `2026-09 (berjalan)` → `Sep*`; dipakai label sumbu bar chart. */
export function periodLabel(period: string): string {
  const month = Number(period.slice(5, 7))
  const name = MONTHS[month - 1] ?? period
  return period.includes('berjalan') ? `${name}*` : name
}

/**
 * Ke mana fee platform pergi. Empat potongan yang menjumlah ke fee terkumpul:
 * biaya, PPh final, yang sudah ditarik, dan sisa yang boleh ditarik. Sisa diberi
 * nada merek karena itulah satu-satunya bagian yang boleh disentuh SA
 * (keputusan PO 2026-09-23).
 */
export function profitSegments(profit: ProfitState): ChartSegment[] {
  const withdrawn = withdrawnTotal(profit)
  const remaining = profit.feeGrossJod - profit.costJod - profit.pphFinalJod - withdrawn
  return [
    { label: 'Biaya operasional', value: profit.costJod, tone: 'muted' },
    { label: 'PPh final', value: profit.pphFinalJod, tone: 'warning' },
    { label: 'Sudah ditarik', value: withdrawn, tone: 'success' },
    { label: 'Sisa bisa ditarik', value: Math.max(remaining, 0), tone: 'brand' },
  ]
}

/** Komposisi kewajiban platform: saldo wallet customer + merchant + tips kurir. */
export function liabilitySegments(liability: LiabilitySummary): ChartSegment[] {
  return [
    { label: 'Wallet customer', value: liability.customerWallets, tone: 'brand' },
    { label: 'Wallet merchant', value: liability.merchantWallets, tone: 'success' },
    { label: 'Tips kurir', value: liability.courierTips, tone: 'muted' },
  ]
}

/** Order per periode laporan pajak. */
export function orderSeries(rows: TaxReportRow[]): ChartBar[] {
  return rows.map((row) => ({ label: periodLabel(row.period), value: row.orders }))
}

/** Fee platform terkumpul per periode laporan pajak (0,37 JOD/order). */
export function feeSeries(rows: TaxReportRow[]): ChartBar[] {
  return rows.map((row) => ({ label: periodLabel(row.period), value: row.feeGrossJod }))
}

/**
 * Umur sebuah entry audit dalam hari. AuditEntry hanya menyimpan waktu sebagai
 * teks tampilan (`'Hari ini 09:41'`), jadi ini mem-parse teks itu.
 *
 * ponytail: parsing string tampilan itu rapuh — kalau `AuditEntry.at` kelak
 * dapat timestamp ISO, ganti fungsi ini dan buang pemetaannya.
 */
function daysAgoFrom(at: string): number | null {
  if (at.startsWith('Hari ini')) return 0
  if (at.startsWith('Kemarin')) return 1
  const match = /^(\d+) hari lalu/.exec(at)
  return match ? Number(match[1]) : null
}

function dayLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'Hari ini'
  if (daysAgo === 1) return 'Kemarin'
  return `${daysAgo} hari`
}

/** Jumlah aksi audit per hari, urut lama → baru (kiri → kanan di chart). */
export function auditByDay(entries: AuditEntry[]): ChartBar[] {
  const buckets = new Map<number, number>()
  for (const entry of entries) {
    const daysAgo = daysAgoFrom(entry.at)
    if (daysAgo === null) continue
    buckets.set(daysAgo, (buckets.get(daysAgo) ?? 0) + 1)
  }
  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([daysAgo, count]) => ({ label: dayLabel(daysAgo), value: count }))
}
