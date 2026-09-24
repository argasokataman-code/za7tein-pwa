import { TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MIN_TOPUP_NEW_ACCOUNT_IDR, needsTopUpGate } from '../../data/merchant'
import { money } from '../../data/currency'
import { useAppSelector } from '../../hooks/useAppStore'

/**
 * Gate saldo awal (R-TOPUP-01) — ditampilkan di checkout/pembayaran kalau saldo
 * `available` di bawah 3,5 JOD. Tombol di dalamnya menuju layar top-up (M3),
 * karena gate tanpa jalan keluar cuma memblokir.
 */
export function WalletTopUpGate() {
  const available = useAppSelector((s) => s.wallet.balance.available)
  if (!needsTopUpGate(available)) return null

  return (
    <div className="wallet-gate" role="status">
      <TriangleAlert size={18} strokeWidth={1.75} aria-hidden="true" />
      <div className="wallet-gate__text">
        {/* Satu paragraf, bukan judul+isi: sebelumnya "Top-up dulu, minimal…"
            mengulang label tombol mati di bilah bawah dan judul gate sendiri —
            empat penyebutan top-up dalam satu layar (audit 005 #5). */}
        <p className="wallet-gate__body">
          Saldo kamu {money(available)}, minimal top-up {money(MIN_TOPUP_NEW_ACCOUNT_IDR)} sebelum
          order. Gate ini berlaku untuk semua metode pembayaran, bukan cuma bayar pakai saldo.
        </p>
        <Link className="wallet-gate__cta" to="/wallet/top-up">
          Top-up sekarang
        </Link>
      </div>
    </div>
  )
}
