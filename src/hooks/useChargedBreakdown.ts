import { useMemo } from 'react'

import { deliveryFeeFor } from '../data/merchant'
import { chargedBreakdown, payMethodKind, type ChargedBreakdown } from '../data/marketplace'
import { mockUser } from '../data/user'
import { selectSubtotal } from '../store/slices/cartSlice'
import { useAppSelector } from './useAppStore'
import { useLiveRate } from './useLiveRate'

/**
 * Rincian biaya yang ditagih ke customer — satu sumber untuk Checkout dan layar
 * bayar, supaya keduanya tidak bisa menampilkan total berbeda (dulu rumusnya
 * disalin di dua berkas). `Ft` hanya muncul untuk QRIS (§16.2).
 */
export function useChargedBreakdown(): ChargedBreakdown {
  const items = useAppSelector((s) => s.cart.items)
  const stored = useAppSelector((s) => s.cart.addresses)
  const addressId = useAppSelector((s) => s.cart.selectedAddressId)
  const paymentId = useAppSelector((s) => s.cart.selectedPaymentId)
  const promo = useAppSelector((s) => s.cart.promo)
  // Berlangganan kurs: `Pc` dikonversi dari JOD, jadi total ikut berubah saat
  // sync harian memperbarui kurs.
  const { rate } = useLiveRate()

  return useMemo(() => {
    const addresses = Array.isArray(stored) ? stored : mockUser.addresses
    const address = addresses.find((a) => a.id === addressId) ?? addresses[0]
    return chargedBreakdown({
      subtotalIdr: selectSubtotal(items),
      deliveryFeeIdr: address ? deliveryFeeFor(address) : 0,
      discountIdr: promo?.discountIdr ?? 0,
      method: payMethodKind(paymentId ?? 'wallet'),
    })
  }, [items, stored, addressId, promo, paymentId, rate.rate])
}
