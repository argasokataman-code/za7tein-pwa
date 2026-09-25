import { useId } from 'react'

import type { ChartBar } from '../../types'

/**
 * Sparkline — satu seri angka sebagai garis, tanpa sumbu dan tanpa label.
 *
 * Dipakai di kartu pendapatan beranda dapur: yang perlu terlihat hanya
 * **bentuk** tujuh harinya, bukan angka tiap titik. Angka per titik tetap
 * tersedia lewat `aria-label`, jadi tidak ada informasi yang hilang untuk
 * pembaca layar.
 *
 * Kenapa SVG dan bukan `<div>` seperti `BarChart`: garis butuh path, dan bar
 * 7 batang di ruang ~120px akan kembali ke masalah lebar yang sudah diukur
 * (teks nilai tumpang tindih). Satu path tidak punya masalah itu.
 *
 * Tanpa library chart, tanpa gradient (DNA §4). Area di bawah garis memakai
 * `opacity` dari token nada yang sama, jadi tidak ada warna baru.
 */
interface SparklineProps {
  data: ChartBar[]
  ariaLabel: string
  /** Tinggi kotak gambar dalam px; rasio viewBox mengikuti lebar x tinggi ini. */
  height?: number
  /** Lebar acuan untuk menghitung rasio; CSS tetap membuatnya 100% lebar. */
  width?: number
}

export function Sparkline({ data, ariaLabel, height = 34, width = 320 }: SparklineProps) {
  const gradientId = useId()
  const values = data.map((point) => point.value)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1

  // Ruang gambar memakai rasio lebar x tinggi yang sebenarnya (bukan 0..100
  // buatan yang diregangkan). Alasannya bukan estetika: kode repo ini melarang
  // atribut peregangan `preserveAspectRatio` bernilai `none` — ia meregang tidak
  // seragam, dan pada garis data artinya kemiringan garis berubah mengikuti besar
  // kartu, jadi bentuk yang dibaca merchant bergantung lebar layarnya. Dengan
  // rasio nyata, latar itu tidak diperlukan.
  const viewH = height
  const viewW = width
  const padY = 3
  const usableH = viewH - padY * 2

  // Satu titik digambar di tengah lebar supaya tidak jadi garis miring penuh.
  const step = data.length > 1 ? viewW / (data.length - 1) : 0
  const pointAt = (value: number, index: number) => {
    const x = data.length > 1 ? index * step : viewW / 2
    const y = padY + (1 - (value - min) / span) * usableH
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }

  const line = values.map((value, index) => pointAt(value, index)).join(' ')
  const lastPoint = pointAt(values.at(-1) ?? 0, values.length - 1)
  const [lastX, lastY] = lastPoint.split(',')

  return (
    <svg
      className="chart-spark"
      viewBox={`0 0 ${viewW} ${viewH}`}
      role="img"
      aria-label={ariaLabel}
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="chart-spark-fill" stopOpacity="0.18" />
          <stop offset="1" className="chart-spark-fill" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area hanya masuk akal kalau ada lebih dari satu titik. */}
      {data.length > 1 ? (
        <polygon
          className="chart-spark-area"
          fill={`url(#${gradientId})`}
          points={`0,${viewH} ${line} ${viewW},${viewH}`}
        />
      ) : null}
      <polyline className="chart-spark-line" points={line} pathLength={1} />
      <circle className="chart-spark-dot" cx={lastX} cy={lastY} r="2.5" />
    </svg>
  )
}
