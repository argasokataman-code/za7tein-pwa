// Kotak masuk live per audience. Realtime websocket (`useApiRealtime`) yang
// jadi jalur utama; polling ini jaring pengaman bila socket putus + refresh saat
// tab kembali fokus. Mock tetap jadi fallback bila API mati/kosong.
import { useEffect } from 'react'

import { fetchNotifications } from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { setNotifications } from '../store/slices/notificationsSlice'
import type { NotifAudience } from '../types'
import { useAppDispatch } from './useAppStore'

const POLL_MS = 30_000

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
