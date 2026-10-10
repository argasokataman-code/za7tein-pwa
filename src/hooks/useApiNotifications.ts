// Kotak masuk live per audience. Polling (bukan `useSyncOnce`) supaya notif baru
// muncul tanpa refresh: repo ini memakai fetch mentah ke PostgREST (tanpa
// `@supabase/supabase-js`), jadi channel Realtime websocket tak tersedia —
// interval + refresh saat tab kembali fokus sudah memberi efek "langsung".
// Mock tetap jadi fallback bila API mati/kosong.
import { useEffect } from 'react'

import { fetchNotifications } from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { setNotifications } from '../store/slices/notificationsSlice'
import type { NotifAudience } from '../types'
import { useAppDispatch } from './useAppStore'

const POLL_MS = 8_000

export function useApiNotifications(audience: NotifAudience): void {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    const load = () => {
      fetchNotifications(audience)
        .then((items) => {
          if (alive && items.length) dispatch(setNotifications(items))
        })
        .catch(() => {})
    }
    load()
    const timer = setInterval(load, POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [audience, dispatch])
}
