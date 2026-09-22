import { useState } from 'react'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { money } from '../data/currency'
import { MIN_TOPUP_NEW_ACCOUNT_IDR } from '../data/merchant'
import {
  TOP_UP_CHANNELS,
  TOP_UP_PRESETS_IDR,
  channelLabel,
  topUpStatusLabel,
} from '../data/wallet'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { requestTopUp, settleTopUp } from '../store/slices/walletSlice'
import type { TopUpChannel } from '../types'

/**
 * Top-up saldo (M3, flow F3). Xendit tidak nyata: request membuat baris `pending`,
 * lalu tombol "Simulasi webhook" memanggil aksi yang sama dengan
 * `top_up_completed` — saldo baru naik setelah itu, tidak saat request.
 */
export default function WalletTopUp() {
  const dispatch = useAppDispatch()
  const balance = useAppSelector((s) => s.wallet.balance)
  const history = useAppSelector((s) => s.wallet.topUpHistory)

  const [amount, setAmount] = useState<number>(TOP_UP_PRESETS_IDR[0])
  const [channel, setChannel] = useState<TopUpChannel>('xendit_va')

  const pending = history.filter((t) => t.status === 'pending')

  const submit = () => {
    dispatch(requestTopUp({ amount, channel }))
    toast.success('Top-up dibuat — menunggu pembayaran')
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
                <h1 className="profile-flow-title">Top-up Saldo</h1>
              </header>
              <main className="wallet-main">
                <section className="wallet-balance-card" aria-label="Saldo saat ini">
                  <span className="wallet-balance-label">Saldo tersedia</span>
                  <span className="wallet-balance-value">{money(balance.available)}</span>
                  <ExchangeRateNote />
                </section>

                <section className="wallet-form" aria-label="Nominal top-up">
                  <h2 className="wallet-form-title">Nominal</h2>
                  <div className="wallet-presets" role="radiogroup" aria-label="Pilih nominal">
                    {TOP_UP_PRESETS_IDR.map((value) => (
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
                  </div>
                  <p className="wallet-form-note">
                    Akun baru wajib top-up minimal {money(MIN_TOPUP_NEW_ACCOUNT_IDR)} sebelum bisa
                    order (R-TOPUP-01).
                  </p>
                </section>

                <section className="wallet-form" aria-label="Kanal pembayaran">
                  <h2 className="wallet-form-title">Kanal</h2>
                  {TOP_UP_CHANNELS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={channel === c.id}
                      className={`wallet-channel${channel === c.id ? ' wallet-channel--active' : ''}`}
                      onClick={() => setChannel(c.id)}
                    >
                      <span className="wallet-channel-name">{c.label}</span>
                      <span className="wallet-channel-note">{c.note}</span>
                    </button>
                  ))}
                </section>

                <button type="button" className="btn-profile-primary" onClick={submit}>
                  Buat Top-up · {money(amount)}
                </button>

                <section className="wallet-form" aria-label="Riwayat top-up">
                  <h2 className="wallet-form-title">Riwayat Top-up</h2>
                  {history.length === 0 ? (
                    <p className="wallet-form-note">Belum ada top-up.</p>
                  ) : (
                    history.map((t) => (
                      <div key={t.id} className="wallet-history-row">
                        <div className="wallet-item-left">
                          <span className="wallet-item-title">{money(t.amount)}</span>
                          <span className="wallet-item-sub">
                            {channelLabel(t.channel)} ·{' '}
                            {new Date(t.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className={`wallet-status wallet-status--${t.status}`}>
                          {topUpStatusLabel(t.status)}
                        </span>
                        {t.status === 'pending' ? (
                          <button
                            type="button"
                            className="wallet-badge connect"
                            onClick={() => {
                              dispatch(settleTopUp({ id: t.id }))
                              toast.success('Webhook diterima — saldo masuk', {
                                icon: <CheckCircle2 size={18} aria-hidden="true" />,
                              })
                            }}
                          >
                            Simulasi webhook
                          </button>
                        ) : null}
                      </div>
                    ))
                  )}
                  {pending.length > 0 ? (
                    <p className="wallet-form-note">
                      Mock: tidak ada Xendit sungguhan. Tombol simulasi mewakili webhook{' '}
                      <code>top_up_completed</code> yang menaikkan saldo.
                    </p>
                  ) : null}
                </section>
              </main>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
