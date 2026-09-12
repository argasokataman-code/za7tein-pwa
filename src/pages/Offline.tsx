// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

export default function Offline() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <div style={{ minHeight: "100dvh", background: "rgb(0, 0, 0)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 32px", textAlign: "center", fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ marginBottom: "24px" }}>
          <svg width={80} height={80} viewBox="0 0 24 24" fill="none">
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="#FD6931" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: "clamp(22px, 5vw, 30px)", fontWeight: "700", color: "rgb(255, 255, 255)", margin: "0px 0px 12px" }}>
          You're Offline
        </h1>
        <p style={{ fontSize: "15px", color: "rgb(105, 117, 134)", lineHeight: "1.6", maxWidth: "300px", margin: "0px 0px 36px" }}>
          No internet connection. Check your network and try again.
        </p>
        <button type="button" onClick={() => navigate('/home')} style={{ height: "56px", padding: "0px 32px", background: "rgb(253, 105, 49)", color: "rgb(255, 255, 255)", borderWidth: "medium", borderStyle: "none", borderColor: "currentcolor", borderImage: "none", borderRadius: "9999px", fontWeight: "600", fontSize: "16px", cursor: "pointer", fontFamily: "inherit" }}>
          Retry
        </button>
      </div>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
