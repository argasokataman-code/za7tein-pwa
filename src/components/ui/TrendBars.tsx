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
  /** 24 jam butuh batang rapat; tanpa ini gap 16px memakan seluruh lebar kolom. */
  dense?: boolean
  /**
   * Batang yang ditandai "sekarang". Default batang terakhir (harian/mingguan/
   * tahunan berakhir di periode berjalan). Grafik per jam butuh jam berjalan,
   * bukan 23:00, supaya penanda tidak bohong.
   */
  currentIndex?: number
  /** Batang yang sedang dibaca (hover/panah). Membuat grafik interaktif. */
  selectedIndex?: number
  /** Dipanggil saat pengguna mengarahkan kursor, mengetuk, atau menekan panah. */
  onSelect?: (index: number) => void
}

export function TrendBars({
  data,
  ariaLabel,
  formatValue,
  dense = false,
  currentIndex = data.length - 1,
  selectedIndex,
  onSelect,
}: TrendBarsProps) {
  const max = Math.max(...data.map((point) => point.value), 1)
  const interactive = onSelect !== undefined
  const activeIndex = Math.min(Math.max(selectedIndex ?? currentIndex, 0), data.length - 1)

  const selectAt = (clientX: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = (clientX - rect.left) / rect.width
    onSelect?.(Math.min(data.length - 1, Math.max(0, Math.floor(ratio * data.length))))
  }

  return (
    <div className="chart-bars-wrap">
      <div
        className={`chart-bars${dense ? ' chart-bars--dense' : ''}${interactive ? ' chart-bars--interactive' : ''}`}
        role={interactive ? 'group' : 'img'}
        aria-label={interactive ? `${ariaLabel}. Gunakan panah kiri dan kanan untuk membaca tiap titik.` : ariaLabel}
        tabIndex={interactive ? 0 : undefined}
        onPointerMove={
          interactive
            ? (event) => {
                // Sentuh tidak "hover": jangan rebut gulir vertikal. Ketuk sudah
                // ditangani onClick; pointer mouse yang menggerakkan pembacaan.
                if (event.pointerType === 'mouse') selectAt(event.clientX, event.currentTarget)
              }
            : undefined
        }
        onClick={interactive ? (event) => selectAt(event.clientX, event.currentTarget) : undefined}
        onKeyDown={
          interactive
            ? (event) => {
                const step =
                  event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
                if (step !== 0) {
                  event.preventDefault()
                  onSelect(Math.min(data.length - 1, Math.max(0, activeIndex + step)))
                } else if (event.key === 'Home' || event.key === 'End') {
                  event.preventDefault()
                  onSelect(event.key === 'Home' ? 0 : data.length - 1)
                }
              }
            : undefined
        }
      >
        {data.map((point, index) => (
          <span className="chart-bars-col" key={`${point.label}-${index}`} aria-hidden="true">
            {formatValue ? (
              <span className="chart-bars-value">{formatValue(point.value)}</span>
            ) : null}
            <span className="chart-bars-track">
              <span
                className={`chart-bars-bar${index === currentIndex ? ' is-current' : ''}${
                  interactive && index === activeIndex ? ' is-selected' : ''
                }`}
                style={{ height: `${(point.value / max) * 100}%` }}
              />
            </span>
          </span>
        ))}
      </div>
      {/* Label dipisah dari kolom: 24 batang hanya 11px per kolom, sedangkan
          label "00" butuh 17px. Ditempel absolut di posisi batangnya, jadi tidak
          terpotong dan tidak menambah lebar kolom. */}
      <div className="chart-bars-axis" aria-hidden="true">
        {data.map((point, index) =>
          point.label ? (
            <span
              className={`chart-bars-axis-label${
                interactive && index === activeIndex ? ' is-active' : ''
              }`}
              key={`${point.label}-${index}`}
              style={{ left: `${((index + 0.5) / data.length) * 100}%` }}
            >
              {point.label}
            </span>
          ) : null,
        )}
      </div>
    </div>
  )
}
