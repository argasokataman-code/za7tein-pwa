// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { signInSchema, type SignInFormData } from '../lib/schemas'

export default function SignIn() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) })

  const onSubmit = () => {
    toast.success('Welcome back!')
    navigate('/home')
  }

  return (
    <>
    <div className="app-shell">
      <div className="auth-page">
        <div className="screen active" id="signin">
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-12 d-flex flex-column">
                <div className="back-button">
                  <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className="auth-content">
                  <h1 className="auth-title">
                    Selamat Datang!
                  </h1>
                  <p className="auth-subtitle">
                    Masuk dengan nomor HP yang terdaftar.
                  </p>
                  <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Nomor HP
                      </label>
                      <input id="phone" className={`form-control${errors.phone ? " error" : ""}`} placeholder="0812 3456 7890" type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} />
                      {errors.phone ? (
                        <span className="error-message">{errors.phone.message}</span>
                      ) : null}
                    </div>
                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <div className="password-wrapper">
                        <input id="password" className={`form-control${errors.password ? " error" : ""}`} placeholder="Enter your password" type={showPassword ? "text" : "password"} {...register("password")} />
                        <span className="password-toggle" aria-label="Toggle password" role="button" tabIndex={0} style={{ cursor: "pointer" }} onClick={() => setShowPassword((v) => !v)}>
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </span>
                      </div>
                      {errors.password ? (
                        <span className="error-message">{errors.password.message}</span>
                      ) : null}
                    </div>
                    <div className="text-end mb-4">
                      <Link className="forgot-link" to="/forgot-password" style={{ color: "#F15A37", fontSize: "13px", textDecoration: "none" }}>
                        Forgot Password?
                      </Link>
                    </div>
                    <button type="submit" className="btn btn-primary btn-auth" disabled={isSubmitting}>
                      Sign In
                    </button>
                  </form>
                  <div className="divider">
                    <span>
                      Or continue with
                    </span>
                  </div>
                  <div className="social-buttons">
                    <button type="button" className="btn-social" onClick={() => { toast.success("Signed in with social account"); navigate('/home') }}>
                      <img alt="Google" width={24} height={24} src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2048%2048'%3E%3Cpath%20fill='%234285F4'%20d='M46.98%2024.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58%202.96-2.26%205.48-4.78%207.18l7.73%206c4.51-4.18%207.09-10.36%207.09-17.65z'/%3E%3Cpath%20fill='%2334A853'%20d='M24%2048c6.48%200%2011.93-2.13%2015.89-5.81l-7.73-6c-2.15%201.45-4.92%202.3-8.16%202.3-6.26%200-11.57-4.22-13.47-9.91l-7.98%206.19C6.51%2042.62%2014.62%2048%2024%2048z'/%3E%3Cpath%20fill='%23FBBC05'%20d='M10.53%2028.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.9%2016.46%200%2020.12%200%2024c0%203.88.89%207.54%202.55%2010.78l7.98-6.19z'/%3E%3Cpath%20fill='%23EA4335'%20d='M24%209.5c3.54%200%206.71%201.22%209.21%203.6l6.85-6.85C35.9%202.38%2030.47%200%2024%200%2014.62%200%206.51%205.38%202.55%2013.22l7.98%206.19c1.9-5.69%207.21-9.91%2013.47-9.91z'/%3E%3C/svg%3E" style={{ color: "transparent" }} />
                    </button>
                    <button type="button" className="btn-social" onClick={() => { toast.success("Signed in with social account"); navigate('/home') }}>
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="white" />
                      </svg>
                    </button>
                    <button type="button" className="btn-social" onClick={() => { toast.success("Signed in with social account"); navigate('/home') }}>
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>
                  </div>
                  <p className="signup-text mt-6 text-center" style={{ fontSize: "14px", color: "rgb(156, 163, 175)" }}>
                    Don't have an account? 
                    <Link to="/signup" style={{ color: "#F15A37", fontWeight: "600", textDecoration: "none" }}>
                      Sign Up
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
