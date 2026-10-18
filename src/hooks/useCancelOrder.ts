import { useCallback, useState } from 'react'

import { updateOrderStatus, type CustomerActiveOrder } from '../api/orders'
import { dropActiveOrder } from '../store/slices/customerOrdersSlice'
import { useAppDispatch } from './useAppStore'

/**
 * Batalkan order customer + penanda refund untuk splash "dana dikembalikan".
 *
 * Dua tempat memakai jalur yang sama (sheet dok keranjang dan tab "Aktif" di
 * Pesanan Saya) dan dulu keduanya menyalin tiga baris yang identik. Dipusatkan
 * di sini supaya splash tak pernah muncul di satu layar saja kalau jalurnya
 * berubah lagi.
 *
 * Baris dibuang optimistik: kalau BE menolak, gelembung realtime memunculkannya
 * lagi — kegagalan memulihkan dirinya sendiri, jadi tak perlu layar error.
 */
export function useCancelOrder() {
  const dispatch = useAppDispatch()
  const [refundedCode, setRefundedCode] = useState<string | null>(null)

  const cancel = useCallback(
    (order: CustomerActiveOrder) => {
      dispatch(dropActiveOrder(order.id))
      void updateOrderStatus(order.id, 'batal', 'customer').catch(() => {})
      setRefundedCode(order.code)
    },
    [dispatch],
  )

  const dismissRefund = useCallback(() => setRefundedCode(null), [])

  return { cancel, refundedCode, dismissRefund }
}
