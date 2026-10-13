/**
 * Metode bayar aktif untuk layar checkout. Prinsip sama dengan hook katalog:
 * **mock dulu, API menimpa** — mulai dari `PAYMENT_METHODS`, lalu daftar dan
 * urutannya ditimpa hasil BE (`payment_methods`). BE kosong/error → mock tetap,
 * jadi demo tak pecah karena jaringan.
 *
 * Hasil di-cache tingkat modul (beserta promise yang sedang jalan) supaya tiga
 * layar checkout (pilih metode → ringkasan → DANA) tidak menembak endpoint yang
 * sama tiga kali.
 */
import { useEffect, useState } from 'react'

import { fetchPaymentMethodIds } from '../api/payments'
import { apiEnabled } from '../api/supabase'
import { PAYMENT_METHODS } from '../data/merchant'
import type { PaymentMethod, PaymentMethodId } from '../types'

let cache: PaymentMethod[] | null = null
let inflight: Promise<PaymentMethodId[]> | null = null

/** Cocokkan id BE dengan entri mock terkurasi; id tak dikenal dibuang. */
function orderMethods(ids: PaymentMethodId[]): PaymentMethod[] {
  return ids
    .map((id) => PAYMENT_METHODS.find((m) => m.id === id))
    .filter((m): m is PaymentMethod => Boolean(m))
}

export function useApiPaymentMethods(): PaymentMethod[] {
  const [methods, setMethods] = useState<PaymentMethod[]>(cache ?? PAYMENT_METHODS)

  useEffect(() => {
    if (cache || !apiEnabled) return
    let alive = true
    inflight ??= fetchPaymentMethodIds().catch(() => [] as PaymentMethodId[])
    inflight
      .then((ids) => {
        const ordered = ids.length ? orderMethods(ids) : []
        if (!ordered.length) return
        cache = ordered
        if (alive) setMethods(ordered)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return methods
}
