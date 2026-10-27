import { useCallback } from 'react'

import { orderDeliveryType } from '../data/merchantOrders'
import type { Batch, Courier, MerchantOrder } from '../types'

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
  const batchOf = useCallback(
    (orderId: string) => batches.find((b) => b.orderIds.includes(orderId)) ?? null,
    [batches],
  )

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

  return { batchOf, readyHint, showBatchPanel }
}
