// Daftar notifikasi ada di store, bukan di state lokal halaman inbox. Badge di
// lonceng beranda membaca dari sini juga, jadi menandai satu notifikasi terbaca
// pasti ikut menurunkan badge — angka dan daftarnya tidak bisa berbeda.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockNotifications } from '../../data/notifications'
import type { AppNotification } from '../../types'

interface NotificationsState {
  items: AppNotification[]
}

const initialState: NotificationsState = {
  items: mockNotifications,
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
  },
})

export const { markRead, markAllRead } = notificationsSlice.actions

export const selectUnreadCount = (items: AppNotification[]) =>
  items.filter((n) => n.unread).length

export default notificationsSlice.reducer
