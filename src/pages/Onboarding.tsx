import { Download, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { ONBOARDING_SLIDES } from '../data/onboarding'

/**
 * Layar pengenalan customer.
 *
 * Bentuknya carousel: satu foto mengisi penuh section atas sebagai fokus, judul
 * dan isi di panel putih bawah, satu aksi primer. Yang bergerak saat pindah
 * slide hanya konten (foto + teks) — kerangkanya berdiam supaya tombol tidak
 * melompat dari bawah jari.
 *
 * Ikon panah di dalam tombol berubah per slide (`ArrowUpRight` di slide
 * pertama, `ArrowRight` di tengah, `Check` di akhir) dan itu penanda posisi,
 * bukan hiasan: pengguna tahu ini slide terakhir tanpa harus menghitung titik.
 *
 * Semua slide memakai foto dari `public/assets/img/menu/` — tidak ada ikon
 * dekoratif sebagai pengganti gambar, karena foto aslinya tersedia. Isi slide
 * berasal dari PRD aktif (estimasi masak, rute kurir, zona), bukan copy
 * pemasaran.
 */

export default function Onboarding() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [showInstall, setShowInstall] = useState(true)
  /** Slide lama yang masih terlihat saat slide baru masuk (animasi silang). */
  const [phase, setPhase] = useState<'idle' | 'out'>('idle')
  const touchStartX = useRef<number | null>(null)
  // Logika pasang dipakai bersama keempat peran (lihat `useInstallPrompt`); di
  // sini yang lokal ke layar ini hanya penanda "sudah ditutup".
  const { hidden: appInstalled, install } = useInstallPrompt()

  const installApp = async () => {
    const prompted = await install()
    if (!prompted) {
      toast('Buka menu Bagikan di browser, lalu pilih Tambahkan ke Layar Utama.')
      return
    }
    setShowInstall(false)
  }

  const slide = ONBOARDING_SLIDES[index]
  const isLast = index === ONBOARDING_SLIDES.length - 1
  const SlideIcon = slide.icon

  /**
   * Pindah slide dengan dua fase, bukan satu: `out` dulu (konten memudar),
   * lalu ganti isi dan lepas `out` supaya masuk kembali. Kalau isi ditukar
   * langsung tanpa fase keluar, teks baru terlihat melompat di tengah animasi.
   */
  const goTo = useCallback(
    (next: number) => {
      if (next === index || phase === 'out') return
      setPhase('out')
      window.setTimeout(() => {
        setIndex(next)
        setPhase('idle')
      }, 220)
    },
    [index, phase],
  )

  const goNext = () => {
    if (isLast) navigate('/signin')
    else goTo(index + 1)
  }

  // Swipe: ambang 44px supaya tidak bentrok dengan gulir dokumen dan ketukan
  // pendek pada tombol.
  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.changedTouches[0].screenX
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - event.changedTouches[0].screenX
    touchStartX.current = null
    if (Math.abs(delta) < 44) return
    if (delta > 0 && index < ONBOARDING_SLIDES.length - 1) goTo(index + 1)
    if (delta < 0 && index > 0) goTo(index - 1)
  }

  return (
    <div className="onboarding-page">
      <div
        className="onboarding-media"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Pola latar: dua lingkaran radial lembut. Nilainya di CSS, bukan
            gradient merek baru — hanya kedalaman di atas warna aksi. Terlihat
            saat foto masih dimuat. */}
        <div className="onboarding-stage" aria-hidden="true" />

        <div className={`onboarding-visual${phase === 'out' ? ' is-out' : ''}`}>
          <img
            className="onboarding-dish"
            src={slide.photo}
            alt={slide.photoAlt}
            width={slide.photoWidth}
            height={slide.photoHeight}
            decoding="async"
          />
        </div>

        {/* Merek di atas foto: dua aplikasi terinstal berbeda, jadi pengguna
            perlu tahu ini yang mana sejak layar pertama. */}
        <span className="onboarding-brand">
          <img
            className="onboarding-brand-mark"
            src="/icons/sa7tein-96x96.png"
            alt=""
            width={26}
            height={26}
            decoding="async"
          />
          <span className="onboarding-brand-name">Sa7tein</span>
        </span>

        {showInstall && !appInstalled && (
          <aside className="onboarding-install" aria-label="Saran pasang aplikasi">
            <Download size={16} strokeWidth={1.75} aria-hidden="true" />
            <p>Pasang aplikasi untuk pengalaman lebih cepat</p>
            <button
              type="button"
              className="onboarding-install-btn"
              onClick={installApp}
            >
              Pasang
            </button>
            <button
              type="button"
              className="onboarding-install-close"
              aria-label="Tutup saran pasang"
              onClick={() => setShowInstall(false)}
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </aside>
        )}
      </div>

      <div className="onboarding-sheet">
        <div className="onboarding-sheet-top">
          <div className="onboarding-dots" role="group" aria-label="Langkah pengenalan">
            {ONBOARDING_SLIDES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-current={i === index ? 'step' : undefined}
                aria-label={`Langkah ${i + 1}`}
                className={`onboarding-dot${i === index ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <button type="button" className="onboarding-skip" onClick={() => navigate('/signin')}>
            Lewati
          </button>
        </div>

        <div className={`onboarding-copy${phase === 'out' ? ' is-out' : ''}`}>
          <h1 className="onboarding-heading">{slide.title}</h1>
          <p className="onboarding-body">{slide.text}</p>
        </div>

        <button type="button" className="onboarding-cta" onClick={goNext}>
          <span className="onboarding-cta-label">{slide.cta}</span>
          <span className="onboarding-cta-icon" aria-hidden="true">
            <SlideIcon size={20} strokeWidth={2.25} />
          </span>
        </button>
      </div>
    </div>
  )
}
