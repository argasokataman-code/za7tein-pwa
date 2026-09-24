import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import type { AuthPhoto } from '../../types'
import { HomeIndicator } from '../layout/HomeIndicator'

/**
 * Satu kerangka untuk semua layar masuk/daftar.
 *
 * Dulu kelima layar ini menyalin markup Bootstrap hasil porting
 * (`.screen`/`.container`/`.row`/`.col`) dan mewarisi tiga penyimpangan
 * sekaligus: gutter 24px (kontraknya 20px), tombol `--radius-pill` (skala
 * berhenti di 12px), dan penggulung bersarang di dalam `.auth-content`. Layar
 * auth juga satu-satunya tempat foto makanan sudah tersedia tapi tidak dipakai.
 *
 * Bentuknya dua panel, bukan "kartu di tengah": panel foto memakai aset yang
 * sudah ada di repo, panel form memakai `--surface` yang sudah jadi token.
 * Tidak ada aset baru, tidak ada ilustrasi stok, tidak ada emoji.
 *
 * Layar yang tidak butuh foto (mis. "menunggu persetujuan") memakai varian
 * polos lewat `photo={undefined}` — bukan menggambar ulang kerangkanya.
 */

export interface AuthLayoutProps {
  /**
   * Foto makanan dari `public/assets/`. Wajib diisi kecuali untuk layar status
   * yang memang tidak butuh konteks visual.
   */
  photo?: AuthPhoto
  /** Nama peran: "Pembeli" atau "Merchant". Pembeda peran, bukan hiasan. */
  role: string
  /** Judul layar. H1 halaman, jadi harus cocok dengan `<title>`. */
  title: string
  subtitle: string
  /** Kalimat kecil di bawah H1 — satu baris, bukan paragraf pemasaran. */
  tagline?: string
  /** Isi panel form: kontrol form atau konten layar status. */
  children: ReactNode
  /**
   * `true` (bawaan) merender tombol kembali bulat di atas H1. Layar pertama
   * yang dibuka dari luar app (mis. `/merchant/pending` tanpa riwayat) tidak
   * punya tempat kembali, jadi tidak perlu tombol yang tidak melakukan apa pun.
   */
  showBack?: boolean
}

export function AuthLayout({
  photo,
  role,
  title,
  subtitle,
  tagline,
  children,
  showBack = true,
}: AuthLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className={`app-shell auth${photo ? '' : ' auth--plain'}`}>
      {photo ? (
        <div className="auth-photo">
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            decoding="async"
          />
          <span className="auth-photo-brand">
            <img
              className="auth-brand-mark"
              src="/icons/sa7tein-96x96.png"
              alt=""
              width={26}
              height={26}
              decoding="async"
            />
            <span className="auth-brand-name">Sa7tein</span>
            <span className="auth-brand-role">{role}</span>
          </span>
        </div>
      ) : null}

      <div className="auth-panel">
        {showBack ? (
          <button
            type="button"
            className="auth-back"
            aria-label="Kembali"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
        ) : null}

        <header className="auth-head">
          <h1 className="auth-h1">{title}</h1>
          <p className="auth-lede">{subtitle}</p>
          {tagline ? <p className="auth-tagline">{tagline}</p> : null}
        </header>

        {children}
      </div>

      <HomeIndicator />
    </div>
  )
}
