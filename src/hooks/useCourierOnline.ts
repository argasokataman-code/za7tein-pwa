import { useCallback } from 'react'

import { setCourierOnline } from '../api/courierStatus'
import { setOnline } from '../store/slices/courierSlice'
import { useAppDispatch, useAppSelector } from './useAppStore'

/**
 * Sakelar siap/jeda kurir, satu perilaku untuk beranda dan profil.
 *
 * Perubahan lokal langsung terlihat (optimistis), lalu ditulis ke
 * `couriers.availability` supaya merchant membaca keadaan yang sama. Kalau
 * tulis gagal, sakelar dikembalikan: lebih baik kurir melihat "gagal" daripada
 * dirinya online sementara merchant melihat offline.
 */
export function useCourierOnline() {
  const dispatch = useAppDispatch()
  const isOnline = useAppSelector((state) => state.courier.isOnline)

  const toggle = useCallback(() => {
    const next = !isOnline
    dispatch(setOnline(next))
    setCourierOnline(next).catch(() => dispatch(setOnline(!next)))
  }, [dispatch, isOnline])

  return { isOnline, toggle }
}
