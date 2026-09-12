// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
export default function AddCard() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="add-card-screen">
          <header className="add-card-header">
            <button type="button" className="btn-back" aria-label="Go back">
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
                      $4,570.80
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
            <form id="add-card-form" className="add-card-form" noValidate>
              <div className="form-group">
                <label htmlFor="card-holder-name" className="form-label">
                  Card Holder Name
                </label>
                <input id="card-holder-name" className="form-control" placeholder="Enter name" autoComplete="cc-name" aria-required="true" type="text" value="" />
              </div>
              <div className="form-group">
                <label htmlFor="card-number" className="form-label">
                  Card Number
                </label>
                <input id="card-number" className="form-control" placeholder="Enter card number" inputMode="numeric" autoComplete="cc-number" maxLength={19} aria-required="true" type="text" value="5294 2436 4780 9568" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cvv" className="form-label">
                    CVV
                  </label>
                  <input id="cvv" className="form-control" placeholder="CVV" inputMode="numeric" maxLength={4} autoComplete="cc-csc" aria-required="true" type="text" value="" />
                </div>
                <div className="form-group">
                  <label htmlFor="expire-date" className="form-label">
                    Expire Date
                  </label>
                  <input id="expire-date" className="form-control" placeholder="MM/YY" inputMode="numeric" maxLength={5} autoComplete="cc-exp" aria-required="true" type="text" value="12/24" />
                </div>
              </div>
            </form>
          </div>
          <div className="add-card-footer">
            <button type="submit" form="add-card-form" className="proceed-btn" aria-busy="false">
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
