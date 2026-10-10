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
import { apiBase, apiEnabled } from './supabase'

type RealtimeHandler = (payload: unknown) => void

const HEARTBEAT_MS = 25_000
const RECONNECT_MS = 3_000

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
    ws = new WebSocket(
      `${proto}://${host}/realtime/v1/websocket?apikey=${apiBase.anonKey}&vsn=1.0.0`,
    )

    ws.onopen = () => {
      ws?.send(
        JSON.stringify({
          topic: 'realtime:public:orders',
          event: 'phx_join',
          payload: {
            config: { postgres_changes: [{ event: '*', schema: 'public', table: 'orders' }] },
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
