import { Delete } from 'lucide-react'
import { Link } from 'react-router-dom'

import toast from 'react-hot-toast'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_ROLE_LABEL } from '../data/auth'
import { useOtpInput } from '../hooks/useOtpInput'

/**
 * Masukkan kode OTP lupa kata sandi.
 *
 * Numpad dipertahankan: mengisi enam kotak digit di ponsel dengan papan angka
 * sendiri lebih cepat daripada keyboard sistem, dan padanya sudah ada gaya
 * bersama di `system/_buttons.scss`.
 *
 * Yang diperbaiki bersama kerangkanya:
 *
 *   - Tombol "Resend Code" dulu `<button>` ber-`style` inline, terukur 82x20 —
 *     jauh di bawah --touch-min, dan gayanya ditulis di markup. Sekarang
 *     `.auth-aside`, jalur yang sama dengan "Lupa kata sandi?" di layar masuk.
 *   - Kotak digit memakai kerangka bersama, bukan kelas porting.
 *   - Copy Indonesia.
 */

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

export default function ForgotPasswordOtp() {
  const otp = useOtpInput(6)

  return (
    <AuthLayout
      role={AUTH_ROLE_LABEL.customer}
      title="Masukkan kode"
      subtitle="Kami kirim enam digit ke nomor terdaftar. Masukkan untuk membuat sandi baru."
    >
      <div className="auth-form">
        <div className="auth-otp" role="group" aria-label="Kode verifikasi">
          {otp.values.map((value, i) => (
            <input
              key={i}
              ref={(el) => {
                otp.refs.current[i] = el
              }}
              className="auth-otp-box"
              maxLength={1}
              inputMode="numeric"
              aria-label={`Digit ${i + 1}`}
              type="text"
              value={value}
              onChange={(e) => otp.handleChange(i, e.target.value)}
              onKeyDown={(e) => otp.handleKeyDown(i, e.key)}
            />
          ))}
        </div>

        <div className="auth-aside">
          <button type="button" onClick={() => toast.success('Kode dikirim ulang')}>
            Kirim ulang kode
          </button>
        </div>

        <button
          type="button"
          className="auth-submit"
          disabled={!otp.isComplete}
          onClick={() => toast.success('Kode benar')}
        >
          Verifikasi
        </button>
      </div>

      <div className="numpad">
        {DIGITS.map((d, i) =>
          d === '' ? (
            // Spacer grid, bukan kontrol. Dulu elemen ini <button>, jadi bisa
            // difokus keyboard padahal tidak melakukan apa pun.
            <span key={`empty-${i}`} className="numpad-btn numpad-empty" aria-hidden="true" />
          ) : d === 'back' ? (
            <button
              key="back"
              type="button"
              className="numpad-btn numpad-back"
              aria-label="Hapus satu digit"
              onClick={otp.handleNumpadBackspace}
            >
              <Delete size={22} strokeWidth={1.75} />
            </button>
          ) : (
            <button key={d} type="button" className="numpad-btn" onClick={() => otp.handleNumpadInput(d)}>
              {d}
            </button>
          ),
        )}
      </div>

      <p className="auth-switch">
        Salah nomor? <Link to="/forgot-password">Ulangi</Link>
      </p>
    </AuthLayout>
  )
}
