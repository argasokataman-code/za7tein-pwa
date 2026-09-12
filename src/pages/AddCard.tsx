// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cardSchema, type CardFormData } from '../lib/schemas'

import toast from 'react-hot-toast'

export default function AddCard() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CardFormData>({ resolver: zodResolver(cardSchema) })
  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500))
    toast.success("Card details saved!"); navigate('/payment-account')
  }
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="add-card-screen">
          <header className="add-card-header">
            <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="add-card-title">
              Add Card
            </h1>
          </header>
          <div className="add-card-content">
            <div className="card-display-widget" aria-label="Card preview">
              <div className="card-pattern" />
              <div className="card-content">
                <div className="card-top">
                  <div className="card-balance">
                    <span className="balance-label">
                      Current Balance
                    </span>
                    <span className="balance-amount">
                      Rp4.570.800
                    </span>
                  </div>
                  <div className="card-brand-logo">
                    <div className="mastercard-logo" aria-label="Mastercard">
                      <div className="mc-circle mc-red" />
                      <div className="mc-circle mc-orange" />
                    </div>
                  </div>
                </div>
                <div className="card-number-display" aria-label="Card number: 5294 2436 4780 9568" aria-live="polite">
                  5294 2436 4780 9568
                </div>
                <div className="card-bottom">
                  <div className="card-holder-display">
                    CARD HOLDER
                  </div>
                  <div className="card-expiry" aria-label="Expiry: 12/24" aria-live="polite">
                    12/24
                  </div>
                </div>
              </div>
            </div>
            <form id="add-card-form" className="add-card-form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="card-holder-name" className="form-label">
                  Card Holder Name
                </label>
                <input id="card-holder-name" className={`form-control${errors.cardHolder ? " error" : ""}`} placeholder="Enter name" autoComplete="cc-name" type="text"  {...register("cardHolder")} />
                      {errors.cardHolder ? (<span className="error-message">{errors.cardHolder.message}</span>) : null}
              </div>
              <div className="form-group">
                <label htmlFor="card-number" className="form-label">
                  Card Number
                </label>
                <input id="card-number" className={`form-control${errors.cardNumber ? " error" : ""}`} placeholder="Enter card number" inputMode="numeric" autoComplete="cc-number" maxLength={19} type="text" value="5294 2436 4780 9568"  {...register("cardNumber")} />
                      {errors.cardNumber ? (<span className="error-message">{errors.cardNumber.message}</span>) : null}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cvv" className="form-label">
                    CVV
                  </label>
                  <input id="cvv" className={`form-control${errors.cvv ? " error" : ""}`} placeholder="CVV" inputMode="numeric" maxLength={4} autoComplete="cc-csc" type="text"  {...register("cvv")} />
                      {errors.cvv ? (<span className="error-message">{errors.cvv.message}</span>) : null}
                </div>
                <div className="form-group">
                  <label htmlFor="expire-date" className="form-label">
                    Expire Date
                  </label>
                  <input id="expire-date" className={`form-control${errors.expiry ? " error" : ""}`} placeholder="MM/YY" inputMode="numeric" maxLength={5} autoComplete="cc-exp" type="text" value="12/24"  {...register("expiry")} />
                      {errors.expiry ? (<span className="error-message">{errors.expiry.message}</span>) : null}
                </div>
              </div>
            </form>
          </div>
          <div className="add-card-footer">
            <button type="submit" form="add-card-form" className="proceed-btn" aria-busy="false" disabled={isSubmitting}>
              Continue
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
