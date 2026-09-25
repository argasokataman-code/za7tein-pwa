import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_PHOTO, AUTH_ROLE_LABEL } from '../data/auth'
import { WA_PHONE_HINT } from '../data/phone'
import { useAppDispatch } from '../hooks/useAppStore'
import { courierOnboardingSchema, type CourierOnboardingFormData } from '../lib/schemas'
import { completeOnboarding } from '../store/slices/courierSlice'

/**
 * Onboarding kurir (keputusan PO 2026-09-25). Setiap peran punya layar
 * onboarding sendiri; kurir tetap direkrut merchant (C-06), layar ini
 * melengkapi profil sebelum masuk. Disimpan sebagai state mock, lalu
 * mengarah ke `/signin`.
 */
export default function CourierOnboarding() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourierOnboardingFormData>({
    resolver: zodResolver(courierOnboardingSchema),
    defaultValues: { vehicle: 'motor' },
  })

  const onSubmit = (data: CourierOnboardingFormData) => {
    dispatch(completeOnboarding({ name: data.name, phone: data.phone, vehicle: data.vehicle }))
    toast.success('Profil kurir tersimpan. Lanjut masuk.')
    navigate('/signin')
  }

  return (
    <AuthLayout
      photo={AUTH_PHOTO.courier}
      role={AUTH_ROLE_LABEL.courier}
      title="Lengkapi profil kurir"
      subtitle="Diisi sekali sebelum mulai. Merchant yang merekrutmu sudah mendaftarkan akun toko."
      tagline="Kurir karyawan merchant: ongkir dan gaji diurus merchant, aplikasi ini hanya membawa tips. Nomor WA dipakai sebagai identitas dan tujuan kontak customer."
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="courier-name">
            Nama
          </label>
          <input
            id="courier-name"
            className={`auth-input${errors.name ? ' is-error' : ''}`}
            placeholder="Nama yang dipakai customer"
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
          <label className="auth-label" htmlFor="courier-phone">
            Nomor WhatsApp
          </label>
          <input
            id="courier-phone"
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

        <fieldset className="auth-fieldset">
          <legend className="auth-label">Kendaraan</legend>
          <div className="auth-zones">
            <label className="auth-zone">
              <input type="radio" value="motor" {...register('vehicle')} />
              Motor
            </label>
            <label className="auth-zone">
              <input type="radio" value="mobil" {...register('vehicle')} />
              Mobil
            </label>
          </div>
        </fieldset>

        <label className="auth-consent">
          <input
            type="checkbox"
            aria-invalid={errors.agree ? true : undefined}
            {...register('agree')}
          />
          <span>
            Saya setuju pada ketentuan layanan Sa7tein. Isinya belum tersedia karena semua alur di
            repo ini masih mode demo.
          </span>
        </label>
        {errors.agree ? (
          <span className="auth-error" role="alert">
            {errors.agree.message}
          </span>
        ) : null}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          Simpan &amp; lanjut masuk
        </button>
      </form>
    </AuthLayout>
  )
}
