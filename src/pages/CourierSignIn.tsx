import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_PHOTO, AUTH_ROLE_LABEL } from '../data/auth'
import { useAppDispatch } from '../hooks/useAppStore'
import { signInSchema, type SignInFormData } from '../lib/schemas'
import { signIn } from '../store/slices/authSlice'

/**
 * Masuk kurir (mock).
 *
 * Dasar: flow `f21-account-auth` + `f16-merchant-onboarding` — nomor WA wajib
 * untuk customer **dan** kurir/merchant, tersimpan ternormalisasi E.164
 * (`source.md:760`, `:727`), dan kurir adalah karyawan merchant yang direkrut
 * setelah toko aktif (C-06). Jadi kurir masuk dengan nomor HP, bukan email.
 *
 * Repo ini front-end saja: tidak ada sesi atau token sungguhan (AGENTS.md §1),
 * submit menandai sesi demo (`signIn()`) lalu membuka beranda kurir. Mekanisme
 * kredensial (PIN/sesi) belum punya dasar di PRD dan tidak dikarang di sini.
 */
export default function CourierSignIn() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) })

  const onSubmit = () => {
    dispatch(signIn('/courier'))
    toast.success('Masuk sebagai kurir (demo)')
    navigate('/')
  }

  return (
    <AuthLayout
      photo={AUTH_PHOTO.courier}
      role={AUTH_ROLE_LABEL.courier}
      title="Masuk kurir"
      subtitle="Ambil tugas dari merchant dan antar sampai serah terima OTP."
      tagline="Nomor WA dipakai sebagai identitas dan tujuan kontak customer. Kurir karyawan merchant: ongkir dan gaji diurus merchant, aplikasi ini hanya membawa tips (C-06)."
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
              placeholder="Kata sandi akun kurir"
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

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          Masuk
        </button>
      </form>
    </AuthLayout>
  )
}
