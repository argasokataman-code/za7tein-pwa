/** Sinkron data referensi — mock dulu, API menimpa; dipanggil sekali lewat `ApiSync`. */
import { useEffect, useRef } from 'react'

import {
  fetchCouriers,
  fetchCustomerAddress,
  fetchMerchantCredit,
  fetchMerchantProfile,
  fetchMerchantRecords,
  fetchOperators,
  fetchRoles,
  fetchStoreStatus,
  fetchSwitches,
  fetchWallet,
  fetchZones,
  setStoreStatus,
} from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { setMerchants } from '../store/slices/adminSlice'
import { hydrateCredit, hydrateProfile, setCouriers, setStoreActive } from '../store/slices/merchantSlice'
import { setBalance as setPayoutBalance } from '../store/slices/payoutSlice'
import { setOperators, setRoles, setSwitches, setZones } from '../store/slices/superAdminSlice'
import { setCustomerLocation } from '../store/slices/uiSlice'
import { setBalance as setWalletBalance } from '../store/slices/walletSlice'
import { useAppDispatch, useAppSelector } from './useAppStore'

const MERCHANT_ID = 1
const USER_CUSTOMER = 1
const USER_MERCHANT = 2

/** Pola sinkron sekali: load saat mount, serahkan hasil ke `onData` bila masih hidup. */
export function useSyncOnce<T>(
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
  useSyncOnce(() => fetchCouriers(MERCHANT_ID), (rows, d) => {
    if (rows.length) d(setCouriers(rows))
  })
}

/** Modal + rebate merchant → `merchant.credit`. */
function useMerchantCredit(): void {
  useSyncOnce(() => fetchMerchantCredit(MERCHANT_ID), (credit, d) => {
    if (credit) d(hydrateCredit(credit))
  })
}

/** Profil toko (nama, kontak, foto, jam, config kirim) → `merchant`. */
function useMerchantProfile(): void {
  useSyncOnce(() => fetchMerchantProfile(MERCHANT_ID), (profile, d) => {
    if (profile) d(hydrateProfile(profile))
  })
}
/** Registri merchant platform → `admin.merchants` (panel CS + konsol SA). */
function useMerchantRegistry(): void {
  useSyncOnce(() => fetchMerchantRecords(), (rows, d) => {
    if (rows.length) d(setMerchants(rows))
  })
}

/** Saldo wallet live: customer → `wallet`, merchant → `payout`. */
function useWallet(userId: number, target: 'customer' | 'merchant'): void {
  useSyncOnce(() => fetchWallet(userId), (wallet, d) => {
    d(target === 'customer' ? setWalletBalance(wallet) : setPayoutBalance(wallet))
  })
}
/** Alamat default customer live → label hero + titik asal jarak ke toko. */
function useCustomerLocation(): void {
  useSyncOnce(() => fetchCustomerAddress(), (a, d) =>
    d(setCustomerLocation({ label: a.label, lat: a.lat, lng: a.lng })),
  )
}

/** Status toko dua arah: baca `store_status`, tulis balik saat Buka/Tutup ditekan. */
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

/**
 * Konsol SA: zona, kill-switch, role, dan operator. Role + operator harus
 * diambil bersamaan — kalau role live tapi operator mock, `roleId` mock
 * (`owner`) tak ada di daftar role live (`sa_owner`) sehingga konsol terkunci.
 */
function useSuperAdmin(): void {
  useSyncOnce(() => fetchZones(), (rows, d) => {
    if (rows.length) d(setZones(rows))
  })
  useSyncOnce(() => fetchSwitches(), (switches, d) => d(setSwitches(switches)))
  useSyncOnce(() => fetchRoles(), (rows, d) => {
    if (rows.length) d(setRoles(rows))
  })
  useSyncOnce(() => fetchOperators(), (rows, d) => {
    if (rows.length) d(setOperators(rows))
  })
}

/** Panggil sekali di `App` (di dalam `StoreProvider`) — semua sinkron referensi. */
export function useApiSync(): void {
  useCouriers()
  useMerchantCredit()
  useMerchantProfile()
  useMerchantRegistry()
  useWallet(USER_CUSTOMER, 'customer')
  useWallet(USER_MERCHANT, 'merchant')
  useCustomerLocation()
  useStoreStatus()
  useSuperAdmin()
}
