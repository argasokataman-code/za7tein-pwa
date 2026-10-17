import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_MERCHANT_COVER_PHOTOS, AUTH_PHOTO, AUTH_ROLE_LABEL } from '../data/auth'
import { useAppDispatch } from '../hooks/useAppStore'
import { merchantSignInSchema, type MerchantSignInFormData } from '../lib/schemas'
import { signIn } from '../store/slices/authSlice'

export default function MerchantSignIn() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MerchantSignInFormData>({ resolver: zodResolver(merchantSignInSchema) })

  const onSubmit = () => {
    dispatch(signIn('/merchant'))
    toast.success('Masuk sebagai merchant')
    navigate('/')
  }

  return (
    <AuthLayout
      photo={AUTH_PHOTO.merchant}
      photos={AUTH_MERCHANT_COVER_PHOTOS}
      role={AUTH_ROLE_LABEL.merchant}
      title="Masuk"
      brandLayout="cover"
    >
      <nav className="auth-tabs" aria-label="Pilih masuk atau daftar">
        <Link className="auth-tab auth-tab--active" to="/signin" aria-current="page">
          Masuk
        </Link>
        <Link className="auth-tab" to="/signup">
          Daftar
        </Link>
      </nav>

      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className={`auth-input${errors.email ? ' is-error' : ''}`}
            placeholder="toko@contoh.com"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            {...register('email')}
          />
          {errors.email ? (
            <span className="auth-error" role="alert">
              {errors.email.message}
            </span>
          ) : null}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            Kata sandi
          </label>
          <div className="auth-input-wrap">
            <input
              id="password"
              className={`auth-input${errors.password ? ' is-error' : ''}`}
              placeholder="Kata sandi akun toko"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              aria-invalid={errors.password ? true : undefined}
              {...register('password')}
            />
            <button
              type="button"
              className="auth-reveal"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
            </button>
          </div>
          {errors.password ? (
            <span className="auth-error" role="alert">
              {errors.password.message}
            </span>
          ) : null}
        </div>

        {/* Pengisi ruang kosong di antara dua field dan tombol: layar masuk
            merchant hanya punya dua field, jadi tanpa gambar ini panel terasa
            kosong setengah layar. Dekoratif — `alt=""` dan tak bisa difokus. */}
        <img
          className="auth-slot-art"
          src="/assets/img/menu/merchant-sate.webp"
          alt=""
          aria-hidden="true"
          width={350}
          height={210}
          decoding="async"
        />

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          Masuk
        </button>
      </form>
    </AuthLayout>
  )
}
