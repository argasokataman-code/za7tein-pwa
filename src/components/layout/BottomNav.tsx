import type { ComponentType } from 'react'
import { createPortal } from 'react-dom'
import { Heart, House, ShoppingBag, User } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { useAppSelector } from '../../hooks/useAppStore'
import { selectCartCount } from '../../store/slices/cartSlice'

export interface BottomNavItem {
  to: string
  label: string
  Icon: ComponentType<{ strokeWidth?: number }>
  end?: boolean
  badge?: number
  srText?: string
  /** Prefix rute lain yang masih dianggap bagian menu ini (mis. batch = Order). */
  activePaths?: string[]
}

const defaultItems: BottomNavItem[] = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/orders', label: 'My Order', Icon: ShoppingBag },
  { to: '/favorites', label: 'Favorites', Icon: Heart },
  { to: '/profile', label: 'Profile', Icon: User },
]

export function BottomNav({ items: propItems }: { items?: BottomNavItem[] }) {
  const cartCount = useAppSelector((s) => selectCartCount(s.cart.items))
  const { pathname } = useLocation()

  const items =
    propItems ??
    defaultItems.map((item) =>
      item.to === '/orders'
        ? {
            ...item,
            badge: cartCount,
            srText:
              cartCount > 0
                ? `${cartCount} item di keranjang`
                : undefined,
          }
        : item,
    )

  // Portal ke `document.body`, bukan dirender di dalam halaman.
  //
  // Alasannya kontrak animasi halaman: wadah transisi di `App.tsx` memakai
  // `transform` untuk menggeser halaman (M3 "forward and backward"), dan
  // `transform` pada sebuah leluhur menjadikannya containing block baru untuk
  // `position: fixed`. Selama animasi 260ms, bilah ini ikut melayang bersama
  // halaman — terukur turun ke y=1479 dan area bawah layar jadi kosong. Portal
  // mengeluarkannya dari pohon yang dianimasikan, jadi bilah tetap menempel di
  // viewport sementara isi halaman bergeser.
  //
  // Context router ikut lewat portal (React mempertahankan context), jadi
  // `NavLink` tetap membaca rute aktif dengan benar.
  return createPortal(
    <nav className="bottom-nav">
      {items.map(({ to, label, Icon, end, badge, srText, activePaths }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `nav-item ${
              isActive ||
              activePaths?.some(
                (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
              )
                ? 'active'
                : ''
            }`
          }
        >
          <span className="nav-icon-wrap">
            <Icon strokeWidth={1.75} />
            {badge != null && badge > 0 ? (
              <span className="nav-cart-badge" aria-hidden="true">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="nav-label">{label}</span>
          {srText && badge != null && badge > 0 ? (
            <span className="sr-only">{srText}</span>
          ) : null}
        </NavLink>
      ))}
    </nav>,
    document.body,
  )
}
