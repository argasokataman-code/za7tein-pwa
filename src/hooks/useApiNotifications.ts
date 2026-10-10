// Kotak masuk live, di file sendiri supaya `useApiReference.ts` tetap di bawah
// batas 150 baris hook. Pola identik: mock dulu, API menimpa hanya saat sukses.
// Audience mengikuti peran aktif (customer/merchant/courier/cs).
import { fetchNotifications } from '../api/reference'
import { setNotifications } from '../store/slices/notificationsSlice'
import type { NotifAudience } from '../types'
import { useSyncOnce } from './useApiReference'

export function useApiNotifications(audience: NotifAudience): void {
  useSyncOnce(() => fetchNotifications(audience), (items, d) => {
    if (items.length) d(setNotifications(items))
  })
}
