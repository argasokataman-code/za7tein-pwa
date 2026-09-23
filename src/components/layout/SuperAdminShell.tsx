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

import {
  SA_CURRENT_ACTOR,
  SA_ROUTE_PERMISSIONS,
  permissionLabel,
  roleForOperator,
  saActors,
  saPermissions,
} from '../../data/superadmin'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { setActiveOperator } from '../../store/slices/superAdminSlice'

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
 *
 * Izin ditegakkan di sini, bukan hanya ditampilkan di halaman Role: menu yang
 * tidak boleh dibuka dinonaktifkan, dan rute yang diketik langsung ditolak
 * sebelum halamannya dirender. Peta rute → izin tinggal di `data/superadmin.ts`
 * supaya nav dan gate tidak pernah berbeda pendapat.
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
  const dispatch = useAppDispatch()
  const { pathname } = useLocation()
  const operators = useAppSelector((s) => s.superAdmin.operators)
  const roles = useAppSelector((s) => s.superAdmin.roles)
  const activeOperatorId = useAppSelector((s) => s.superAdmin.activeOperatorId)

  const actors = saActors(operators, roles)
  const activeOperator = operators.find((operator) => operator.id === activeOperatorId)
  const activeRole = roleForOperator(roles, activeOperator ?? operators[0]) ?? null
  const actor = activeOperator?.name ?? SA_CURRENT_ACTOR.name
  const actorRole = activeRole?.name ?? 'Pemilik platform'

  const current = NAV.find((item) => item.to === pathname) ?? NAV[0]
  const required = SA_ROUTE_PERMISSIONS[current.to] ?? ''
  const allowed = !required || Boolean(activeRole?.permissionIds.includes(required))

  // Judul tab harus sama dengan judul halaman yang tampil (senior-fe UX rule).
  useEffect(() => {
    document.title = `Sa7tein Super Admin · ${allowed ? current.label : 'Akses ditolak'}`
  }, [current.label, allowed])

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
          {NAV.map((item) => {
            const need = SA_ROUTE_PERMISSIONS[item.to] ?? ''
            const canOpen = !need || Boolean(activeRole?.permissionIds.includes(need))
            if (!canOpen) {
              return (
                <span
                  key={item.to}
                  className="sa-nav-item is-locked"
                  aria-disabled="true"
                  title={`Butuh izin: ${permissionLabel(need)}`}
                >
                  <item.icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  {item.label}
                  <span className="sa-sr">Terkunci, butuh izin {permissionLabel(need)}</span>
                </span>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sa-nav-item${isActive ? ' is-active' : ''}`}
              >
                <item.icon size={18} strokeWidth={1.75} aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="sa-side-foot">
          <label className="sa-actor-picker">
            <span className="sa-side-label">Bertindak sebagai</span>
            <select
              value={activeOperatorId}
              onChange={(event) => dispatch(setActiveOperator({ id: event.target.value }))}
            >
              {actors.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.name} · {roleForOperator(roles, operator)?.name}
                </option>
              ))}
            </select>
          </label>
          <p className="sa-side-role">
            {actorRole} · {activeRole?.permissionIds.length ?? 0} izin
          </p>
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
          {allowed ? (
            children
          ) : (
            <section className="sa-card">
              <p className="sa-card-label">Akses ditolak</p>
              <p className="sa-card-title">Role {actorRole} tidak punya izin ini</p>
              <p className="sa-card-sub">
                Halaman <strong>{current.label}</strong> butuh izin{' '}
                <strong>{permissionLabel(required)}</strong>. Ganti operator di sidebar, atau minta
                pemilik platform menambah izin itu di halaman Role &amp; operator.
              </p>
              <ul className="sa-kv">
                <li>
                  <span>Operator</span>
                  <span>{actor}</span>
                </li>
                <li>
                  <span>Role</span>
                  <span>{actorRole}</span>
                </li>
                <li>
                  <span>Izin yang dimiliki</span>
                  <span>{activeRole?.permissionIds.length ?? 0} dari {saPermissions.length}</span>
                </li>
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
