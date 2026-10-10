import { ChevronLeft } from 'lucide-react'
// Preferensi notifikasi. Dipindah dari /notifications, karena rute itu
// seharusnya berarti kotak masuk — itulah yang dijanjikan tombol lonceng
// berbadge. Halaman ini yang ditautkan dari menu Profil.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import {
  deletePushSubscription,
  fetchPushSubscription,
  savePushSubscription,
  type PushRow,
} from '../api/profile'
import { mockPushSubscription } from '../data/notifications'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { clearPush, registerPush } from '../store/slices/notificationsSlice'
import type { PushSubscriptionRecord } from '../types'

const TOGGLES = [
  { id: 'notifications', label: 'Notifikasi', on: true },
  { id: 'sound', label: 'Suara', on: false },
  { id: 'vibrate', label: 'Getar', on: false },
  { id: 'offers', label: 'Promo & Penawaran', on: true },
  { id: 'payments', label: 'Pembayaran', on: false },
  { id: 'cashback', label: 'Cashback', on: false },
  { id: 'updates', label: 'Pembaruan Aplikasi', on: true },
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

export default function NotificationSettings() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const subscription = useAppSelector((s) => s.notifications.subscription)
  const [pushId, setPushId] = useState<string | null>(null)

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
    const sub = mockPushSubscription(
      navigator.userAgent.includes('Mobile') ? 'mobile-web' : 'web',
    )
    try {
      const row = await savePushSubscription(sub.endpoint, sub.keys.p256dh, sub.keys.auth)
      if (row) setPushId(String(row.id))
    } catch {
      toast.error('Gagal menyimpan registrasi')
    }
    dispatch(registerPush({ subscription: sub }))
    toast.success('Push terdaftar')
  }

  const deactivate = async () => {
    if (pushId) await deletePushSubscription(pushId).catch(() => {})
    setPushId(null)
    dispatch(clearPush())
    toast.success('Registrasi push dimatikan')
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
                {subscription
                  ? `Perangkat terdaftar sejak ${registeredLabel}. `
                  : 'Sakelar ini mendaftarkan perangkat ke server. '}
                Pengiriman push belum aktif di versi ini.
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
