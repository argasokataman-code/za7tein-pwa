// Daftar notifikasi ada di store, bukan di state lokal halaman inbox. Badge di
// lonceng beranda membaca dari sini juga, jadi menandai satu notifikasi terbaca
// pasti ikut menurunkan badge — angka dan daftarnya tidak bisa berbeda.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockNotifications } from '../../data/notifications'
import type { AppNotification, PushSubscriptionRecord } from '../../types'

interface NotificationsState {
  items: AppNotification[]
  /** Subscription push aktif (mock, M8). Null = belum mendaftar. */
  subscription: PushSubscriptionRecord | null
}

const initialState: NotificationsState = {
  items: mockNotifications,
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
    /** Daftar push (mock): menyimpan subscription, bukan mengirim notifikasi. */
    registerPush(state, action: PayloadAction<{ subscription: PushSubscriptionRecord }>) {
      state.subscription = action.payload.subscription
    },
    clearPush(state) {
      state.subscription = null
    },
  },
})

export const { markRead, markAllRead, registerPush, clearPush } = notificationsSlice.actions

export const selectUnreadCount = (items: AppNotification[]) =>
  items.filter((n) => n.unread).length

export default notificationsSlice.reducer
