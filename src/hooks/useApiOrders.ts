/**
 * Sinkron order merchant dari API. Seed `merchant.orders` hanya tampil sebelum
 * hidrasi pertama atau saat API error; begitu API menjawab (walau nol baris),
 * `mergeOrders` menggantinya dengan order nyata supaya Terima/Tolak selalu
 * bekerja pada id yang bisa dipersist ke BE (lihat komentar slice).
 *
 * Sekalian hidrasi batch dari tabel `batches` D1 (`mergeBatches`, read-only):
 * daftar order sudah dimuat lebih dulu, jadi ia bisa jadi cadangan anggota batch
 * saat kolom `route` kosong.
 */
import { useEffect } from 'react'

import { fetchMerchantBatches } from '../api/batches'
import { fetchMerchantOrders } from '../api/orders'
import { apiEnabled } from '../api/supabase'
import { mergeBatches } from '../store/slices/batchSlice'
import { mergeOrders } from '../store/slices/merchantSlice'
import { useAppDispatch } from './useAppStore'

export function useMerchantOrdersSync(): void {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchMerchantOrders()
      .then(async (orders) => {
        if (!alive) return
        dispatch(mergeOrders(orders))
        const batches = await fetchMerchantBatches(undefined, orders)
        if (alive) dispatch(mergeBatches(batches))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch])
}
