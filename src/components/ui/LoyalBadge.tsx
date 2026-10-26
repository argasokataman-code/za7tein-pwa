import { Medal } from 'lucide-react'

import { findCustomer, isLoyalCustomer } from '../../data/people'

interface LoyalBadgeProps {
  customerId: string
}

/**
 * Label "Pelanggan Setia" untuk customer yang sudah menyelesaikan cukup banyak
 * order. Ambangnya di `data/people.ts` (`LOYAL_ORDER_MIN`), bukan di sini.
 *
 * Customer tanpa data registri tidak diberi label apa pun: lebih baik diam
 * daripada mengarang status.
 */
export function LoyalBadge({ customerId }: LoyalBadgeProps) {
  const customer = findCustomer(customerId)
  if (!isLoyalCustomer(customer)) return null

  return (
    <span className="loyal-badge">
      <Medal size={12} strokeWidth={1.75} aria-hidden="true" />
      Pelanggan Setia
    </span>
  )
}
