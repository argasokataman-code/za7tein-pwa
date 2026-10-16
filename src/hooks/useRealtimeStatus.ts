import { useEffect, useState } from 'react'

import { onResync } from '../api/realtime'

/** Berapa lama indikator "menyusul" terlihat; resync sendiri berjalan cepat. */
const RESYNC_VISIBLE_MS = 2_500

/**
 * Denyut resync untuk ditampilkan (NFR-05). Sebelumnya muatan disusulkan
 * diam-diam: daftar yang tak berubah tak bisa dibedakan dari "koneksi putus".
 *
 * Keadaan **offline** sengaja tidak dilacak di sini — aplikasi sudah punya layar
 * sendiri untuk itu (`/offline`, dipasang dari `App.tsx` saat jaringan hilang),
 * jadi menambah cabang offline di dalam halaman hanya menghasilkan kode yang
 * tak pernah terlihat.
 */
export function useRealtimeResync(): boolean {
  const [resyncing, setResyncing] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsubscribe = onResync(() => {
      setResyncing(true)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => setResyncing(false), RESYNC_VISIBLE_MS)
    })
    return () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  return resyncing
}
