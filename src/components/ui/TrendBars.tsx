import type { ChartBar } from '../../types'

/**
 * Tren harian sebagai batang, satu batang per hari.
 *
 * Menggantikan sparkline garis: untuk tujuh titik, garis mengundang tafsir
 * "tren" yang tidak bisa diverifikasi (tanpa sumbu, tanpa baseline, tanpa nilai
 * per hari) dan kemiringannya berubah mengikuti min/max. Batang punya baseline
 * nol yang nyata, hari tanpa nilai terlihat kosong, dan label harinya terbaca.
 *
 * Angka total/ringkasan tetap di kartu induk; di sini yang ditambah adalah
 * bentuk + nama hari, bukan dekorasi. Warna memakai `currentColor` supaya kartu
 * berlatar merek (oranye/navy) tidak perlu aturan warna kedua.
 */
interface TrendBarsProps {
  data: ChartBar[]
  ariaLabel: string
  /** Format angka di atas batang (mis. `18` = 18 ribu). Tanpa ini, hanya bentuk. */
  formatValue?: (value: number) => string
}

export function TrendBars({ data, ariaLabel, formatValue }: TrendBarsProps) {
  const max = Math.max(...data.map((point) => point.value), 1)
  const lastIndex = data.length - 1

  return (
    <div className="chart-bars" role="img" aria-label={ariaLabel}>
      {data.map((point, index) => (
        <span className="chart-bars-col" key={`${point.label}-${index}`} aria-hidden="true">
          {formatValue ? (
            <span className="chart-bars-value">{formatValue(point.value)}</span>
          ) : null}
          <span className="chart-bars-track">
            <span
              className={`chart-bars-bar${index === lastIndex ? ' is-current' : ''}`}
              style={{ height: `${(point.value / max) * 100}%` }}
            />
          </span>
          <span className="chart-bars-label">{point.label}</span>
        </span>
      ))}
    </div>
  )
}
