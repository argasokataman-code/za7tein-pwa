// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

export default function AddressSelection() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="address-selection-screen">
          <header className="address-selection-header">
            <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="address-selection-title">
              Address
            </h1>
          </header>
          <div className="address-selection-content">
            <div className="address-list" role="radiogroup" aria-label="Select delivery address">
              <div className="address-item selected" role="radio" aria-checked="true" tabIndex={0}>
                <div className="address-icon-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house">
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </div>
                <div className="address-info">
                  <h3 className="address-name">
                    Home
                  </h3>
                  <p className="address-text">
                    4517 Washington Ave. Manchester, Kentucky 394
                  </p>
                </div>
                <div className="address-actions">
                  <button type="button" className="address-delete-btn" aria-label="Delete Home">
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 lucide-trash-2">
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                  <div className="address-radio-dot">
                    <div className="radio-outer radio-outer--active">
                      <div className="radio-inner" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="address-item" role="radio" aria-checked="false" tabIndex={0}>
                <div className="address-icon-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase">
                    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    <rect width={20} height={14} x="2" y="6" rx="2" />
                  </svg>
                </div>
                <div className="address-info">
                  <h3 className="address-name">
                    My Office
                  </h3>
                  <p className="address-text">
                    4517 Washington Ave. Manchester, Kentucky 394
                  </p>
                </div>
                <div className="address-actions">
                  <button type="button" className="address-delete-btn" aria-label="Delete My Office">
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 lucide-trash-2">
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                  <div className="address-radio-dot">
                    <div className="radio-outer" />
                  </div>
                </div>
              </div>
              <div className="address-item" role="radio" aria-checked="false" tabIndex={0}>
                <div className="address-icon-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building2 lucide-building-2">
                    <path d="M10 12h4" />
                    <path d="M10 8h4" />
                    <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
                    <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
                    <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                  </svg>
                </div>
                <div className="address-info">
                  <h3 className="address-name">
                    My Apartment
                  </h3>
                  <p className="address-text">
                    4517 Washington Ave. Manchester, Kentucky 394
                  </p>
                </div>
                <div className="address-actions">
                  <button type="button" className="address-delete-btn" aria-label="Delete My Apartment">
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 lucide-trash-2">
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                  <div className="address-radio-dot">
                    <div className="radio-outer" />
                  </div>
                </div>
              </div>
            </div>
            <button type="button" className="add-address-btn" aria-label="Add new address">
              <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>
                Add New Address
              </span>
            </button>
          </div>
          <div className="address-selection-footer">
            <button type="button" className="proceed-btn" aria-label="Continue with selected address">
              Continue
            </button>
          </div>
          <div className="home-indicator" />
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
