// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

export default function AddProfilePhoto() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow">
            <header className="profile-flow-header">
              <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="profile-flow-title">
                Add Profile Photo
              </h1>
            </header>
            <main className="profile-flow-main">
              <div className="add-photo-block">
                <div className="add-photo-avatar">
                  <img id="profilePhotoPreview" alt="Profile" width={52} height={52} src="/_next/static/media/profile.f3501486.png" style={{ color: "transparent" }} />
                </div>
                <button type="button" className="btn-upload-photo">
                  Upload New Photo
                </button>
                <input accept="image/*" className="d-none" type="file" />
              </div>
              <button type="button" className="btn-profile-primary" onClick={() => { toast.success("Changes saved!"); navigate('/profile') }}>
                Save Changes
              </button>
            </main>
          </div>
          <div className="profile-modal-overlay " id="successModal">
            <div className="profile-modal profile-modal-success">
              <div className="profile-modal-icon success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2 className="profile-modal-title">
                Profile Update Successfully
              </h2>
              <p className="profile-modal-text">
                Congratulations! Your changes have been saved. Your profile is now up-to-date.
              </p>
              <button type="button" className="btn-profile-primary" onClick={() => { toast.success("Changes saved!"); navigate('/profile') }}>
                Done
              </button>
            </div>
          </div>
          <div className="profile-modal-overlay " id="exitModal">
            <div className="profile-modal profile-modal-exit">
              <div className="profile-modal-icon exit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <h2 className="profile-modal-title">
                Are you sure want to exit without saving your profile?
              </h2>
              <p className="profile-modal-text">
                If you exit now any changes you haven't saved will be lost.
              </p>
              <div className="profile-modal-actions">
                <button type="button" className="btn-profile-outline">
                  Cancel
                </button>
                <button type="button" className="btn-profile-primary" onClick={() => { toast.success("Changes saved!"); navigate('/profile') }}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
