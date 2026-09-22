import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { money } from '../data/currency'
import { PAYOUT_PRESETS_IDR, payoutStatusLabel } from '../data/wallet'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { requestPayout } from '../store/slices/walletSlice'

/**
 * Tarik saldo (M3, flow F6). Fee penarikan belum final (OQ-22), jadi layar ini
 * tidak memotong apa pun dan hanya menandai tempatnya — bukan angka karangan.
 * Nominal ditahan begitu permintaan dibuat.
 */
export default function WalletPayout() {
  const dispatch = useAppDispatch()
  const balance = useAppSelector((s) => s.wallet.balance)
  const history = useAppSelector((s) => s.wallet.payoutHistory)

  const [amount, setAmount] = useState<number>(PAYOUT_PRESETS_IDR[0])

  const tooMuch = amount > balance.available
  const canSubmit = amount > 0 && !tooMuch

  const submit = () => {
    if (tooMuch) {
      toast.error('Nominal melebihi saldo tersedia')
      return
    }
    dispatch(requestPayout({ amount }))
    toast.success('Penarikan diminta — menunggu diproses')
  }

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="wallet-page">
            <div className="wallet-flow">
              <header className="profile-flow-header ">
                <Link className="back-btn-profile" aria-label="Go back" to="/wallet">
                  <ChevronLeft size={24} strokeWidth={1.75} />
                </Link>
                <h1 className="profile-flow-title">Tarik Saldo</h1>
              </header>
              <main className="wallet-main">
                <section className="wallet-balance-card" aria-label="Saldo tersedia">
                  <span className="wallet-balance-label">Saldo tersedia</span>
                  <span className="wallet-balance-value">{money(balance.available)}</span>
                  <ExchangeRateNote />
                </section>

                <section className="wallet-form" aria-label="Nominal penarikan">
                  <h2 className="wallet-form-title">Nominal</h2>
                  <div className="wallet-presets" role="radiogroup" aria-label="Pilih nominal">
                    {PAYOUT_PRESETS_IDR.map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={amount === value}
                        className={`wallet-preset${amount === value ? ' wallet-preset--active' : ''}`}
                        onClick={() => setAmount(value)}
                      >
                        {money(value)}
                      </button>
                    ))}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={amount === balance.available}
                      className={`wallet-preset${amount === balance.available ? ' wallet-preset--active' : ''}`}
                      onClick={() => setAmount(balance.available)}
                    >
                      Semua saldo
                    </button>
                  </div>
                  <p className="wallet-form-note">
                    Fee penarikan belum final (OQ-22) — belum ada potongan yang ditampilkan.
                  </p>
                  {tooMuch ? (
                    <p className="wallet-warning" role="status">
                      Nominal melebihi saldo tersedia ({money(balance.available)}).
                    </p>
                  ) : null}
                </section>

                <button
                  type="button"
                  className="btn-profile-primary"
                  disabled={!canSubmit}
                  onClick={submit}
                >
                  Tarik · {money(amount)}
                </button>

                <section className="wallet-form" aria-label="Riwayat penarikan">
                  <h2 className="wallet-form-title">Riwayat Penarikan</h2>
                  {history.length === 0 ? (
                    <p className="wallet-form-note">Belum ada penarikan.</p>
                  ) : (
                    history.map((p) => (
                      <div key={p.id} className="wallet-history-row">
                        <div className="wallet-item-left">
                          <span className="wallet-item-title">{money(p.amount)}</span>
                          <span className="wallet-item-sub">
                            {new Date(p.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className={`wallet-status wallet-status--${p.status}`}>
                          {payoutStatusLabel(p.status)}
                        </span>
                      </div>
                    ))
                  )}
                </section>
              </main>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
