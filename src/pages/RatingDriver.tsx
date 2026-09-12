import { ChevronLeft, Clock3, Star } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'
import { useState } from 'react'

export default function RatingDriver() {
  const [rating, setRating] = useState(4)
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="rating-driver-page">
          <div className="rating-driver-screen">
            <header className="rating-driver-header">
              <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
              <h1 className="rating-driver-title">
                Rating
              </h1>
            </header>
            <div className="rating-driver-content">
              <div className="rating-order-info">
                <h2 className="rating-order-number">
                  No. Pesanan - 012345
                </h2>
                <div className="rating-order-time">
                  <Clock3 size={16} strokeWidth={1.75} />
                  <span>
                    Hari ini, 12:28 PM
                  </span>
                </div>
              </div>
              <div className="rating-driver-card">
                <div className="rating-driver-avatar-wrap">
                  <img alt="Budi Santoso" width={100} height={100} className="rating-driver-avatar" src="/assets/img/profile.png" style={{ color: "transparent" }} />
                </div>
                <h3 className="rating-driver-name">
                  Budi Santoso
                </h3>
              </div>
              <p className="rating-prompt">
                How much rating would you like to give?
              </p>
              <div className="star-rating" role="group" aria-label="Star rating">
                <button type="button" className={`star-btn${rating >= 1 ? " active" : ""}`} aria-label="1 star" style={{ pointerEvents: "auto" }} onClick={() => setRating(1)}>
                  <Star size={40} strokeWidth={1.75} color={rating >= 1 ? 'var(--star)' : 'var(--text-secondary)'} fill={rating >= 1 ? 'var(--star)' : 'none'} />
                </button>
                <button type="button" className={`star-btn${rating >= 2 ? " active" : ""}`} aria-label="2 stars" style={{ pointerEvents: "auto" }} onClick={() => setRating(2)}>
                  <Star size={40} strokeWidth={1.75} color={rating >= 2 ? 'var(--star)' : 'var(--text-secondary)'} fill={rating >= 2 ? 'var(--star)' : 'none'} />
                </button>
                <button type="button" className={`star-btn${rating >= 3 ? " active" : ""}`} aria-label="3 stars" style={{ pointerEvents: "auto" }} onClick={() => setRating(3)}>
                  <Star size={40} strokeWidth={1.75} color={rating >= 3 ? 'var(--star)' : 'var(--text-secondary)'} fill={rating >= 3 ? 'var(--star)' : 'none'} />
                </button>
                <button type="button" className={`star-btn${rating >= 4 ? " active" : ""}`} aria-label="4 stars" style={{ pointerEvents: "auto" }} onClick={() => setRating(4)}>
                  <Star size={40} strokeWidth={1.75} color={rating >= 4 ? 'var(--star)' : 'var(--text-secondary)'} fill={rating >= 4 ? 'var(--star)' : 'none'} />
                </button>
                <button type="button" className={`star-btn${rating >= 5 ? " active" : ""}`} aria-label="5 stars" style={{ pointerEvents: "auto" }} onClick={() => setRating(5)}>
                  <Star size={40} strokeWidth={1.75} color={rating >= 5 ? 'var(--star)' : 'var(--text-secondary)'} fill={rating >= 5 ? 'var(--star)' : 'none'} />
                </button>
              </div>
            </div>
            <div className="rating-driver-footer">
              <button type="button" className="rating-submit-btn" onClick={() => { toast.success("Rating submitted! Thank you."); navigate('/home') }}>
                Submit
              </button>
            </div>
            <div className="home-indicator " />
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
