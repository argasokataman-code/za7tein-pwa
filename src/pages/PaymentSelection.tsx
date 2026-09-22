// Metode bayar (PRD v2): saldo Sa7tein, COD, dan transfer manual legacy.
import { ChevronLeft, CheckCircle2, Banknote, Landmark, Wallet } from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { PAYMENT_METHODS, mockMerchant } from '../data/merchant'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { setPayment } from '../store/slices/cartSlice'

const METHOD_ICONS: Record<string, typeof Wallet> = {
  wallet: Wallet,
  cod: Banknote,
  transfer: Landmark,
}

export default function PaymentSelection() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const selected = useAppSelector((s) => s.cart.selectedPaymentId)

  const choose = (id: string, label: string) => {
    dispatch(setPayment(id))
    toast.success(label, { icon: <CheckCircle2 size={18} aria-hidden="true" /> })
    navigate('/payment-amount')
  }

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="payment-selection-screen">
            <header className="payment-selection-header">
              <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
              <h1 className="payment-selection-title">
                Metode Pembayaran
              </h1>
            </header>
            <div className="payment-selection-content">
              <div className="payment-list" role="radiogroup" aria-label="Pilih metode pembayaran">
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = selected === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`payment-item${isSelected ? ' selected' : ''}`}
                      onClick={() => choose(m.id, m.label)}
                    >
                      <div className="payment-icon">
                        {(() => {
                          const Icon = METHOD_ICONS[m.id] ?? Wallet
                          return <Icon size={26} strokeWidth={1.75} color="var(--on-brand)" />
                        })()}
                      </div>
                      <div className="payment-info">
                        <h3 className="payment-name">
                          {m.label}
                        </h3>
                        <p className="payment-number">
                          {m.id === 'transfer'
                            ? `${mockMerchant.bank.name} ${mockMerchant.bank.account} · ${mockMerchant.bank.holder}`
                            : m.description}
                        </p>
                      </div>
                      <div className="payment-radio">
                        <div className={isSelected ? 'radio-outer radio-outer--active' : 'radio-outer'}>
                          {isSelected ? <div className="radio-inner" /> : null}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="payment-selection-footer">
              <button
                type="button"
                className="proceed-btn"
                aria-label="Lanjut dengan metode terpilih"
                onClick={() => navigate('/payment-amount')}
              >
                Lanjut
              </button>
            </div>
            <div className="home-indicator " />
          </div>
        </main>
      </div>
    </>
  )
}
