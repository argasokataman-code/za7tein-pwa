/** Sinkron data referensi — mock dulu, API menimpa; dipanggil sekali lewat `ApiSync`. */
import { useEffect, useRef } from 'react'

import {
  fetchCouriers,
  fetchMerchantCredit,
  fetchMerchantProfile,
  fetchStoreStatus,
  fetchSwitches,
  fetchWallet,
  fetchZones,
  setStoreStatus,
} from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { hydrateCredit, hydrateProfile, setCouriers, setStoreActive } from '../store/slices/merchantSlice'
import { setBalance as setPayoutBalance } from '../store/slices/payoutSlice'
import { setSwitches, setZones } from '../store/slices/superAdminSlice'
import { setBalance as setWalletBalance } from '../store/slices/walletSlice'
import { useAppDispatch, useAppSelector } from './useAppStore'

const MERCHANT_ID = 1
const USER_CUSTOMER = 1
const USER_MERCHANT = 2

/** Pola sinkron sekali: load saat mount, serahkan hasil ke `onData` bila masih hidup. */
function useSyncOnce<T>(
  load: () => Promise<T | undefined>,
  onData: (data: T, dispatch: ReturnType<typeof useAppDispatch>) => void,
): void {
  const dispatch = useAppDispatch()
  const ref = useRef({ load, onData })
  ref.current = { load, onData }
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    ref.current
      .load()
      .then((data) => {
        if (alive && data !== undefined) ref.current.onData(data, dispatch)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch])
}

/** Kurir milik merchant demo → `merchant.couriers`. */
function useCouriers(): void {
  useSyncOnce(
    () => fetchCouriers(MERCHANT_ID),
    (rows, dispatch) => {
      if (rows.length) dispatch(setCouriers(rows))
    },
  )
}

/** Modal + rebate merchant → `merchant.credit`. */
function useMerchantCredit(): void {
  useSyncOnce(
    () => fetchMerchantCredit(MERCHANT_ID),
    (credit, dispatch) => {
      if (credit) dispatch(hydrateCredit(credit))
    },
  )
}

/** Profil toko (nama, kontak, foto, konfigurasi kirim) → `merchant`. */
function useMerchantProfile(): void {
  useSyncOnce(
    () => fetchMerchantProfile(MERCHANT_ID),
    (profile, dispatch) => {
      if (profile) dispatch(hydrateProfile(profile))
    },
  )
}

/** Saldo wallet live: customer → `wallet`, merchant → `payout`. */
function useWallet(userId: number, target: 'customer' | 'merchant'): void {
  useSyncOnce(
    () => fetchWallet(userId),
    (wallet, dispatch) => {
      dispatch(target === 'customer' ? setWalletBalance(wallet) : setPayoutBalance(wallet))
    },
  )
}

/**
 * Status toko dua arah: baca `store_status` saat mount, tulis balik ke backend
 * tiap merchant menekan Buka/Tutup. `baseline` mencegah tulis saat pembacaan
 * pertama datang (tanpa itu, hasil baca ikut ditulis kembali).
 */
function useStoreStatus(): void {
  const dispatch = useAppDispatch()
  const isActive = useAppSelector((s) => s.merchant.isActive)
  const baseline = useRef<boolean | null>(null)
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchStoreStatus(MERCHANT_ID)
      .then((open) => {
        if (!alive || open === undefined) return
        baseline.current = open
        dispatch(setStoreActive(open))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch])
  useEffect(() => {
    if (!apiEnabled || baseline.current === null || baseline.current === isActive) return
    baseline.current = isActive
    setStoreStatus(isActive, MERCHANT_ID).catch(() => {})
  }, [isActive])
}

/** Konsol SA: zona + kill-switch. Role & operator tetap mock (vocabulary izin beda, operator tanpa nama). */
function useSuperAdmin(): void {
  useSyncOnce(
    () => fetchZones(),
    (rows, dispatch) => {
      if (rows.length) dispatch(setZones(rows))
    },
  )
  useSyncOnce(
    () => fetchSwitches(),
    (switches, dispatch) => {
      if (switches) dispatch(setSwitches(switches))
    },
  )
}

/** Panggil sekali di `App` (di dalam `StoreProvider`) — semua sinkron referensi. */
export function useApiSync(): void {
  useCouriers()
  useMerchantCredit()
  useMerchantProfile()
  useWallet(USER_CUSTOMER, 'customer')
  useWallet(USER_MERCHANT, 'merchant')
  useStoreStatus()
  useSuperAdmin()
}
