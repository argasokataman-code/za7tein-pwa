import { ArrowLeft } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { forgotPasswordSchema, type ForgotPasswordFormData } from '../lib/schemas'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    toast.success('OTP sent to your email!')
    navigate('/forgot-password-otp')
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
                    <ArrowLeft size={20} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="auth-content">
                  <h1 className="auth-title">
                    Forgot Password
                  </h1>
                  <p className="auth-subtitle">
                    Masukkan nomor HP terdaftar, kami akan mengirim kode OTP.
                  </p>
                  <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                      <label className="form-label">
                        Nomor HP
                      </label>
                      <input className={`form-control${errors.phone ? " error" : ""}`} placeholder="0812 3456 7890" type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} />
                      {errors.phone ? (
                        <span className="error-message">{errors.phone.message}</span>
                      ) : null}
                    </div>
                    <button type="submit" className="btn btn-primary btn-auth" disabled={isSubmitting}>
                      Kirim OTP
                    </button>
                  </form>
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
