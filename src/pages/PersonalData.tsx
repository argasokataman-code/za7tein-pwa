// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

export default function PersonalData() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow-page-scroll">
            <div className="profile-flow">
              <header className="profile-flow-header ">
                <Link className="back-btn-profile" aria-label="Go back" to="/profile">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </Link>
                <h1 className="profile-flow-title">
                  Personal Data
                </h1>
              </header>
              <main className="profile-flow-main">
                <div className="personal-data-avatar-wrap">
                  <div className="personal-data-avatar">
                    <img alt="Profile" width={52} height={52} src="/assets/img/profile.png" style={{ color: "transparent" }} />
                    <Link className="avatar-edit-btn" aria-label="Change photo" to="/add-profile-photo">
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                  </div>
                </div>
                <form className="personal-data-form" noValidate>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Full Name
                    </label>
                    <input className="form-input-profile" placeholder="Jenny Wilson" type="text" name="fullName" />
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Email
                    </label>
                    <input className="form-input-profile" placeholder="you@email.com" type="email" name="email" />
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Phone Number
                    </label>
                    <input className="form-input-profile" placeholder="+1 - 304 555 0121" type="tel" name="phone" />
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Date of Birth
                    </label>
                    <input className="form-input-profile" placeholder="November 24, 2000" type="date" name="dob" />
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Gender
                    </label>
                    <select className="form-input-profile form-select-profile" name="gender">
                      <option value="">
                        Select gender
                      </option>
                      <option value="female">
                        Female
                      </option>
                      <option value="male">
                        Male
                      </option>
                      <option value="other">
                        Other
                      </option>
                    </select>
                  </div>
                  <button type="submit" className="btn-profile-primary" onClick={() => { toast.success("Changes saved!"); navigate('/profile') }}>
                    Save Changes
                  </button>
                </form>
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
