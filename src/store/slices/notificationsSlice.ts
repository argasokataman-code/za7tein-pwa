// Daftar notifikasi ada di store, bukan di state lokal halaman inbox. Badge di
// lonceng beranda membaca dari sini juga, jadi menandai satu notifikasi terbaca
// pasti ikut menurunkan badge — angka dan daftarnya tidak bisa berbeda.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AppNotification, PushSubscriptionRecord } from '../../types'

interface NotificationsState {
  items: AppNotification[]
  /** Registrasi push aktif (M8). Null = belum mendaftar. */
  subscription: PushSubscriptionRecord | null
  /**
   * Alarm tugas kurir yang sedang berbunyi. Null = tidak ada. Tidak ikut
   * persist: alarm yang tertinggal setelah reload akan berbunyi untuk tugas
   * lama yang mungkin sudah selesai.
   */
  alarm: AppNotification | null
}

const initialState: NotificationsState = {
  items: [],
  subscription: null,
  alarm: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload)
      if (item) item.unread = false
    },
    markAllRead(state) {
      state.items.forEach((n) => {
        n.unread = false
      })
    },
    /** Ganti seluruh kotak masuk dari API — termasuk saat kosong, agar daftar
     *  lama tidak menetap. */
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.items = action.payload
    },
    /** Registrasi push: simpan subscription (barisnya ditulis ke backend di halaman). */
    registerPush(state, action: PayloadAction<{ subscription: PushSubscriptionRecord }>) {
      state.subscription = action.payload.subscription
    },
    clearPush(state) {
      state.subscription = null
    },
    /**
     * Tambah satu notifikasi ke kotak masuk. Dipakai aksi lintas peran (kurir
     * "Tiba" → customer dapat notif) — satu store, pola sama seperti sengketa
     * yang dibaca lintas peran. Web Push asli tetap di luar scope (R-PUSH-01).
     */
    pushNotification(state, action: PayloadAction<AppNotification>) {
      state.items.unshift(action.payload)
    },
    /** Bunyikan alarm takeover untuk satu notifikasi tugas kurir. */
    raiseNotificationAlarm(state, action: PayloadAction<AppNotification>) {
      state.alarm = action.payload
    },
    clearNotificationAlarm(state) {
      state.alarm = null
    },
  },
})

export const {
  markRead,
  markAllRead,
  registerPush,
  clearPush,
  pushNotification,
  setNotifications,
  raiseNotificationAlarm,
  clearNotificationAlarm,
} = notificationsSlice.actions

export const selectUnreadCount = (items: AppNotification[]) =>
  items.filter((n) => n.unread).length

export default notificationsSlice.reducer
