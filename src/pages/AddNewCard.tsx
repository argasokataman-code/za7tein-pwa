// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cardSchema, type CardFormData } from '../lib/schemas'

export default function AddNewCard() {
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
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header">
              <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="profile-flow-title">
                Add New Card
              </h1>
            </header>
            <main className="wallet-main add-card-main">
              <div className="add-card-preview">
                <div className="add-card-preview-top">
                  <div className="add-card-balance-info">
                    <span className="add-card-label">
                      Current Balance
                    </span>
                    <div className="add-card-amount">
                      Rp3.242.230
                    </div>
                  </div>
                  <div className="add-card-logo-container">
                    <img alt="Visa Debit" width={50} height={16} className="add-card-logo" src="/_next/static/media/visa.4c91c8bb.png" style={{ color: "transparent" }} />
                    <span className="add-card-debit">
                      Debit
                    </span>
                  </div>
                </div>
                <div className="add-card-preview-bottom">
                  <span className="add-card-number">
                    9865 3567 4563 4235
                  </span>
                  <span className="add-card-expiry">
                    12/24
                  </span>
                </div>
              </div>
              <form className="wallet-form add-card-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group-profile">
                  <label className="form-label-profile">
                    Card Number
                  </label>
                  <input inputMode="numeric" className={`form-input-profile${errors.cardNumber ? " error" : ""}`} placeholder="0000 0000 0000 0000" maxLength={19} type="text"  {...register("cardNumber")} />
                      {errors.cardNumber ? (<span className="error-message">{errors.cardNumber.message}</span>) : null}
                </div>
                <div className="form-group-profile">
                  <label className="form-label-profile">
                    Card Holder Name
                  </label>
                  <input className={`form-input-profile${errors.cardHolder ? " error" : ""}`} placeholder="Name on card" type="text"  {...register("cardHolder")} />
                      {errors.cardHolder ? (<span className="error-message">{errors.cardHolder.message}</span>) : null}
                </div>
                <div className="form-row-2">
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Expired
                    </label>
                    <input inputMode="numeric" className={`form-input-profile${errors.expiry ? " error" : ""}`} placeholder="MM/YY" maxLength={5} type="text"  {...register("expiry")} />
                      {errors.expiry ? (<span className="error-message">{errors.expiry.message}</span>) : null}
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      CVV Code
                    </label>
                    <input inputMode="numeric" className={`form-input-profile${errors.cvv ? " error" : ""}`} placeholder="•••" maxLength={4} type="password"  {...register("cvv")} />
                      {errors.cvv ? (<span className="error-message">{errors.cvv.message}</span>) : null}
                  </div>
                </div>
                <button type="submit" className="btn-profile-primary" onClick={() => { toast.success("Card details saved!"); navigate('/payment-account') }} disabled={isSubmitting}>
                  Add Card
                </button>
              </form>
            </main>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
