/**
 * Sinkron data referensi dari API — **mock dulu, API menimpa** (pola sama
 * dengan `useApiCatalog`/`useApiOrders`). Dipanggil sekali dari `App` lewat
 * `ApiSync`: kalau API mati/kosong/error, seed Redux tetap tampil.
 */
import { useEffect, useRef } from 'react'

import {
  fetchCouriers,
  fetchMerchantCredit,
  fetchStoreStatus,
  fetchSwitches,
  fetchWallet,
  fetchZones,
  setStoreStatus,
} from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { hydrateCredit, setCouriers, setStoreActive } from '../store/slices/merchantSlice'
import { setBalance as setPayoutBalance } from '../store/slices/payoutSlice'
import { setSwitches, setZones } from '../store/slices/superAdminSlice'
import { setBalance as setWalletBalance } from '../store/slices/walletSlice'
import { useAppDispatch, useAppSelector } from './useAppStore'

const MERCHANT_ID = 1
const USER_CUSTOMER = 1
const USER_MERCHANT = 2

/** Kurir milik merchant demo → `merchant.couriers`. */
function useCouriers(): void {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchCouriers(MERCHANT_ID)
      .then((rows) => {
        if (alive && rows.length) dispatch(setCouriers(rows))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch])
}

/** Modal + rebate merchant → `merchant.credit`. */
function useMerchantCredit(): void {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchMerchantCredit(MERCHANT_ID)
      .then((credit) => {
        if (alive && credit) dispatch(hydrateCredit(credit))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch])
}

/** Saldo wallet live: customer → `wallet`, merchant → `payout`. */
function useWallet(userId: number, target: 'customer' | 'merchant'): void {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchWallet(userId)
      .then((wallet) => {
        if (!alive || !wallet) return
        dispatch(target === 'customer' ? setWalletBalance(wallet) : setPayoutBalance(wallet))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch, userId, target])
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

/**
 * Konsol SA: zona + kill-switch. Role & operator **tidak** diambil dari
 * backend — vocabulary izinnya berbeda (`zone.write` vs `zone.edit`) dan
 * operator tak punya nama, jadi menimpanya mengunci seluruh konsol; keduanya
 * tetap mock sampai kontraknya diselaraskan.
 */
function useSuperAdmin(): void {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchZones().then((rows) => alive && rows.length && dispatch(setZones(rows))).catch(() => {})
    fetchSwitches()
      .then((switches) => alive && dispatch(setSwitches(switches)))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [dispatch])
}

/** Panggil sekali di `App` (di dalam `StoreProvider`) — semua sinkron referensi. */
export function useApiSync(): void {
  useCouriers()
  useMerchantCredit()
  useWallet(USER_CUSTOMER, 'customer')
  useWallet(USER_MERCHANT, 'merchant')
  useStoreStatus()
  useSuperAdmin()
}
