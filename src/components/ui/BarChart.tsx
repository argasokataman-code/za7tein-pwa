import type { ChartBar, ChartTone } from '../../types'

/**
 * Bar chart kolom — HTML/CSS, bukan SVG.
 *
 * Batang tidak butuh path, jadi `<div>` dengan tinggi persentase lebih ringkas
 * dan otomatis responsif. Animasi tumbuh lewat keyframes di `_charts.scss`
 * dengan jeda bertingkat per batang; `prefers-reduced-motion` mematikannya.
 *
 * `role="img"` membuat isi batang tidak dibacakan ganda — pembaca layar memakai
 * `aria-label` yang dibangun dari data, jadi angkanya tetap tersedia sebagai teks.
 */
interface BarChartProps {
  data: ChartBar[]
  ariaLabel: string
  tone?: ChartTone
  /** Label sumbu mendatar; dipakai kalau `ariaLabel` perlu konteks satuan. */
  format?: (value: number) => string
  /** Varian rapat untuk kartu kecil (aktivitas audit). */
  compact?: boolean
}

const STAGGER_MS = 60

export function BarChart({ data, ariaLabel, tone = 'brand', format, compact = false }: BarChartProps) {
  const max = Math.max(...data.map((bar) => bar.value), 1)
  const described = data.map((bar) => `${bar.label} ${format ? format(bar.value) : bar.value}`).join(', ')

  return (
    <div
      className={`chart-bars${compact ? ' is-compact' : ''}`}
      role="img"
      aria-label={`${ariaLabel}: ${described}`}
    >
      {data.map((bar, index) => (
        <div className="chart-bar" key={bar.label}>
          <span className="chart-bar-value">{format ? format(bar.value) : bar.value}</span>
          <span className="chart-bar-track">
            <span
              className={`chart-bar-fill chart-tone-bg--${tone}`}
              style={{ height: `${(bar.value / max) * 100}%`, animationDelay: `${index * STAGGER_MS}ms` }}
            />
          </span>
          <span className="chart-bar-label">{bar.label}</span>
        </div>
      ))}
    </div>
  )
}
