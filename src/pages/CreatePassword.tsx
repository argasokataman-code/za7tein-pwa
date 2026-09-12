import { ChevronLeft, Check, Eye } from 'lucide-react'
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
                    <ChevronLeft size={24} strokeWidth={1.75} />
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
                          <Eye size={20} strokeWidth={1.75} />
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
                <Check size={48} strokeWidth={1.75} color="var(--on-brand)" />
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
    </>
  )
}
