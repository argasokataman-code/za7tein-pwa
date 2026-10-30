import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface BackButtonProps {
  /** Tujuan tetap. Kalau kosong, kembali satu langkah (`navigate(-1)`). */
  to?: string
  className?: string
  label?: string
}

/** Akar tiap peran — tujuan saat tak ada entri riwayat (deep link / ikon home screen). */
const ROLE_ROOTS: [prefix: string, root: string][] = [
  ['/customer', '/customer/home'],
  ['/merchant', '/merchant'],
  ['/courier', '/courier'],
  ['/ops', '/ops'],
  ['/superadmin', '/superadmin'],
]

/** MD-13 `NB-07`: `navigate(-1)` hanya sah bila memang ada entri sebelumnya. */
function fallbackTarget(pathname: string): string {
  const match = ROLE_ROOTS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  return match ? match[1] : '/'
}

/**
 * Satu-satunya tombol kembali design system (`_topbar.scss` → `$back-solid`):
 * kotak 44px, `--radius-md`, permukaan `--surface` + `--border-strong`, chevron
 * 24px stroke 1,75. Dengan `to` ia jadi `<Link>` (bisa dibuka tab baru / tombol
 * tengah); tanpa `to` kembali satu langkah — dan kalau halaman ini dibuka
 * langsung tanpa riwayat, ia mendarat di akar perannya, bukan keluar aplikasi.
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

  const back = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1)
      return
    }
    navigate(fallbackTarget(window.location.pathname), { replace: true })
  }

  return (
    <button type="button" className={classes} aria-label={label} onClick={back}>
      <ChevronLeft size={24} strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}
