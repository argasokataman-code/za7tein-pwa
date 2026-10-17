import { useMemo } from 'react'

import { idrToJod, jodToIdr } from '../data/currency'
import { bestProgramCombination, programMatches } from '../data/marketing'
import { mockLoyaltyCards } from '../data/marketing'
import { selectSubtotal } from '../store/slices/cartSlice'
import { useAppSelector } from './useAppStore'

/** Program yang benar-benar dipakai di keranjang, siap ditampilkan. */
export interface ProgramRow {
  id: string
  name: string
  owner: 'platform' | 'merchant'
  discountIdr: number
  /** Customer sudah menekan "Klaim" di halaman toko (tampilan, bukan hitungan). */
  claimed: boolean
}

/** Program yang muncul di keranjang tapi belum dihitung, beserta sebabnya. */
export interface ProgramInfoRow {
  id: string
  name: string
  note: string
}

export interface ProgramDiscount {
  /** Total diskon program yang dipakai (IDR) — masuk ke `chargedBreakdown`. */
  discountIdr: number
  rows: ProgramRow[]
  infoRows: ProgramInfoRow[]
  /** Satu catatan untuk semua yang tak masuk total (stacking + sebabnya). */
  note: string | null
}

/**
 * Diskon program marketing (§15) untuk keranjang aktif. Satu tempat: dipakai
 * `useChargedBreakdown` (supaya total di semua layar identik) dan Checkout
 * (supaya barisnya bisa dibaca satu per satu).
 */
export function useProgramDiscount(): ProgramDiscount {
  const items = useAppSelector((s) => s.cart.items)
  const merchantId = useAppSelector((s) => s.cart.activeMerchantId)
  const programs = useAppSelector((s) => s.marketing.programs)
  const rules = useAppSelector((s) => s.marketing.rules)
  const rewards = useAppSelector((s) => s.marketing.rewards)
  const claimedProgramIds = useAppSelector((s) => s.marketing.claimedProgramIds)

  return useMemo(() => {
    const subtotalIdr = selectSubtotal(items)
    // Poin loyalty mock: BE belum punya `loyalty_cards` (§15, ui-impact).
    const points = mockLoyaltyCards.reduce((sum, card) => sum + card.points, 0)
    const ctx = {
      merchantId,
      subtotalJod: idrToJod(subtotalIdr),
      qty: items.reduce((sum, item) => sum + item.quantity, 0),
      menuIds: items.map((item) => item.id),
      points,
    }
    const combo = bestProgramCombination(programs, rules, rewards, ctx)
    const all = programMatches(programs, rules, rewards, ctx)
    const chosenIds = new Set(combo.chosen.map((m) => m.program.id))
    const infoRows = all
      .filter((m) => !chosenIds.has(m.program.id) && m.unsupported)
      .map((m) => ({ id: m.program.id, name: m.program.name, note: m.unsupported ?? 'Belum didukung' }))
    // Satu catatan, bukan dua paragraf berturut-turut: aturan penggabungan lebih
    // dulu (itu yang menjelaskan kenapa angka lain tidak muncul), lalu sebab per
    // program. Semua yang tak masuk total bisa dibaca dalam satu tempat.
    const note = [
      combo.rejected.length > 0
        ? 'Program lain tidak dipakai karena ada program yang tak bisa digabung (§15.3).'
        : null,
      ...infoRows.map((row) => `${row.name}: ${row.note}`),
    ]
      .filter(Boolean)
      .join(' ')
    return {
      discountIdr: Math.round(jodToIdr(combo.discountJod)),
      rows: combo.chosen.map((m) => ({
        id: m.program.id,
        name: m.program.name,
        owner: m.program.owner,
        discountIdr: Math.round(jodToIdr(m.discountJod)),
        claimed: claimedProgramIds.includes(m.program.id),
      })),
      infoRows,
      note: note.length ? note : null,
    }
  }, [items, merchantId, programs, rules, rewards, claimedProgramIds])
}
