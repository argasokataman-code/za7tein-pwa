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
export function NotificationBell() {
  const navigate = useNavigate()
  const unread = useAppSelector((s) => selectUnreadCount(s.notifications.items))

  return (
    <button
      type="button"
      className="notif-bell"
      aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
      onClick={() => navigate('/notifications')}
    >
      <Bell size={22} strokeWidth={1.75} aria-hidden="true" />
      {unread > 0 ? (
        <span className="notif-bell__badge" aria-hidden="true">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </button>
  )
}
