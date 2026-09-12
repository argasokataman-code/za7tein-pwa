import { ChevronDown, Eye, EyeOff } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { signUpSchema, type SignUpFormData } from '../lib/schemas'

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) })
  const navigate = useNavigate()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async () => {
    if (!acceptedTerms) {
      toast.error('Please accept the Terms and Conditions')
      return
    }
    await new Promise((r) => setTimeout(r, 800))
    toast.success('Account created!')
    navigate('/verification')
  }

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
                  <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                      <label htmlFor="fullname" className="form-label">
                        Full Name
                      </label>
                      <input id="fullname" className={`form-control${errors.name ? " error" : ""}`} placeholder="Enter your name" type="text"  {...register("name")} />
                      {errors.name ? (<span className="error-message">{errors.name.message}</span>) : null}
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
                          <ChevronDown size={16} strokeWidth={1.75} className="dropdown-icon" />
                        </div>
                        <input id="phone" className={`form-control phone-input${errors.phone ? " error" : ""}`} placeholder="Enter your number" type="tel"  {...register("phone")} />
                      {errors.phone ? (<span className="error-message">{errors.phone.message}</span>) : null}
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="email-signup" className="form-label">
                        Email
                      </label>
                      <input id="email-signup" className={`form-control${errors.email ? " error" : ""}`} placeholder="Enter your email" type="email"  {...register("email")} />
                      {errors.email ? (<span className="error-message">{errors.email.message}</span>) : null}
                    </div>
                    <div className="form-group">
                      <label htmlFor="password-signup" className="form-label">
                        Password
                      </label>
                      <div className="password-wrapper">
                        <input id="password-signup" className={`form-control${errors.password ? " error" : ""}`} placeholder="Enter your password" type={showPassword ? 'text' : 'password'} {...register("password")} />
                      {errors.password ? (<span className="error-message">{errors.password.message}</span>) : null}
                        <button type="button" className="password-toggle" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword} onClick={() => setShowPassword((v) => !v)}>
                          {showPassword ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-auth" disabled={isSubmitting}>
                      Sign Up
                    </button>
                  </form>
                  <div className="terms-wrapper">
                    <label className="terms-checkbox">
                      <input id="terms-checkbox" type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
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
    </>
  )
}
