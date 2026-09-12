import { ChevronLeft } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { billingSchema, type BillingFormData } from '../lib/schemas'

export default function AddCardAddress() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BillingFormData>({ resolver: zodResolver(billingSchema) })
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
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
              <h1 className="profile-flow-title">
                Add New Card
              </h1>
            </header>
            <main className="wallet-main add-card-main">
              <div className="card-preview card-preview-orange">
                <div className="card-preview-balance">
                  Rp3.242.230
                </div>
                <div className="card-preview-logo">
                  VISA
                </div>
              </div>
              <form className="wallet-form" id="billingForm" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group-profile">
                  <label className="form-label-profile">
                    Street Address
                  </label>
                  <input className={`form-input-profile${errors.street ? " error" : ""}`} placeholder="Enter street address" required type="text"  {...register("street")} />
                      {errors.street ? (<span className="error-message">{errors.street.message}</span>) : null}
                </div>
                <div className="form-group-profile">
                  <label className="form-label-profile">
                    City
                  </label>
                  <input className={`form-input-profile${errors.city ? " error" : ""}`} placeholder="Enter city" required type="text"  {...register("city")} />
                      {errors.city ? (<span className="error-message">{errors.city.message}</span>) : null}
                </div>
                <div className="form-row-2">
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      State
                    </label>
                    <input className={`form-input-profile${errors.state ? " error" : ""}`} placeholder="State" required type="text"  {...register("state")} />
                      {errors.state ? (<span className="error-message">{errors.state.message}</span>) : null}
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Zip Code
                    </label>
                    <input className={`form-input-profile${errors.zip ? " error" : ""}`} placeholder="Zip" required type="text"  {...register("zip")} />
                      {errors.zip ? (<span className="error-message">{errors.zip.message}</span>) : null}
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
    </>
  )
}
