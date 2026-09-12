// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

export default function Faq() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header ">
              <Link className="back-btn-profile" aria-label="Go back" to="/help-center">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
              <h1 className="profile-flow-title">
                FAQ
              </h1>
            </header>
            <main className="wallet-main">
              <div className="help-search-wrap">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input className="help-search-input" placeholder="Search here..." type="search" />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: "rgb(255, 255, 255)", marginBottom: "4px" }}>
                  Introduction
                </h2>
                <p style={{ fontSize: "13px", color: "rgb(156, 163, 175)" }}>
                  Find answers to common questions about payments, cards, and account security.
                </p>
              </div>
              <div className="faq-accordion">
                <div className="faq-item">
                  <button type="button" className="faq-question" aria-expanded="false">
                    What types of payments are accepted?
                  </button>
                  <div className="faq-answer">
                    <p>
                      We accept all major credit and debit cards (Visa, Mastercard), Apple Pay, Google Pay, and PayPal.
                    </p>
                  </div>
                </div>
                <div className="faq-item">
                  <button type="button" className="faq-question" aria-expanded="false">
                    How long does it take for a payment to process?
                  </button>
                  <div className="faq-answer">
                    <p>
                      Card payments are usually processed within seconds. Your bank may take 1–3 business days to reflect the charge.
                    </p>
                  </div>
                </div>
                <div className="faq-item">
                  <button type="button" className="faq-question" aria-expanded="false">
                    How do I add or remove a card?
                  </button>
                  <div className="faq-answer">
                    <p>
                      Go to Profile → Payment Account → Your Card. Tap "Add New Card" to add, or use the manage option to remove a card.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
