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
    /** Merchant menambah order Regular ke batch yang hitung mundurnya berjalan (BR-B02). */
    addOrderToBatch(state, action: PayloadAction<{ batchId: string; orderId: string }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (!batch) return
      if (batch.orderIds.includes(action.payload.orderId)) return
      batch.orderIds.push(action.payload.orderId)
      if (batch.autoSort) batch.routeOrder = [...batch.orderIds]
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
    /** Toggle auto-sort kurir (BR-B12); ON mengurutkan rute, OFF membiarkan manual. */
    setAutoSort(state, action: PayloadAction<{ batchId: string; autoSort: boolean }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (!batch) return
      batch.autoSort = action.payload.autoSort
      batch.routeOrder = action.payload.autoSort ? [...batch.orderIds] : []
    },
    /** Urutan manual saat auto-sort OFF. */
    setRouteOrder(state, action: PayloadAction<{ batchId: string; orderIds: string[] }>) {
      const batch = state.batches.find((b) => b.id === action.payload.batchId)
      if (batch) batch.routeOrder = action.payload.orderIds
    },
  },
})

export const {
  addBatch,
  addOrderToBatch,
  setBatchStatus,
  assignBatchCourier,
  setAutoSort,
  setRouteOrder,
} = batchSlice.actions
export default batchSlice.reducer
