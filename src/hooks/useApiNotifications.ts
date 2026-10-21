// Kotak masuk live per audience. Realtime websocket (`useApiRealtime`) yang
// jadi jalur utama; polling ini jaring pengaman bila socket putus + refresh saat
// tab kembali fokus. Mock tetap jadi fallback bila API mati/kosong.
import { useEffect, useRef } from 'react'

import { fetchNotifications } from '../api/reference'
import { apiEnabled } from '../api/supabase'
import {
  raiseNotificationAlarm,
  setNotifications,
} from '../store/slices/notificationsSlice'
import type { NotifAudience } from '../types'
import { useAppDispatch } from './useAppStore'

// Kurir memikul order yang sudah matang: 30 detik terlalu lama untuk tugas
// baru, jadi audiensnya dipoll lebih rapat. Peran lain tetap 30 detik agar
// tidak menambah beban tanpa manfaat.
const POLL_MS = 30_000
const COURIER_POLL_MS = 15_000

export function useApiNotifications(audience: NotifAudience): void {
  const dispatch = useAppDispatch()
  // Id yang sudah pernah terlihat. Muatan pertama hanya jadi baseline: notifikasi
  // lama yang belum dibaca tidak boleh membangunkan alarm saat aplikasi dibuka.
  const seen = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    const load = () => {
      fetchNotifications(audience)
        .then((items) => {
          if (!alive) return
          const fresh = items.filter(
            (item) => item.unread && item.kind === 'courier' && !seen.current?.has(item.id),
          )
          if (seen.current === null) {
            seen.current = new Set()
          } else if (audience === 'courier' && fresh.length > 0) {
            // Satu alarm untuk notifikasi terbaru; badge tetap menghitung semua.
            dispatch(raiseNotificationAlarm(fresh[0]))
          }
          items.forEach((item) => seen.current?.add(item.id))
          dispatch(setNotifications(items))
        })
        .catch(() => {})
    }
    load()
    const timer = setInterval(load, audience === 'courier' ? COURIER_POLL_MS : POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)
    // Segera saat koneksi kembali: polling 30s terasa lambat setelah offline.
    window.addEventListener('online', load)
    return () => {
      alive = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', load)
    }
  }, [audience, dispatch])
}
