// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useState } from 'react'
import { Link } from 'react-router-dom'

const faq = [
  {
    question: 'What types of payments are accepted?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard), Apple Pay, Google Pay, and PayPal.',
  },
  {
    question: 'How long does it take for a payment to process?',
    answer:
      'Card payments are usually processed within seconds. Your bank may take 1–3 business days to reflect the charge.',
  },
  {
    question: 'How do I add or remove a card?',
    answer:
      'Go to Profile → Payment Account → Your Card. Tap "Add New Card" to add, or use the manage option to remove a card.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState(-1)
  const [query, setQuery] = useState('')

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
                <input
                  className="help-search-input"
                  placeholder="Search here..."
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
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
                {faq
                  .filter((item) =>
                    `${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((item, i) => (
                    <div key={item.question} className={`faq-item${open === i ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="faq-question"
                        aria-expanded={open === i}
                        onClick={() => setOpen(open === i ? -1 : i)}
                      >
                        {item.question}
                      </button>
                      <div className="faq-answer">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  ))}
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
