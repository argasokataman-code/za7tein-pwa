import { ChevronLeft, Activity, Box, Shield, ShieldCheck, Upload } from 'lucide-react'
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
                  <ChevronLeft size={24} strokeWidth={1.75} />
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
                  <section className="privacy-section s7-parallax--card">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <Box size={20} strokeWidth={1.75} />
                      </div>
                      <h2>
                        1. Information Collection
                      </h2>
                    </div>
                    <p>
                      We collect information you provide directly (name, email, phone, payment details when you add a card) and automatically (device, logs) to provide and improve our services.
                    </p>
                  </section>
                  <section className="privacy-section s7-parallax--card">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <Activity size={20} strokeWidth={1.75} />
                      </div>
                      <h2>
                        2. Information Usage
                      </h2>
                    </div>
                    <p>
                      We use your information to process orders, manage your account, send notifications, improve our app, and comply with legal obligations.
                    </p>
                  </section>
                  <section className="privacy-section s7-parallax--card">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <Upload size={20} strokeWidth={1.75} />
                      </div>
                      <h2>
                        3. Information Sharing
                      </h2>
                    </div>
                    <p>
                      We do not sell your personal information. We may share data with service providers (payment processors, delivery partners) only as necessary to operate the service.
                    </p>
                  </section>
                  <section className="privacy-section s7-parallax--card">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <Shield size={20} strokeWidth={1.75} />
                      </div>
                      <h2>
                        4. Data Security
                      </h2>
                    </div>
                    <p>
                      We use industry-standard measures to protect your data. Payment details are processed by certified payment providers and are not stored on our servers in full form.
                    </p>
                  </section>
                  <section className="privacy-section s7-parallax--card">
                    <div className="privacy-icon-title">
                      <div className="privacy-icon">
                        <ShieldCheck size={20} strokeWidth={1.75} />
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
    </>
  )
}
