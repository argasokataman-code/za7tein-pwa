import {
  AlertTriangle,
  BadgeCheck,
  Gift,
  LayoutDashboard,
  Package,
  Scale,
  ScrollText,
  ShieldAlert,
  SlidersHorizontal,
  Tags,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

/**
 * Kerangka panel ops (M10, R-OPS) — website penuh non-PWA, dibuka dari desktop.
 *
 * Keputusan (keputusan PO: ops = desktop penuh, bukan kolom 430px; kelanjutan
 * pola konsol Super Admin): rail sidebar + konten selebar jendela. Gaya
 * memakai ulang kelas `.sa-*` dari konsol SA — satu bahasa visual, bukan
 * stylesheet baru. Pengecualian lebar ini tercatat di `/documentation`.
 *
 * Tanpa auth (PRD aktif belum punya requirement auth ops → `UNRESOLVED`),
 * jadi tidak ada penjaga rute; lihat AGENTS §9 soal panel CS tanpa auth.
 */

const NAV = [
  { to: '/', label: 'Ringkasan', icon: LayoutDashboard, hint: 'Antrean & beban kerja ops' },
  { to: '/onboarding', label: 'Verifikasi onboarding', icon: BadgeCheck, hint: 'Setujui / tolak tenant baru' },
  { to: '/rules', label: 'Rule sengketa', icon: Scale, hint: 'Katalog mitigasi, kompensasi, punishment' },
  { to: '/incidents', label: 'Insiden', icon: ShieldAlert, hint: 'Tangani insiden per order' },
  { to: '/moderation', label: 'Moderasi tag', icon: Tags, hint: 'Setujui / tolak tag merchant' },
  { to: '/penalties', label: 'Surat peringatan', icon: AlertTriangle, hint: 'SP & punishment tercatat' },
  { to: '/programs', label: 'Program aplikator', icon: Gift, hint: 'Diskon platform lintas merchant' },
  { to: '/quotas', label: 'Paket kuota', icon: Package, hint: 'Paket order & order COD' },
  { to: '/settings', label: 'Aturan platform', icon: SlidersHorizontal, hint: 'Multiplier, ambang notif, flat fee' },
  { to: '/analytics', label: 'Analytics & log', icon: ScrollText, hint: 'Aktivitas platform + audit aksi' },
] as const

interface OpsShellProps {
  children: ReactNode
}

export function OpsShell({ children }: OpsShellProps) {
  const { pathname } = useLocation()

  const current =
    NAV.find((item) => (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to))) ?? NAV[0]

  // Judul tab harus sama dengan judul halaman yang tampil (senior-fe UX rule).
  useEffect(() => {
    document.title = `Sa7tein Ops · ${current.label}`
  }, [current.label])

  return (
    <div className="sa-root">
      <aside className="sa-side">
        <div className="sa-brand">
          <span className="sa-brand-mark">
            <ShieldAlert size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="sa-brand-copy">
            <strong>Sa7tein</strong>
            <span>Ops</span>
          </span>
        </div>

        <nav className="sa-nav" aria-label="Menu panel ops">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sa-nav-item${isActive ? ' is-active' : ''}`}
            >
              <item.icon size={18} strokeWidth={1.75} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sa-side-foot">
          <p className="sa-side-role">Operator ops · di balik Cloudflare Access (mock)</p>
          <Link className="sa-side-link" to="/admin">
            Buka panel CS
          </Link>
          <Link className="sa-side-link" to="/superadmin">
            Buka konsol Super Admin
          </Link>
          <Link className="sa-side-link" to="/documentation">
            Dokumentasi
          </Link>
        </div>
      </aside>

      <div className="sa-body">
        <header className="sa-top">
          <div className="sa-top-copy">
            <p className="sa-top-eyebrow">Panel Ops</p>
            <h1 className="sa-top-title">{current.label}</h1>
            <p className="sa-top-hint">{current.hint}</p>
          </div>
          <p className="sa-top-badge">Data demo · bukan transaksi sungguhan</p>
        </header>
        <main className="sa-main" id="ops-main">
          {children}
        </main>
      </div>
    </div>
  )
}
