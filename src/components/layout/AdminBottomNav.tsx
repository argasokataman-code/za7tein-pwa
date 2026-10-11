import { useAdminNavItems } from '../admin/adminNav'
import { BottomNav } from './BottomNav'

/**
 * Navigasi bawah panel CS (ponsel). Itemnya datang dari `useAdminNavItems`
 * supaya sama persis dengan sidebar desktop (AdminShell).
 */
export function AdminBottomNav() {
  const items = useAdminNavItems()
  return <BottomNav items={items} />
}
