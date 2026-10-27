import type { ChartBar, ChartSegment, MerchantOrder } from '../types'
import { isOrderToday, merchantOrders } from './merchantOrders'

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
 * Tujuh hari terakhir, berakhir hari ini. Nilainya naik di hari-hari terakhir
 * supaya grafiknya punya bentuk yang bisa dibaca, bukan rata; label harinya
 * diturunkan dari tanggal berjalan, bukan ditulis mati.
 *
 * Dua hal yang dijaga supaya angka di grafik tidak bertentangan dengan kartu:
 * jumlah order tujuh baris ini sama dengan `merchantOrders.length` (8), dan
 * `revenueIdr` per hari hanya menjumlahkan order yang benar-benar berjalan —
 * order `ditolak` dan `batal` tidak pernah jadi pendapatan.
 */
export const merchantTrend: TrendPoint[] = (() => {
  const days = [
    { orders: 0, revenueIdr: 0 },
    { orders: 1, revenueIdr: 18000 },
    { orders: 1, revenueIdr: 44000 },
    { orders: 1, revenueIdr: 12000 },
    { orders: 1, revenueIdr: 44000 },
    { orders: 2, revenueIdr: 78000 },
    { orders: 2, revenueIdr: 60000 },
  ]
  const today = new Date()
  return days.map((day, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days.length - 1 - index))
    // Label diturunkan dari tanggalnya, bukan ditulis "Sen…Min": deret ini
    // bergerak mengikuti hari ini, jadi label mati akan berbohong begitu hari
    // berganti (terukur: batang bertanggal Senin berlabel "Min").
    const shortDay = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()]
    return { ...day, label: shortDay, date: isoLocalDay(date) }
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
 * Periode kartu pendapatan. Default **harian** karena pertanyaan pertama
 * merchant adalah "hari ini bagaimana", bukan "tahun ini bagaimana".
 */
export type RevenuePeriod = 'daily' | 'weekly' | 'yearly'

export const REVENUE_PERIODS: { id: RevenuePeriod; label: string }[] = [
  { id: 'daily', label: 'Harian' },
  { id: 'weekly', label: 'Mingguan' },
  { id: 'yearly', label: 'Tahunan' },
]

/**
 * Satu batang pendapatan. Selain bentuk (`value`), batang membawa keterangan
 * yang dibaca saat diarahkan: nama lengkap periode, jumlah order, dan nominal
 * aslinya. Tanpa ini hover cuma mengulang tinggi batang.
 */
export interface RevenueBucket extends ChartBar {
  /** Nama lengkap untuk pembaca hover, mis. `14:00–14:59` atau `Sabtu, 24 Okt`. */
  fullLabel: string
  /** Order yang membentuk batang ini (0 = jam/hari kosong). */
  orders: number
  /** Nominal rupiah asli; `value` cuma versi ribuan untuk tinggi batang. */
  revenueIdr: number
}

export interface RevenueSeries {
  bars: RevenueBucket[]
  totalIdr: number
  orders: number
  /** Rata-rata per order; 0 kalau belum ada order. */
  averageIdr: number
  /** Label puncak: jam (`14:00`) untuk harian, hari/bulan untuk periode lain. */
  peak: string
  /** Indeks batang puncak — titik yang dipilih sebelum pengguna mengarahkan. */
  peakIndex: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const MONTHS_FULL = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]
const DAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

/** Tanggal lokal `YYYY-MM-DD`; `toISOString()` bisa mundur sehari sebelum 07:00 WIB. */
function isoLocalDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** `Sabtu, 24 Okt` dari tanggal ISO `YYYY-MM-DD`. */
function fullDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  return `${DAYS_FULL[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

/** `Oktober 2026` dari `YYYY-MM`. */
function fullMonthLabel(isoMonth: string): string {
  const [year, month] = isoMonth.split('-').map(Number)
  return `${MONTHS_FULL[month - 1]} ${year}`
}

/**
 * Dua belas bulan terakhir berakhir bulan ini. State demo seperti deret harian:
 * repo ini front-end saja, jadi tidak ada query agregat sungguhan. Dijaga tetap
 * berupa `TrendPoint` supaya total/puncak memakai fungsi yang sama.
 */
const YEARLY_SEED = [
  { orders: 54, revenueIdr: 1_480_000 },
  { orders: 61, revenueIdr: 1_720_000 },
  { orders: 48, revenueIdr: 1_260_000 },
  { orders: 66, revenueIdr: 1_960_000 },
  { orders: 72, revenueIdr: 2_180_000 },
  { orders: 58, revenueIdr: 1_640_000 },
  { orders: 63, revenueIdr: 1_810_000 },
  { orders: 70, revenueIdr: 2_040_000 },
  { orders: 52, revenueIdr: 1_420_000 },
  { orders: 68, revenueIdr: 1_980_000 },
  { orders: 75, revenueIdr: 2_260_000 },
  { orders: 81, revenueIdr: 2_460_000 },
]

export const merchantYearlyTrend: TrendPoint[] = (() => {
  const now = new Date()
  return YEARLY_SEED.map((point, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (YEARLY_SEED.length - 1 - index), 1)
    return {
      ...point,
      label: MONTHS[date.getMonth()],
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    }
  })
})()

/**
 * Pendapatan hari ini per jam (24 batang) dari order yang benar-benar ada.
 * Order tanpa `placedAtMs` tidak bisa ditempatkan pada satu jam, jadi dilewati —
 * lebih baik batang kosong daripada jam yang dikarang. Label hanya tiap 3 jam
 * supaya 24 batang tetap terbaca di kolom 430px.
 */
export function hourlyRevenueSeries(
  orders: MerchantOrder[] = merchantOrders,
  now = Date.now(),
): RevenueSeries {
  const buckets = Array.from({ length: 24 }, () => ({ orders: 0, revenueIdr: 0 }))
  for (const order of orders) {
    if (order.status === 'ditolak' || order.status === 'batal') continue
    if (order.placedAtMs === undefined || !isOrderToday(order, now)) continue
    const hour = new Date(order.placedAtMs).getHours()
    buckets[hour].orders += 1
    buckets[hour].revenueIdr += order.total
  }
  const bars: RevenueBucket[] = buckets.map((bucket, hour) => {
    const hh = String(hour).padStart(2, '0')
    return {
      label: hour % 3 === 0 ? hh : '',
      fullLabel: `${hh}:00–${hh}:59`,
      value: Math.round(bucket.revenueIdr / 1000),
      orders: bucket.orders,
      revenueIdr: bucket.revenueIdr,
    }
  })
  const peakHour = buckets.reduce(
    (best, bucket, hour) => (bucket.revenueIdr > buckets[best].revenueIdr ? hour : best),
    0,
  )
  const totalIdr = buckets.reduce((sum, bucket) => sum + bucket.revenueIdr, 0)
  const orderCount = buckets.reduce((sum, bucket) => sum + bucket.orders, 0)
  return {
    bars,
    totalIdr,
    orders: orderCount,
    averageIdr: orderCount > 0 ? Math.round(totalIdr / orderCount) : 0,
    peak: `${String(peakHour).padStart(2, '0')}:00`,
    peakIndex: peakHour,
  }
}

/** Satu bentuk untuk tiga tombol periode, supaya kartu tidak punya tiga jalur. */
export function revenueSeries(
  period: RevenuePeriod,
  orders: MerchantOrder[] = merchantOrders,
  now = Date.now(),
): RevenueSeries {
  if (period === 'daily') return hourlyRevenueSeries(orders, now)

  const points = period === 'weekly' ? merchantTrend : merchantYearlyTrend
  const totals = trendTotals(points)
  // 12 batang di kolom 430px hanya selebar ~15px: nama bulan tiga huruf tidak
  // muat (terukur terpotong), jadi sumbu memakai nomor bulan 01-12. Nama bulan
  // lengkap dipakai di keterangan hover, bukan dipaksa masuk kolom.
  const bars: RevenueBucket[] =
    period === 'yearly'
      ? points.map((point) => ({
          label: point.date.slice(5),
          fullLabel: fullMonthLabel(point.date),
          value: Math.round(point.revenueIdr / 1000),
          orders: point.orders,
          revenueIdr: point.revenueIdr,
        }))
      : points.map((point) => ({
          label: point.label,
          fullLabel: fullDayLabel(point.date),
          value: Math.round(point.revenueIdr / 1000),
          orders: point.orders,
          revenueIdr: point.revenueIdr,
        }))
  const peakIndex = Math.max(
    0,
    points.findIndex((point) => point === totals.best),
  )
  return {
    bars,
    totalIdr: totals.revenueIdr,
    orders: totals.orders,
    averageIdr: totals.orders > 0 ? Math.round(totals.revenueIdr / totals.orders) : 0,
    peak: totals.best?.label ?? '-',
    peakIndex,
  }
}

/**
 * Komposisi status order untuk donut. Satu potongan per tab antrean merchant
 * (Antrean/Disiapkan/Siap/Diantar/Selesai/Batal) supaya tiap potongan bisa
 * ditekan dan mendarat di daftar yang isinya persis sama.
 */
export function orderMixSegments(orders: MerchantOrder[] = merchantOrders): ChartSegment[] {
  const count = (statuses: string[]) =>
    orders.filter((order) => statuses.includes(order.status)).length
  const segments: ChartSegment[] = [
    { label: 'Baru', value: count(['baru']), tone: 'warning', tab: 'masuk' },
    { label: 'Disiapkan', value: count(['diterima', 'disiapkan']), tone: 'brand', tab: 'disiapkan' },
    { label: 'Siap', value: count(['siap']), tone: 'brand', tab: 'siap' },
    { label: 'Diantar', value: count(['diantar', 'tiba']), tone: 'success', tab: 'diantar' },
    { label: 'Selesai', value: count(['selesai']), tone: 'muted', tab: 'selesai' },
    { label: 'Batal/tolak', value: count(['ditolak', 'batal']), tone: 'danger', tab: 'batal' },
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

/** Satu baris peringkat menu: terjual, omzet, dan berapa order memuatnya. */
export interface MenuSalesRow {
  /** `CartItem.id` — kunci yang membuat satu menu tidak terhitung dua kali. */
  id: string
  name: string
  /** Total `quantity` lintas order. */
  sold: number
  /** `quantity × price` — omzet menu ini dalam rupiah. */
  revenueIdr: number
  /** Berapa order yang memuat menu ini. */
  orders: number
}

/**
 * Peringkat menu dari isi order yang ada — bukan mock baru.
 *
 * `MerchantOrder.items` sudah membawa `CartItem.quantity` dan `price`, jadi
 * "menu apa yang paling disukai" bisa diturunkan tanpa menambah data apa pun.
 * Dikelompokkan per identitas menu (`CartItem.menuId` kalau ada, kalau tidak
 * `CartItem.id`), bukan per baris order: baris order punya id unik per order,
 * jadi memakai `id` saja membuat satu menu muncul sekali untuk tiap order yang
 * memuatnya (terukur: 87 "menu" dari 98 order padahal menunya belasan).
 *
 * **Rentangnya sempit dan labelnya harus jujur.** Delapan order mock adalah
 * sekitar setengah jam terakhir, bukan "sepanjang masa"; bisa saja satu kantor
 * pesan bareng. Pemanggil wajib menyebut rentangnya di UI.
 */
export function menuSalesRanking(orders: MerchantOrder[] = merchantOrders): MenuSalesRow[] {
  const byId = new Map<string, MenuSalesRow>()
  for (const order of orders) {
    // Order yang ditolak/batal tidak pernah jadi penjualan.
    if (order.status === 'ditolak' || order.status === 'batal') continue
    for (const item of order.items) {
      const key = item.menuId ?? item.id
      const row = byId.get(key) ?? {
        id: key,
        name: item.name,
        sold: 0,
        revenueIdr: 0,
        orders: 0,
      }
      row.sold += item.quantity
      row.revenueIdr += item.quantity * item.price
      row.orders += 1
      byId.set(key, row)
    }
  }
  return [...byId.values()].sort((a, b) => b.sold - a.sold || b.revenueIdr - a.revenueIdr)
}

/**
 * Porsi menu teratas dibanding seluruh porsi terjual (0–1). Dipakai kartu
 * "Terjual" untuk membaca satu kalimat, bukan menyuruh merchant menghitung
 * sendiri dari deretan bar.
 */
export function topMenuShare(rows: MenuSalesRow[]): { name: string; share: number; orders: number } | null {
  const top = rows[0]
  const total = rows.reduce((sum, row) => sum + row.sold, 0)
  if (!top || total === 0) return null
  return { name: top.name, share: top.sold / total, orders: top.orders }
}
