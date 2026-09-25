import { ChevronLeft, CreditCard, Landmark } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { money, moneyPlain } from '../data/currency'
import { accountLabel } from '../data/payout'
import {
  COURIER_PAYOUT_FEE_IDR,
  COURIER_TIPS_MIN_WITHDRAW_IDR,
  courierPayoutNet,
  courierTipsAvailable,
} from '../data/courierWallet'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { requestCourierPayout } from '../store/slices/courierSlice'

/**
 * Pencairan tips kurir (R-WALLET-01, flow f6). Fee Rp2.500 ditanggung kurir —
 * dipotong dari nilai withdraw, jadi layar menampilkan "diterima" bersih.
 * Ambang minimum masih contoh PRD (`COURIER_TIPS_MIN_WITHDRAW_IDR`).
 */
export default function CourierPayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const tasks = useAppSelector((s) => s.courier.tasks)
  const payouts = useAppSelector((s) => s.courier.payouts)
  const accounts = useAppSelector((s) => s.courier.payoutAccounts)
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0]

  const available = courierTipsAvailable(tasks, payouts)
  const [accountId, setAccountId] = useState(primary?.id ?? '')
  const [amount, setAmount] = useState<number>(available)

  const belowMin = available < COURIER_TIPS_MIN_WITHDRAW_IDR
  const tooMuch = amount > available
  const canSubmit = Boolean(accountId) && amount > 0 && !tooMuch && !belowMin

  const submit = () => {
    if (!canSubmit) return
    dispatch(requestCourierPayout({ amount, accountId }))
    toast.success(`Pencairan diminta — diterima ${moneyPlain(courierPayoutNet(amount))}`)
    navigate('/wallet')
  }

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow="Penghasilan" title="Tarik tips" />

        <section className="courier-card courier-wallet-hero" aria-label="Saldo tips">
          <p className="courier-card-sub">Saldo tips bisa ditarik</p>
          <p className="courier-wallet-total">{money(available)}</p>
        </section>

        {accounts.length === 0 ? (
          <section className="courier-card">
            <div className="courier-row">
              <CreditCard size={20} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="courier-card-title">Belum ada rekening tujuan</p>
                <p className="courier-card-sub">Tambahkan rekening dulu sebelum menarik tips.</p>
              </div>
            </div>
            <Link className="btn btn-primary courier-wallet-cta" to="/payout-accounts">
              Tambah rekening
            </Link>
          </section>
        ) : belowMin ? (
          <section className="courier-card">
            <p className="courier-card-title">Belum mencapai ambang penarikan</p>
            <p className="courier-card-sub">
              Kumpulkan minimal {moneyPlain(COURIER_TIPS_MIN_WITHDRAW_IDR)} dulu. Menarik tips kecil
              setelah dipotong fee tidak ekonomis. Ambang ini masih contoh PRD, belum final.
            </p>
          </section>
        ) : (
          <>
            <section className="courier-section">
              <h2 className="courier-section-title">Rekening tujuan</h2>
              <div className="courier-account-picker" role="radiogroup" aria-label="Pilih rekening">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    role="radio"
                    aria-checked={accountId === account.id}
                    className={`courier-account-option${accountId === account.id ? ' is-active' : ''}`}
                    onClick={() => setAccountId(account.id)}
                  >
                    <Landmark size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span className="courier-account-option-body">
                      <span className="courier-account-option-title">{accountLabel(account)}</span>
                      <span className="courier-account-option-sub">a.n. {account.holderName}</span>
                    </span>
                    {account.isPrimary ? (
                      <span className="courier-account-option-badge">Utama</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </section>

            <section className="courier-card">
              <label className="form-label" htmlFor="courier-payout-amount">Nominal penarikan</label>
              <div className="courier-payout-amount">
                <span aria-hidden="true">Rp</span>
                <input
                  id="courier-payout-amount"
                  type="number"
                  min={0}
                  step={5000}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button type="button" onClick={() => setAmount(available)}>Semua</button>
              </div>
              {tooMuch ? (
                <p className="courier-payout-warning" role="status">
                  Nominal melebihi saldo tersedia ({moneyPlain(available)}).
                </p>
              ) : (
                <p className="courier-card-sub">
                  Diterima <strong>{money(courierPayoutNet(amount || 0))}</strong> setelah fee payout
                  {' '}{moneyPlain(COURIER_PAYOUT_FEE_IDR)} yang ditanggung kurir.
                </p>
              )}
            </section>

            <button
              type="button"
              className="btn btn-primary courier-wallet-cta"
              disabled={!canSubmit}
              onClick={submit}
            >
              Tarik {moneyPlain(amount || 0)}
            </button>
          </>
        )}

        <Link className="courier-back-link" to="/wallet">
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          Kembali ke dompet
        </Link>
      </main>
      <CourierBottomNav />
    </div>
  )
}
