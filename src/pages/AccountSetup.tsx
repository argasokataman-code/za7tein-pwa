// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'

import { useNavigate } from 'react-router-dom'

export default function AccountSetup() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <div style={{ minHeight: "100dvh", background: "rgb(0, 0, 0)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 32px", textAlign: "center", fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ marginBottom: "24px" }}>
          <svg width={72} height={72} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
            <path d="M12 7l.01 5M12 16h.01" stroke="#FD6931" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: "clamp(22px, 5vw, 30px)", fontWeight: "700", color: "rgb(255, 255, 255)", margin: "0px 0px 12px" }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: "15px", color: "rgb(105, 117, 134)", lineHeight: "1.6", maxWidth: "320px", margin: "0px 0px 8px" }}>
          An unexpected error occurred. Please try again.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "280px" }}>
          <button type="button" onClick={() => navigate('/home')} style={{ height: "56px", background: "rgb(253, 105, 49)", color: "rgb(255, 255, 255)", borderWidth: "medium", borderStyle: "none", borderColor: "currentcolor", borderImage: "none", borderRadius: "9999px", fontWeight: "600", fontSize: "16px", cursor: "pointer", fontFamily: "inherit" }}>
            Try Again
          </button>
          <Link to="/home" style={{ height: "56px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.06)", color: "rgb(255, 255, 255)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "9999px", fontWeight: "500", fontSize: "15px", textDecoration: "none" }}>
            Go to Home
          </Link>
        </div>
      </div>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
