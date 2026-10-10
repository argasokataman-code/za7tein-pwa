import { Store } from 'lucide-react'
import { useState } from 'react'

import { Sa7teinHeroPattern } from '../ui/Sa7teinHeroPattern'
import { NotificationBell } from '../ui/NotificationBell'

/** Status jualan toko: buka · sibuk (buka tapi menahan order) · tutup. */
export type StoreStatus = 'buka' | 'sibuk' | 'tutup'

interface MerchantHomeHeroProps {
  /** Nama toko yang tampil sebagai judul. */
  name: string
  /** Foto toko (f16 D1). `merchantSlice.logo`, sinkron dengan Setelan toko. */
  logo: string | null
  /** Status jualan: `isActive`/`isBusy` di `merchantSlice` dirangkum jadi satu. */
  status: StoreStatus
  /** Jam tutup otomatis, ditampilkan sebagai keterangan saat toko buka. */
  closeTime: string
  /** Jumlah order hari ini (state tampilan, bukan counter). */
  todayOrderCount: number
  /** Batas order harian. */
  dailyLimit: number
  /** Pilih status baru. Tutup tetap dikonfirmasi oleh pemanggil. */
  onSelectStatus: (status: StoreStatus) => void
}

const STATUS_ORDER: StoreStatus[] = ['buka', 'sibuk', 'tutup']

const STATUS_LABEL: Record<StoreStatus, string> = {
  buka: 'Buka',
  sibuk: 'Sibuk',
  tutup: 'Tutup',
}

/**
 * Hero beranda dapur.
 *
 * Menggabungkan identitas toko, status jualan tiga keadaan (buka · sibuk ·
 * tutup), dan kuota harian jadi satu bidang merek di puncak beranda. Kontrol
 * status = segmented tiga pilihan; "sibuk" berarti toko masih buka tapi
 * menahan order baru sebentar. Komponen ini tidak menyimpan state, hanya
 * menampilkan nilai dan meneruskan aksi lewat `onSelectStatus`.
 *
 * Bidang oranye + pola gelombang dari komponen bersama `Sa7teinHeroPattern`.
 */
export function MerchantHomeHero({
  name,
  logo,
  status,
  closeTime,
  todayOrderCount,
  dailyLimit,
  onSelectStatus,
}: MerchantHomeHeroProps) {
  const quotaRatio = dailyLimit > 0 ? Math.min(todayOrderCount / dailyLimit, 1) : 0
  // URL foto bisa datang dari API dan rusak; tanpa penjagaan, avatar menampilkan
  // ikon gambar pecah. Gagal muat → jatuh ke placeholder ikon toko.
  const [logoFailed, setLogoFailed] = useState(false)
  const showLogo = Boolean(logo) && !logoFailed
  const note =
    status === 'buka'
      ? `Tutup otomatis pukul ${closeTime}`
      : status === 'sibuk'
        ? 'Masih buka, tapi order baru ditahan sebentar'
        : 'Buka untuk mulai menerima order'

  return (
    <section className="s7-hero merchant-hero">
      <Sa7teinHeroPattern />

      <div className="merchant-hero__content">
        <div className="merchant-hero__id">
          {/* Dekoratif: nama toko tepat di sebelahnya, jadi alt dikosongkan
              supaya pembaca layar tidak membacanya dua kali. Tanpa foto,
              placeholder ikon toko menjaga tata letak tetap sama. */}
          {showLogo ? (
            <img
              className="merchant-hero__avatar"
              src={logo ?? undefined}
              alt=""
              width={56}
              height={56}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="merchant-hero__avatar" aria-hidden="true">
              <Store size={24} strokeWidth={1.75} />
            </span>
          )}
          <div>
            <p className="merchant-eyebrow">Dapur</p>
            <h1 className="merchant-title">{name}</h1>
          </div>
          <NotificationBell variant="hero" />
        </div>

        <div className="merchant-hero__status" role="radiogroup" aria-label="Status toko">
          {STATUS_ORDER.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={status === option}
              className={`merchant-hero__status-option merchant-hero__status-option--${option}${
                status === option ? ' is-active' : ''
              }`}
              onClick={() => onSelectStatus(option)}
            >
              <span className="merchant-hero__status-dot" aria-hidden="true" />
              {STATUS_LABEL[option]}
            </button>
          ))}
        </div>

        <p className="merchant-hero__note">{note}</p>

        <div className="merchant-hero__quota">
          <p className="merchant-hero__quota-head">
            <span>Kuota harian</span>
            <span>
              {todayOrderCount} / {dailyLimit} order
            </span>
          </p>
          <div className="merchant-hero__quota-track" role="presentation">
            <span style={{ width: `${quotaRatio * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
