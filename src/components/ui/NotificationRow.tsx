import { Bell, Bike, Tag, Truck, Wallet, type LucideIcon } from 'lucide-react'

import { markNotificationRead } from '../../api/notifications'
import { useAppDispatch } from '../../hooks/useAppStore'
import { markRead } from '../../store/slices/notificationsSlice'
import type { AppNotification } from '../../types'

const KIND_ICON: Record<AppNotification['kind'], LucideIcon> = {
  order: Bike,
  promo: Tag,
  payment: Wallet,
  courier: Truck,
  system: Bell,
}

interface NotificationRowProps {
  notification: AppNotification
}

/**
 * Satu baris notifikasi. Satu sumber markup untuk kotak masuk penuh
 * (`/notifications`) dan popup lonceng konsol desktop, jadi keduanya tak bisa
 * melenceng. Klik menandai dibaca di store + menulis balik ke backend.
 *
 * Merender `<li>` dan wajib berada di dalam `<ul className="inbox-list">`.
 */
export function NotificationRow({ notification: n }: NotificationRowProps) {
  const dispatch = useAppDispatch()
  const Icon = KIND_ICON[n.kind]

  return (
    <li>
      <button
        type="button"
        className={`inbox-row inbox-row--${n.kind}${n.unread ? ' inbox-row--unread' : ''}`}
        aria-label={`${n.title}${n.unread ? ', belum dibaca' : ''}`}
        onClick={() => {
          dispatch(markRead(n.id))
          void markNotificationRead(n.id).catch(() => {})
        }}
      >
        <span className="inbox-row__icon" aria-hidden="true">
          <Icon size={18} strokeWidth={1.75} />
        </span>

        <span className="inbox-row__text">
          <span className="inbox-row__head">
            <span className="inbox-row__title">{n.title}</span>
            <span className="inbox-row__time">{n.time}</span>
          </span>
          <span className="inbox-row__body">{n.body}</span>
        </span>
      </button>
    </li>
  )
}
