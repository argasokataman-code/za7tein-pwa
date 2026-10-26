import { useMemo } from 'react'

import { chargedBreakdown, payMethodKind, type ChargedBreakdown } from '../data/marketplace'
import { mockUser } from '../data/user'
import { selectSubtotal } from '../store/slices/cartSlice'
import { useAppSelector } from './useAppStore'
import { useDeliveryQuote } from './useDeliveryQuote'
import { useLiveRate } from './useLiveRate'
import { useProgramDiscount } from './useProgramDiscount'

/**
 * Rincian biaya yang ditagih ke customer — satu sumber untuk Checkout dan layar
 * bayar, supaya keduanya tidak bisa menampilkan total berbeda (dulu rumusnya
 * disalin di dua berkas). `Ft` hanya muncul untuk QRIS (§16.2). Diskon program
 * marketing (§15) ikut di sini, bukan dihitung ulang di tiap layar.
 */
export function useChargedBreakdown(): ChargedBreakdown {
  const items = useAppSelector((s) => s.cart.items)
  const stored = useAppSelector((s) => s.cart.addresses)
  const addressId = useAppSelector((s) => s.cart.selectedAddressId)
  const paymentId = useAppSelector((s) => s.cart.selectedPaymentId)
  const promo = useAppSelector((s) => s.cart.promo)
  const deliveryType = useAppSelector((s) => s.cart.deliveryType)
  /** Pengali tarif Quick = knob ops (§13), bukan konstanta di layar checkout. */
  const quickMultiplier = useAppSelector((s) => s.ops.config.quickMultiplier)
  const program = useProgramDiscount()
  // Berlangganan kurs: `Pc` dikonversi dari JOD, jadi total ikut berubah saat
  // sync harian memperbarui kurs.
  const { rate } = useLiveRate()
  const quoteFor = useDeliveryQuote()

  return useMemo(() => {
    const addresses = Array.isArray(stored) ? stored : mockUser.addresses
    const address = addresses.find((a) => a.id === addressId) ?? addresses[0]
    // Fee dari coverage merchant (§9.1); alamat di luar coverage tidak diantar.
    const baseDeliveryFeeIdr = address ? quoteFor(address).feeIdr : 0
    return chargedBreakdown({
      subtotalIdr: selectSubtotal(items),
      deliveryFeeIdr:
        deliveryType === 'quick' ? baseDeliveryFeeIdr * quickMultiplier : baseDeliveryFeeIdr,
      discountIdr: (promo?.discountIdr ?? 0) + program.discountIdr,
      method: payMethodKind(paymentId ?? 'wallet'),
    })
  }, [
    items,
    stored,
    addressId,
    promo,
    paymentId,
    rate.rate,
    program.discountIdr,
    deliveryType,
    quickMultiplier,
    quoteFor,
  ])
}
