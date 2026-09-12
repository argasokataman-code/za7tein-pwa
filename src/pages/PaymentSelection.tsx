// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import { useSelection } from '../hooks/useToggleSet'

import toast from 'react-hot-toast'

export default function PaymentSelection() {
  const selection = useSelection("Master Card **** **** 1234")
  const navigate = useNavigate()
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
              Payment Methods
            </h1>
          </header>
          <div className="payment-selection-content">
            <Link className="payment-account-link" to="/user-profile/wallet">
              Payment Account
            </Link>
            <div className="payment-list" role="radiogroup" aria-label="Select a payment method">
              <button type="button" role="radio" aria-checked="false" className={`payment-item${selection.isSelected("PayPal") ? " selected" : ""}`} onClick={() => { selection.select("PayPal"); toast.success("PayPal selected", { icon: "✅" }); navigate('/payment-amount') }}>
                <div className="payment-icon">
                  <div className="paypal-logo" aria-label="PayPal">
                    <svg width={40} height={24} viewBox="0 0 40 24" fill="none">
                      <path d="M15.5 7.5H12.5L10.5 15.5H13L13.5 13H15.5L16.5 15.5H19L17 7.5H15.5Z" fill="#0070BA" />
                      <path d="M18.5 7.5H15.5L17.5 15.5H20.5L18.5 7.5Z" fill="#009CDE" />
                    </svg>
                  </div>
                </div>
                <div className="payment-info">
                  <h3 className="payment-name">
                    PayPal
                  </h3>
                </div>
                <div className="payment-radio">
                  <div className="radio-outer" />
                </div>
              </button>
              <button type="button" role="radio" aria-checked="false" className={`payment-item${selection.isSelected("Google Pay") ? " selected" : ""}`} onClick={() => { selection.select("Google Pay"); toast.success("Google Pay selected", { icon: "✅" }); navigate('/payment-amount') }}>
                <div className="payment-icon">
                  <div className="googlepay-logo" aria-label="Google Pay">
                    <svg width={32} height={32} viewBox="0 0 48 48" fill="none">
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.9 16.46 0 20.12 0 24c0 3.88.89 7.54 2.55 10.78l7.98-6.19z" />
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.22l7.98 6.19c1.9-5.69 7.21-9.91 13.47-9.91z" />
                    </svg>
                  </div>
                </div>
                <div className="payment-info">
                  <h3 className="payment-name">
                    Google Pay
                  </h3>
                </div>
                <div className="payment-radio">
                  <div className="radio-outer" />
                </div>
              </button>
              <button type="button" role="radio" aria-checked="false" className={`payment-item${selection.isSelected("Apple Pay") ? " selected" : ""}`} onClick={() => { selection.select("Apple Pay"); toast.success("Apple Pay selected", { icon: "✅" }); navigate('/payment-amount') }}>
                <div className="payment-icon">
                  <div className="applepay-logo" aria-label="Apple Pay">
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="white" />
                    </svg>
                  </div>
                </div>
                <div className="payment-info">
                  <h3 className="payment-name">
                    Apple Pay
                  </h3>
                </div>
                <div className="payment-radio">
                  <div className="radio-outer" />
                </div>
              </button>
              <button type="button" role="radio" aria-checked="true" className={`payment-item${selection.isSelected("Master Card **** **** 1234") ? " selected" : ""}`} onClick={() => { selection.select("Master Card **** **** 1234"); toast.success("Master Card **** **** 1234 selected", { icon: "✅" }); navigate('/payment-amount') }}>
                <div className="payment-icon">
                  <div className="mastercard-logo" aria-label="Mastercard">
                    <div className="mc-circle mc-red" />
                    <div className="mc-circle mc-orange" />
                  </div>
                </div>
                <div className="payment-info">
                  <h3 className="payment-name">
                    Master Card
                  </h3>
                  <p className="payment-number">
                    **** **** 1234
                  </p>
                </div>
                <div className="payment-radio">
                  <div className="radio-outer radio-outer--active">
                    <div className="radio-inner" />
                  </div>
                </div>
              </button>
            </div>
            <Link className="add-payment-btn" aria-label="Add a new card" to="/add-card">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>
                Add New Card
              </span>
            </Link>
          </div>
          <div className="payment-selection-footer">
            <button type="button" className="proceed-btn" aria-label="Confirm payment method and continue">
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
