import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_PHOTO, AUTH_ROLE_LABEL } from '../data/auth'
import { WA_PHONE_HINT } from '../data/phone'
import { signUpSchema, type SignUpFormData } from '../lib/schemas'

export default function SignUp() {
  const navigate = useNavigate()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) })

  const onSubmit = async () => {
    if (!acceptedTerms) {
      toast.error('Centang dulu persetujuan syarat dan ketentuan.')
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 800))
    toast.success('Akun dibuat. Lanjut verifikasi email.')
    navigate('/verification')
  }

  return (
    <AuthLayout
      photo={AUTH_PHOTO.signup}
      role={AUTH_ROLE_LABEL.customer}
      title="Buat akun"
      subtitle="Nomor WhatsApp jadi identitasmu. Kami pakai untuk kabar pesanan kalau notifikasi tidak sampai."
      tagline="Minimal top-up akun baru 3,5 JOD, dan saldo bisa dipakai kapan saja. Untuk sekarang semua alur di sini masih mode demo."
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="fullname">
            Nama
          </label>
          <input
            id="fullname"
            className={`auth-input${errors.name ? ' is-error' : ''}`}
            placeholder="Nama yang dipakai kurir"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            {...register('name')}
          />
          {errors.name ? (
            <span className="auth-error" role="alert">
              {errors.name.message}
            </span>
          ) : null}
        </div>

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
          ) : (
            <span className="auth-hint">{WA_PHONE_HINT}</span>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="email-signup">
            Email <span>(untuk verifikasi)</span>
          </label>
          <input
            id="email-signup"
            className={`auth-input${errors.email ? ' is-error' : ''}`}
            placeholder="nama@email.com"
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
          <label className="auth-label" htmlFor="password-signup">
            Kata sandi
          </label>
          <div className="auth-input-wrap">
            <input
              id="password-signup"
              className={`auth-input${errors.password ? ' is-error' : ''}`}
              placeholder="Minimal 6 karakter"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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

        {/*
          Syarat & ketentuan sekarang checkbox asli, bukan checkbox tersembunyi
          dengan tanda centang tiruan. Yang lama memakai `display: none` pada
          input, jadi halaman tidak bisa ditelusuri dengan keyboard dan pembaca
          layar tidak melihatnya sama sekali. Karena repo ini front-end saja,
          isi Syarat & Ketentuan serta Pemberitahuan Privasi memang belum ada:
          dulu dua tautan itu menuju `href="#"`, yang berarti kontrol mati
          (senior-fe HG-06). Sekarang menjadi satu baris teks biasa, bukan
          tautan yang tidak ke mana-mana.
        */}
        <label className="auth-consent">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span>
            Saya setuju pada syarat dan ketentuan serta pemberitahuan privasi Sa7tein. Isinya belum
            tersedia karena semua alur di repo ini masih mode demo.
          </span>
        </label>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          Buat akun
        </button>
      </form>

      <p className="auth-switch">
        Sudah punya akun? <Link to="/signin">Masuk</Link>
      </p>
    </AuthLayout>
  )
}
