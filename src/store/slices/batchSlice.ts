import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockBatches } from '../../data/marketplace'
import type { Batch, BatchStatus } from '../../types'

interface BatchState {
  batches: Batch[]
}

const initialState: BatchState = {
  batches: mockBatches,
}

/**
 * Batch kurir inhouse (PRD §8). Satu batch = wadah order Regular milik merchant,
 * diantar oleh satu kurir inhouse. Maks 24 order (BR-B04) ditegakkan di pemanggil;
 * slice hanya menyimpan state yang ditampilkan. Repo ini mock: hitung mundur dan
 * auto-sort adalah nilai, bukan penghitung nyata (AGENTS.md §1).
 */
const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    addBatch(state, action: PayloadAction<Batch>) {
      state.batches.unshift(action.payload)
    },
    /** Tambah order Regular ke batch yang hitung mundurnya berjalan (BR-B02). */
    addOrderToBatch(state, action: PayloadAction<{ batchId: string; orderId: string }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (!batch) return
      if (batch.orderIds.includes(action.payload.orderId)) return
      batch.orderIds.push(action.payload.orderId)
      // `routeOrder` hanya menyimpan urutan manual (auto-sort OFF). Saat ON,
      // urutan diturunkan dari auto-sort, jadi tak ditulis mentah di sini.
    },
    setBatchStatus(state, action: PayloadAction<{ batchId: string; status: BatchStatus }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (batch) batch.status = action.payload.status
    },
    /** Merchant meng-assign batch ke satu kurir inhouse (BR-B07). */
    assignBatchCourier(state, action: PayloadAction<{ batchId: string; courierId: string }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (batch) batch.courierId = action.payload.courierId
    },
    /** Merchant menutup batch lebih awal — tak ada order baru setelahnya (BR-B08). */
    closeBatchEarly(state, action: PayloadAction<{ batchId: string }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (batch) batch.status = 'closed'
    },
    /**
     * Merchant menyetujui kurir mulai lebih awal; batch masuk pengantaran
     * (BR-B09). Syaratnya ditegakkan pemanggil lewat `canStartEarly()`.
     */
    approveEarlyStart(state, action: PayloadAction<{ batchId: string }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (batch) batch.status = 'delivering'
    },
    /**
     * Toggle auto-sort kurir (BR-B12): `routeOrder` hanya menyimpan urutan
     * manual. ON mengosongkannya (urutan diturunkan dari auto-sort); OFF
     * membiarkan manual mulai dari urutan tersimpan.
     */
    setAutoSort(state, action: PayloadAction<{ batchId: string; autoSort: boolean }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (!batch) return
      batch.autoSort = action.payload.autoSort
      batch.routeOrder = []
    },
    /** Urutan manual saat auto-sort OFF. */
    setRouteOrder(state, action: PayloadAction<{ batchId: string; orderIds: string[] }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (batch) batch.routeOrder = action.payload.orderIds
    },
    /**
     * Hidrasi batch dari BE: tambah yang belum ada, **jangan** menimpa yang sudah
     * ada. Batch lokal mungkin sudah diubah merchant (tutup/assign) sementara tulis
     * tabel belum ada di Worker; menimpa akan menghapus perubahan itu di tiap refetch
     * (pola sama dengan `mergeOrders`, BUG-88046).
     */
    mergeBatches(state, action: PayloadAction<Batch[]>) {
      const known = new Set(state.batches.map((batch) => batch.id))
      for (const batch of action.payload) {
        if (!known.has(batch.id)) state.batches.push(batch)
      }
    },
  },
})

export const {
  addBatch,
  addOrderToBatch,
  setBatchStatus,
  assignBatchCourier,
  closeBatchEarly,
  approveEarlyStart,
  setAutoSort,
  setRouteOrder,
  mergeBatches,
} = batchSlice.actions
export default batchSlice.reducer
