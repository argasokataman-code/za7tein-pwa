import { Bike, ClipboardList, LayoutDashboard, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAppSelector } from '../../hooks/useAppStore'
import { countByTab } from '../../data/merchantOrders'

const items = [
  { to: '/merchant', label: 'Beranda', Icon: LayoutDashboard, end: true },
  { to: '/merchant/orders', label: 'Order', Icon: ClipboardList, end: false },
  { to: '/merchant/couriers', label: 'Kurir', Icon: Bike, end: false },
  { to: '/merchant/settings', label: 'Setelan', Icon: Settings, end: false },
]

export function MerchantBottomNav() {
  const orders = useAppSelector((s) => s.merchant.orders)
  const incoming = countByTab(orders, 'masuk')

  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon-wrap">
            <Icon strokeWidth={1.75} />
            {to === '/merchant/orders' && incoming > 0 ? (
              <span className="nav-cart-badge" aria-hidden="true">
                {incoming}
              </span>
            ) : null}
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
