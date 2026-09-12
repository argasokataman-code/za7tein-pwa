// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
export default function AddNewCard() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header">
              <button type="button" className="btn-back" aria-label="Go back">
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
                      $3,242.23
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
              <form className="wallet-form add-card-form">
                <div className="form-group-profile">
                  <label className="form-label-profile">
                    Card Number
                  </label>
                  <input inputMode="numeric" className="form-input-profile" placeholder="0000 0000 0000 0000" maxLength={19} type="text" value="" />
                </div>
                <div className="form-group-profile">
                  <label className="form-label-profile">
                    Card Holder Name
                  </label>
                  <input className="form-input-profile" placeholder="Name on card" type="text" value="" />
                </div>
                <div className="form-row-2">
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Expired
                    </label>
                    <input inputMode="numeric" className="form-input-profile" placeholder="MM/YY" maxLength={5} type="text" value="" />
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      CVV Code
                    </label>
                    <input inputMode="numeric" className="form-input-profile" placeholder="•••" maxLength={4} type="password" value="" />
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
