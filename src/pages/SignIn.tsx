import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_PHOTO, AUTH_ROLE_LABEL } from '../data/auth'
import { useAppDispatch } from '../hooks/useAppStore'
import { signInSchema, type SignInFormData } from '../lib/schemas'
import { signIn } from '../store/slices/authSlice'

export default function SignIn() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) })

  const onSubmit = () => {
    dispatch(signIn('/customer'))
    toast.success('Mode demo: berhasil masuk')
    navigate('/home')
  }

  return (
    <AuthLayout
      photo={AUTH_PHOTO.signin}
      role={AUTH_ROLE_LABEL.customer}
      title="Masuk"
      subtitle="Pesan dari dapur di sekitarmu dan ikuti perjalanannya sampai tiba."
      tagline="Estimasi masak 15, 25, atau 35 menit, jelas sejak checkout. Ongkir ditanggung merchant, bukan ditambahkan ke pesananmu."
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="phone">
            Nomor WhatsApp
          </label>
          <input
            id="phone"
            className={`auth-input${errors.phone ? ' is-error' : ''}`}
            placeholder="0812 3456 7890"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={errors.phone ? true : undefined}
            {...register('phone')}
          />
          {errors.phone ? (
            <span className="auth-error" role="alert">
              {errors.phone.message}
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
              placeholder="Masukkan kata sandi"
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

        <div className="auth-aside">
          <Link to="/forgot-password">Lupa kata sandi?</Link>
        </div>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          Masuk
        </button>
      </form>
    </AuthLayout>
  )
}
