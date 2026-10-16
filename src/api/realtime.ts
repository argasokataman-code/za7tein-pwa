/**
 * Realtime Supabase lewat WebSocket (protokol Phoenix) — tanpa dependency baru,
 * pakai `WebSocket` bawaan browser.
 *
 * Publication Realtime backend ini berisi `orders, merchants, menus,
 * wallet_ledgers, disputes, couriers, batches`. `notifications` dan `checkpoints`
 * TIDAK termasuk, jadi perubahan status order dipakai sebagai sinyal untuk
 * menyegarkan inbox (bukan langganan langsung ke tabel `notifications`).
 */
import { refToken } from './reference'
import { WS_MESSAGE_VERSION, WS_SUBSCRIBED_TOPICS, WS_TOPIC_PREFIX } from '../data/realtime'
import { apiBase, apiEnabled } from './supabase'

type RealtimeHandler = (payload: unknown) => void

const HEARTBEAT_MS = 25_000
const RECONNECT_MS = 3_000

/* ── Sinyal resync (NFR-05) ─────────────────────────────────────────────────── */

type ResyncListener = () => void
const resyncListeners = new Set<ResyncListener>()

/**
 * Kabarkan bahwa muatan sedang disusulkan (socket sambung kembali / `online`).
 * Dipakai indikator sambungan supaya "menyusul state yang terlewat" terlihat,
 * bukan cuma terjadi diam-diam.
 */
export function notifyResync(): void {
  resyncListeners.forEach((fn) => fn())
}

/** Dengar sinyal resync; balikan fungsi untuk melepas. */
export function onResync(fn: ResyncListener): () => void {
  resyncListeners.add(fn)
  return () => {
    resyncListeners.delete(fn)
  }
}

/** Langganan `orders` (semua event). Balikan fungsi untuk melepas. */
export function subscribeOrders(onChange: RealtimeHandler): () => void {
  if (!apiEnabled || typeof WebSocket === 'undefined') return () => {}

  let ws: WebSocket | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let retry: ReturnType<typeof setTimeout> | null = null
  let closed = false

  const connect = async () => {
    if (closed) return
    let token = apiBase.anonKey
    try {
      token = (await refToken()) || apiBase.anonKey
    } catch {
      // gagal login → tetap coba dengan anon
    }
    const proto = apiBase.url.startsWith('https') ? 'wss' : 'ws'
    const host = apiBase.url.replace(/^https?:\/\//, '')
    // Topik & versi kontrak pesan datang dari katalog (`src/data/realtime.ts`),
    // bukan ditulis ulang di sini — diuji terhadap `contract.realtime` (NFR-06).
    const topic = `${WS_TOPIC_PREFIX}${WS_SUBSCRIBED_TOPICS[0]}`
    ws = new WebSocket(
      `${proto}://${host}/realtime/v1/websocket?apikey=${apiBase.anonKey}&vsn=${WS_MESSAGE_VERSION}`,
    )

    ws.onopen = () => {
      ws?.send(
        JSON.stringify({
          topic,
          event: 'phx_join',
          payload: {
            config: {
              postgres_changes: [
                { event: '*', schema: 'public', table: WS_SUBSCRIBED_TOPICS[0] },
              ],
            },
            access_token: token,
          },
          ref: '1',
        }),
      )
      heartbeat = setInterval(() => {
        ws?.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: 'hb' }))
      }, HEARTBEAT_MS)
    }
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.event === 'postgres_changes') onChange(msg.payload)
      } catch {
        // pesan non-JSON; abaikan
      }
    }
    ws.onclose = () => {
      if (heartbeat) clearInterval(heartbeat)
      if (!closed) retry = setTimeout(connect, RECONNECT_MS)
    }
    ws.onerror = () => ws?.close()
  }

  void connect()

  return () => {
    closed = true
    if (heartbeat) clearInterval(heartbeat)
    if (retry) clearTimeout(retry)
    ws?.close()
  }
}
