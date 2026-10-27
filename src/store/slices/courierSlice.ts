import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { courierTasks as seedTasks, nextCheckpoint } from '../../data/courier'
import { courierBatchTasks } from '../../data/courierBatch'
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
   * Batch kurir inhouse yang ditugaskan merchant (M5, BR-B07), diisi dari BE
   * (`fetchCourierBatch`). Null = belum ada penugasan — sengaja **bukan** batch
   * seed: batch palsu sempat tampil sebelum BE menjawab, dan tombol "Mulai
   * antar" di batch palsu itu menulis ke baris BE yang salah.
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
}

const initialState: CourierState = {
  isOnline: true,
  tasks: seedTasks,
  batch: null,
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
    /**
     * Batch live dari BE yang ditugaskan ke kurir ini (`fetchCourierBatch`).
     * `null` = tak ada penugasan; batch seed hanya dipakai sebelum BE menjawab.
     */
    setBatch(state, action: PayloadAction<Batch | null>) {
      state.batch = action.payload
    },
    /**
     * Daftar tugas = BE begitu BE punya tugas. Seed hanya jaring sebelum muatan
     * pertama; sebelumnya seed ikut menumpuk selamanya sehingga kurir melihat
     * 12 tugas padahal order nyata cuma beberapa. Progres lokal (checkpoint,
     * OTP) dibawa untuk id yang sama supaya realtime tidak memundurkan langkah.
     */
    setTasks(state, action: PayloadAction<CourierTask[]>) {
      if (!action.payload.length) return
      const local = new Map(state.tasks.map((task) => [task.id, task]))
      // Order selesai tidak lagi dikirim RPC kurir; kalau dibuang, riwayat sesi
      // ini ikut hilang padahal kurir baru saja menuntaskannya. Hanya order BE
      // (`api-…`) yang dipertahankan — riwayat seed ikut dibuang bersama seed.
      const finished = state.tasks.filter(
        (task) =>
          task.checkpoint === 'selesai' &&
          task.id.startsWith('api-') &&
          !action.payload.some((row) => row.id === task.id),
      )
      state.tasks = action.payload.map((task) => {
        const mine = local.get(task.id)
        return mine
          ? {
              ...task,
              checkpoint: mine.checkpoint,
              checkpointStartedAt: mine.checkpointStartedAt,
              otpVerified: mine.otpVerified,
            }
          : task
      })
      state.tasks.push(...finished)
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
    /** API: rekening pencairan kurir live menimpa mock (`payout_accounts`). */
    replacePayoutAccounts(state, action: PayloadAction<PayoutAccount[]>) {
      state.payoutAccounts = action.payload
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
  setBatch,
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
  replacePayoutAccounts,
  requestCourierPayout,
} = courierSlice.actions
export default courierSlice.reducer
