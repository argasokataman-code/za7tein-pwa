import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { courierTasks as seedTasks, nextCheckpoint } from '../../data/courier'
import type { CourierTask } from '../../types'

interface CourierState {
  /** Kurir siap menerima tugas. Tidak dipersist — mock, reset saat reload. */
  isOnline: boolean
  tasks: CourierTask[]
}

const initialState: CourierState = {
  isOnline: true,
  tasks: seedTasks,
}

const courierSlice = createSlice({
  name: 'courier',
  initialState,
  reducers: {
    toggleOnline(state) {
      state.isOnline = !state.isOnline
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
  },
})

export const { toggleOnline, advanceCheckpoint, cancelTask, completeTask } = courierSlice.actions
export default courierSlice.reducer
