import { useCallback, useState } from 'react'

import { updateOrderStatus, type CustomerActiveOrder } from '../api/orders'
import { cancelOrder as releaseHold } from '../store/slices/cartSlice'
import { dropActiveOrder } from '../store/slices/customerOrdersSlice'
import { useAppDispatch, useAppSelector } from './useAppStore'

/** Hasil satu pembatalan: dipakai splash, dan apakah ada dana yang benar-benar ditahan. */
export interface CancelDone {
  code: string
  refunded: boolean
}

/**
 * Batalkan order customer + penanda hasil untuk splash setelahnya.
 *
 * Dua tempat memakai jalur yang sama (sheet dok keranjang dan tab "Aktif" di
 * Pesanan Saya), jadi penulisan status, pelepasan hold, dan splash tak boleh
 * disalin ke dua layar.
 *
 * Baris baru dibuang **setelah** BE menerima status. Sebelumnya baris hilang
 * lebih dulu dan kegagalan ditelan `catch`, sehingga customer melihat splash
 * sukses untuk pembatalan yang tidak pernah tersimpan.
 */
export function useCancelOrder() {
  const dispatch = useAppDispatch()
  const holdStatus = useAppSelector((s) => s.cart.holdStatus)
  const [done, setDone] = useState<CancelDone | null>(null)
  /** Order yang pembatalannya sedang dikirim; tombolnya menunggu, bukan pura-pura selesai. */
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<{ id: string; message: string } | null>(null)

  const cancel = useCallback(
    async (order: CustomerActiveOrder, reason?: string) => {
      setPendingId(order.id)
      setError(null)
      // Hold hanya lahir dari pembayaran yang benar-benar terjadi (COD/online).
      // Draft dan quotation belum memotong apa pun, jadi splash tak boleh
      // menjanjikan uang kembali untuk keduanya.
      const refunded = holdStatus === 'held' || holdStatus === 'cut'
      try {
        await updateOrderStatus(order.id, 'batal', 'customer', { cancelReason: reason })
        if (refunded) dispatch(releaseHold())
        dispatch(dropActiveOrder(order.id))
        setDone({ code: order.code, refunded })
      } catch {
        setError({
          id: order.id,
          message: 'Pembatalan gagal dikirim. Periksa koneksi lalu coba lagi.',
        })
      } finally {
        setPendingId(null)
      }
    },
    [dispatch, holdStatus],
  )

  const dismissDone = useCallback(() => setDone(null), [])
  const clearError = useCallback(() => setError(null), [])

  return { cancel, done, dismissDone, pendingId, error, clearError }
}
