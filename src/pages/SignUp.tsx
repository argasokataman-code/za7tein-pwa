// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

export default function SignUp() {
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <div className="auth-page">
        <div className="screen active">
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-12 d-flex flex-column justify-content-center">
                <div className="auth-content">
                  <h1 className="auth-title">
                    Create Your Account
                  </h1>
                  <p className="auth-subtitle">
                    Join us today and unlock endless possibilities. It's quick, easy, and just a step away!
                  </p>
                  <form className="auth-form" noValidate onSubmit={(e) => { e.preventDefault(); toast.success("Account created!"); navigate('/verification') }}>
                    <div className="form-group">
                      <label htmlFor="fullname" className="form-label">
                        Full Name
                      </label>
                      <input id="fullname" className="form-control" placeholder="Enter your name" type="text" name="name" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <div className="phone-wrapper">
                        <div className="country-selector">
                          <svg width={20} height={15} viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="flag-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={20} height={15} style={{ maskType: "luminance" }}>
                              <rect width={20} height={15} fill="white" />
                            </mask>
                            <g mask="url(#flag-mask)">
                              <path fillRule="evenodd" clipRule="evenodd" d="M0 0H20V15H0V0Z" fill="#E53051" />
                              <path d="M20 13.75V15H0V13.75H20ZM20 12.5H0V11.25H20V12.5ZM20 10H0V8.75H20V10ZM20 7.5H0V6.25H20V7.5ZM20 5H0V3.75H20V5ZM20 2.5H0V1.25H20V2.5Z" fill="white" />
                              <rect width="11.25" height="8.75" fill="#344AB9" />
                              <rect x="1" y="1" width={1} height={1} fill="white" />
                              <rect x="3" y="1" width={1} height={1} fill="white" />
                              <rect x="5" y="1" width={1} height={1} fill="white" />
                              <rect x="7" y="1" width={1} height={1} fill="white" />
                              <rect x="9" y="1" width={1} height={1} fill="white" />
                              <rect x="2" y="2.5" width={1} height={1} fill="white" />
                              <rect x="4" y="2.5" width={1} height={1} fill="white" />
                              <rect x="6" y="2.5" width={1} height={1} fill="white" />
                              <rect x="8" y="2.5" width={1} height={1} fill="white" />
                              <rect x="1" y="4" width={1} height={1} fill="white" />
                              <rect x="3" y="4" width={1} height={1} fill="white" />
                              <rect x="5" y="4" width={1} height={1} fill="white" />
                              <rect x="7" y="4" width={1} height={1} fill="white" />
                              <rect x="9" y="4" width={1} height={1} fill="white" />
                              <rect x="2" y="5.5" width={1} height={1} fill="white" />
                              <rect x="4" y="5.5" width={1} height={1} fill="white" />
                              <rect x="6" y="5.5" width={1} height={1} fill="white" />
                              <rect x="8" y="5.5" width={1} height={1} fill="white" />
                              <rect x="1" y="7" width={1} height={1} fill="white" />
                              <rect x="3" y="7" width={1} height={1} fill="white" />
                              <rect x="5" y="7" width={1} height={1} fill="white" />
                              <rect x="7" y="7" width={1} height={1} fill="white" />
                              <rect x="9" y="7" width={1} height={1} fill="white" />
                            </g>
                          </svg>
                          <span className="country-code">
                            +1
                          </span>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" className="dropdown-icon">
                            <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <input id="phone" className="form-control phone-input" placeholder="Enter your number" type="tel" name="phone" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="email-signup" className="form-label">
                        Email
                      </label>
                      <input id="email-signup" className="form-control" placeholder="Enter your email" type="email" name="email" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="password-signup" className="form-label">
                        Password
                      </label>
                      <div className="password-wrapper">
                        <input id="password-signup" className="form-control" placeholder="Enter your password" type="password" name="password" />
                        <span className="password-toggle" role="button" tabIndex={0} aria-label="Show password">
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <path d="M12 5C7.5 5 3.73 7.61 2 11.5C3.73 15.39 7.5 18 12 18C16.5 18 20.27 15.39 22 11.5C20.27 7.61 16.5 5 12 5ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="currentColor" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-auth">
                      Sign Up
                    </button>
                  </form>
                  <div className="terms-wrapper">
                    <label className="terms-checkbox">
                      <input id="terms-checkbox" type="checkbox" />
                      <span className="checkmark" />
                      <span className="terms-text">
                        By creating an account, you agree to our 
                        <a className="terms-link" href="#">
                          Terms and Conditions
                        </a>
                         and 
                        <a className="terms-link" href="#">
                          Privacy Notice
                        </a>
                        .
                      </span>
                    </label>
                  </div>
                  <p className="signin-text">
                    Already have an account? 
                    <Link className="signin-link" to="/signin">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="home-indicator " />
        </div>
      </div>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
