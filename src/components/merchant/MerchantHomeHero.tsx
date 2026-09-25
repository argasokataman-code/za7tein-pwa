import { Store } from 'lucide-react'

import { Sa7teinHeroPattern } from '../ui/Sa7teinHeroPattern'

interface MerchantHomeHeroProps {
  /** Nama toko yang tampil sebagai judul. */
  name: string
  /** Foto toko (f16 D1). `merchantSlice.logo`, sinkron dengan Setelan toko. */
  logo: string | null
  /** Status jualan (`isActive` di `merchantSlice`). */
  isActive: boolean
  /** Jam tutup otomatis, ditampilkan sebagai keterangan saat toko buka. */
  closeTime: string
  /** Jumlah order hari ini (state tampilan, bukan counter). */
  todayOrderCount: number
  /** Batas order harian. */
  dailyLimit: number
  onToggle: () => void
}

/**
 * Hero beranda dapur.
 *
 * Menyatukan tiga hal yang sebelumnya tiga kartu terpisah: identitas toko,
 * status buka/tutup beserta tombolnya, dan kuota harian. Tiga-tiganya mengatur
 * hal yang sama — apakah toko menerima order — jadi satu bidang lebih jujur
 * daripada tiga kartu setara.
 *
 * Struktur dan tombolnya tetap milik halaman: komponen ini tidak menyimpan
 * state, hanya menampilkan nilai dan meneruskan aksi lewat `onToggle`. Bidang
 * oranye + pola gelombang berasal dari komponen bersama `Sa7teinHeroPattern`
 * dan `system/_hero.scss`, dipakai beranda pelanggan juga.
 */
export function MerchantHomeHero({
  name,
  logo,
  isActive,
  closeTime,
  todayOrderCount,
  dailyLimit,
  onToggle,
}: MerchantHomeHeroProps) {
  const quotaRatio = dailyLimit > 0 ? Math.min(todayOrderCount / dailyLimit, 1) : 0

  return (
    <section className="s7-hero merchant-hero">
      <Sa7teinHeroPattern />

      <div className="merchant-hero__content">
        <div className="merchant-hero__id">
          {/* Dekoratif: nama toko tepat di sebelahnya, jadi alt dikosongkan
              supaya pembaca layar tidak membacanya dua kali. Tanpa foto,
              placeholder ikon toko menjaga tata letak tetap sama. */}
          {logo ? (
            <img className="merchant-hero__avatar" src={logo} alt="" width={56} height={56} />
          ) : (
            <span className="merchant-hero__avatar" aria-hidden="true">
              <Store size={24} strokeWidth={1.75} />
            </span>
          )}
          <div>
            <p className="merchant-eyebrow">Dapur</p>
            <h1 className="merchant-title">{name}</h1>
          </div>
        </div>

        <p className="merchant-hero__state">
          <span className="merchant-hero__dot" aria-hidden="true" />
          {isActive ? 'Buka — menerima order baru' : 'Tutup — order baru ditahan'}
        </p>
        <p className="merchant-hero__note">
          {isActive ? `Tutup otomatis pukul ${closeTime}` : 'Buka untuk mulai menerima'}
        </p>

        <button type="button" className="merchant-hero__toggle" onClick={onToggle}>
          {isActive ? 'Tutup toko' : 'Buka toko'}
        </button>

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
