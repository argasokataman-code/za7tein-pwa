import { ChevronLeft, CreditCard, Landmark } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { money, moneyPlain } from '../data/currency'
import { accountLabel, PAYOUT_FEE_IDR } from '../data/payout'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { requestPayout } from '../store/slices/payoutSlice'

/**
 * Pencairan merchant (R-WALLET-01, flow f6): pilih rekening tujuan + nominal,
 * lalu `POST /v3/payouts` versi mock. Fee payout Rp2.500 belum dipotong dari
 * saldo karena penanggungnya untuk merchant belum diputuskan PRD — layar hanya
 * menampilkan info, tidak mengarang angka.
 */
export default function MerchantPayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const balance = useAppSelector((state) => state.payout.balance)
  const accounts = useAppSelector((state) => state.payout.accounts)
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0]

  const [accountId, setAccountId] = useState(primary?.id ?? '')
  const [amount, setAmount] = useState<number>(Math.min(100_000, balance.available))

  const tooMuch = amount > balance.available
  const canSubmit = Boolean(accountId) && amount > 0 && !tooMuch

  const submit = () => {
    if (!canSubmit) return
    dispatch(requestPayout({ amount, accountId }))
    toast.success('Pencairan diminta — menunggu diproses')
    navigate('/wallet')
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Keuangan" title="Tarik saldo" />

        <section className="merchant-card merchant-wallet-balance" aria-label="Saldo tersedia">
          <span className="merchant-wallet-balance-label">Saldo tersedia</span>
          <span className="merchant-wallet-balance-value">{money(balance.available)}</span>
        </section>

        {accounts.length === 0 ? (
          <section className="merchant-card">
            <div className="merchant-row">
              <CreditCard size={20} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="merchant-card-title">Belum ada rekening tujuan</p>
                <p className="merchant-card-sub">
                  Tambahkan rekening dulu sebelum menarik saldo.
                </p>
              </div>
            </div>
            <Link className="btn btn-primary merchant-wallet-manage" to="/payout-accounts">
              Tambah rekening
            </Link>
          </section>
        ) : (
          <>
            <section className="merchant-section">
              <div className="merchant-section-head">
                <h2>Rekening tujuan</h2>
                <Link className="merchant-section-link" to="/payout-accounts">
                  Kelola
                </Link>
              </div>
              <div className="merchant-account-picker" role="radiogroup" aria-label="Pilih rekening">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    role="radio"
                    aria-checked={accountId === account.id}
                    className={`merchant-account-option${accountId === account.id ? ' is-active' : ''}`}
                    onClick={() => setAccountId(account.id)}
                  >
                    <Landmark size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span className="merchant-account-option-body">
                      <span className="merchant-account-option-title">{accountLabel(account)}</span>
                      <span className="merchant-account-option-sub">a.n. {account.holderName}</span>
                    </span>
                    {account.isPrimary ? (
                      <span className="merchant-account-option-badge">Utama</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </section>

            <section className="merchant-card">
              <label className="form-label" htmlFor="merchant-payout-amount">
                Nominal penarikan
              </label>
              <div className="merchant-payout-amount">
                <span aria-hidden="true">Rp</span>
                <input
                  id="merchant-payout-amount"
                  type="number"
                  min={0}
                  step={10000}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button type="button" onClick={() => setAmount(balance.available)}>
                  Semua
                </button>
              </div>
              {tooMuch ? (
                <p className="merchant-payout-warning" role="status">
                  Nominal melebihi saldo tersedia ({moneyPlain(balance.available)}).
                </p>
              ) : (
                <p className="merchant-card-sub">
                  Fee payout {moneyPlain(PAYOUT_FEE_IDR)} per transfer dikenakan saat pencairan
                  berhasil. Penanggungnya belum final untuk merchant, jadi belum dipotong dari saldo.
                </p>
              )}
            </section>

            <button
              type="button"
              className="btn btn-primary merchant-wallet-manage"
              disabled={!canSubmit}
              onClick={submit}
            >
              Tarik {moneyPlain(amount || 0)}
            </button>
          </>
        )}

        <Link className="merchant-back-link" to="/wallet">
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          Kembali ke saldo
        </Link>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
