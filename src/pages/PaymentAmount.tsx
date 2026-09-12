// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

export default function PaymentAmount() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="payment-amount-screen">
          <header className="payment-amount-header">
            <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="payment-amount-title">
              Checkout
            </h1>
          </header>
          <div className="payment-amount-content">
            <div className="order-summary-section">
              <h2 className="section-title">
                Order Summary
              </h2>
              <div className="summary-item">
                <span>
                  Order Amount
                </span>
                <span>
                  $0.00
                </span>
              </div>
              <div className="summary-item">
                <span>
                  Tax
                </span>
                <span>
                  $5.00
                </span>
              </div>
              <div className="summary-item">
                <span>
                  Discount
                </span>
                <span>
                  $0.00
                </span>
              </div>
              <div className="summary-divider" />
              <div className="summary-total">
                <span>
                  Total Payment
                </span>
                <span>
                  $5.00
                </span>
              </div>
            </div>
            <div className="payment-method-display">
              <h2 className="section-title">
                Payment Method
              </h2>
              <div className="payment-method-card" />
            </div>
          </div>
          <div className="payment-amount-footer">
            <button className="btn btn-primary pay-btn">
              Pay Now
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
