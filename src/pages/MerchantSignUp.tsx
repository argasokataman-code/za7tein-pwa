import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { merchantSignUpSchema, type MerchantSignUpFormData } from '../lib/schemas'

export default function MerchantSignUp() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MerchantSignUpFormData>({ resolver: zodResolver(merchantSignUpSchema) })

  const onSubmit = () => {
    navigate('/merchant/pending')
  }

  return (
    <div className="app-shell">
      <div className="auth-page">
        <div className="screen active" id="merchant-signup">
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
              <h1 className="auth-title">Daftar Toko</h1>
              <p className="auth-subtitle">
                Akun toko ditinjau Super Admin sebelum bisa menerima order.
              </p>

              <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Nama toko
                  </label>
                  <input
                    id="name"
                    className={`form-control${errors.name ? ' error' : ''}`}
                    placeholder="Warung Nusantara"
                    type="text"
                    {...register('name')}
                  />
                  {errors.name ? (
                    <span className="error-message">{errors.name.message}</span>
                  ) : null}
                </div>

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
                  <label htmlFor="phone" className="form-label">
                    Nomor HP (opsional)
                  </label>
                  <input
                    id="phone"
                    className={`form-control${errors.phone ? ' error' : ''}`}
                    placeholder="0812 3456 7890"
                    type="tel"
                    inputMode="tel"
                    {...register('phone')}
                  />
                  {errors.phone ? (
                    <span className="error-message">{errors.phone.message}</span>
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
                      placeholder="Minimal 6 karakter"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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
                  Daftar
                </button>
              </form>

              <p className="merchant-auth-switch">
                Sudah punya akun toko? <Link to="/merchant/signin">Masuk</Link>
              </p>
            </div>
          </div>
          <div className="home-indicator" />
        </div>
      </div>
    </div>
  )
}
