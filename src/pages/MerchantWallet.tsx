import { ArrowDownLeft, ArrowUpRight, ChevronLeft, Landmark } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { money, moneyPlain } from '../data/currency'
import { accountLabel, PAYOUT_FEE_IDR } from '../data/payout'
import { payoutStatusLabel } from '../data/wallet'
import { useAppSelector } from '../hooks/useAppStore'

const entryDate = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Dompet merchant (R-WALLET-01, flow f6): saldo dari order selesai yang bisa
 * ditarik ke rekening. Bukan pot modal/cashback Founding — itu JOD dan
 * non-withdrawal, rumahnya di `/merchant/insentif`.
 */
export default function MerchantWallet() {
  const balance = useAppSelector((state) => state.payout.balance)
  const history = useAppSelector((state) => state.payout.history)
  const accounts = useAppSelector((state) => state.payout.accounts)
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0]

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Keuangan" title="Saldo & pencairan" />

        <section className="merchant-card merchant-wallet-balance" aria-label="Saldo dompet">
          <span className="merchant-wallet-balance-label">Saldo tersedia</span>
          <span className="merchant-wallet-balance-value">{money(balance.available)}</span>
          <span className="merchant-wallet-balance-sub">
            {balance.pending > 0
              ? `${moneyPlain(balance.pending)} ditahan untuk order berjalan`
              : 'Tidak ada dana yang ditahan'}
          </span>
        </section>

        <Link className="btn btn-primary merchant-wallet-manage" to="/payout">
          <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
          Tarik saldo ke rekening
        </Link>

        <section className="merchant-card">
          <div className="merchant-row">
            <Landmark size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="merchant-card-title">Rekening pencairan</p>
              <p className="merchant-card-sub">
                {primary ? accountLabel(primary) : 'Belum ada rekening tujuan'}
              </p>
              <p className="merchant-card-sub">
                {accounts.length} rekening tersimpan · fee payout {moneyPlain(PAYOUT_FEE_IDR)} per
                pencairan
              </p>
            </div>
          </div>
          <Link className="merchant-btn-ghost merchant-wallet-manage" to="/payout-accounts">
            Kelola rekening
          </Link>
        </section>

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Riwayat dompet</h2>
          </div>
          {history.length === 0 ? (
            <p className="merchant-card-sub">Belum ada transaksi.</p>
          ) : (
            <ul className="merchant-wallet-history">
              {history.map((entry) => {
                const isCredit = entry.kind === 'settlement'
                const Icon = isCredit ? ArrowDownLeft : ArrowUpRight
                return (
                  <li key={entry.id}>
                    <span
                      className={`merchant-wallet-history-icon${isCredit ? ' is-credit' : ''}`}
                      aria-hidden="true"
                    >
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <div className="merchant-wallet-history-body">
                      <span className="merchant-wallet-history-title">
                        {isCredit ? 'Kredit order selesai' : 'Pencairan ke rekening'}
                      </span>
                      <span className="merchant-wallet-history-sub">
                        {entryDate(entry.createdAt)}
                        {entry.destination ? ` · ${entry.destination}` : ''}
                      </span>
                    </div>
                    <div className="merchant-wallet-history-right">
                      <span
                        className={`merchant-wallet-history-amount${isCredit ? ' is-credit' : ''}`}
                      >
                        {isCredit ? '+' : '−'}
                        {moneyPlain(entry.amount)}
                      </span>
                      <span className="merchant-wallet-history-status">
                        {isCredit ? 'Masuk saldo' : payoutStatusLabel(entry.status)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="merchant-hint-inline">
            Urut dari yang terbaru. Kredit masuk otomatis saat order selesai.
          </p>
        </section>

        <Link className="merchant-back-link" to="/settings">
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          Kembali ke setelan
        </Link>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
