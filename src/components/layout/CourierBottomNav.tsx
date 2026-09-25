import { Home, UserRound, Wallet } from 'lucide-react'

import { useAppSelector } from '../../hooks/useAppStore'
import { isActiveTask } from '../../data/courier'
import { BottomNav } from './BottomNav'
import type { BottomNavItem } from './BottomNav'

/** Tiga tab saja — brief kurir: "minimalis satu tangan". */
export function CourierBottomNav() {
  const tasks = useAppSelector((s) => s.courier.tasks)
  const active = tasks.filter(isActiveTask).length

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
