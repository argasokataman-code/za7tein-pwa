import { Bike, Home, UserRound, Wallet } from 'lucide-react'

import { useAppSelector } from '../../hooks/useAppStore'
import { isActiveTask } from '../../data/courier'
import { BottomNav } from './BottomNav'
import type { BottomNavItem } from './BottomNav'

/** Tiga tab saja — brief kurir: "minimalis satu tangan". */
export function CourierBottomNav() {
  const tasks = useAppSelector((s) => s.courier.tasks)
  const active = tasks.filter(isActiveTask).length
  const courierKind = useAppSelector((s) => s.auth.courierKind)
  const selfId = useAppSelector((s) => s.partner.selfId)
  const pending = useAppSelector(
    (s) => s.partner.assignments.filter((a) => a.partnerId === selfId && a.status === 'pending').length,
  )

  // Partner tidak punya batch/tips/dompet toko — hanya tawaran Quick dan akun.
  if (courierKind === 'partner') {
    const partnerItems: BottomNavItem[] = [
      {
        to: '/partner',
        label: 'Tugas',
        Icon: Bike,
        end: true,
        badge: pending,
        srText: pending > 0 ? `${pending} tawaran menunggu` : undefined,
      },
      { to: '/profile', label: 'Profil', Icon: UserRound, end: false },
    ]
    return <BottomNav items={partnerItems} />
  }

  const items: BottomNavItem[] = [
    {
      to: '/',
      label: 'Beranda',
      Icon: Home,
      end: true,
      badge: active,
      srText: active > 0 ? `${active} tugas berjalan` : undefined,
    },
    { to: '/tips', label: 'Tips', Icon: Wallet, end: false },
    { to: '/profile', label: 'Profil', Icon: UserRound, end: false },
  ]

  return <BottomNav items={items} />
}
