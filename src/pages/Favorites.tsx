// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

export default function Favorites() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="favorites-screen">
          <header className="favorites-header">
            <button type="button" className="btn-back" aria-label="Go back">
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="favorites-title">
              Favorites
            </h1>
          </header>
          <div className="favorites-content">
            <div className="empty-state">
              <svg width={80} height={80} viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2>
                No Favorites Yet
              </h2>
              <p>
                Start adding your favourite items to see them here!
              </p>
              <Link className="btn btn-primary" to="/home">
                Browse Menu
              </Link>
            </div>
          </div>
          <div className="home-indicator " />
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
