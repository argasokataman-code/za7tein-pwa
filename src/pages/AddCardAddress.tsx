// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

export default function AddCardAddress() {
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
              <div className="card-preview card-preview-orange">
                <div className="card-preview-balance">
                  $3,242.23
                </div>
                <div className="card-preview-logo">
                  VISA
                </div>
              </div>
              <form className="wallet-form" id="billingForm">
                <div className="form-group-profile">
                  <label className="form-label-profile">
                    Street Address
                  </label>
                  <input className="form-input-profile" placeholder="Enter street address" required type="text" value="" name="street" />
                </div>
                <div className="form-group-profile">
                  <label className="form-label-profile">
                    City
                  </label>
                  <input className="form-input-profile" placeholder="Enter city" required type="text" value="" name="city" />
                </div>
                <div className="form-row-2">
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      State
                    </label>
                    <input className="form-input-profile" placeholder="State" required type="text" value="" name="state" />
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Zip Code
                    </label>
                    <input className="form-input-profile" placeholder="Zip" required type="text" value="" name="zip" />
                  </div>
                </div>
                <button type="submit" className="btn-profile-primary">
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
