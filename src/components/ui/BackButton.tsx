import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface BackButtonProps {
  /** Tujuan tetap. Kalau kosong, kembali satu langkah (`navigate(-1)`). */
  to?: string
  className?: string
  label?: string
}

/**
 * Satu-satunya tombol kembali design system (`_topbar.scss` → `$back-solid`):
 * kotak 44px, `--radius-md`, permukaan `--surface` + `--border-strong`, chevron
 * 24px stroke 1,75. Dengan `to` ia jadi `<Link>` (bisa dibuka tab baru / tombol
 * tengah); tanpa `to` kembali satu langkah.
 */
export function BackButton({ to, className = '', label = 'Kembali' }: BackButtonProps) {
  const navigate = useNavigate()
  const classes = `back-button ${className}`.trim()

  if (to) {
    return (
      <Link className={classes} aria-label={label} to={to}>
        <ChevronLeft size={24} strokeWidth={1.75} aria-hidden="true" />
      </Link>
    )
  }

  return (
    <button type="button" className={classes} aria-label={label} onClick={() => navigate(-1)}>
      <ChevronLeft size={24} strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}
