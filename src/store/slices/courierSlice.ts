import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { courierTasks as seedTasks, nextCheckpoint } from '../../data/courier'
import {
  courierBatchTasks,
  mockCourierBatch,
} from '../../data/courierBatch'
import {
  COURIER_PAYOUT_FEE_IDR,
  courierTipsAvailable,
  mockCourierPayoutAccounts,
} from '../../data/courierWallet'
import type { Batch, CourierTask, PayoutAccount, PayoutEntry } from '../../types'

interface CourierState {
  /** Kurir siap menerima tugas. Tidak dipersist — mock, reset saat reload. */
  isOnline: boolean
  tasks: CourierTask[]
  /**
   * Batch kurir inhouse yang ditugaskan merchant (M5, BR-B07). Null = kurir tak
   * punya batch. Tidak dipersist — mock, reset saat reload (sama seperti `tasks`).
   */
  batch: Batch | null
  /** Rekening tujuan pencairan tips (R-WALLET-01, f6). */
  payoutAccounts: PayoutAccount[]
  /** Riwayat pencairan; saldo dihitung dari fee + tips − pencairan. */
  payouts: PayoutEntry[]
  /**
   * Profil hasil onboarding kurir (keputusan PO 2026-09-25). Tipe lokal karena
   * hanya slice ini yang memakainya. Null sampai onboarding selesai.
   */
  onboarding: CourierOnboarding | null
}

export interface CourierOnboarding {
  name: string
  phone: string
  vehicle: 'motor' | 'mobil'
}

const initialState: CourierState = {
  isOnline: true,
  tasks: seedTasks,
  batch: mockCourierBatch,
  payoutAccounts: mockCourierPayoutAccounts,
  payouts: [],
  onboarding: null,
}

const makeId = (prefix: string, count: number) => `${prefix}-${count + 1}-${Date.now()}`

const courierSlice = createSlice({
  name: 'courier',
  initialState,
  reducers: {
    toggleOnline(state) {
      state.isOnline = !state.isOnline
    },
    /** Simpan profil dari onboarding kurir, sebelum masuk. */
    completeOnboarding(state, action: PayloadAction<CourierOnboarding>) {
      state.onboarding = action.payload
    },
    /** Tambah tugas live dari BE; tugas yang sudah ada dibiarkan (progres lokal menang). */
    setTasks(state, action: PayloadAction<CourierTask[]>) {
      const have = new Set(state.tasks.map((t) => t.id))
      for (const task of action.payload) {
        if (!have.has(task.id)) state.tasks.unshift(task)
      }
    },
    /** Maju satu checkpoint sesuai urutan flow F13, lalu mulai jeda SLA baru. */
    advanceCheckpoint(state, action: PayloadAction<{ id: string }>) {
      const task = state.tasks.find((t) => t.id === action.payload.id)
      if (!task) return
      const next = nextCheckpoint(task.checkpoint)
      if (!next) return
      task.checkpoint = next
      task.checkpointStartedAt = new Date().toISOString()
    },
    /** Cabang `batal` — hanya saat customer lalai setelah "Tiba" (guard flow F13). */
    cancelTask(state, action: PayloadAction<{ id: string }>) {
      const task = state.tasks.find((t) => t.id === action.payload.id)
      if (task) task.checkpoint = 'batal'
    },
    /** Settle hanya lewat OTP yang benar — divalidasi di layar sebelum dispatch. */
    completeTask(state, action: PayloadAction<{ id: string }>) {
      const task = state.tasks.find((t) => t.id === action.payload.id)
      if (!task) return
      task.otpVerified = true
      task.checkpoint = 'selesai'
      task.checkpointStartedAt = undefined
    },
    /**
     * Toggle auto-sort batch (M5, BR-B12). ON = urutan diturunkan (nearest
     * neighbour dari dapur, mock); OFF = mulai manual dari urutan yang sedang
     * terlihat. `routeOrder` hanya menyimpan urutan manual — saat ON dikosongkan
     * supaya daftar, peta, dan "berikutnya" tak bisa berbeda pendapat.
     */
    setBatchAutoSort(state, action: PayloadAction<{ autoSort: boolean }>) {
      const batch = state.batch
      if (!batch) return
      if (action.payload.autoSort) {
        batch.autoSort = true
        batch.routeOrder = []
        return
      }
      batch.routeOrder = courierBatchTasks(batch, state.tasks).map((task) => task.id)
      batch.autoSort = false
    },
    /** Urutan antar manual saat auto-sort OFF. */
    setBatchRouteOrder(state, action: PayloadAction<{ orderIds: string[] }>) {
      if (state.batch) state.batch.routeOrder = action.payload.orderIds
    },
    /** Kurir menekan "Mulai antar" → batch masuk pengantaran (PRD §7.2). */
    startBatchDelivery(state) {
      if (state.batch) state.batch.status = 'delivering'
    },
    addPayoutAccount(
      state,
      action: PayloadAction<{ bankName: string; accountNumber: string; holderName: string }>,
    ) {
      state.payoutAccounts.push({
        id: makeId('cpa', state.payoutAccounts.length),
        ...action.payload,
        isPrimary: state.payoutAccounts.length === 0,
      })
    },
    updatePayoutAccount(
      state,
      action: PayloadAction<{
        id: string
        bankName: string
        accountNumber: string
        holderName: string
      }>,
    ) {
      const account = state.payoutAccounts.find((a) => a.id === action.payload.id)
      if (!account) return
      account.bankName = action.payload.bankName
      account.accountNumber = action.payload.accountNumber
      account.holderName = action.payload.holderName
    },
    removePayoutAccount(state, action: PayloadAction<{ id: string }>) {
      const wasPrimary = state.payoutAccounts.find((a) => a.id === action.payload.id)?.isPrimary
      state.payoutAccounts = state.payoutAccounts.filter((a) => a.id !== action.payload.id)
      if (wasPrimary && state.payoutAccounts.length > 0) state.payoutAccounts[0].isPrimary = true
    },
    setPrimaryPayoutAccount(state, action: PayloadAction<{ id: string }>) {
      for (const account of state.payoutAccounts) {
        account.isPrimary = account.id === action.payload.id
      }
    },
    /**
     * Pencairan saldo dompet (f6). Yang ditarik hanya **tips** — fee pengantaran
     * dikirim platform otomatis ke DANA saat order selesai (PRD §16.4, PO
     * 2026-10-16), jadi tidak lewat dompet ini. Fee Rp2.500 ditanggung kurir dan
     * dipotong dari nilai withdraw; saldo tidak disimpan, dihitung dari
     * tips − pencairan.
     */
    requestCourierPayout(state, action: PayloadAction<{ amount: number; accountId: string }>) {
      const { amount, accountId } = action.payload
      const account = state.payoutAccounts.find((a) => a.id === accountId)
      if (!account || amount <= 0) return
      if (amount > courierTipsAvailable(state.tasks, state.payouts)) return
      state.payouts.unshift({
        id: makeId('cpo', state.payouts.length),
        kind: 'payout',
        amount,
        fee: COURIER_PAYOUT_FEE_IDR,
        status: 'pending',
        createdAt: new Date().toISOString(),
        destination: `${account.bankName} · ${account.accountNumber}`,
      })
    },
  },
})

export const {
  toggleOnline,
  completeOnboarding,
  setTasks,
  advanceCheckpoint,
  cancelTask,
  completeTask,
  setBatchAutoSort,
  setBatchRouteOrder,
  startBatchDelivery,
  addPayoutAccount,
  updatePayoutAccount,
  removePayoutAccount,
  setPrimaryPayoutAccount,
  requestCourierPayout,
} = courierSlice.actions
export default courierSlice.reducer
