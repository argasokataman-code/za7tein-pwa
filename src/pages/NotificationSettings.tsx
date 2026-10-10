import { ChevronLeft } from 'lucide-react'
// Preferensi notifikasi. Dipindah dari /notifications, karena rute itu
// seharusnya berarti kotak masuk — itulah yang dijanjikan tombol lonceng
// berbadge. Halaman ini yang ditautkan dari menu Profil.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import { subscribePush, pushSupported, unsubscribePush } from '../api/push'
import {
  deletePushSubscription,
  fetchPushSubscription,
  savePushSubscription,
  type PushRow,
} from '../api/profile'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { clearPush, registerPush } from '../store/slices/notificationsSlice'
import type { PushSubscriptionRecord } from '../types'

const TOGGLES = [
  { id: 'order', label: 'Status pesanan', on: true },
  { id: 'courier', label: 'Kurir & pengantaran', on: true },
  { id: 'promo', label: 'Promo & Penawaran', on: true },
  { id: 'payment', label: 'Pembayaran', on: false },
] as const

/** Baris backend → record tampilan (platform dari UA, waktu dari `created_at`). */
function toRecord(row: PushRow): PushSubscriptionRecord {
  return {
    id: String(row.id),
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
    platform: navigator.userAgent.includes('Mobile') ? 'mobile-web' : 'web',
    registeredAt: row.created_at ?? new Date().toISOString(),
  }
}

const platformLabel = () =>
  navigator.userAgent.includes('Mobile') ? 'mobile-web' : 'web'

export default function NotificationSettings() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const subscription = useAppSelector((s) => s.notifications.subscription)
  const [pushId, setPushId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // Service worker hanya ada di build/preview, bukan dev — sejalan dengan
  // pushSupported(); toggle dimatikan di dev supaya tidak menjanjikan hal salah.
  const supported = import.meta.env.PROD && pushSupported()

  // Registrasi tersimpan di tabel `push_subscriptions` — muat saat mount supaya
  // status "aktif" bertahan lintas refresh, bukan hanya di store satu sesi.
  useEffect(() => {
    let alive = true
    fetchPushSubscription()
      .then((row) => {
        if (!alive) return
        if (!row) {
          dispatch(clearPush())
          return
        }
        setPushId(String(row.id))
        dispatch(registerPush({ subscription: toRecord(row) }))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch])

  const activate = async () => {
    setBusy(true)
    try {
      // Langganan nyata: endpoint dari push service peramban (VAPID), bukan mock.
      const keys = await subscribePush()
      const row = await savePushSubscription(keys.endpoint, keys.p256dh, keys.auth)
      setPushId(row ? String(row.id) : null)
      dispatch(
        registerPush({
          subscription: {
            id: row ? String(row.id) : undefined,
            endpoint: keys.endpoint,
            keys: { p256dh: keys.p256dh, auth: keys.auth },
            platform: platformLabel(),
            registeredAt: row?.created_at ?? new Date().toISOString(),
          },
        }),
      )
      toast.success('Push aktif di perangkat ini')
    } catch (error) {
      const denied = error instanceof Error && error.message === 'push-permission-denied'
      toast.error(denied ? 'Izin notifikasi ditolak' : 'Push tidak bisa diaktifkan di sini')
    } finally {
      setBusy(false)
    }
  }

  const deactivate = async () => {
    setBusy(true)
    try {
      await unsubscribePush()
      if (pushId) await deletePushSubscription(pushId).catch(() => {})
      setPushId(null)
      dispatch(clearPush())
      toast.success('Push dimatikan')
    } finally {
      setBusy(false)
    }
  }

  const registeredLabel = subscription
    ? new Date(subscription.registeredAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

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
                <ChevronLeft size={24} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <h1 className="profile-flow-title">Pengaturan Notifikasi</h1>
            </header>

            <main className="profile-flow-main">
              {/* Kategori = jenis notifikasi yang benar-benar dikirim (kolom
                  `notifications.kind`: order, courier, promo, payment). */}
              <div className="notifications-list">
                {TOGGLES.map((t) => (
                  <div className="notification-row" key={t.id}>
                    <span className="notification-label">{t.label}</span>
                    <label className="toggle-wrap" htmlFor={`toggle-${t.id}`}>
                      <input
                        id={`toggle-${t.id}`}
                        className="toggle-input"
                        type="checkbox"
                        defaultChecked={t.on}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
                <div className="notification-row">
                  <span className="notification-label">Notifikasi push</span>
                  <label className="toggle-wrap" htmlFor="toggle-push">
                    <input
                      id="toggle-push"
                      className="toggle-input"
                      type="checkbox"
                      aria-label="Notifikasi push"
                      checked={subscription !== null}
                      disabled={!supported || busy}
                      onChange={(e) => {
                        if (e.target.checked) activate()
                        else deactivate()
                      }}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <p className="text-muted-profile">
                {!supported
                  ? 'Push butuh aplikasi terpasang (build/preview), tidak aktif di mode dev. '
                  : subscription
                    ? `Perangkat ini berlangganan push sejak ${registeredLabel}. `
                    : 'Nyalakan untuk berlangganan push di perangkat ini. '}
                Pengiriman dari server lewat skrip scripts/send-push.mjs.
              </p>

              <button
                type="button"
                className="btn-profile-primary"
                onClick={() => {
                  toast.success('Pengaturan disimpan')
                  navigate('/profile')
                }}
              >
                Simpan
              </button>
            </main>
          </div>
        </div>
      </main>
    </div>
  )
}
