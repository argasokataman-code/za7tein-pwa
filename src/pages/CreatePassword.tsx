// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { createPasswordSchema, type CreatePasswordFormData } from '../lib/schemas'

export default function CreatePassword() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePasswordFormData>({ resolver: zodResolver(createPasswordSchema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    setShowModal(true)
  }

  return (
    <>
    <div className="app-shell">
      <div className="auth-page">
        <div className="screen active">
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-12 d-flex flex-column justify-content-center">
                <div className="back-button">
                  <button type="button" className="btn-back" aria-label="Back" onClick={() => navigate(-1)}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className="auth-content">
                  <h1 className="auth-title">
                    Create New Password
                  </h1>
                  <p className="auth-subtitle">
                    Choose a strong password to secure your account. Make it unique and memorable!
                  </p>
                  <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                      <label className="form-label">
                        Password
                      </label>
                      <div className="password-wrapper">
                        <input className={`form-control${errors.password ? " error" : ""}`} placeholder="Enter your password" type={showPassword ? "text" : "password"} {...register("password")} />
                        <span className="password-toggle" style={{ cursor: "pointer" }} role="button" tabIndex={0} onClick={() => setShowPassword((v) => !v)}>
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </span>
                      </div>
                      {errors.password ? (
                        <span className="error-message">{errors.password.message}</span>
                      ) : null}
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Confirm Password
                      </label>
                      <input className={`form-control${errors.confirmPassword ? " error" : ""}`} placeholder="Confirm your password" type="password" {...register("confirmPassword")} />
                      {errors.confirmPassword ? (
                        <span className="error-message">{errors.confirmPassword.message}</span>
                      ) : null}
                    </div>
                    <button type="submit" className="btn btn-primary btn-auth" disabled={isSubmitting}>
                      Create New Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className={`profile-modal-overlay${showModal ? " is-open" : ""}`}>
            <div className="profile-modal">
              <div className="profile-modal-icon success-icon">
                <svg width={48} height={48} viewBox="0 0 56 56" fill="none">
                  <path d="M11.667 28L23.333 39.667L46.667 16.333" stroke="white" strokeWidth="4.667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="profile-modal-title">
                Password Changed!
              </h2>
              <p className="profile-modal-text">
                Your password has been successfully updated.
              </p>
              <button className="btn-profile-primary" onClick={() => { toast.success('Password updated successfully!'); navigate('/home') }}>
                Back to Home
              </button>
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
