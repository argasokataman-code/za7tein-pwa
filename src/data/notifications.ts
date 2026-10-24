// Pembantu kotak masuk notifikasi. Daftar isi datang dari backend (tabel
// `notifications`, `fetchNotifications`) — tidak ada seed mock di sini.
// Sebelumnya daftar contoh selalu di-seed ulang tiap boot dan menetap saat API
// mengembalikan nol baris.
import type { NotifAudience, PushSubscriptionRecord } from '../types'

/* ── Push (R-PUSH-01, M8) ──────────────────────────────────────────────────── */

/**
 * Ketentuan payload push dari PRD, ditampilkan di layar pengaturan sebagai
 * kontrak. Service workernya ada (`public/push-sw.js`); yang belum adalah
 * pengiriman otomatis dari BE, jadi push masih dipicu manual (script/fungsi demo).
 */
export const PUSH_CONTRACT = {
  maxPayloadKb: 4,
  ttlRequired: true,
  userVisibleOnly: true,
} as const

/**
 * Subscription **placeholder**. `PushManager` sungguhan baru tersedia saat
 * aplikasi di-install (khususnya iOS, §20.3 L2), jadi endpoint/kunci di bawah
 * bukan dari browser — yang nyata adalah **barisnya disimpan** ke tabel
 * `push_subscriptions`.
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
  if (pathname.startsWith('/ops') || pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) return 'cs'
  return 'customer'
}
