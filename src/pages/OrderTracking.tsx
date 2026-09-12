// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import { useLeafletMap } from '../hooks/useLeafletMap'

export default function OrderTracking() {
  const { recenter } = useLeafletMap("tracking-map")
  const navigate = useNavigate()
  useEffect(() => {
    document.body.className = "order-tracking-page"
    return () => {
      document.body.className = ''
    }
  }, [])

  return (
    <>
    <div className="app-shell">
      <main>
        <div className="order-tracking-screen">
          <header className="order-tracking-header">
            <button className="back-btn-map" aria-label="Go back" type="button" onClick={() => navigate(-1)}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="order-tracking-title">
              Pesanan
            </h1>
          </header>
          <div id="tracking-map" className="order-map-container" />
          <button className="recenter-btn" aria-label="Recenter map" type="button" onClick={recenter}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
          </button>
          <div className="order-details-panel">
            <div className="panel-handle" />
            <div className="order-info-section">
              <h2 className="order-number">
                Order Number - 936844
              </h2>
              <div className="order-time">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>
                  Today, 12:27 PM
                </span>
              </div>
            </div>
            <div className="driver-card">
              <div className="driver-profile">
                <div className="driver-avatar">
                  <div className="driver-avatar-placeholder">
                    <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
                      <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="driver-badge">
                    <svg width={12} height={12} viewBox="0 0 22 22" fill="none">
                      <path d="M9.8999 2.2002C9.29239 2.2002 8.7999 2.69268 8.7999 3.3002C8.7999 3.90771 9.29239 4.4002 9.8999 4.4002H12.0999C12.7074 4.4002 13.1999 3.90771 13.1999 3.3002C13.1999 2.69268 12.7074 2.2002 12.0999 2.2002H9.8999Z" fill="white" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M4.3999 5.5002C4.3999 4.28517 5.38488 3.3002 6.5999 3.3002C6.5999 5.12274 8.07736 6.6002 9.8999 6.6002H12.0999C13.9224 6.6002 15.3999 5.12274 15.3999 3.3002C16.6149 3.3002 17.5999 4.28517 17.5999 5.5002V17.6002C17.5999 18.8152 16.6149 19.8002 15.3999 19.8002H6.5999C5.38488 19.8002 4.3999 18.8152 4.3999 17.6002V5.5002ZM15.0777 11.778C15.5073 11.3484 15.5073 10.652 15.0777 10.2224C14.6481 9.7928 13.9517 9.7928 13.5221 10.2224L9.8999 13.8446L8.47772 12.4224C8.04814 11.9928 7.35166 11.9928 6.92208 12.4224C6.49251 12.852 6.49251 13.5484 6.92208 13.978L9.12209 16.178C9.55166 16.6076 10.2481 16.6076 10.6777 16.178L15.0777 11.778Z" fill="white" />
                    </svg>
                  </div>
                </div>
                <div className="driver-info">
                  <h3 className="driver-name">
                    Lucas Nathan
                  </h3>
                  <div className="driver-rating">
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#F15A37" />
                    </svg>
                    <span>
                      4.7
                    </span>
                  </div>
                </div>
              </div>
              <div className="driver-actions">
                <a className="driver-action-btn call-btn" aria-label="Call driver" href="tel:+1234567890">
                  <svg width={17} height={17} viewBox="0 0 17 17" fill="none">
                    <path d="M1.636 2.455a.818.818 0 0 1 .818-.818h1.762c.4 0 .74.289.806.683l.605 3.63a.818.818 0 0 1-.322.831L4.046 7.449c.913 2.27 2.724 4.081 4.994 4.995l.633-1.267a.818.818 0 0 1 .831-.322l3.63.605a.818.818 0 0 1 .683.806v1.762a.818.818 0 0 1-.818.818H12.273C6.398 14.846 1.636 10.084 1.636 4.21V2.455Z" fill="#202020" />
                  </svg>
                </a>
                <button className="driver-action-btn chat-btn" aria-label="Chat with driver" type="button" onClick={() => { toast.success("Chat with driver") }}>
                  <svg width={17} height={17} viewBox="0 0 17 17" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.727 4.09v6.546c0 .904-.732 1.636-1.636 1.636H9L4.91 15.545v-3.273H3.273A1.636 1.636 0 0 1 1.636 10.636V4.09c0-.904.732-1.636 1.636-1.636h10.82c.903 0 1.636.732 1.636 1.636ZM5.727 7.363a.818.818 0 1 1-1.636 0 .818.818 0 0 1 1.636 0Zm1.636 0a.818.818 0 1 0 1.637 0 .818.818 0 0 0-1.637 0Zm3.273 0a.818.818 0 1 0 1.637 0 .818.818 0 0 0-1.637 0Z" fill="#202020" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="progress-tracker">
              <div style={{ display: "contents" }}>
                <div className="progress-step completed">
                  <div className="step-icon">
                    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
                      <path d="M9.8999 2.2002C9.29239 2.2002 8.7999 2.69268 8.7999 3.3002C8.7999 3.90771 9.29239 4.4002 9.8999 4.4002H12.0999C12.7074 4.4002 13.1999 3.90771 13.1999 3.3002C13.1999 2.69268 12.7074 2.2002 12.0999 2.2002H9.8999Z" fill="#F15A37" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M4.3999 5.5002C4.3999 4.28517 5.38488 3.3002 6.5999 3.3002C6.5999 5.12274 8.07736 6.6002 9.8999 6.6002H12.0999C13.9224 6.6002 15.3999 5.12274 15.3999 3.3002C16.6149 3.3002 17.5999 4.28517 17.5999 5.5002V17.6002C17.5999 18.8152 16.6149 19.8002 15.3999 19.8002H6.5999C5.38488 19.8002 4.3999 18.8152 4.3999 17.6002V5.5002ZM15.0777 11.778C15.5073 11.3484 15.5073 10.652 15.0777 10.2224C14.6481 9.7928 13.9517 9.7928 13.5221 10.2224L9.8999 13.8446L8.47772 12.4224C8.04814 11.9928 7.35166 11.9928 6.92208 12.4224C6.49251 12.852 6.49251 13.5484 6.92208 13.978L9.12209 16.178C9.55166 16.6076 10.2481 16.6076 10.6777 16.178L15.0777 11.778Z" fill="#F15A37" />
                    </svg>
                  </div>
                  <span className="step-label">
                    Pesanan Diterima
                  </span>
                </div>
                <div className="progress-line" />
              </div>
              <div style={{ display: "contents" }}>
                <div className="progress-step active">
                  <div className="step-icon">
                    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
                      <path d="M21.8625 7.8375C21.7531 7.69163 21.5902 7.5952 21.4097 7.56941C21.2292 7.54362 21.0459 7.5906 20.9 7.7L19.25 8.9375V7.5625C19.25 7.19783 19.1051 6.84809 18.8473 6.59023C18.5894 6.33237 18.2397 6.1875 17.875 6.1875H4.125C3.76033 6.1875 3.41059 6.33237 3.15273 6.59023C2.89487 6.84809 2.75 7.19783 2.75 7.5625V8.9375L1.1 7.7C0.954134 7.5906 0.770779 7.54362 0.590276 7.56941C0.409772 7.5952 0.246905 7.69163 0.137503 7.8375C0.028101 7.98337-0.0188737 8.16672 0.00691253 8.34723C0.0326988 8.52773 0.129134 8.6906 0.275003 8.8L2.75 10.6563V15.8125C2.75 16.5418 3.03973 17.2413 3.55546 17.757C4.07118 18.2728 4.77066 18.5625 5.5 18.5625H16.5C17.2293 18.5625 17.9288 18.2728 18.4445 17.757C18.9603 17.2413 19.25 16.5418 19.25 15.8125V10.6563L21.725 8.8C21.8625 7.8375Z" fill="white" />
                    </svg>
                  </div>
                  <span className="step-label">
                    Sedang Dimasak
                  </span>
                </div>
                <div className="progress-line" />
              </div>
              <div style={{ display: "contents" }}>
                <div className="progress-step">
                  <div className="step-icon">
                    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
                      <path d="M1 10H21M1 10L5 6M1 10L5 14M8 6H21M8 18H21M8 6V18" stroke="#6B6865" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="step-label">
                    Sedang Diantar
                  </span>
                </div>
                <div className="progress-line" />
              </div>
              <div style={{ display: "contents" }}>
                <div className="progress-step">
                  <div className="step-icon">
                    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
                      <path d="M2.2002 11.5502C2.2002 10.6389 2.93893 9.9002 3.8502 9.9002C4.76147 9.9002 5.5002 10.6389 5.5002 11.5502V18.1502C5.5002 19.0615 4.76147 19.8002 3.8502 19.8002C2.93893 19.8002 2.2002 19.0615 2.2002 18.1502V11.5502Z" fill="#6B6865" />
                      <path d="M6.6002 11.3669V17.3405C6.6002 18.1738 7.071 18.9356 7.81633 19.3083L7.87116 19.3357C8.48212 19.6412 9.15582 19.8002 9.8389 19.8002H15.7966C16.8453 19.8002 17.7482 19.06 17.9539 18.0317L19.2739 11.4317C19.5462 10.0703 18.5049 8.8002 17.1166 8.8002H13.2002V4.4002C13.2002 3.18517 12.2152 2.2002 11.0002 2.2002C10.3927 2.2002 9.9002 2.69268 9.9002 3.3002V4.03353C9.9002 4.98556 9.59141 5.91191 9.0202 6.67353L7.4802 8.72686C6.90898 9.48849 6.6002 10.4148 6.6002 11.3669Z" fill="#6B6865" />
                    </svg>
                  </div>
                  <span className="step-label">
                    Delivered
                  </span>
                </div>
              </div>
            </div>
            <div className="order-status-message preparing-status">
              <div className="status-icon preparing-icon">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="status-text">
                <h3 className="status-title">
                  Pesanan sedang disiapkan
                </h3>
                <p className="status-subtitle">
                  Toko sedang memasak pesananmu
                </p>
              </div>
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
