// Daftar notifikasi ada di store, bukan di state lokal halaman inbox. Badge di
// lonceng beranda membaca dari sini juga, jadi menandai satu notifikasi terbaca
// pasti ikut menurunkan badge — angka dan daftarnya tidak bisa berbeda.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AppNotification, PushSubscriptionRecord } from '../../types'

interface NotificationsState {
  items: AppNotification[]
  /** Subscription push aktif (mock, M8). Null = belum mendaftar. */
  subscription: PushSubscriptionRecord | null
}

const initialState: NotificationsState = {
  items: [],
  subscription: null,
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
    /** Daftar push (mock): menyimpan subscription, bukan mengirim notifikasi. */
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
  },
})

export const { markRead, markAllRead, registerPush, clearPush, pushNotification, setNotifications } =
  notificationsSlice.actions

export const selectUnreadCount = (items: AppNotification[]) =>
  items.filter((n) => n.unread).length

export default notificationsSlice.reducer
