import { ChevronLeft, SquarePen } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { updateCustomerContact } from '../api/profile'
import { personalDataSchema, type PersonalDataFormData } from '../lib/schemas'
import { updateUser } from '../store/slices/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'

export default function PersonalData() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonalDataFormData>({ resolver: zodResolver(personalDataSchema) })
  // Isi form dari sesi live (email/HP ditulis tabel `users`). Di-reset saat
  // `auth.user` tiba dari sinkron API, bukan hanya di nilai awal mount.
  useEffect(() => {
    if (!user) return
    reset((prev) => ({
      ...prev,
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
    }))
  }, [user, reset])
  const onSubmit = async (data: PersonalDataFormData) => {
    try {
      await updateCustomerContact({ email: data.email, phone: data.phone })
      dispatch(updateUser({ email: data.email, phone: data.phone }))
      toast.success('Perubahan disimpan')
    } catch {
      toast.error('Gagal menyimpan perubahan')
    }
    navigate('/profile')
  }
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="profile-flow-page">
          <div className="profile-flow-page-scroll">
            <div className="profile-flow">
              <header className="profile-flow-header ">
                <Link className="back-btn-profile" aria-label="Go back" to="/profile">
                  <ChevronLeft size={24} strokeWidth={1.75} />
                </Link>
                <h1 className="profile-flow-title">
                  Personal Data
                </h1>
              </header>
              <main className="profile-flow-main">
                <div className="personal-data-avatar-wrap">
                  <div className="personal-data-avatar">
                    <img alt="Profile" width={52} height={52} src="/assets/img/profile.png" style={{ color: "transparent" }} />
                    <Link className="avatar-edit-btn" aria-label="Change photo" to="/add-profile-photo">
                      <SquarePen size={16} strokeWidth={1.75} />
                    </Link>
                  </div>
                </div>
                <form className="personal-data-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                  <p className="addr-form-hint">
                    Email dan nomor HP tersimpan ke server. Nama, tanggal lahir, dan jenis
                    kelamin belum punya kolom di backend, jadi belum ikut tersimpan.
                  </p>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Full Name
                    </label>
                    <input className={`form-input-profile${errors.fullName ? " error" : ""}`} placeholder="Nama lengkap" type="text"  {...register("fullName")} />
                      {errors.fullName ? (<span className="error-message">{errors.fullName.message}</span>) : null}
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Email
                    </label>
                    <input className={`form-input-profile${errors.email ? " error" : ""}`} placeholder="nama@email.com" type="email"  {...register("email")} />
                      {errors.email ? (<span className="error-message">{errors.email.message}</span>) : null}
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Phone Number
                    </label>
                    <input className={`form-input-profile${errors.phone ? " error" : ""}`} placeholder="+62 812 3456 7890" type="tel"  {...register("phone")} />
                      {errors.phone ? (<span className="error-message">{errors.phone.message}</span>) : null}
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Date of Birth
                    </label>
                    <input className={`form-input-profile${errors.dob ? " error" : ""}`} placeholder="November 24, 2000" type="date"  {...register("dob")} />
                      {errors.dob ? (<span className="error-message">{errors.dob.message}</span>) : null}
                  </div>
                  <div className="form-group-profile">
                    <label className="form-label-profile">
                      Gender
                    </label>
                    <select className="form-input-profile form-select-profile" name="gender">
                      <option value="">
                        Select gender
                      </option>
                      <option value="female">
                        Female
                      </option>
                      <option value="male">
                        Male
                      </option>
                      <option value="other">
                        Other
                      </option>
                    </select>
                  </div>
                  <button type="submit" className="btn-profile-primary" disabled={isSubmitting}>
                    Save Changes
                  </button>
                </form>
              </main>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
