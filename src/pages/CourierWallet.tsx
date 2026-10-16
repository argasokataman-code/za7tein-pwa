import { ArrowDownLeft, ArrowUpRight, Coins, Landmark, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { accountLabel } from '../data/payout'
import {
  COURIER_MIN_WITHDRAW_IDR,
  COURIER_PAYOUT_FEE_IDR,
  courierFeeEntries,
  courierWalletBreakdown,
  mockCourierTips,
} from '../data/courierWallet'
import { payoutStatusLabel } from '../data/wallet'
import { useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'

const entryDate = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Dompet kurir (R-WALLET-01, flow f6). Menampung **fee pengantaran** Regular
 * online (R-DELIV-FEE, masuk DANA kurir saat order selesai) dan **tips**
 * customer. Saldo diturunkan dari tugas + riwayat pencairan, bukan state
 * terpisah, jadi menuntaskan order langsung menaikkan angka ini.
 */
export default function CourierWallet() {
  const { money, moneyPlain } = useMoney()
  const tasks = useAppSelector((s) => s.courier.tasks)
  const payouts = useAppSelector((s) => s.courier.payouts)
  const accounts = useAppSelector((s) => s.courier.payoutAccounts)
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0]

  const { tips, fees, available } = courierWalletBreakdown(tasks, payouts)
  const belowMin = available < COURIER_MIN_WITHDRAW_IDR
  const remaining = COURIER_MIN_WITHDRAW_IDR - available
  const ratio = Math.min(1, available / COURIER_MIN_WITHDRAW_IDR)

  const history = [...payouts, ...mockCourierTips, ...courierFeeEntries(tasks)].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  )

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow="Penghasilan" title="Dompet kurir" back="/tips" />

        <section className="courier-card courier-wallet-hero" aria-label="Saldo dompet">
          <p className="courier-card-sub">Saldo bisa ditarik</p>
          <p className="courier-wallet-total">{money(available)}</p>
          <p className="courier-card-sub">
            Fee pengantaran {moneyPlain(fees)} · tips {moneyPlain(tips)}
          </p>
          <div className="courier-wallet-meter" role="presentation">
            <span style={{ width: `${Math.round(ratio * 100)}%` }} />
          </div>
          <p className="courier-card-sub">
            {belowMin
              ? `${moneyPlain(remaining)} lagi untuk mencapai ambang penarikan ${moneyPlain(COURIER_MIN_WITHDRAW_IDR)}`
              : 'Sudah melewati ambang, siap ditarik ke rekening'}
          </p>
        </section>

        {belowMin ? (
          <button type="button" className="btn btn-primary courier-wallet-cta" disabled>
            <Lock size={18} strokeWidth={1.75} aria-hidden="true" />
            Belum mencapai ambang
          </button>
        ) : (
          <Link className="btn btn-primary courier-wallet-cta" to="/payout">
            <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
            Tarik saldo ke rekening
          </Link>
        )}

        <section className="courier-card">
          <div className="courier-row">
            <Landmark size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">Rekening pencairan</p>
              <p className="courier-card-sub">
                {primary ? accountLabel(primary) : 'Belum ada rekening tujuan'}
              </p>
              <p className="courier-card-sub">
                Fee payout {moneyPlain(COURIER_PAYOUT_FEE_IDR)} ditanggung kurir, dipotong dari nilai
                penarikan
              </p>
            </div>
          </div>
          <Link className="courier-secondary-link" to="/payout-accounts">
            Kelola rekening
          </Link>
        </section>

        <section className="courier-section">
          <h2 className="courier-section-title">Riwayat dompet</h2>
          {history.length === 0 ? (
            <p className="courier-empty">Belum ada transaksi.</p>
          ) : (
            <ul className="courier-wallet-history">
              {history.map((entry) => {
                const isPayout = entry.kind === 'payout'
                const Icon = entry.kind === 'tip' ? Coins : isPayout ? ArrowUpRight : ArrowDownLeft
                const title = isPayout
                  ? 'Pencairan ke rekening'
                  : entry.kind === 'tip'
                    ? 'Tips masuk'
                    : 'Fee pengantaran'
                return (
                  <li key={entry.id}>
                    <span
                      className={`courier-wallet-history-icon${isPayout ? '' : ' is-credit'}`}
                      aria-hidden="true"
                    >
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <div className="courier-wallet-history-body">
                      <span className="courier-wallet-history-title">{title}</span>
                      <span className="courier-wallet-history-sub">
                        {entryDate(entry.createdAt)}
                        {entry.destination ? ` · ${entry.destination}` : ''}
                        {entry.fee ? ` · fee ${moneyPlain(entry.fee)}` : ''}
                      </span>
                    </div>
                    <div className="courier-wallet-history-right">
                      <span className={`courier-wallet-history-amount${isPayout ? '' : ' is-credit'}`}>
                        {isPayout ? '−' : '+'}
                        {moneyPlain(entry.amount)}
                      </span>
                      <span className="courier-wallet-history-status">
                        {isPayout ? payoutStatusLabel(entry.status) : 'Masuk saldo'}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="courier-hint-inline">
            Ambang penarikan {moneyPlain(COURIER_MIN_WITHDRAW_IDR)}. Gaji bulanan bukan milik kurir,
            jadi tidak masuk dompet ini.
          </p>
        </section>

      </main>
      <CourierBottomNav />
    </div>
  )
}
