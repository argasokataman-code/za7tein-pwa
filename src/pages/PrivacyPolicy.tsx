// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow-page-scroll">
            <div className="profile-flow">
              <header className="profile-flow-header">
                <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <h1 className="profile-flow-title">
                  Privacy &amp; Policy
                </h1>
              </header>
              <main className="profile-flow-main privacy-main">
                <div className="privacy-header-content">
                  <p className="privacy-effective">
                    Effective Date: December 25, 2024
                  </p>
                </div>
                <div className="privacy-content">
                  <section className="privacy-section">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                      </div>
                      <h2>
                        1. Information Collection
                      </h2>
                    </div>
                    <p>
                      We collect information you provide directly (name, email, phone, payment details when you add a card) and automatically (device, logs) to provide and improve our services.
                    </p>
                  </section>
                  <section className="privacy-section">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      </div>
                      <h2>
                        2. Information Usage
                      </h2>
                    </div>
                    <p>
                      We use your information to process orders, manage your account, send notifications, improve our app, and comply with legal obligations.
                    </p>
                  </section>
                  <section className="privacy-section">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      </div>
                      <h2>
                        3. Information Sharing
                      </h2>
                    </div>
                    <p>
                      We do not sell your personal information. We may share data with service providers (payment processors, delivery partners) only as necessary to operate the service.
                    </p>
                  </section>
                  <section className="privacy-section">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <h2>
                        4. Data Security
                      </h2>
                    </div>
                    <p>
                      We use industry-standard measures to protect your data. Payment details are processed by certified payment providers and are not stored on our servers in full form.
                    </p>
                  </section>
                  <section className="privacy-section">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 1a21 21 0 0 0-9 4.8V11c0 5.8 3.8 11 9 12.2 5.2-1.2 9-6.4 9-12.2V5.8A21 21 0 0 0 12 1z" />
                          <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                          <path d="M12 15c-3.3 0-6 1.3-6 3v1h12v-1c0-1.7-2.7-3-6-3z" />
                        </svg>
                      </div>
                      <h2>
                        5. Your Rights
                      </h2>
                    </div>
                    <p>
                      You may access, correct, or delete your personal information through the app settings or by contacting support. You may also opt out of marketing communications.
                    </p>
                  </section>
                </div>
              </main>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
