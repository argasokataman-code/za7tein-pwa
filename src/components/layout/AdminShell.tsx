import { ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { APP_VERSION } from '../../data/appInfo'
import { useAdminNavItems } from '../admin/adminNav'
import { AdminBottomNav } from './AdminBottomNav'

/**
 * Kerangka panel CS.
 *
 * Keputusan desain (satu alasan per pilihan, QL-01):
 * - Di ponsel TIDAK berubah: kolom 430px + bottom nav. Panel ini tetap PWA
 *   tempat CS bekerja dari ponsel.
 * - Di desktop (≥901px) mengikuti pola konsol Super Admin (`_superadmin.scss`):
 *   sidebar sticky 248px + kolom konten penuh. CS memakai panel ini dari laptop
 *   juga (keputusan PO 2026-10-11), dan lebar 248px yang sama membuat dua
 *   konsol terasa satu keluarga. Di bawah 901px sidebar disembunyikan, bottom
 *   nav yang memimpin.
 * - Navigasi datang dari `useAdminNavItems`, jadi sidebar dan bottom nav tak
 *   pernah berbeda angka badge.
 *
 * `AdminPageHeader` tetap dirender tiap halaman (judul + lonceng); shell cuma
 * menambah sidebar. Escape lebar 430px ditangani `_admin-console.scss` lewat
 * `:has(.admin-console)` — pola yang sama dengan `.sa-root` dan `.doc-root`.
 */
interface AdminShellProps {
  children: ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const items = useAdminNavItems()

  return (
    <div className="app-shell admin-console">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="admin-brand-mark">
            <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="admin-brand-copy">
            <strong>Sa7tein</strong>
            <span>Panel CS</span>
          </span>
        </div>

        <nav className="admin-side-nav" aria-label="Menu panel CS">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-side-item${isActive ? ' is-active' : ''}`}
            >
              <item.Icon strokeWidth={1.75} />
              {item.label}
              {item.badge ? (
                <>
                  <span className="admin-side-badge" aria-hidden="true">
                    {item.badge}
                  </span>
                  <span className="sr-only">{item.srText ?? `${item.badge}`}</span>
                </>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="admin-side-foot">
          <Link className="admin-side-link" to="/documentation">
            Dokumentasi
          </Link>
          <p className="admin-side-role">Versi {APP_VERSION}</p>
        </div>
      </aside>

      <div className="admin-body">
        {children}
        <AdminBottomNav />
      </div>
    </div>
  )
}
