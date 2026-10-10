import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAppSelector } from '../../hooks/useAppStore'
import { selectUnreadCount } from '../../store/slices/notificationsSlice'

/**
 * Lonceng notifikasi untuk header peran (merchant/kurir/CS). Angka dari slice
 * yang sama dengan lonceng beranda customer, jadi badge dan halaman inbox tidak
 * bisa berbeda. Navigasi relatif terhadap basename router peran aktif, jadi
 * `/notifications` mengarah ke inbox peran itu.
 */
interface NotificationBellProps {
  /**
   * `plain` — header konsol: ikon polos transparan (`.notif-bell`).
   * `hero` — kontrol hero beranda (kelas `.s7-hero`): memakai resep
   * `.s7-notification` yang **sama persis** dengan beranda pelanggan, bukan
   * salinannya, supaya keduanya tak bisa melenceng.
   */
  variant?: 'plain' | 'hero'
}

export function NotificationBell({ variant = 'plain' }: NotificationBellProps) {
  const navigate = useNavigate()
  const unread = useAppSelector((s) => selectUnreadCount(s.notifications.items))
  const hero = variant === 'hero'

  return (
    <button
      type="button"
      className={hero ? 's7-notification' : 'notif-bell'}
      aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
      onClick={() => navigate('/notifications')}
    >
      <Bell
        size={hero ? undefined : 22}
        className={hero ? 's7-bell-icon' : undefined}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      {unread > 0 ? (
        <span className={hero ? 's7-notification__badge' : 'notif-bell__badge'} aria-hidden="true">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </button>
  )
}
