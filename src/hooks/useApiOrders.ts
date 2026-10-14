/**
 * Sinkron order merchant dari API. Seed `merchant.orders` hanya tampil sebelum
 * hidrasi pertama atau saat API error; begitu API menjawab (walau nol baris),
 * `mergeOrders` menggantinya dengan order nyata supaya Terima/Tolak selalu
 * bekerja pada id yang bisa dipersist ke BE (lihat komentar slice).
 */
import { useEffect } from 'react'

import { fetchMerchantOrders } from '../api/orders'
import { apiEnabled } from '../api/supabase'
import { mergeOrders } from '../store/slices/merchantSlice'
import { useAppDispatch } from './useAppStore'

export function useMerchantOrdersSync(): void {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchMerchantOrders()
      .then((orders) => {
        if (alive) dispatch(mergeOrders(orders))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch])
}
