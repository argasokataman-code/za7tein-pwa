import { ArrowRight, ChevronLeft, Download, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { money } from '../data/currency'
import { MIN_TOPUP_NEW_ACCOUNT_IDR, needsTopUpGate } from '../data/merchant'
import { useAppSelector } from '../hooks/useAppStore'

/**
 * Saldo wallet customer (M3, flow F3): `available` + `pending`, plus pintu ke
 * top-up dan penarikan. Gate saldo awal juga ditampilkan di sini supaya sebabnya
 * kelihatan dari halaman saldo, bukan cuma saat checkout.
 */
export default function WalletBalance() {
  const balance = useAppSelector((s) => s.wallet.balance)
  const gated = needsTopUpGate(balance.available)

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="wallet-page">
            <div className="wallet-flow">
              <header className="profile-flow-header ">
                <Link className="back-btn-profile" aria-label="Go back" to="/profile">
                  <ChevronLeft size={24} strokeWidth={1.75} />
                </Link>
                <h1 className="profile-flow-title">Saldo Sa7tein</h1>
              </header>
              <main className="wallet-main">
                <section className="wallet-balance-card" aria-label="Ringkasan saldo">
                  <span className="wallet-balance-label">Saldo tersedia</span>
                  <span className="wallet-balance-value">{money(balance.available)}</span>
                  <div className="wallet-balance-row">
                    <span>Hold order berjalan</span>
                    <span>{money(balance.pending)}</span>
                  </div>
                  <ExchangeRateNote />
                </section>

                {gated ? (
                  <p className="wallet-gate wallet-gate--inline" role="status">
                    Saldo masih di bawah ambang {money(MIN_TOPUP_NEW_ACCOUNT_IDR)} — checkout
                    ditahan sampai top-up masuk.
                  </p>
                ) : null}

                <Link className="wallet-item wallet-item-link" to="/wallet/top-up">
                  <div className="wallet-item-icon">
                    <Plus size={24} strokeWidth={1.75} />
                  </div>
                  <div className="wallet-item-left">
                    <span className="wallet-item-title">Top-up Saldo</span>
                    <span className="wallet-item-sub">
                      Xendit VA/QRIS (mock) · minimal {money(MIN_TOPUP_NEW_ACCOUNT_IDR)}
                    </span>
                  </div>
                  <ArrowRight size={20} strokeWidth={1.75} />
                </Link>

                <Link className="wallet-item wallet-item-link" to="/wallet/payout">
                  <div className="wallet-item-icon">
                    <Download size={24} strokeWidth={1.75} />
                  </div>
                  <div className="wallet-item-left">
                    <span className="wallet-item-title">Tarik Saldo</span>
                    <span className="wallet-item-sub">
                      Riwayat penarikan · fee penarikan menyusul (OQ-22)
                    </span>
                  </div>
                  <ArrowRight size={20} strokeWidth={1.75} />
                </Link>
              </main>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
