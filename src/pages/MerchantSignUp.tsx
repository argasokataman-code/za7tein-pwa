import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_PHOTO, AUTH_ROLE_LABEL } from '../data/auth'
import { AUTH_FACTS } from '../data/authCopy'
import { merchantSignUpSchema, type MerchantSignUpFormData } from '../lib/schemas'

export default function MerchantSignUp() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MerchantSignUpFormData>({
    resolver: zodResolver(merchantSignUpSchema),
    defaultValues: { zone: AUTH_FACTS.zones[0] },
  })

  // Sorotan pilihan zona disimpan sebagai state lokal, bukan lewat `watch()`.
  // Bukan preferensi gaya: `watch()` mengembalikan fungsi yang tidak bisa
  // dimemo dengan aman, jadi React Compiler melewati optimasi seluruh komponen
  // ini dan oxlint melaporkannya sebagai peringatan. Nilai formnya tetap di
  // react-hook-form; yang lokal hanya kelas visualnya, dan keduanya diikat ke
  // satu sumber lewat `register` yang sama.
  const [zone, setZone] = useState<MerchantSignUpFormData['zone']>(AUTH_FACTS.zones[0])

  return (
    <AuthLayout
      photo={AUTH_PHOTO.merchant}
      role={AUTH_ROLE_LABEL.merchant}
      title="Daftar toko"
      subtitle="Akun toko ditinjau tim CS sebelum bisa menerima order."
      tagline={`Layanan berjalan di ${AUTH_FACTS.city}, dengan dua zona pengantaran. Ongkir ditanggung merchant, dan deposit COD merchant terpisah dari modal saldo 5 JOD.`}
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit(() => navigate('/onboarding'))}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="name">
            Nama toko
          </label>
          <input
            id="name"
            className={`auth-input${errors.name ? ' is-error' : ''}`}
            placeholder="Warung Nusantara"
            type="text"
            autoComplete="organization"
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
          <label className="auth-label" htmlFor="phone">
            Nomor HP <span>(opsional)</span>
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

        {/*
          Zona wajib dipilih, dan pilihannya radio bukan teks bebas: PRD aktif
          hanya punya dua zona (Hijazi dan Syimali). Alamat yang diisi bebas akan
          ditolak guard zona, jadi lebih baik dibatasi di sini daripada baru
          ketahuan saat checkout.
        */}
        <fieldset className="auth-fieldset">
          <legend className="auth-label">Zona pengantaran</legend>
          <div className="auth-zones">
            {AUTH_FACTS.zones.map((item) => (
              <label key={item} className={`auth-zone${zone === item ? ' is-on' : ''}`}>
                <input
                  type="radio"
                  value={item}
                  {...register('zone', { onChange: () => setZone(item) })}
                />
                {item}
              </label>
            ))}
          </div>
          <span className="auth-hint">
            Pesanan hanya jalan kalau alamat pembeli di dalam zona yang kamu aktifkan.
          </span>
        </fieldset>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            Kata sandi
          </label>
          <div className="auth-input-wrap">
            <input
              id="password"
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

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          Kirim pendaftaran
        </button>
      </form>

      <p className="auth-switch">
        Sudah punya akun toko? <Link to="/signin">Masuk</Link>
      </p>
    </AuthLayout>
  )
}
