// Chat order live (customer ↔ kurir). Tabel `chats`/`chat_messages` tidak masuk
// publication Realtime backend, jadi jalur ini polling ringkas (5 dtk) bukan
// websocket — sejajar `useApiNotifications` yang juga polling untuk tabel yang
// tak di-publish. Polling berhenti saat API mati / belum ada order aktif.
import { useCallback, useEffect, useState } from 'react'

import { fetchChatMessages, sendChatMessage, type ChatLine } from '../api/chat'
import { apiEnabled } from '../api/supabase'

const POLL_MS = 5_000

export function useApiChat(orderId: number | null): {
  live: boolean
  lines: ChatLine[]
  send: (body: string) => Promise<void>
} {
  const live = apiEnabled && orderId !== null && Number.isFinite(orderId)
  const [lines, setLines] = useState<ChatLine[]>([])

  useEffect(() => {
    if (!live || orderId === null) return
    let alive = true
    const load = () => {
      fetchChatMessages(orderId)
        .then((items) => {
          if (alive) setLines(items)
        })
        .catch(() => {})
    }
    load()
    const timer = setInterval(load, POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', load)
    return () => {
      alive = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', load)
    }
  }, [live, orderId])

  const send = useCallback(
    async (body: string) => {
      if (!live || orderId === null) return
      await sendChatMessage({ orderId, from: 'customer', body }).catch(() => {})
      const items = await fetchChatMessages(orderId).catch(() => [])
      setLines(items)
    },
    [live, orderId],
  )

  return { live, lines, send }
}
