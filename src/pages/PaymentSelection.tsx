// PRD: tanpa payment gateway. Hanya COD dan transfer manual ke rekening toko.
import { CheckCircle2 } from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { PAYMENT_METHODS, mockMerchant } from '../data/merchant'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { setPayment } from '../store/slices/cartSlice'

function CodIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}

function TransferIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V10l7-5 7 5v11" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )
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
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
                        {m.id === 'cod' ? <CodIcon /> : <TransferIcon />}
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
      <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
