/**
 * Lokasi kurir bergerak ↔ Worker D1 (`couriers.latitude/longitude/last_seen_at`).
 *
 * Kontrak BE (diverifikasi 2026-11-07):
 *  - `POST /rest/v1/rpc/update_courier_location { p_lat, p_lng }` — hanya akun
 *    kurir; `400 "bukan kurir"` untuk peran lain.
 *  - `POST /rest/v1/rpc/courier_location { p_order_id }` — hanya peserta order
 *    (customer/merchant/kurir terkait/ops); `null` bila order tanpa kurir.
 *    `stale` dihitung server: `last_seen_at` lebih tua dari 120 detik.
 *
 * Batasan PRD **L1**: posisi hanya dikirim selama app kurir terbuka dan layar
 * menyala (bukan background tracking). Karena itu pengiriman dimulai saat
 * pengantaran aktif dan dihentikan di luar itu.
 */
import { apiEnabled, rpc } from './supabase'
import { ensureCourierToken } from './orders'

export interface OrderCourierLocation {
  id: number
  name: string
  latitude: number
  longitude: number
  last_seen_at: string
  /** Selisih milidetik dari server saat dibaca. */
  age_ms: number
  /** `true` bila `last_seen_at` lebih tua dari ambang server (120 detik). */
  stale: boolean
}

/** `api-<n>` / `<n>` → id order numerik; seed non-numerik → `null`. */
export function numericOrderId(orderId: string | number | null | undefined): number | null {
  if (typeof orderId === 'number') return Number.isFinite(orderId) ? orderId : null
  const raw = String(orderId ?? '')
  const value = /^api-(\d+)$/.exec(raw)?.[1] ?? (/^\d+$/.test(raw) ? raw : '')
  return value ? Number(value) : null
}

/** Kirim satu posisi kurir. `false` = BE menolak (bukan kurir / API mati). */
export async function pushCourierLocation(lat: number, lng: number): Promise<boolean> {
  if (!apiEnabled) return false
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  try {
    const token = await ensureCourierToken()
    await rpc(token, 'update_courier_location', { p_lat: lat, p_lng: lng })
    return true
  } catch {
    return false
  }
}

/** Posisi terakhir kurir untuk satu order; `null` = tanpa kurir / gagal / API mati. */
export async function fetchOrderCourierLocation(
  orderId: number,
): Promise<OrderCourierLocation | null> {
  if (!apiEnabled || !Number.isFinite(orderId)) return null
  try {
    const token = await ensureCourierToken()
    const row = await rpc<OrderCourierLocation | null>(token, 'courier_location', {
      p_order_id: orderId,
    })
    if (!row || !Number.isFinite(row.latitude) || !Number.isFinite(row.longitude)) return null
    return row
  } catch {
    return null
  }
}

/** Jeda minimum antar-kirim; BE menandai stale setelah 120 detik. */
const SEND_INTERVAL_MS = 10_000

/**
 * Ikuti posisi perangkat selama pengantaran aktif. Mengembalikan fungsi stop.
 *
 * `watchPosition` sendiri sudah mengirim tiap kali posisi berubah; pengiriman
 * dibatasi `SEND_INTERVAL_MS` supaya tidak membanjiri Worker dan tidak
 * menghabiskan baterai. Error perangkat (izin ditolak, GPS mati) diteruskan ke
 * `onError`, bukan ditelan.
 */
export function startCourierLocationWatch(
  onUpdate?: (lat: number, lng: number) => void,
  onError?: (error: GeolocationPositionError) => void,
): () => void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    onError?.({ code: 2, message: 'Geolocation tidak tersedia', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
    return () => {}
  }

  let lastSentAt = 0
  let inFlight = false

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const now = Date.now()
      if (inFlight || now - lastSentAt < SEND_INTERVAL_MS) return
      inFlight = true
      lastSentAt = now
      void pushCourierLocation(latitude, longitude)
        .then((ok) => {
          if (ok) onUpdate?.(latitude, longitude)
        })
        .finally(() => {
          inFlight = false
        })
    },
    (error) => onError?.(error),
    { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
  )

  return () => navigator.geolocation.clearWatch(watchId)
}
