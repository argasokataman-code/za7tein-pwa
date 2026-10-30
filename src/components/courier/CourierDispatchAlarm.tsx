import { ArrowRight, Clock, ShoppingBag, Store, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { markNotificationRead } from '../../api/notifications'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { useBackClose } from '../../hooks/useBackClose'
import { useNotificationSound } from '../../hooks/useNotificationSound'
import {
  clearNotificationAlarm,
  markRead,
} from '../../store/slices/notificationsSlice'

/**
 * Alarm tugas baru untuk kurir inhouse.
 *
 * Kenapa takeover, bukan sekadar badge: dispatch datang saat makanan sudah
 * matang, dan lonceng kecil di header kalah oleh layar tugas yang sedang
 * dibuka. Kartu ini menutup layar sampai kurir mengakuinya, dengan bunyi
 * berulang dari `useNotificationSound` (Web Audio, tanpa berkas audio) dan
 * getar di perangkat yang mendukung. Bunyi berhenti sendiri setelah 30 detik
 * supaya tidak jadi teror kalau ponsel ditinggal, dan tidak pernah berbunyi
 * di layar masuk/onboarding atau permukaan mitra.
 *
 * Notifikasi tetap tersimpan di kotak masuk; "Tutup" hanya menghentikan alarm,
 * badge lonceng tetap menghitungnya sampai dibaca.
 */
export function CourierDispatchAlarm() {
  const alarm = useAppSelector((state) => state.notifications.alarm)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const play = useNotificationSound()
  const primaryRef = useRef<HTMLButtonElement>(null)

  const suppressed =
    location.pathname === '/onboarding' ||
    location.pathname === '/signin' ||
    location.pathname === '/partner' ||
    location.pathname.startsWith('/partner/')
  // Alarm = overlay modal: back menutupnya, bukan memindah layar (MD-13 NB-02).
  useBackClose(Boolean(alarm) && !suppressed, () => dispatch(clearNotificationAlarm()))

  useEffect(() => {
    if (!alarm || suppressed) return
    const startedAt = Date.now()
    const buzz = () => {
      if ('vibrate' in navigator) navigator.vibrate([200, 120, 200])
    }
    play()
    buzz()
    // Satu pola tiap 3 detik, berhenti setelah 30 detik atau saat alarm
    // ditutup. Saat tab disembunyikan bunyinya berhenti, bukan menumpuk.
    const chime = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - startedAt > 30_000) return
      play()
      buzz()
    }, 3_000)
    const stop = window.setTimeout(() => window.clearInterval(chime), 30_000)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    primaryRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch(clearNotificationAlarm())
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.clearInterval(chime)
      window.clearTimeout(stop)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [alarm, suppressed, play, dispatch])

  if (!alarm || suppressed) return null

  const openTasks = () => {
    dispatch(markRead(alarm.id))
    void markNotificationRead(alarm.id).catch(() => {})
    dispatch(clearNotificationAlarm())
    navigate('/')
  }

  return (
    <div
      className="courier-alarm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="courier-alarm-title"
      aria-describedby="courier-alarm-body"
    >
      <div className="courier-alarm-panel">
        <button
          type="button"
          className="courier-alarm-close"
          aria-label="Tutup alarm"
          onClick={() => dispatch(clearNotificationAlarm())}
        >
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <img
          className="courier-alarm-art"
          src="/assets/illustrations/dispatch-courier.webp"
          alt=""
          width={670}
          height={215}
          decoding="async"
        />

        <div className="courier-alarm-content">
          <div className="courier-alarm-head">
            <span className="courier-alarm-badge" aria-hidden="true">
              <Store size={24} strokeWidth={1.75} />
            </span>
            <div className="courier-alarm-heading">
              <p className="courier-alarm-kicker">Tugas baru</p>
              <h2 className="courier-alarm-title" id="courier-alarm-title">
                {alarm.title}
              </h2>
            </div>
          </div>

          <p className="courier-alarm-body" id="courier-alarm-body">
            {alarm.body}
          </p>

          <div className="courier-alarm-info">
            {alarm.orderId ? (
              <div className="courier-alarm-cell">
                <ShoppingBag size={20} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Order #{alarm.orderId}</strong>
                  <span>Pesanan</span>
                </div>
              </div>
            ) : null}
            <div className="courier-alarm-cell">
              <Clock size={20} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <strong>Masuk</strong>
                <span>{alarm.time}</span>
              </div>
            </div>
          </div>

          <button
            ref={primaryRef}
            type="button"
            className="courier-alarm-primary"
            onClick={openTasks}
          >
            Lihat tugas
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="courier-alarm-dismiss"
            onClick={() => dispatch(clearNotificationAlarm())}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
