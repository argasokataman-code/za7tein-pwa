// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

export default function RatingDriver() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="rating-driver-page">
          <div className="rating-driver-screen">
            <header className="rating-driver-header">
              <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="rating-driver-title">
                Rating
              </h1>
            </header>
            <div className="rating-driver-content">
              <div className="rating-order-info">
                <h2 className="rating-order-number">
                  Order Number - 012345
                </h2>
                <div className="rating-order-time">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>
                    Today, 12:28 PM
                  </span>
                </div>
              </div>
              <div className="rating-driver-card">
                <div className="rating-driver-avatar-wrap">
                  <img alt="Lucas Nathan" width={100} height={100} className="rating-driver-avatar" src="/assets/img/profile.png" style={{ color: "transparent" }} />
                </div>
                <h3 className="rating-driver-name">
                  Lucas Nathan
                </h3>
              </div>
              <p className="rating-prompt">
                How much rating would you like to give?
              </p>
              <div className="star-rating" role="group" aria-label="Star rating">
                <button type="button" className="star-btn active" aria-label="1 star" style={{ pointerEvents: "auto" }}>
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </button>
                <button type="button" className="star-btn active" aria-label="2 stars" style={{ pointerEvents: "auto" }}>
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </button>
                <button type="button" className="star-btn active" aria-label="3 stars" style={{ pointerEvents: "auto" }}>
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </button>
                <button type="button" className="star-btn active" aria-label="4 stars" style={{ pointerEvents: "auto" }}>
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </button>
                <button type="button" className="star-btn" aria-label="5 stars" style={{ pointerEvents: "auto" }}>
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="rating-driver-footer">
              <button type="button" className="rating-submit-btn">
                Submit
              </button>
            </div>
            <div className="home-indicator " />
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
