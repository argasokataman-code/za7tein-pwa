import {
  BookOpen,
  LayoutDashboard,
  Map,
  ReceiptText,
  Scale,
  ScrollText,
  ShieldHalf,
  ToggleLeft,
  Users,
  Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { SA_CURRENT_ACTOR, saOperators, saRoles } from '../../data/superadmin'

/**
 * Kerangka konsol Super Admin.
 *
 * Keputusan desain (satu alasan per pilihan, QL-01):
 * - Sidebar + konten penuh, bukan kolom 430px: SA memakai dashboard bertabel
 *   dari desktop (keputusan PO 2026-09-23). Pengecualian lebar ini tercatat di
 *   `/documentation` (AGENTS.md §9), bukan kebocoran.
 * - Token yang sama dengan PWA (`--bg-warm`, `--surface`, aksen oranye), supaya
 *   konsol terasa satu produk dengan aplikasi, bukan aplikasi lain.
 * - Aksen oranye dipakai hemat: hanya item nav aktif dan aksi primer.
 */

const NAV = [
  { to: '/', label: 'Ringkasan', icon: LayoutDashboard, hint: 'Keuntungan, liability, kill switch' },
  { to: '/zones', label: 'Master zona', icon: Map, hint: 'Poligon Hijazi & Syimali' },
  { to: '/roles', label: 'Role & operator', icon: Users, hint: 'Izin & akun operator CS' },
  { to: '/audit', label: 'Audit trail', icon: ScrollText, hint: 'Semua aksi SA & CS' },
  { to: '/tax', label: 'Laporan pajak', icon: ReceiptText, hint: 'GST makanan + PPh final' },
  { to: '/profit', label: 'Saldo keuntungan', icon: Wallet, hint: 'Dana yang boleh ditarik SA' },
  { to: '/ledger', label: 'Ledger', icon: BookOpen, hint: 'Pantau merchant & customer' },
  { to: '/appeals', label: 'Banding sengketa', icon: Scale, hint: 'Tinjau putusan level-1 CS' },
  { to: '/switches', label: 'Kill switch', icon: ToggleLeft, hint: 'COD, payout, maintenance' },
] as const

interface SuperAdminShellProps {
  children: ReactNode
}

export function SuperAdminShell({ children }: SuperAdminShellProps) {
  const { pathname } = useLocation()
  const current = NAV.find((item) => item.to === pathname) ?? NAV[0]
  const owner = saOperators.find((o) => o.roleId === 'owner')
  const actor = owner?.name ?? SA_CURRENT_ACTOR.name
  const actorRole = saRoles.find((r) => r.id === owner?.roleId)?.name ?? 'Pemilik platform'

  // Judul tab harus sama dengan judul halaman yang tampil (senior-fe UX rule).
  useEffect(() => {
    document.title = `Sa7tein Super Admin, ${current.label}`
  }, [current.label])

  return (
    <div className="sa-root">
      <a className="sa-skip" href="#sa-main">
        Lompat ke konten
      </a>

      <aside className="sa-side">
        <div className="sa-brand">
          <span className="sa-brand-mark">
            <ShieldHalf size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="sa-brand-copy">
            <strong>Sa7tein</strong>
            <span>Super Admin</span>
          </span>
        </div>

        <nav className="sa-nav" aria-label="Menu konsol">
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
          <p className="sa-side-label">Operator</p>
          <p className="sa-side-actor">{actor}</p>
          <p className="sa-side-role">{actorRole}</p>
          <Link className="sa-side-link" to="/admin">
            Buka panel CS
          </Link>
          <Link className="sa-side-link" to="/documentation">
            Dokumentasi
          </Link>
        </div>
      </aside>

      <div className="sa-body">
        <header className="sa-top">
          <div className="sa-top-copy">
            <p className="sa-top-eyebrow">Konsol Super Admin</p>
            <h1 className="sa-top-title">{current.label}</h1>
            <p className="sa-top-hint">{current.hint}</p>
          </div>
          <p className="sa-top-badge">Data demo · bukan transaksi sungguhan</p>
        </header>
        <main className="sa-main" id="sa-main">
          {children}
        </main>
      </div>
    </div>
  )
}
