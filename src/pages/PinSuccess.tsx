import { Check } from 'lucide-react'
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
                <Check size={64} strokeWidth={1.75} color="var(--on-brand)" />
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
    </>
  )
}
