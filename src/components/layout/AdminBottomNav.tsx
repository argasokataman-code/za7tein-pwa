import { LayoutDashboard, ListChecks, Scale, Store, ScrollText } from 'lucide-react'

import { useAppSelector } from '../../hooks/useAppStore'
import { openDisputeCount, pendingTenantCount } from '../../data/admin'
import { BottomNav } from './BottomNav'
import type { BottomNavItem } from './BottomNav'

export function AdminBottomNav() {
  const tenants = useAppSelector((s) => s.admin.tenants)
  const disputes = useAppSelector((s) => s.admin.disputes)
  const pending = pendingTenantCount(tenants)
  const open = openDisputeCount(disputes)

  const items: BottomNavItem[] = [
    { to: '/', label: 'Ringkasan', Icon: LayoutDashboard, end: true },
    {
      to: '/onboarding',
      label: 'Onboarding',
      Icon: ListChecks,
      end: false,
      badge: pending,
      srText: pending > 0 ? `${pending} tenant menunggu review` : undefined,
    },
    {
      to: '/disputes',
      label: 'Sengketa',
      Icon: Scale,
      end: false,
      badge: open,
      srText: open > 0 ? `${open} sengketa terbuka` : undefined,
    },
    { to: '/merchants', label: 'Merchant', Icon: Store, end: false },
    { to: '/ledger', label: 'Ledger', Icon: ScrollText, end: false },
  ]

  return <BottomNav items={items} />
}
