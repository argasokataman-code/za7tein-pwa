import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_ROLE_LABEL } from '../data/auth'
import { useOtpInput } from '../hooks/useOtpInput'

/**
 * Verifikasi email — enam digit yang dikirim ke email terdaftar.
 *
 * Kerangkanya `AuthLayout` varian polos, sama seperti layar auth lain. Yang
 * berubah bersama itu:
 *
 *   - Kotak digit memakai `.auth-otp` di kerangka bersama. Sebelumnya
 *     `.code-input` dari stylesheet porting dengan gutter 24px.
 *   - Tombolnya `.auth-submit`, dan verifikasinya dinonaktifkan sampai enam
 *     digit terisi. Dulu tombolnya selalu bisa ditekan lalu menampilkan toast
 *     error, sehingga kontrolnya tidak pernah menyampaikan keadaannya.
 *   - Copy Indonesia. "Please Verify Your Email" jadi "Verifikasi email".
 *
 * Catatan: PRD aktif tidak punya requirement OTP (level 1 cukup validasi
 * format + simpan E.164). Layar ini mock yang sudah ada sejak versi lama, dan
 * tidak mengklaim mengirim apa pun sungguhan.
 */
export default function Verification() {
  const otp = useOtpInput(6)
  const navigate = useNavigate()

  const verify = () => {
    toast.success('Email terverifikasi')
    navigate('/signin')
  }

  return (
    <AuthLayout
      role={AUTH_ROLE_LABEL.customer}
      title="Verifikasi email"
      subtitle="Masukkan enam digit kode yang kami kirim ke emailmu."
    >
      <div className="auth-form">
        <div className="auth-otp" role="group" aria-label="Kode verifikasi">
          {otp.values.map((value, i) => (
            <input
              key={i}
              ref={(el) => {
                otp.refs.current[i] = el
              }}
              inputMode="numeric"
              maxLength={1}
              className="auth-otp-box"
              aria-label={`Digit ${i + 1}`}
              type="text"
              value={value}
              onChange={(e) => otp.handleChange(i, e.target.value)}
              onKeyDown={(e) => otp.handleKeyDown(i, e.key)}
            />
          ))}
        </div>

        <button
          type="button"
          className="auth-submit"
          disabled={!otp.isComplete}
          onClick={verify}
        >
          Verifikasi
        </button>

        <p className="auth-hint">Kode bisa dikirim ulang dalam 58 detik.</p>
      </div>
    </AuthLayout>
  )
}
