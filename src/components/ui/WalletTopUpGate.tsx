import { TriangleAlert } from 'lucide-react'

import { MIN_TOPUP_NEW_ACCOUNT_IDR, needsTopUpGate } from '../../data/merchant'
import { money } from '../../data/currency'
import { useAppSelector } from '../../hooks/useAppStore'

/**
 * Gate saldo awal (R-TOPUP-01) — ditampilkan di checkout/pembayaran kalau saldo
 * `available` di bawah 3,5 JOD. Layar top-up ada di M3; sampai itu dibangun, gate
 * cuma menjelaskan kenapa pembayaran diblokir.
 */
export function WalletTopUpGate() {
  const available = useAppSelector((s) => s.wallet.balance.available)
  if (!needsTopUpGate(available)) return null

  return (
    <div className="wallet-gate" role="status">
      <TriangleAlert size={18} strokeWidth={1.75} aria-hidden="true" />
      <div className="wallet-gate__text">
        <p className="wallet-gate__title">Top-up dulu, minimal {money(MIN_TOPUP_NEW_ACCOUNT_IDR)}</p>
        <p className="wallet-gate__body">
          Saldo kamu {money(available)}. Gate saldo awal berlaku untuk semua metode, bukan cuma
          bayar pakai saldo. Layar top-up menyusul (M3).
        </p>
      </div>
    </div>
  )
}
