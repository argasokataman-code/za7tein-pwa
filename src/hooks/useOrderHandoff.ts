import { useCallback } from 'react'

import { createBatchOnBe } from '../api/batches'
import { BATCH_COUNTDOWN_SECONDS, nextBatchId } from '../data/batch'
import { DEFAULT_COOK_MINUTES, orderDeliveryType } from '../data/merchantOrders'
import { useAppDispatch } from './useAppStore'
import { addBatch } from '../store/slices/batchSlice'
import { setOrderBatch } from '../store/slices/merchantSlice'
import type { Batch, Courier, MerchantOrder } from '../types'

/** Tenant demo (satu toko) — sama dengan yang dipakai halaman antrean. */
const MERCHANT_ID = 'merchant-1'

/**
 * Langkah setelah packing untuk satu order.
 *
 * Dipisah dari `MerchantOrders.tsx` supaya halaman tetap di bawah batas 700
 * baris (AGENTS §3) dan supaya kalimat "apa yang harus dilakukan sekarang"
 * punya satu sumber: tiket di tab Siap dan sheet detail memakai `readyHint`
 * yang sama.
 *
 * Regular: kurir inhouse per batch (pilih kurir, tutup batch lebih awal,
 * setujui mulai antar). Quick: satu kurir partner per order.
 */
export function useOrderHandoff(batches: Batch[], couriers: Courier[]) {
  const dispatch = useAppDispatch()

  const batchOf = useCallback(
    (orderId: string) => batches.find((b) => b.orderIds.includes(orderId)) ?? null,
    [batches],
  )

  /**
   * Order Regular bisa datang dari BE tanpa batch (di luar sesi "Terima" ini).
   * Tanpa batch, panel Batch kurir tidak punya tempat memilih kurir, jadi
   * packing/aksi kurir membuatkan batch lebih dulu.
   */
  const ensureBatch = async (order: MerchantOrder) => {
    if (orderDeliveryType(order) !== 'regular' || batchOf(order.id)) return
    const estimateMinutes = order.cookMinutes ?? DEFAULT_COOK_MINUTES
    // Tulis dulu ke BE: id barisnya dipakai sebagai id batch FE, supaya batch
    // yang sama terlihat dari perangkat lain (dulu batch hanya hidup di Redux).
    const beId = await createBatchOnBe({ orderIds: [order.id], estimateMinutes })
    const batchId = beId !== null ? String(beId) : nextBatchId(batches)
    dispatch(
      addBatch({
        id: batchId,
        merchantId: MERCHANT_ID,
        courierId: null,
        orderIds: [order.id],
        status: 'countdown',
        estimateMinutes,
        countdownSeconds: BATCH_COUNTDOWN_SECONDS,
        autoSort: true,
        routeOrder: [],
        createdAt: new Date().toISOString(),
      }),
    )
    dispatch(setOrderBatch({ id: order.id, batchId }))
  }

  const readyHint = (order: MerchantOrder) => {
    if (orderDeliveryType(order) === 'quick') {
      return 'Serahkan ke kurir partner; status berubah Diantar setelah kurir menerima.'
    }
    const batch = batchOf(order.id)
    if (!batch) return 'Pilih kurir inhouse di panel Batch kurir.'
    if (!batch.courierId) return 'Pilih kurir inhouse di panel Batch kurir di atas.'
    const name = couriers.find((c) => c.id === batch.courierId)?.name ?? 'Kurir'
    if (batch.status === 'closed') {
      return `${name} sudah ditugaskan — setujui mulai antar di panel Batch kurir.`
    }
    return `${name} mengantar batch ini setelah kamu menutup batch lebih awal.`
  }

  /** Panel batch ada di atas daftar; gulirkan, jangan pindahkan halaman. */
  const showBatchPanel = () => {
    document.querySelector('.merchant-batch')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /** Aksi "Pilih kurir batch": pastikan batch ada dulu, baru gulir ke panel. */
  const openBatch = (order: MerchantOrder) => {
    void ensureBatch(order)
    showBatchPanel()
  }

  return { batchOf, ensureBatch, readyHint, showBatchPanel, openBatch }
}
