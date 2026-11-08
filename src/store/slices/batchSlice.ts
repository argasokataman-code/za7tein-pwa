import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockBatches } from '../../data/marketplace'
import type { Batch, BatchStatus } from '../../types'

interface BatchState {
  batches: Batch[]
  /**
   * Anggota batch yang sudah ditulis klien tapi belum terbaca balik dari
   * `orders_batches.route`/`orders.batch_id`. `mergeBatches` menyatukannya
   * sebentar supaya batch tidak tampak kosong di jendela jeda baca D1.
   */
  pendingMembers: Record<string, { orderIds: string[]; at: number }>
}

/** Umur penjagaan anggota batch (ms); sejalan dengan `merchantSlice`. */
const PENDING_MEMBERS_MS = 30_000

const initialState: BatchState = {
  batches: mockBatches,
  pendingMembers: {},
}

/**
 * `pendingMembers` ditambahkan setelah slice `batch` sudah tersimpan di
 * localStorage, dan `autoMergeLevel1` menyalin slice tersimpan apa adanya
 * menimpa initial state. State lama karena itu bisa masuk dengan
 * `pendingMembers: undefined`, dan penulisan pertama (`addOrderToBatch`) gagal
 * `Cannot set properties of undefined`. Field ini hanya penjagaan sementara,
 * jadi yang benar adalah menyiapkannya di sini, bukan membuang seluruh batch
 * (batch lokal `batch-N` belum tentu sudah ada di BE).
 */
const pendingOf = (state: BatchState) => (state.pendingMembers ??= {})

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
      // `route`/`order_count` di BE baru terlihat setelah PATCH-nya mendarat;
      // catat di sini supaya refetch di jendela itu tidak mengosongkan batch.
      pendingOf(state)[batch.id] = {
        orderIds: [...batch.orderIds],
        at: Date.now(),
      }
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
     * Hidrasi batch dari BE: BE sekarang sumber kebenaran (tabel `batches`
     * bisa ditulis, lihat `api/batches.ts`), jadi baris yang sama ditimpa
     * dengan nilai BE supaya perubahan dari perangkat lain ikut terlihat.
     *
     * Batch lokal lama ber-id `batch-N` hanya ada di perangkat ini karena dulu
     * tulis ke tabel belum ada; kalau tidak dibuang, panel menampilkan batch
     * kembar (satu dari BE, satu sisa localStorage) untuk order yang sama.
     */
    mergeBatches(state, action: PayloadAction<Batch[]>) {
      const now = Date.now()
      const pendingMembers = pendingOf(state)
      const incoming = new Map(action.payload.map((batch) => [batch.id, batch]))
      const prev = new Map(state.batches.map((batch) => [batch.id, batch]))
      // Batch yang berasal dari BE (`id` numerik) hanya boleh hidup selama masih
      // ada di respons: setelah barisnya dihapus/dibersihkan di D1, salinan lama
      // di Redux harus ikut hilang. Id `batch-N` adalah batch lokal yang belum
      // (atau gagal) ditulis ke BE, jadi ia tetap dipertahankan.
      state.batches = state.batches.filter(
        (batch) => incoming.has(batch.id) || batch.id.startsWith('batch-'),
      )
      for (const batch of action.payload) {
        const index = state.batches.findIndex((item) => item.id === batch.id)
        // Urutan manual (`routeOrder`) + sakelar auto-sort tidak punya kolom BE;
        // tanpa dibawa, penyegaran berkala menghapus susunan rute yang sudah
        // disusun merchant/kurir di perangkat ini.
        const local = index >= 0 ? prev.get(batch.id) : undefined
        let orderIds = batch.orderIds
        const pending = pendingMembers[batch.id]
        if (pending) {
          const caughtUp = pending.orderIds.every((id) => batch.orderIds.includes(id))
          if (caughtUp || now - pending.at > PENDING_MEMBERS_MS) {
            delete pendingMembers[batch.id]
          } else {
            orderIds = [
              ...batch.orderIds,
              ...pending.orderIds.filter((id) => !batch.orderIds.includes(id)),
            ]
          }
        }
        const merged: Batch = {
          ...batch,
          orderIds,
          ...(local ? { autoSort: local.autoSort, routeOrder: local.routeOrder } : {}),
        }
        if (index >= 0) state.batches[index] = merged
        else state.batches.push(merged)
      }
      // Penjagaan untuk batch yang tak lagi ada di respons BE tak berguna lagi.
      for (const [id, entry] of Object.entries(pendingMembers)) {
        if (now - entry.at > PENDING_MEMBERS_MS) delete pendingMembers[id]
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
