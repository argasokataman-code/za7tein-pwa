import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_COURIER_COVER_PHOTOS, AUTH_PHOTO, AUTH_ROLE_LABEL } from '../data/auth'
import { useAppDispatch } from '../hooks/useAppStore'
import { courierSignInSchema, type CourierSignInFormData } from '../lib/schemas'
import { signIn, setCourierKind } from '../store/slices/authSlice'

type CourierKind = 'inhouse' | 'partner'

/**
 * Masuk kurir (mock).
 *
 * Dua jenis akun, satu layar: `Kurir toko` (karyawan merchant, C-06) dan
 * `Kurir partner` (direkrut tim ops, M6). Keduanya memakai form yang sama
 * karena yang membedakan adalah akunnya, bukan cara masuk — jadi pilihannya
 * segmented switch, bukan dua halaman kembar.
 *
 * Kredensial = email magic link, mengikuti PRD aktif R-ACC-01 ("login MVP
 * hanya email magic link; satu email = satu role"). Ini MENDAHULUI kode lama:
 * layar ini dulu memakai nomor WA + kata sandi, dan `docs/plan-courier.md` K5
 * mencatat mekanisme kredensial sebagai `UNRESOLVED`.
 *
 * Repo ini front-end saja (AGENTS.md §1): tidak ada email yang benar-benar
 * dikirim dan tidak ada token. Setelah toast "tautan dikirim", demo langsung
 * menandai sesi (`signIn()`) lalu membuka beranda kurir — sama seperti layar
 * masuk lain yang juga melewati langkah verifikasi. Tautan sungguhan baru ada
 * kalau BE magic link dikerjakan.
 */
export default function CourierSignIn() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [kind, setKind] = useState<CourierKind>('inhouse')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourierSignInFormData>({ resolver: zodResolver(courierSignInSchema) })

  const onSubmit = () => {
    toast.success('Tautan masuk dikirim ke emailmu.')
    dispatch(setCourierKind(kind))
    dispatch(signIn('/courier'))
    // Partner punya permukaan sendiri: satu order per waktu, tanpa batch.
    navigate(kind === 'partner' ? '/partner' : '/')
  }

  return (
    <AuthLayout
      photo={AUTH_PHOTO.courier}
      photos={AUTH_COURIER_COVER_PHOTOS}
      role={AUTH_ROLE_LABEL.courier}
      title="Masuk"
      brandLayout="cover"
    >
      {/* Dua pilihan setara, bukan tab navigasi: yang dipilih adalah jenis
          akun, dan isi form tetap sama. Rel putih + pil aktif `--orange-soft`
          supaya tombol utama tetap satu-satunya bidang oranye penuh. */}
      <div className="auth-seg" role="group" aria-label="Jenis akun kurir">
        <label className="auth-seg-item">
          <input
            type="radio"
            name="courier-kind"
            value="inhouse"
            checked={kind === 'inhouse'}
            onChange={() => setKind('inhouse')}
          />
          Kurir toko
        </label>
        <label className="auth-seg-item">
          <input
            type="radio"
            name="courier-kind"
            value="partner"
            checked={kind === 'partner'}
            onChange={() => setKind('partner')}
          />
          Kurir partner
        </label>
      </div>
      <p className="auth-hint auth-seg-hint">Kurir toko dibuat merchant; kurir partner dibuat tim ops.</p>

      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
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
          ) : (
            <span className="auth-hint">Satu email hanya untuk satu peran. Tautan dikirim ke kotak masukmu.</span>
          )}
        </div>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Mengirim tautan…' : 'Kirim tautan masuk'}
        </button>
      </form>
    </AuthLayout>
  )
}
