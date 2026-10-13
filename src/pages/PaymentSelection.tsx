// Metode bayar (keputusan PO 2026-10-13): saldo Sa7tein, COD, VA & QRIS lewat DANA.
import { useRef, useState, type KeyboardEvent } from 'react'
import { CheckCircle2, Banknote, Landmark, QrCode, Wallet } from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { switchBlockCopy, switchIsDown } from '../data/superadmin'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { useApiPaymentMethods } from '../hooks/useApiPaymentMethods'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { setPayment } from '../store/slices/cartSlice'
import { BackButton } from '../components/ui/BackButton'

const METHOD_ICONS: Record<string, typeof Wallet> = {
  wallet: Wallet,
  cod: Banknote,
  dana_va: Landmark,
  dana_qris: QrCode,
}

export default function PaymentSelection() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const selected = useAppSelector((s) => s.cart.selectedPaymentId)
  const switches = useAppSelector((s) => s.superAdmin.switches)
  const listRef = useRef<HTMLDivElement>(null)
  // Daftar + urutan metode datang dari BE (mock dulu, API menimpa).
  const methods = useApiPaymentMethods()
  // Kill switch platform: SA bisa menutup COD saja, atau seluruh order baru
  // (maintenance). Layar ini yang menegakkannya, bukan konsol SA.
  const maintenanceCopy = switchBlockCopy('maintenance', switches)
  const codCopy = switchBlockCopy('cod', switches)
  const isBlocked = (id: string) => Boolean(maintenanceCopy ?? (id === 'cod' ? codCopy : null))
  // Radiogroup asli: satu item bisa di-Tab, panah berpindah pilihan. Tanpa ini
  // `role="radio"` menjanjikan perilaku papan ketik yang tidak ada.
  const [focusIndex, setFocusIndex] = useState(() => {
    const i = methods.findIndex((m) => m.id === selected)
    return i >= 0 ? i : Math.max(0, methods.findIndex((m) => !isBlocked(m.id)))
  })

  const choose = (id: string, label: string) => {
    if (switchIsDown('maintenance', switches)) return
    if (id === 'cod' && switchIsDown('cod', switches)) return
    dispatch(setPayment(id))
    toast.success(label, { icon: <CheckCircle2 size={18} aria-hidden="true" /> })
    navigate('/payment-amount')
  }

  const moveFocus = (dir: number) => {
    const enabled = methods.map((_, i) => i).filter((i) => !isBlocked(methods[i].id))
    if (enabled.length === 0) return
    const at = enabled.indexOf(focusIndex)
    const next = enabled[(at + dir + enabled.length) % enabled.length]
    setFocusIndex(next)
    listRef.current?.querySelectorAll<HTMLButtonElement>('.payment-item')[next]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      moveFocus(1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      moveFocus(-1)
    }
  }

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="payment-selection-screen">
            <header className="payment-selection-header">
              <BackButton className="btn-back" />
              <h1 className="payment-selection-title">
                Metode Pembayaran
              </h1>
            </header>
            <div className="payment-selection-content">
              {maintenanceCopy ? <PlatformNotice message={maintenanceCopy} /> : null}
              <div
                className="payment-list"
                role="radiogroup"
                aria-label="Pilih metode pembayaran"
                ref={listRef}
                onKeyDown={onKeyDown}
              >
                {methods.map((m, index) => {
                  const isSelected = selected === m.id
                  const blocked = isBlocked(m.id)
                  const reason = m.id === 'cod' ? codCopy : null
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-disabled={blocked}
                      disabled={blocked}
                      tabIndex={!blocked && index === focusIndex ? 0 : -1}
                      onFocus={() => setFocusIndex(index)}
                      className={`payment-item${isSelected ? ' selected' : ''}${blocked ? ' is-blocked' : ''}`}
                      onClick={() => choose(m.id, m.label)}
                    >
                      <div className="payment-icon">
                        {(() => {
                          const Icon = METHOD_ICONS[m.id] ?? Wallet
                          return <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                        })()}
                      </div>
                      <div className="payment-info">
                        <h3 className="payment-name">
                          {m.label}
                        </h3>
                        <p className="payment-number">
                          {blocked && reason ? reason : m.description}
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
                disabled={Boolean(maintenanceCopy)}
                onClick={() => navigate('/payment-amount')}
              >
                {maintenanceCopy ? 'Platform maintenance' : 'Lanjut'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
