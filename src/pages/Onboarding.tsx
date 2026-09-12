// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
export default function Onboarding() {
  return (
    <>
    <div className="app-shell">
      <div className="PwaInstallBanner-module-scss-module__ziTC8q__wrapper PwaInstallBanner-module-scss-module__ziTC8q__show">
        <p className="PwaInstallBanner-module-scss-module__ziTC8q__text">
          <strong>
            Download the app
          </strong>
           — Install Delivo PWA for a better experience.
        </p>
        <div className="PwaInstallBanner-module-scss-module__ziTC8q__actions">
          <button className="PwaInstallBanner-module-scss-module__ziTC8q__installBtn">
            Install
          </button>
          <button className="PwaInstallBanner-module-scss-module__ziTC8q__dismissBtn" aria-label="Dismiss">
            ×
          </button>
        </div>
      </div>
      <div className="screen active">
        <div className="onboarding-image onboarding-image-1" />
        <div className="onboarding-overlay" />
        <div className="container h-100">
          <div className="row h-100">
            <div className="col-12 d-flex flex-column justify-content-end">
              <div className="onboarding-content">
                <h2 className="onboarding-title" style={{ whiteSpace: "pre-line" }}>
                  Discover Deliciousness Anytime, Anywhere
                </h2>
                <p className="onboarding-description">
                  Explore endless food options, order in seconds, and enjoy quick delivery straight to your door.
                </p>
                <div className="pagination-dots">
                  <span className="dot active" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <button className="btn btn-primary btn-continue">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="home-indicator " />
      </div>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
