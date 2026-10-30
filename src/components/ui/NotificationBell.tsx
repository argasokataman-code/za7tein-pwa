import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { markNotificationsRead } from '../../api/notifications'
import { notificationAudienceFromPath } from '../../data/notifications'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { useBackClose } from '../../hooks/useBackClose'
import { markAllRead, selectUnreadCount } from '../../store/slices/notificationsSlice'
import { NotificationRow } from './NotificationRow'

/**
 * Batas lebar konsol desktop — konsol ops memakai rail `.sa-root` yang sama
 * dengan Super Admin. Di bawahnya popup tidak dibuka.
 */
const DESKTOP_QUERY = '(min-width: 901px)'
/** Baris maksimum di popup. Sisanya lewat tautan inbox — tanpa gulir bersarang. */
const PANEL_LIMIT = 5

interface NotificationBellProps {
  /**
   * `plain` — header konsol: ikon polos transparan (`.notif-bell`).
   * `hero` — kontrol hero beranda (kelas `.s7-hero`): memakai resep
   * `.s7-notification` yang **sama persis** dengan beranda pelanggan, bukan
   * salinannya, supaya keduanya tak bisa melenceng.
   */
  variant?: 'plain' | 'hero'
  /**
   * Konsol web desktop: klik membuka popup daftar notifikasi di bawah lonceng,
   * bukan pindah halaman penuh. Di lebar ponsel perilakunya tetap pindah ke
   * inbox — popup adalah pola web, bukan pola PWA.
   */
  panel?: boolean
}

/**
 * Lonceng notifikasi untuk header peran (merchant/kurir/CS). Angka dari slice
 * yang sama dengan lonceng beranda customer, jadi badge dan halaman inbox tidak
 * bisa berbeda. Navigasi relatif terhadap basename router peran aktif, jadi
 * `/notifications` mengarah ke inbox peran itu.
 *
 * Dengan `panel` (konsol web desktop ≥901px) lonceng membuka popup; isinya
 * memakai baris yang sama dengan halaman inbox (`NotificationRow`), jadi kedua
 * tampilan itu tak bisa melenceng.
 */
export function NotificationBell({ variant = 'plain', panel = false }: NotificationBellProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.notifications.items)
  const unread = useAppSelector((s) => selectUnreadCount(s.notifications.items))
  const hero = variant === 'hero'
  const usePanel = panel && !hero

  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  // Popup notifikasi desktop = overlay: back menutupnya (MD-13 NB-02).
  useBackClose(open, () => setOpen(false))

  // Popup non-modal: tutup saat klik di luar atau Escape; fokus balik ke lonceng.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const button = (
    <button
      ref={buttonRef}
      type="button"
      className={hero ? 's7-notification' : 'notif-bell'}
      aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
      aria-haspopup={usePanel ? 'dialog' : undefined}
      aria-expanded={usePanel ? open : undefined}
      onClick={() => {
        if (usePanel && window.matchMedia(DESKTOP_QUERY).matches) setOpen((v) => !v)
        else navigate('/notifications')
      }}
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

  if (!usePanel) return button

  return (
    <div className="notif" ref={wrapRef}>
      {button}
      {open ? (
        <div className="notif-panel" role="dialog" aria-label="Notifikasi">
          <div className="notif-panel__head">
            <span>Notifikasi</span>
            {unread > 0 ? (
              <button
                type="button"
                className="notif-panel__action"
                onClick={() => {
                  dispatch(markAllRead())
                  void markNotificationsRead(
                    notificationAudienceFromPath(window.location.pathname),
                  ).catch(() => {})
                }}
              >
                Tandai semua dibaca
              </button>
            ) : (
              <span className="notif-panel__count">Semua dibaca</span>
            )}
          </div>

          {items.length === 0 ? (
            <p className="notif-panel__empty">Belum ada notifikasi.</p>
          ) : (
            <ul className="inbox-list">
              {items.slice(0, PANEL_LIMIT).map((n) => (
                <NotificationRow key={n.id} notification={n} />
              ))}
            </ul>
          )}

          <button
            type="button"
            className="notif-panel__all"
            onClick={() => {
              setOpen(false)
              navigate('/notifications')
            }}
          >
            Lihat semua notifikasi
          </button>
        </div>
      ) : null}
    </div>
  )
}
