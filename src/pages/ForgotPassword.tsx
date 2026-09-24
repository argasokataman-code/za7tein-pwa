import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_ROLE_LABEL } from '../data/auth'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../lib/schemas'

/**
 * Lupa kata sandi — langkah pertama: masukkan nomor terdaftar.
 *
 * Kerangkanya memakai `AuthLayout` yang sama dengan masuk/daftar, bukan markup
 * Bootstrap hasil porting (`.container`/`.row`/`.col-12`). Porting itu membawa
 * gutter 24px (kontraknya `--space-5`) dan penggulung bersarang, jadi tiga
 * layar auth yang tersisa terasa berbeda lebar dari lima layar auth yang sudah
 * memakai kerangka bersama.
 *
 * Tanpa foto: layar ini satu tujuan dan satu aksi, jadi varian polos
 * (`photo={undefined}`) yang dipakai — sama seperti layar status.
 */
export default function ForgotPassword() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    toast.success('Kode dikirim ke nomor terdaftar')
    navigate('/forgot-password-otp')
  }

  return (
    <AuthLayout
      role={AUTH_ROLE_LABEL.customer}
      title="Lupa kata sandi"
      subtitle="Masukkan nomor HP terdaftar, kami kirim kode untuk membuat sandi baru."
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="phone">
            Nomor HP
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

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          Kirim kode
        </button>
      </form>

      <p className="auth-switch">
        Ingat kata sandinya? <Link to="/signin">Masuk</Link>
      </p>
    </AuthLayout>
  )
}
