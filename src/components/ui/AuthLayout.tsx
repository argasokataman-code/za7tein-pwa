import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthBanner } from './AuthBanner'
import { AuthCoverHero } from './AuthCoverHero'
import type { AuthBannerSlide, AuthPhoto } from '../../types'

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
  subtitle?: string
  /** Kalimat kecil di bawah H1 — satu baris, bukan paragraf pemasaran. */
  tagline?: string
  /**
   * Slide banner yang bergilir. Bila diisi, banner menggantikan `tagline`
   * supaya janji produk tampil sebagai gambar, bukan paragraf panjang.
   */
  banners?: readonly AuthBannerSlide[]
  /** Isi panel form: kontrol form atau konten layar status. */
  children: ReactNode
  /**
   * `true` (bawaan) merender tombol kembali bulat di atas H1. Layar pertama
   * yang dibuka dari luar app (mis. `/merchant/pending` tanpa riwayat) tidak
   * punya tempat kembali, jadi tidak perlu tombol yang tidak melakukan apa apa.
   */
  showBack?: boolean
  /**
   * Susunan kepala layar. `'pill'` (bawaan) = pita foto dengan pil merek kecil
   * di kiri-atas, dipakai layar auth lain. `'hero'` = blok merek oranye bersudut
   * membulat (tanda merek di cakram putih, nama, chip peran) mengikuti acuan
   * desain login baru; `/customer/signin` memakainya lebih dulu, layar lain
   * menyusul, jadi varian ini masih opt-in dan propnya hilang saat jadi bawaan.
   * `'cover'` = foto penuh setinggi 240px yang berganti sendiri, dengan tanda
   * merek sebagai tile di sambungan foto/panel. Dipakai `/customer/signin` sejak
   * irisan HTML disetujui pemilik: tanpa nama merek sebagai teks dan tanpa chip
   * peran di layar pembeli.
   */
  brandLayout?: 'pill' | 'hero' | 'cover'
  /** Foto kepala untuk `brandLayout="cover"`. Diabaikan varian lain. */
  photos?: readonly AuthPhoto[]
}

export function AuthLayout({
  photo,
  role,
  title,
  subtitle,
  tagline,
  banners,
  children,
  showBack = true,
  brandLayout = 'pill',
  photos,
}: AuthLayoutProps) {
  const navigate = useNavigate()
  // Layar tanpa foto tidak punya kepala hero (mis. "menunggu persetujuan"):
  // varian ini turun jadi polos, bukan menggambar blok oranye kosong.
  const hero = Boolean(photo) && brandLayout === 'hero'
  // `cover` butuh daftar foto; kalau hanya ada satu, ia turun jadi hero biasa
  // supaya tidak ada kepala kosong saat prop lupa diisi.
  const cover = brandLayout === 'cover' && Boolean(photos?.length)

  return (
    <div
      className={`app-shell auth${photo || cover ? '' : ' auth--plain'}${hero ? ' auth--hero' : ''}${cover ? ' auth--cover' : ''}`}
    >
      {cover && photos ? <AuthCoverHero photos={photos} /> : null}

      {!cover && hero && photo ? (
        <div className="auth-hero">
          <img
            className="auth-hero-art"
            src={photo.src}
            alt=""
            aria-hidden="true"
            width={photo.width}
            height={photo.height}
            decoding="async"
          />
          {showBack ? (
            <button
              type="button"
              className="auth-hero-back"
              aria-label="Kembali"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} strokeWidth={1.75} />
            </button>
          ) : null}
          <span className="auth-hero-disc">
            <img
              className="auth-brand-mark"
              src="/icons/sa7tein-96x96.png"
              alt=""
              width={40}
              height={40}
              decoding="async"
            />
          </span>
          <span className="auth-hero-name">Sa7tein</span>
          <span className="auth-hero-role">{role}</span>
        </div>
      ) : photo && !cover ? (
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
        {showBack && !hero && !cover ? (
          <button
            type="button"
            className="auth-back"
            aria-label="Kembali"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
        ) : null}

        {cover ? (
          <>
            {/* Tile merek duduk di sambungan foto/panel: separuh badannya
                menimpa tepi bawah foto, jadi ia yang menyambung dua bidang itu.
                Nama merek tidak ditulis sebagai teks (arahan pemilik). */}
            <img
              className="auth-cover-mark"
              src="/icons/sa7tein-mark.svg"
              alt="Sa7tein"
              width={80}
              height={80}
              decoding="async"
            />
            {/* Tab "Masuk" sudah jadi judul visual, tapi halaman tetap butuh
                satu H1 untuk pembaca layar dan struktur dokumen. */}
            <h1 className="sr-only">{title}</h1>
          </>
        ) : (
          <header className="auth-head">
            <h1 className="auth-h1">{title}</h1>
            {subtitle ? <p className="auth-lede">{subtitle}</p> : null}
            {banners && banners.length > 0 ? (
              <AuthBanner slides={banners} />
            ) : tagline ? (
              <p className="auth-tagline">{tagline}</p>
            ) : null}
          </header>
        )}

        {children}
      </div>
    </div>
  )
}
