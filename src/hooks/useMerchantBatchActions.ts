import { useCallback } from 'react'
import toast from 'react-hot-toast'

import { patchBatchOnBe } from '../api/batches'
import { assignOrderCourier, updateOrderStatus } from '../api/orders'
import { assignBatchCourier, approveEarlyStart, closeBatchEarly } from '../store/slices/batchSlice'
import { setOrderStatus } from '../store/slices/merchantSlice'
import type { Batch } from '../types'
import { useAppDispatch } from './useAppStore'

/**
 * Aksi batch yang dipakai dua layar: daftar batch dan detail batch. Satu sumber
 * supaya toast, persist BE, dan perubahan status order tidak berbeda antar layar.
 */
export function useMerchantBatchActions(batches: Batch[]) {
  const dispatch = useAppDispatch()

  const assignCourier = useCallback(
    (batchId: string, courierId: string) => {
      dispatch(assignBatchCourier({ batchId, courierId }))
      void patchBatchOnBe(batchId, { courierId })
      toast.success('Kurir ditugaskan ke batch')
    },
    [dispatch],
  )

  const closeEarly = useCallback(
    (batchId: string) => {
      dispatch(closeBatchEarly({ batchId }))
      void patchBatchOnBe(batchId, { status: 'closed' })
      toast.success('Batch ditutup, tidak menerima order baru')
    },
    [dispatch],
  )

  const approveStart = useCallback(
    (batchId: string) => {
      const batch = batches.find((item) => item.id === batchId)
      dispatch(approveEarlyStart({ batchId }))
      void patchBatchOnBe(batchId, { status: 'delivering' })
      batch?.orderIds.forEach((id) => {
        dispatch(setOrderStatus({ id, status: 'diantar' }))
        void updateOrderStatus(id, 'diantar').catch(() => {})
        const cid = batch.courierId?.replace(/\D/g, '')
        if (cid) void assignOrderCourier(id, cid).catch(() => {})
      })
      toast.success('Kurir mulai mengantar lebih awal')
    },
    [batches, dispatch],
  )

  return { assignCourier, closeEarly, approveStart }
}
