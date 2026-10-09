/**
 * Sinkron order merchant dari API — **mock dulu, API menimpa** (pola sama
 * dengan `useApiCatalog`). Kalau API mati/kosong/error, seed `merchant.orders`
 * tetap tampil; kalau ada order live, ia digabung ke depan seed lewat
 * `mergeOrders` supaya aksi Terima/Tolak tetap bekerja pada id yang ada.
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
        if (alive && orders.length) dispatch(mergeOrders(orders))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch])
}
