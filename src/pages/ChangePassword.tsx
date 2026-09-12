import { ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const PASSWORD_FIELDS = [
  { id: 'currentPassword', label: 'Kata sandi saat ini', placeholder: 'Masukkan kata sandi saat ini' },
  { id: 'newPassword', label: 'Kata sandi baru', placeholder: 'Masukkan kata sandi baru' },
  { id: 'confirmPassword', label: 'Konfirmasi kata sandi baru', placeholder: 'Ulangi kata sandi baru' },
] as const

type PasswordFieldId = (typeof PASSWORD_FIELDS)[number]['id']

export default function ChangePassword() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState<PasswordFieldId[]>([])
  const [values, setValues] = useState<Record<PasswordFieldId, string>>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (Object.values(values).some((value) => !value)) {
      toast.error('Lengkapi semua kolom kata sandi')
      return
    }
    if (values.newPassword !== values.confirmPassword) {
      toast.error('Konfirmasi kata sandi belum cocok')
      return
    }
    toast.success('Perubahan kata sandi disimulasikan')
    navigate('/profile')
  }

  return (
    <div className="app-shell">
      <main className="profile-flow-page">
        <div className="profile-flow-page-scroll">
          <div className="profile-flow">
            <header className="profile-flow-header">
              <button type="button" className="btn-back" aria-label="Kembali" onClick={() => navigate(-1)}>
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
              <h1 className="profile-flow-title">Ubah kata sandi</h1>
            </header>
            <div className="profile-flow-main">
              <p className="text-muted-profile">Buat kata sandi baru untuk akunmu.</p>
              <form className="auth-form" onSubmit={submit}>
                {PASSWORD_FIELDS.map((field) => {
                  const isVisible = visible.includes(field.id)
                  return (
                    <div className="form-group-profile mb-4" key={field.id}>
                      <label className="form-label-profile" htmlFor={field.id}>{field.label}</label>
                      <div className="password-wrapper">
                        <input
                          id={field.id}
                          className="form-input-profile pe-5"
                          placeholder={field.placeholder}
                          type={isVisible ? 'text' : 'password'}
                          autoComplete={field.id === 'currentPassword' ? 'current-password' : 'new-password'}
                          value={values[field.id]}
                          onChange={(event) => setValues((previous) => ({ ...previous, [field.id]: event.target.value }))}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          aria-label={`${isVisible ? 'Sembunyikan' : 'Tampilkan'} ${field.label.toLowerCase()}`}
                          aria-pressed={isVisible}
                          onClick={() => setVisible((previous) => isVisible ? previous.filter((id) => id !== field.id) : [...previous, field.id])}
                        >
                          {isVisible ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>
                  )
                })}
                <button type="submit" className="btn-profile-primary mt-4">Simpan perubahan</button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
