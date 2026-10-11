import { UserRound } from 'lucide-react'

import { Sa7teinHeroPattern } from '../ui/Sa7teinHeroPattern'
import { NotificationBell } from '../ui/NotificationBell'
import { CurrencyToggle } from '../ui/CurrencyToggle'

interface CourierHomeHeroProps {
  /** Nama kurir yang tampil sebagai judul. */
  name: string
  /** Nomor WA kurir, baris kecil di bawah nama. */
  phone: string
  /** Siap menerima tugas baru (`courierSlice.isOnline`). */
  online: boolean
  /** Ubah status siap/jeda; pemanggil yang memutuskan efeknya. */
  onToggleOnline: () => void
}

/**
 * Hero beranda kurir.
 *
 * Menggabungkan identitas kurir (nama + nomor WA) dan status siap/jeda jadi
 * satu bidang merek di puncak beranda — pola yang sama dengan beranda merchant
 * (`MerchantHomeHero`). Kontrol status = segmented dua pilihan, menggantikan
 * tombol siap/jeda lama. Komponen ini tidak menyimpan state, hanya menampilkan
 * nilai dan meneruskan aksi lewat `onToggleOnline`.
 *
 * Ringkasan hari ini **tidak** di sini: angkanya jadi tile 2x2 di bawah hero
 * (`CourierTasks`), supaya ikon berwarna terbaca di permukaan terang, bukan
 * tenggelam di atas oranye.
 *
 * Bidang oranye + pola gelombang dari komponen bersama `Sa7teinHeroPattern`.
 * Full-bleed seperti hero merchant: latar menyentuh tepi kolom, isi tetap
 * bergutter 20px.
 */
export function CourierHomeHero({
  name,
  phone,
  online,
  onToggleOnline,
}: CourierHomeHeroProps) {
  const note = online
    ? 'Tugas dari merchant masuk otomatis.'
    : 'Tugas baru ditahan sampai kamu siap lagi.'

  return (
    <section className="s7-hero courier-hero">
      <Sa7teinHeroPattern />

      <div className="courier-hero__content">
        <div className="courier-hero__topbar">
          {/* Ikon, bukan foto: `courierSelf` belum punya medan foto. Nama kurir
              tepat di bawahnya, jadi alt dikosongkan. */}
          <span className="courier-hero__avatar" aria-hidden="true">
            <UserRound size={26} strokeWidth={1.75} />
          </span>

          <div className="courier-hero__controls">
            <CurrencyToggle className="currency-toggle--on-dark" />
            <NotificationBell variant="hero" />
          </div>
        </div>

        {/* Identitas di barisnya sendiri: nama dapat lebar penuh, tidak
            berebut ruang dengan dua kontrol lalu terpotong (audit-016). */}
        <div className="courier-hero__identity">
          <p className="courier-eyebrow">Kurir</p>
          <h1 className="courier-title">{name}</h1>
          <p className="courier-hero__phone">{phone}</p>
        </div>

        <div
          className="courier-hero__status"
          role="radiogroup"
          aria-label="Status terima tugas"
        >
          <button
            type="button"
            role="radio"
            aria-checked={online}
            className={`courier-hero__status-option courier-hero__status-option--siap${
              online ? ' is-active' : ''
            }`}
            onClick={() => {
              if (!online) onToggleOnline()
            }}
          >
            <span className="courier-hero__status-dot" aria-hidden="true" />
            Siap
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!online}
            className={`courier-hero__status-option courier-hero__status-option--jeda${
              !online ? ' is-active' : ''
            }`}
            onClick={() => {
              if (online) onToggleOnline()
            }}
          >
            <span className="courier-hero__status-dot" aria-hidden="true" />
            Jeda
          </button>
        </div>

        <p className="courier-hero__note">{note}</p>
      </div>
    </section>
  )
}
