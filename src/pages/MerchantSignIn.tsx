import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { merchantSignInSchema, type MerchantSignInFormData } from '../lib/schemas'

export default function MerchantSignIn() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MerchantSignInFormData>({ resolver: zodResolver(merchantSignInSchema) })

  const onSubmit = () => {
    toast.success('Masuk sebagai merchant')
    navigate('/')
  }

  return (
    <div className="app-shell">
      <div className="auth-page">
        <div className="screen active" id="merchant-signin">
          <div className="container">
            <button
              type="button"
              className="btn-back"
              aria-label="Kembali"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={24} strokeWidth={1.75} />
            </button>
            <div className="auth-content">
              <h1 className="auth-title">Masuk Merchant</h1>
              <p className="auth-subtitle">Kelola order, menu, dan kurir tokomu.</p>

              <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    className={`form-control${errors.email ? ' error' : ''}`}
                    placeholder="toko@contoh.com"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                  />
                  {errors.email ? (
                    <span className="error-message">{errors.email.message}</span>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="password"
                      className={`form-control${errors.password ? ' error' : ''}`}
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password')}
                    />
                    <span
                      className="password-toggle"
                      role="button"
                      tabIndex={0}
                      aria-label="Tampilkan password"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
                    </span>
                  </div>
                  {errors.password ? (
                    <span className="error-message">{errors.password.message}</span>
                  ) : null}
                </div>

                <button type="submit" className="btn btn-primary btn-auth" disabled={isSubmitting}>
                  Masuk
                </button>
              </form>

              <p className="merchant-auth-switch">
                Belum punya akun toko? <Link to="/signup">Daftar</Link>
              </p>
            </div>
          </div>
          <div className="home-indicator" />
        </div>
      </div>
    </div>
  )
}
