import { LayoutDashboard, ListChecks, Scale, ScrollText, Store } from 'lucide-react'

import { openDisputeCount, pendingTenantCount } from '../../data/admin'
import { useAppSelector } from '../../hooks/useAppStore'
import type { BottomNavItem } from '../layout/BottomNav'

/**
 * Item navigasi panel CS: satu sumber untuk bottom nav (ponsel) dan sidebar
 * (desktop). Badge dihitung dari state yang sama, jadi dua bentuk nav tak
 * pernah berbeda angka (QL-01).
 */
export function useAdminNavItems(): BottomNavItem[] {
  const tenants = useAppSelector((s) => s.admin.tenants)
  const disputes = useAppSelector((s) => s.admin.disputes)
  const pending = pendingTenantCount(tenants)
  const open = openDisputeCount(disputes)

  return [
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
}
