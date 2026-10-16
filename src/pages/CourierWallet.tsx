import { ArrowDownLeft, ArrowUpRight, Bike, Coins, Landmark, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { accountLabel } from '../data/payout'
import {
  COURIER_MIN_WITHDRAW_IDR,
  COURIER_PAYOUT_FEE_IDR,
  courierFeeEntries,
  courierFeesPaid,
  courierTipsBreakdown,
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
 * Dompet kurir (R-WALLET-01, flow f6). Dua sumber penghasilan dipisah
 * (PRD §16.4, PO 2026-10-16): **tips** customer masuk saldo yang ditarik lewat
 * layar ini, sedangkan **fee pengantaran** Regular online dikirim platform
 * otomatis ke DANA saat order selesai, jadi ia ditampilkan sebagai penghasilan
 * terpisah dan tidak menambah saldo tarik. Saldo diturunkan dari tugas + riwayat
 * pencairan, bukan state terpisah.
 */
export default function CourierWallet() {
  const { money, moneyPlain } = useMoney()
  const tasks = useAppSelector((s) => s.courier.tasks)
  const payouts = useAppSelector((s) => s.courier.payouts)
  const accounts = useAppSelector((s) => s.courier.payoutAccounts)
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0]

  const { tips, withdrawn, available } = courierTipsBreakdown(tasks, payouts)
  const feeEntries = courierFeeEntries(tasks)
  const feesPaid = courierFeesPaid(tasks)
  const belowMin = available < COURIER_MIN_WITHDRAW_IDR
  const remaining = COURIER_MIN_WITHDRAW_IDR - available
  const ratio = Math.min(1, available / COURIER_MIN_WITHDRAW_IDR)

  // Riwayat dompet = saldo tarik saja (pencairan + tips). Baris fee punya
  // bagiannya sendiri di atas karena ia tidak pernah masuk saldo ini.
  const history = [...payouts, ...mockCourierTips].sort((a, b) =>
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
            Dari tips {moneyPlain(tips)}
            {withdrawn > 0 ? ` · sudah ditarik ${moneyPlain(withdrawn)}` : ''}
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

        <section className="courier-card">
          <div className="courier-row">
            <Bike size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">Penghasilan pengantaran</p>
              <p className="courier-card-sub">
                {moneyPlain(feesPaid)} dari fee order Regular online. Dikirim otomatis ke DANA saat
                order selesai, jadi tidak masuk saldo yang ditarik di sini.
              </p>
            </div>
          </div>
          {feeEntries.length === 0 ? (
            <p className="courier-empty">Belum ada fee pengantaran yang cair.</p>
          ) : (
            <ul className="courier-wallet-history">
              {feeEntries.map((entry) => (
                <li key={entry.id}>
                  <span className="courier-wallet-history-icon is-credit" aria-hidden="true">
                    <ArrowDownLeft size={16} strokeWidth={1.75} />
                  </span>
                  <div className="courier-wallet-history-body">
                    <span className="courier-wallet-history-title">Fee pengantaran</span>
                    <span className="courier-wallet-history-sub">
                      {entryDate(entry.createdAt)}
                      {entry.destination ? ` · ${entry.destination}` : ''}
                    </span>
                  </div>
                  <div className="courier-wallet-history-right">
                    <span className="courier-wallet-history-amount is-credit">
                      +{moneyPlain(entry.amount)}
                    </span>
                    <span className="courier-wallet-history-status">ke DANA</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="courier-section">
          <h2 className="courier-section-title">Riwayat saldo</h2>
          {history.length === 0 ? (
            <p className="courier-empty">Belum ada transaksi.</p>
          ) : (
            <ul className="courier-wallet-history">
              {history.map((entry) => {
                const isPayout = entry.kind === 'payout'
                const Icon = isPayout ? ArrowUpRight : Coins
                return (
                  <li key={entry.id}>
                    <span
                      className={`courier-wallet-history-icon${isPayout ? '' : ' is-credit'}`}
                      aria-hidden="true"
                    >
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <div className="courier-wallet-history-body">
                      <span className="courier-wallet-history-title">
                        {isPayout ? 'Pencairan ke rekening' : 'Tips masuk'}
                      </span>
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
            Ambang penarikan {moneyPlain(COURIER_MIN_WITHDRAW_IDR)}. Fee pengantaran tidak masuk
            saldo ini (otomatis ke DANA), dan gaji bulanan dibayar merchant di luar aplikasi.
          </p>
        </section>

      </main>
      <CourierBottomNav />
    </div>
  )
}
