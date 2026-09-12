// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function OrderArrived() {
  const navigate = useNavigate()
  useEffect(() => {
    document.body.className = "order-arrived-page"
    return () => {
      document.body.className = ''
    }
  }, [])

  return (
    <>
    <div className="app-shell">
      <main>
        <div className="order-arrived-screen">
          <header className="order-arrived-header">
            <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </header>
          <div className="order-arrived-content">
            <div className="order-arrived-icon-wrapper">
              <div className="order-arrived-confetti">
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-x" />
                <span className="confetti-x" />
                <span className="confetti-x" />
                <span className="confetti-x" />
              </div>
              <div className="order-arrived-icon-circle">
                <svg width={60} height={60} viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h1 className="order-arrived-title">
              Your order has arrived!
            </h1>
            <p className="order-arrived-message">
              Enjoy your food! We hope you have a great meal. Thank you for choosing Sa7tein.
            </p>
            <Link className="order-arrived-rate-btn" to="/rating-driver">
              Rate your driver
            </Link>
          </div>
          <div className="home-indicator " />
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
