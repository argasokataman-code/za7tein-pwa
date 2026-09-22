import { Bike, BookOpenText, ClipboardList, LayoutDashboard, Settings } from 'lucide-react'

import { useAppSelector } from '../../hooks/useAppStore'
import { BottomNav } from './BottomNav'
import type { BottomNavItem } from './BottomNav'
import { countByTab } from '../../data/merchantOrders'

export function MerchantBottomNav() {
  const orders = useAppSelector((s) => s.merchant.orders)
  const incoming = countByTab(orders, 'masuk')

  const items: BottomNavItem[] = [
    { to: '/', label: 'Beranda', Icon: LayoutDashboard, end: true },
    {
      to: '/orders',
      label: 'Order',
      Icon: ClipboardList,
      end: false,
      badge: incoming,
      srText: incoming > 0 ? `${incoming} pesanan masuk` : undefined,
    },
    { to: '/menu', label: 'Menu', Icon: BookOpenText, end: false },
    { to: '/couriers', label: 'Kurir', Icon: Bike, end: false },
    { to: '/settings', label: 'Setelan', Icon: Settings, end: false },
  ]

  return <BottomNav items={items} />
}
