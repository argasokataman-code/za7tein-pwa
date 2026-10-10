/**
 * Web Push (VAPID) — langganan perangkat lewat Service Worker + `PushManager`.
 *
 * Langganan sungguhan (endpoint dikeluarkan push service peramban), bukan lagi
 * placeholder. Kunci publik VAPID boleh publik; kunci privat untuk mengirim
 * TIDAK ada di klien (lihat `scripts/send-push.mjs`).
 */
const VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ||
  'BEGmjyRsl649TJi4Rhfs5dfbJjPaJyEL6zKNGO4BTAJ-88_lCzq64e7XCDChH1EwzyC80agWz4oD4QuDaAHIkWI'

export interface PushKeys {
  endpoint: string
  p256dh: string
  auth: string
}

/** Peramban siap push? (butuh SW aktif, jadi hanya di build/preview — bukan dev). */
export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** base64url VAPID → `Uint8Array` untuk `applicationServerKey`. */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
  return bytes
}

/** Minta izin lalu langganan push; kembalikan kunci untuk disimpan ke backend. */
export async function subscribePush(): Promise<PushKeys> {
  if (!pushSupported()) throw new Error('push-unsupported')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('push-permission-denied')
  // `getRegistration` (bukan `.ready`) supaya di dev — service worker memang tak
  // terdaftar — gagal cepat alih-alih menggantung menunggu selamanya.
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) throw new Error('push-unsupported')
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }))
  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('push-subscribe-invalid')
  }
  return { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }
}

/** Batalkan langganan perangkat (dipakai saat push dimatikan). */
export async function unsubscribePush(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  await subscription?.unsubscribe()
}
