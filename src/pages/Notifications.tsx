// Kotak masuk notifikasi — tujuan tombol lonceng di beranda.
//
// Sebelumnya rute ini berisi halaman preferensi toggle, dan lonceng berbadge
// "3" membuka halaman yang tidak memuat satu pun notifikasi. Preferensinya
// pindah ke /notification-settings, karena itu memang pengaturan dan ditautkan
// dari menu Profil, bukan dari lonceng.
import { Bell, Bike, Check, Tag, Wallet, type LucideIcon } from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { markAllRead, markRead, selectUnreadCount } from '../store/slices/notificationsSlice'
import type { AppNotification } from '../types'

const KIND_ICON: Record<AppNotification['kind'], LucideIcon> = {
  order: Bike,
  promo: Tag,
  payment: Wallet,
  system: Bell,
}

export default function Notifications() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.notifications.items)
  const unread = selectUnreadCount(items)

  return (
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow">
            <header className="profile-flow-header">
              <button
                type="button"
                className="back-btn-profile"
                aria-label="Kembali"
                onClick={() => navigate(-1)}
              >
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
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
                    onClick={() => dispatch(markAllRead())}
                  >
                    Tandai semua dibaca
                  </button>
                ) : null}
              </div>

              <ul className="inbox-list">
                {items.map((n) => {
                  const Icon = KIND_ICON[n.kind]
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        className={n.unread ? 'inbox-row inbox-row--unread' : 'inbox-row'}
                        aria-label={`${n.title}${n.unread ? ', belum dibaca' : ''}`}
                        onClick={() => dispatch(markRead(n.id))}
                      >
                        <span className="inbox-row__icon" aria-hidden="true">
                          <Icon size={18} strokeWidth={1.75} />
                        </span>

                        <span className="inbox-row__text">
                          <span className="inbox-row__title">{n.title}</span>
                          <span className="inbox-row__body">{n.body}</span>
                          <span className="inbox-row__time">{n.time}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {unread === 0 ? (
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
