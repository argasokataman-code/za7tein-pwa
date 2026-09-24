import type { ChartBar, ChartSegment, MerchantOrder } from '../types'
import { merchantOrders } from './merchantOrders'

/**
 * Data deret waktu untuk dashboard merchant (M2).
 *
 * Merchant tidak menyimpan tanggal pesanan: `MerchantOrder.placedAt` berbentuk
 * teks relatif ("2 menit lalu") karena layar antrean cuma butuh itu. Grafik tren
 * butuh tanggal, jadi deret harian disimpan terpisah di sini dan sengaja
 * diturunkan dari angka yang sama dengan kartu statistik supaya tidak ada dua
 * kebenaran: `orders` tujuh hari terakhir dijumlahkan sama dengan jumlah order
 * mock (`merchantOrders.length`).
 *
 * Angka di sini state demo, bukan hasil query — repo ini front-end saja
 * (AGENTS.md §1). Kalau nanti ada backend, fungsi di bawah tetap berlaku dan
 * sumbernya tinggal diganti.
 */

/** Satu titik deret harian: jumlah order dan pendapatannya (IDR). */
export interface TrendPoint {
  /** Label pendek untuk sumbu, mis. `Sen`. */
  label: string
  /** Tanggal ISO supaya urutannya tidak bergantung nama hari. */
  date: string
  orders: number
  revenueIdr: number
}

/**
 * Tujuh hari terakhir, berakhir hari ini. Bentuknya naik menjelang akhir pekan
 * supaya grafiknya punya bentuk yang bisa dibaca, bukan rata.
 *
 * Dua hal yang dijaga supaya angka di grafik tidak bertentangan dengan kartu:
 * jumlah order tujuh baris ini sama dengan `merchantOrders.length` (8), dan
 * `revenueIdr` per hari hanya menjumlahkan order yang benar-benar berjalan —
 * order `ditolak` dan `batal` tidak pernah jadi pendapatan.
 */
export const merchantTrend: TrendPoint[] = (() => {
  const days = [
    { label: 'Sen', orders: 0, revenueIdr: 0 },
    { label: 'Sel', orders: 1, revenueIdr: 18000 },
    { label: 'Rab', orders: 1, revenueIdr: 44000 },
    { label: 'Kam', orders: 1, revenueIdr: 12000 },
    { label: 'Jum', orders: 1, revenueIdr: 44000 },
    { label: 'Sab', orders: 2, revenueIdr: 78000 },
    { label: 'Min', orders: 2, revenueIdr: 60000 },
  ]
  const today = new Date()
  return days.map((day, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days.length - 1 - index))
    return { ...day, date: date.toISOString().slice(0, 10) }
  })
})()

/** Permintaan tren: total order dan pendapatan tujuh hari terakhir. */
export function trendTotals(points: TrendPoint[] = merchantTrend): {
  orders: number
  revenueIdr: number
  best: TrendPoint | null
} {
  const orders = points.reduce((sum, point) => sum + point.orders, 0)
  const revenueIdr = points.reduce((sum, point) => sum + point.revenueIdr, 0)
  const best = points.reduce<TrendPoint | null>(
    (top, point) => (!top || point.revenueIdr > top.revenueIdr ? point : top),
    null,
  )
  return { orders, revenueIdr, best }
}

/** Deret batang jumlah order per hari untuk `BarChart`. */
export function orderTrendBars(points: TrendPoint[] = merchantTrend): ChartBar[] {
  return points.map((point) => ({ label: point.label, value: point.orders }))
}

/** Deret batang pendapatan per hari (dalam ribuan rupiah, biar terbaca). */
export function revenueTrendBars(points: TrendPoint[] = merchantTrend): ChartBar[] {
  return points.map((point) => ({ label: point.label, value: Math.round(point.revenueIdr / 1000) }))
}

/**
 * Komposisi status order untuk donut. Menumpang `MerchantOrderStatus` yang ada;
 * `masuk` digabung ke "Baru" dan `tiba` ke "Diantar" supaya donutnya tidak
 * terpecah jadi delapan potongan yang tidak terbaca di lebar 430px.
 */
export function orderMixSegments(orders: MerchantOrder[] = merchantOrders): ChartSegment[] {
  const count = (statuses: string[]) =>
    orders.filter((order) => statuses.includes(order.status)).length
  const segments: ChartSegment[] = [
    { label: 'Baru', value: count(['masuk']), tone: 'warning' },
    { label: 'Diproses', value: count(['diterima', 'dimasak']), tone: 'brand' },
    { label: 'Diantar', value: count(['diantar', 'tiba']), tone: 'success' },
    { label: 'Selesai', value: count(['selesai']), tone: 'muted' },
    { label: 'Batal/tolak', value: count(['ditolak', 'batal']), tone: 'danger' },
  ]
  return segments.filter((segment) => segment.value > 0)
}

/** Perbandingan metode bayar — COD ditagih kurir, transfer dicek buktinya. */
export function paymentMixSegments(orders: MerchantOrder[] = merchantOrders): ChartSegment[] {
  const cod = orders.filter((order) => order.paymentMethod === 'cod').length
  const transfer = orders.filter((order) => order.paymentMethod === 'transfer').length
  const segments: ChartSegment[] = [
    { label: 'COD (tunai)', value: cod, tone: 'brand' },
    { label: 'Transfer', value: transfer, tone: 'success' },
  ]
  return segments.filter((segment) => segment.value > 0)
}
