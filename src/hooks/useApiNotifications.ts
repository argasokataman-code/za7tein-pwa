// Kotak masuk live, di file sendiri supaya `useApiReference.ts` tetap di bawah
// batas 150 baris hook. Pola identik: mock dulu, API menimpa hanya saat sukses.
import { fetchNotifications } from '../api/reference'
import { setNotifications } from '../store/slices/notificationsSlice'
import { useSyncOnce } from './useApiReference'

export function useApiNotifications(): void {
  useSyncOnce(() => fetchNotifications(), (items, d) => {
    if (items.length) d(setNotifications(items))
  })
}
