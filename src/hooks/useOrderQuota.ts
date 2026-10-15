/**
 * Sisa siklus kuota order aktif (§17): reserve dilakukan saat order dibuat
 * (`PaymentAmount`), di sini **konsumsi saat selesai** dan **pengembalian saat
 * batal**. Dipisah ke hook supaya layar tahap pesanan — yang sudah di batas
 * baris — tidak menambah dua selector + dua dispatch di tengah render.
 */
import { useCallback } from 'react'

import { setQuotaKind } from '../store/slices/cartSlice'
import { consumeQuota, returnQuota } from '../store/slices/quotaSlice'
import { useAppDispatch, useAppSelector } from './useAppStore'

export function useOrderQuota() {
  const dispatch = useAppDispatch()
  const quotaKind = useAppSelector((s) => s.cart.quotaKind)
  const merchantId = useAppSelector((s) => s.cart.activeMerchantId)

  const consume = useCallback(() => {
    if (!quotaKind) return
    dispatch(consumeQuota({ kind: quotaKind, merchantId }))
    dispatch(setQuotaKind(null))
  }, [dispatch, quotaKind, merchantId])

  const release = useCallback(() => {
    if (!quotaKind) return
    dispatch(returnQuota({ kind: quotaKind, merchantId }))
    dispatch(setQuotaKind(null))
  }, [dispatch, quotaKind, merchantId])

  return { consume, release }
}
