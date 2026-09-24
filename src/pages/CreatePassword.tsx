import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_ROLE_LABEL } from '../data/auth'
import { createPasswordSchema, type CreatePasswordFormData } from '../lib/schemas'

/**
 * Membuat kata sandi baru — langkah terakhir lupa kata sandi.
 *
 * Dua hal ikut diperbaiki bersama kerangkanya:
 *
 *   1. Penampil sandi dulu `<span role="button" tabIndex={0}>`, jadi Enter dan
 *      Spasi tidak menyalakannya — `role` memberi tahu pembaca layar bahwa itu
 *      tombol, tapi perilaku tombolnya tidak ada. Sekarang `<button>` sungguhan
 *      dengan `aria-pressed`.
 *   2. Copy-nya campur Inggris ("Create New Password", "Password Changed!").
 *      Diseragamkan ke Bahasa Indonesia seperti layar auth lain.
 *
 * Tanpa foto: varian polos, sama seperti langkah pertama.
 */
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
    <AuthLayout
      role={AUTH_ROLE_LABEL.customer}
      title="Buat kata sandi baru"
      subtitle="Pilih sandi yang kuat dan mudah kamu ingat."
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
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

        <div className="auth-field">
          <label className="auth-label" htmlFor="confirm">
            Ulangi kata sandi
          </label>
          <input
            id="confirm"
            className={`auth-input${errors.confirmPassword ? ' is-error' : ''}`}
            placeholder="Ulangi kata sandi"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.confirmPassword ? true : undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <span className="auth-error" role="alert">
              {errors.confirmPassword.message}
            </span>
          ) : null}
        </div>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          Simpan kata sandi
        </button>
      </form>

      {showModal ? (
        <div className="auth-form" role="status">
          <p className="auth-hint">Kata sandi berhasil diperbarui.</p>
          <button
            type="button"
            className="auth-submit"
            onClick={() => {
              toast.success('Kata sandi diperbarui')
              navigate('/home')
            }}
          >
            Kembali ke beranda
          </button>
        </div>
      ) : null}
    </AuthLayout>
  )
}
