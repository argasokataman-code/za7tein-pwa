// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

export default function Reviews() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="reviews-screen">
          <div className="reviews-header">
            <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="reviews-page-title">
              Reviews
            </h1>
            <div className="header-spacer" />
          </div>
          <div className="reviews-content">
            <div className="overall-rating-section">
              <div className="rating-display">
                <div className="average-rating">
                  4.9
                </div>
                <div className="stars-display">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                  </svg>
                </div>
                <div className="reviews-count">
                  Based on 120 review
                </div>
              </div>
              <div className="rating-distribution">
                <div className="distribution-row">
                  <span className="star-label">
                    5
                  </span>
                  <div className="distribution-bar">
                    <div className="distribution-fill" style={{ width: "75%" }} />
                  </div>
                </div>
                <div className="distribution-row">
                  <span className="star-label">
                    4
                  </span>
                  <div className="distribution-bar">
                    <div className="distribution-fill" style={{ width: "15%" }} />
                  </div>
                </div>
                <div className="distribution-row">
                  <span className="star-label">
                    3
                  </span>
                  <div className="distribution-bar">
                    <div className="distribution-fill" style={{ width: "5%" }} />
                  </div>
                </div>
                <div className="distribution-row">
                  <span className="star-label">
                    2
                  </span>
                  <div className="distribution-bar">
                    <div className="distribution-fill" style={{ width: "3%" }} />
                  </div>
                </div>
                <div className="distribution-row">
                  <span className="star-label">
                    1
                  </span>
                  <div className="distribution-bar">
                    <div className="distribution-fill" style={{ width: "2%" }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="reviews-list-header">
              <h2 className="reviews-list-title">
                Reviews (120)
              </h2>
            </div>
            <div className="reviews-list-container">
              <div className="review-card">
                <img alt="Dianne Russell" width={48} height={48} className="reviewer-avatar" src="/assets/img/reviewer/user1.png" style={{ color: "transparent" }} />
                <div className="review-content">
                  <div className="reviewer-info">
                    <span className="reviewer-name">
                      Dianne Russell
                    </span>
                    <div className="review-rating">
                      <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                      </svg>
                      <span className="rating-value">
                        4.5
                      </span>
                    </div>
                  </div>
                  <p className="review-text">
                    Amazing! The burger was juicier and tastier than I expected. Perfectly grilled with fresh toppings. Highly recommend!
                  </p>
                </div>
              </div>
              <div className="review-card">
                <img alt="Cody Fisher" width={48} height={48} className="reviewer-avatar" src="/assets/img/reviewer/user2.png" style={{ color: "transparent" }} />
                <div className="review-content">
                  <div className="reviewer-info">
                    <span className="reviewer-name">
                      Cody Fisher
                    </span>
                    <div className="review-rating">
                      <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                      </svg>
                      <span className="rating-value">
                        4.4
                      </span>
                    </div>
                  </div>
                  <p className="review-text">
                    The burger was cooked to perfection. Loved the special sauce!
                  </p>
                </div>
              </div>
              <div className="review-card">
                <img alt="Jacob Jones" width={48} height={48} className="reviewer-avatar" src="/assets/img/reviewer/user3.png" style={{ color: "transparent" }} />
                <div className="review-content">
                  <div className="reviewer-info">
                    <span className="reviewer-name">
                      Jacob Jones
                    </span>
                    <div className="review-rating">
                      <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                      </svg>
                      <span className="rating-value">
                        4.8
                      </span>
                    </div>
                  </div>
                  <p className="review-text">
                    Even better than the pictures. The patty was flavorful and fresh.
                  </p>
                </div>
              </div>
              <div className="review-card">
                <img alt="Esther Howard" width={48} height={48} className="reviewer-avatar" src="/assets/img/reviewer/user4.png" style={{ color: "transparent" }} />
                <div className="review-content">
                  <div className="reviewer-info">
                    <span className="reviewer-name">
                      Esther Howard
                    </span>
                    <div className="review-rating">
                      <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                      </svg>
                      <span className="rating-value">
                        4.4
                      </span>
                    </div>
                  </div>
                  <p className="review-text">
                    Delicious and perfectly sized. Great textures and flavors.
                  </p>
                </div>
              </div>
              <div className="review-card">
                <img alt="Sarah Wilson" width={48} height={48} className="reviewer-avatar" src="/assets/img/reviewer/user5.png" style={{ color: "transparent" }} />
                <div className="review-content">
                  <div className="reviewer-info">
                    <span className="reviewer-name">
                      Sarah Wilson
                    </span>
                    <div className="review-rating">
                      <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                      </svg>
                      <span className="rating-value">
                        5
                      </span>
                    </div>
                  </div>
                  <p className="review-text">
                    Absolutely fantastic! Best burger I've had in a long time.
                  </p>
                </div>
              </div>
              <div className="review-card">
                <img alt="Michael Brown" width={48} height={48} className="reviewer-avatar" src="/assets/img/reviewer/user6.png" style={{ color: "transparent" }} />
                <div className="review-content">
                  <div className="reviewer-info">
                    <span className="reviewer-name">
                      Michael Brown
                    </span>
                    <div className="review-rating">
                      <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                      </svg>
                      <span className="rating-value">
                        4.7
                      </span>
                    </div>
                  </div>
                  <p className="review-text">
                    Great food and fast delivery! Really enjoyed it.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="home-indicator" />
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
