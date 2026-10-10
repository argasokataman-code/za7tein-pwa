/** Sinkron profil customer: identitas (`users`) + daftar alamat (`addresses`). */
import { useEffect } from 'react'

import { fetchCustomerAccount, fetchCustomerAddresses, fetchCustomerUser, fetchMerchantLocation, toAddress } from '../api/profile'
import { apiEnabled } from '../api/supabase'
import { updateUser } from '../store/slices/authSlice'
import { setAddresses } from '../store/slices/cartSlice'
import { useAppDispatch, useAppSelector } from './useAppStore'

/** Identitas customer live → `auth.user`: email/HP dari tabel `users`, nama/avatar dari metadata akun. */
function useCustomerUser(): void {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    const run = () =>
      Promise.all([fetchCustomerUser(), fetchCustomerAccount()])
        .then(([u, account]) => {
          if (!alive) return
          dispatch(
            updateUser({
              ...(account?.name ? { name: account.name } : {}),
              ...(account?.avatar ? { avatar: account.avatar } : {}),
              ...(u?.email ? { email: u.email } : {}),
              ...(u?.phone ? { phone: u.phone } : {}),
            }),
          )
        })
        .catch(() => {})
    run()
    window.addEventListener('online', run)
    return () => {
      alive = false
      window.removeEventListener('online', run)
    }
  }, [dispatch])
}

/** Alamat customer live → `cart.addresses`; zona + jarak dihitung dari poligon master. */
function useCustomerAddresses(): void {
  const dispatch = useAppDispatch()
  const zones = useAppSelector((s) => s.superAdmin.zones)
  useEffect(() => {
    if (!apiEnabled || zones.length === 0) return
    let alive = true
    const run = () =>
      Promise.all([fetchCustomerAddresses(), fetchMerchantLocation()])
        .then(([rows, kitchen]) => {
          if (alive && rows.length) dispatch(setAddresses(rows.map((r) => toAddress(r, zones, kitchen))))
        })
        .catch(() => {})
    run()
    window.addEventListener('online', run)
    return () => {
      alive = false
      window.removeEventListener('online', run)
    }
  }, [zones, dispatch])
}

/** Dipanggil sekali dari `useApiSync`. */
export function useApiProfile(): void {
  useCustomerUser()
  useCustomerAddresses()
}
