import { useMemo } from 'react'

import { deliveryQuote } from '../data/coverage'
import { jodToIdr } from '../data/currency'
import { MERCHANT_KITCHEN } from '../data/zones'
import type { Address } from '../types'
import { useAppSelector } from './useAppStore'

export interface DeliveryQuoteIdr {
  covered: boolean
  feeIdr: number
}

/**
 * Ongkir + gate coverage dari **coverage merchant** (§9.1), bukan zona legacy
 * Hijazi/Syimali. Checkout, pemilihan alamat, dan layar bayar memakai hook ini
 * supaya ketiganya tidak bisa menampilkan angka berbeda — sumbernya satu:
 * `coverage` di store, yang juga disunting di konsol merchant.
 *
 * Jarak masih garis lurus (mock); produksi memakai rute jalan kaki (WALK) untuk
 * fee, sementara filter/sort tetap garis lurus (§9.1).
 */
export function useDeliveryQuote() {
  const coverage = useAppSelector((s) => s.coverage)

  return useMemo(() => {
    return (address: Pick<Address, 'lat' | 'lng'>): DeliveryQuoteIdr => {
      const kitchen = coverage.origin ?? MERCHANT_KITCHEN
      const quote = deliveryQuote(coverage, { lat: address.lat, lng: address.lng }, kitchen)
      return { covered: quote.covered, feeIdr: jodToIdr(quote.feeJod) }
    }
  }, [coverage])
}
