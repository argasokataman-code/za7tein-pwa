import type { ComponentType } from 'react'
import { Heart, House, ShoppingBag, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAppSelector } from '../../hooks/useAppStore'
import { selectCartCount } from '../../store/slices/cartSlice'

export interface BottomNavItem {
  to: string
  label: string
  Icon: ComponentType<{ strokeWidth?: number }>
  end?: boolean
  badge?: number
  srText?: string
}

const defaultItems: BottomNavItem[] = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/checkout', label: 'My Order', Icon: ShoppingBag },
  { to: '/favorites', label: 'Favorites', Icon: Heart },
  { to: '/profile', label: 'Profile', Icon: User },
]

export function BottomNav({ items: propItems }: { items?: BottomNavItem[] }) {
  const cartCount = useAppSelector((s) => selectCartCount(s.cart.items))

  const items =
    propItems ??
    defaultItems.map((item) =>
      item.to === '/checkout'
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

  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, Icon, end, badge, srText }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon-wrap">
            <Icon strokeWidth={1.75} />
            {badge != null && badge > 0 ? (
              <span className="nav-cart-badge" aria-hidden="true">
                {badge}
              </span>
            ) : null}
          </span>
          <span>{label}</span>
          {srText && badge != null && badge > 0 ? (
            <span className="sr-only">{srText}</span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  )
}
