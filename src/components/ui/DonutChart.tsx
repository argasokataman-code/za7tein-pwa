import { useEffect, useState } from 'react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { ChartSegment } from '../../types'

/**
 * Donut komposisi — SVG tulis tangan, tanpa library chart.
 *
 * Alasan (AGENTS.md §12: jangan tambah dependency untuk hal yang bisa
 * diselesaikan beberapa baris): satu donut cukup dengan `stroke-dasharray` pada
 * `<circle>`, dan DNA melarang gradient sehingga `conic-gradient` tidak dipakai.
 * Nada warna lewat kelas `chart-tone--*` yang memetakan ke token yang ada.
 *
 * Animasi menggambar: panjang tiap potongan dihitung dari 0 lalu bertransisi ke
 * nilai akhir lewat CSS (`transition: stroke-dasharray`). Kalau pengguna meminta
 * gerak dikurangi, potongan langsung digambar penuh — stylesheet juga mematikan
 * transisinya.
 */
interface DonutChartProps {
  segments: ChartSegment[]
  /** Ringkasan komposisi untuk pembaca layar; nilainya ada di legenda kartu. */
  ariaLabel: string
  centerValue?: string
  centerLabel?: string
  /** Tebal cincin dalam satuan viewBox 100×100. */
  thickness?: number
}

export function DonutChart({
  segments,
  ariaLabel,
  centerValue,
  centerLabel,
  thickness = 15,
}: DonutChartProps) {
  const { reducedMotion } = usePrefersReducedMotion()
  const [drawn, setDrawn] = useState(reducedMotion)

  useEffect(() => {
    if (reducedMotion) return
    const frame = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(frame)
  }, [reducedMotion])

  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1
  const radius = (100 - thickness) / 2
  const circumference = 2 * Math.PI * radius

  // Offset tiap potongan dihitung lebih dulu (bukan diakumulasi sambil render)
  // supaya render tetap murni. Jumlah segmen kecil, jadi kuadratik ini aman.
  const shares = segments.map((segment) => segment.value / total)
  const starts = shares.map((_, index) =>
    shares.slice(0, index).reduce((sum, share) => sum + share, 0),
  )

  return (
    <figure className="chart-donut">
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={ariaLabel}
        preserveAspectRatio="xMidYMid meet"
      >
        <circle
          className="chart-donut-track"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={thickness}
        />
        {segments.map((segment, index) => (
          <circle
            key={segment.label}
            className={`chart-donut-seg chart-tone--${segment.tone}`}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeDasharray={`${drawn ? shares[index] * circumference : 0} ${circumference}`}
            strokeDashoffset={-starts[index] * circumference}
            transform="rotate(-90 50 50)"
          />
        ))}
      </svg>
      {centerValue ? (
        <figcaption className="chart-donut-center">
          <strong>{centerValue}</strong>
          {centerLabel ? <span>{centerLabel}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}
