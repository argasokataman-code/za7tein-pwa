// Kotak masuk notifikasi — tujuan tombol lonceng di beranda dan konsol ponsel.
//
// Sebelumnya rute ini berisi halaman preferensi toggle, dan lonceng berbadge
// "3" membuka halaman yang tidak memuat satu pun notifikasi. Preferensinya
// pindah ke /notification-settings, karena itu memang pengaturan dan ditautkan
// dari menu Profil, bukan dari lonceng.
//
// Barisnya kini komponen bersama (`NotificationRow`) yang juga dipakai popup
// lonceng konsol desktop, jadi kedua tampilan tak bisa melenceng.
import { Check } from 'lucide-react'

import { markNotificationsRead } from '../api/notifications'
import { BackButton } from '../components/ui/BackButton'
import { NotificationRow } from '../components/ui/NotificationRow'
import { notificationAudienceFromPath } from '../data/notifications'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { markAllRead, selectUnreadCount } from '../store/slices/notificationsSlice'

export default function Notifications() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.notifications.items)
  const unread = selectUnreadCount(items)

  return (
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow">
            <header className="profile-flow-header">
              <BackButton className="back-btn-profile" />
              <h1 className="profile-flow-title">Notifikasi</h1>
            </header>

            <main className="profile-flow-main">
              <div className="inbox-head">
                <span className="inbox-head__count">
                  {unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}
                </span>
                {unread > 0 ? (
                  <button
                    type="button"
                    className="inbox-head__action"
                    onClick={() => {
                      dispatch(markAllRead())
                      void markNotificationsRead(
                        notificationAudienceFromPath(window.location.pathname),
                      ).catch(() => {})
                    }}
                  >
                    Tandai semua dibaca
                  </button>
                ) : null}
              </div>

              {items.length === 0 ? (
                <p className="inbox-foot">Belum ada notifikasi.</p>
              ) : null}

              <ul className="inbox-list">
                {items.map((n) => (
                  <NotificationRow key={n.id} notification={n} />
                ))}
              </ul>

              {items.length > 0 && unread === 0 ? (
                <p className="inbox-foot">
                  <Check size={16} strokeWidth={2} aria-hidden="true" />
                  Semua notifikasi sudah dibaca.
                </p>
              ) : null}
            </main>
          </div>
        </div>
      </main>
    </div>
  )
}
