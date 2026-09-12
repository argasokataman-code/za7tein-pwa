import { ChevronLeft, Star } from 'lucide-react'
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
              <ChevronLeft size={24} strokeWidth={1.75} />
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
                  <Star size={24} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
                  <Star size={24} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
                  <Star size={24} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
                  <Star size={24} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
                  <Star size={24} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
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
                      <Star size={16} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
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
                      <Star size={16} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
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
                      <Star size={16} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
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
                      <Star size={16} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
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
                      <Star size={16} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
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
                      <Star size={16} strokeWidth={1.75} fill="var(--star)" color="var(--star)" />
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
    </>
  )
}
