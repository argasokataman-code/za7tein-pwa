// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

export default function PinSuccess() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow success-screen">
            <div className="success-icon-wrap">
              <div className="success-icon-circle">
                <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
            <h1 className="success-title">
              PIN Successfully Added!
            </h1>
            <p className="success-text">
              This ensures more secure transactions and prevents unauthorized access.
            </p>
            <Link className="btn-profile-primary" to="/security">
              Done
            </Link>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
