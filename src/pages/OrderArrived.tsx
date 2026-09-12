import { ChevronLeft, Check } from 'lucide-react'
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
              <ChevronLeft size={24} strokeWidth={1.75} />
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
                <Check size={60} strokeWidth={1.75} color="var(--on-brand)" />
              </div>
            </div>
            <h1 className="order-arrived-title">
              Your order has arrived!
            </h1>
            <p className="order-arrived-message">
              Enjoy your food! We hope you have a great meal. Thank you for choosing Sa7tein.
            </p>
            <Link className="order-arrived-rate-btn" to="/rating-driver">
              Beri rating kurir
            </Link>
          </div>
          <div className="home-indicator " />
        </div>
      </main>
    </div>
    </>
  )
}
