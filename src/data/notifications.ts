// Pembantu kotak masuk notifikasi. Daftar isi datang dari backend (tabel
// `notifications`, `fetchNotifications`) — tidak ada seed mock di sini.
// Sebelumnya daftar contoh selalu di-seed ulang tiap boot dan menetap saat API
// mengembalikan nol baris.
import type { NotifAudience, PushSubscriptionRecord } from '../types'

/* ── Push (R-PUSH-01, M8) ──────────────────────────────────────────────────── */

/**
 * Ketentuan payload push dari PRD. Ditampilkan di layar pengaturan sebagai
 * kontrak, bukan diimplementasikan: repo ini tidak punya service worker push,
 * jadi tidak ada notifikasi yang benar-benar dikirim.
 */
export const PUSH_CONTRACT = {
  maxPayloadKb: 4,
  ttlRequired: true,
  userVisibleOnly: true,
} as const

/**
 * Subscription **placeholder**. Repo ini tak punya `PushManager` (service worker
 * push tak dibuat), jadi endpoint/kunci di bawah bukan dari browser sungguhan —
 * yang nyata adalah **barisnya disimpan** ke tabel `push_subscriptions`.
 */
export function mockPushSubscription(platform = 'web'): PushSubscriptionRecord {
  return {
    endpoint: 'https://push.sa7tein.example/sub/9f2c1b',
    keys: { p256dh: 'BOr…mock…p256dh', auth: 'K7f…mock' },
    platform,
    registeredAt: new Date().toISOString(),
  }
}


/** Audience inbox dari prefix peran di URL (panel admin & konsol SA berbagi `cs`). */
export function notificationAudienceFromPath(pathname: string): NotifAudience {
  if (pathname.startsWith('/merchant')) return 'merchant'
  if (pathname.startsWith('/courier')) return 'courier'
  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) return 'cs'
  return 'customer'
}
