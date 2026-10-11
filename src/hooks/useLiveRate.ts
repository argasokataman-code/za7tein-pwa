import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import toast from 'react-hot-toast'

import { getExchangeRate, refreshLiveRate, subscribeRate } from '../data/currency'

// Auto-sync sekali per sesi halaman. Rate tetap dinilai "basi" per hari, jadi
// kunjungan berikutnya pada hari yang sama tidak memanggil provider lagi.
let bootRefreshStarted = false

/**
 * Kurs live IDR↔JOD (keputusan OQ-26).
 *
 * - Reaktif: berlangganan `rate` di `data/currency` lewat `useSyncExternalStore`,
 *   sehingga formatter murni (`money`, `idrToJod`) otomatis ikut berubah.
 * - Auto harian: hook pertama yang menempel memicu `refreshLiveRate()`; hook
 *   lain hanya berlangganan. Rate basi (≥ sehari) → fetch, segar → no-op.
 * - Manual: `refresh()` memaksa fetch dan memunculkan toast hasil.
 */
export function useLiveRate() {
  const rate = useSyncExternalStore(subscribeRate, getExchangeRate)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (bootRefreshStarted) return
    bootRefreshStarted = true
    void refreshLiveRate().catch(() => {
      // Gagal → rate lama (mock/cache) tetap dipakai, transaksi tidak diblokir.
    })
  }, [])

  const refresh = useCallback(async () => {
    setSyncing(true)
    try {
      await refreshLiveRate(true)
      toast.success('Kurs live diperbarui')
    } catch {
      toast.error('Gagal ambil kurs, pakai kurs terakhir')
    } finally {
      setSyncing(false)
    }
  }, [])

  return { rate, syncing, refresh }
}
