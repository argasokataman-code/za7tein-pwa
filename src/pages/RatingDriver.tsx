import { ChevronLeft, Clock3, Star } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate, useSearchParams } from 'react-router-dom'

import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

import { money, moneyPlain } from '../data/currency'
import { mockOrder } from '../data/merchant'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { tipCourier } from '../store/slices/walletSlice'

const STARS = [1, 2, 3, 4, 5]

/**
 * Nominal tip yang ditawarkan. PRD §Tips hanya menetapkan "opsional, 100% ke
 * kurir, tanpa komisi platform" — besarannya belum diputuskan, jadi deret ini
 * state tampilan, bukan aturan bisnis yang dikunci.
 */
const TIP_PRESETS_IDR = [0, 3_000, 5_000, 10_000]

export default function RatingDriver() {
  const [rating, setRating] = useState(4)
  const [tip, setTip] = useState(0)
  const [params] = useSearchParams()
  const orderCode = params.get('order') ?? mockOrder.code
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const available = useAppSelector((state) => state.wallet.balance.available)

  useEffect(() => {
    document.body.className = 'rating-driver-page'
    return () => {
      document.body.className = ''
    }
  }, [])

  const submit = () => {
    // R-WALLET-01: tip dipotong dari wallet customer. Kredit ke wallet kurir
    // tidak punya model di repo ini, jadi tidak dikarang.
    if (tip > 0) dispatch(tipCourier({ amount: tip }))
    toast.success(
      tip > 0
        ? `Rating terkirim. Tip ${moneyPlain(tip)} untuk kurir.`
        : 'Rating terkirim. Terima kasih.',
    )
    navigate('/home')
  }

  return (
    <>
    <div className="app-shell">
      <main>
        <div className="rating-driver-page">
          <div className="rating-driver-screen">
            <header className="rating-driver-header">
              <button type="button" className="btn-back" aria-label="Kembali" onClick={() => navigate(-1)}>
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
              <h1 className="rating-driver-title">
                Rating
              </h1>
            </header>
            <div className="rating-driver-content">
              <div className="rating-order-info">
                <h2 className="rating-order-number">
                  Order {orderCode}
                </h2>
                <div className="rating-order-time">
                  <Clock3 size={16} strokeWidth={1.75} />
                  <span>
                    Hari ini, 12:28 PM
                  </span>
                </div>
              </div>
              <div className="rating-driver-card">
                <div className="rating-driver-avatar-wrap">
                  <img alt="Budi Santoso" width={100} height={100} className="rating-driver-avatar" src="/assets/img/profile.png" style={{ color: "transparent" }} />
                </div>
                <h3 className="rating-driver-name">
                  Budi Santoso
                </h3>
              </div>
              <p className="rating-prompt">
                Seberapa puas kamu dengan pengantaran kurir?
              </p>
              <div className="star-rating" role="radiogroup" aria-label="Beri bintang untuk kurir">
                {STARS.map((value) => {
                  const active = rating >= value
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={rating === value}
                      className={active ? "star-btn active" : "star-btn"}
                      aria-label={`${value} bintang`}
                      onClick={() => setRating(value)}
                    >
                      <Star size={40} strokeWidth={1.75} color={active ? 'var(--star)' : 'var(--text-secondary)'} fill={active ? 'var(--star)' : 'none'} />
                    </button>
                  )
                })}
              </div>

              <section className="rating-tip" aria-labelledby="rating-tip-title">
                <h2 className="rating-tip-title" id="rating-tip-title">Tip untuk kurir</h2>
                <div className="wallet-presets" role="radiogroup" aria-label="Pilih nominal tip">
                  {TIP_PRESETS_IDR.map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={tip === value}
                      disabled={value > available}
                      className={`wallet-preset${tip === value ? ' wallet-preset--active' : ''}`}
                      onClick={() => setTip(value)}
                    >
                      {value === 0 ? 'Tanpa tip' : moneyPlain(value)}
                    </button>
                  ))}
                </div>
                <p className="rating-tip-note">
                  {tip > 0
                    ? `${moneyPlain(tip)} dipotong dari saldo wallet kamu, 100% ke kurir tanpa potongan platform. Sisa ${money(available - tip)}.`
                    : 'Opsional. 100% ke kurir, tanpa potongan platform.'}
                </p>
              </section>
            </div>
            <div className="rating-driver-footer">
              <button type="button" className="rating-submit-btn" onClick={submit}>
                {tip > 0 ? `Kirim · tip ${moneyPlain(tip)}` : 'Kirim rating'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
