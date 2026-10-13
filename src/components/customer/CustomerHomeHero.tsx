import { useEffect, useState } from 'react'
import { Bell, ChevronDown, MapPin, Search, SlidersHorizontal } from 'lucide-react'

import { Sa7teinHeroPattern } from '../ui/Sa7teinHeroPattern'
import { CustomerCurrencyButton } from './CustomerCurrencyButton'
/**
 * Hero beranda pelanggan — EDISI 02 (UI v2 "Masakan Tetangga").
 *
 * Susunannya mengikuti desain v2: baris atas berisi tombol alamat (kiri) dan
 * lonceng notifikasi (kanan), lalu sapaan dua baris dengan subjudul, lalu baris
 * pencarian putih di samping tombol filter. Semua warna dan jarak memakai token
 * proyek (--sa7tein-orange, --on-brand, --space-*), bukan set variabel kedua.
 *
 * Dua hal sengaja berbeda dari contoh kode desain, dan alasannya:
 *
 * 1. Avatar. Desain v2 tidak punya avatar di header (profil dijangkau lewat
 *    bilah bawah), jadi tidak ada permintaan foto ke mana pun.
 *
 * 2. Kolom pencarian. Contohnya adalah form yang tidak melakukan apa pun
 *    (`preventDefault`). Di sini ketikan tetap membawa ke layar pencarian,
 *    karena kolom yang bisa diketik tapi tidak bereaksi lebih buruk daripada
 *    tombol palsu yang digantikannya.
 *
 * 3. Baris atas. Contoh menaruh satu tombol kurs di kanan. Repo juga punya
 *    lonceng notifikasi yang berfungsi, jadi keduanya duduk di kanan: satu
 *    tombol mata uang (mengikuti contoh — ikon tukar) dan lonceng, dengan
 *    material kaca yang sama. Sakelar IDR/JOD dan detail kurs tidak lagi
 *    mengambang sebagai pil + koin terpisah di baris ini; keduanya pindah ke
 *    dalam sheet tombol mata uang, jadi barisnya tetap seringkas contoh.
 */

import './CustomerHomeHero.css'

function BellIcon() {
  return <Bell className="s7-bell-icon" strokeWidth={1.75} aria-hidden="true" />
}

function LocationPinIcon() {
  return <MapPin className="s7-pin-icon" strokeWidth={2} aria-hidden="true" />
}

function ChevronDownIcon() {
  return <ChevronDown className="s7-chevron" strokeWidth={1.75} aria-hidden="true" />
}

function SearchIcon() {
  return <Search className="s7-search-icon" strokeWidth={2} aria-hidden="true" />
}

function FilterIcon() {
  return <SlidersHorizontal className="s7-filter-icon" strokeWidth={2} aria-hidden="true" />
}

/**
 * Saran pencarian yang bergantian, muncul menggantikan placeholder.
 *
 * Kenapa overlay, bukan animasi `placeholder` bawaan: `placeholder` adalah
 * atribut, bukan elemen — ia tak bisa dianimasikan per-kata, tak bisa
 * di-`overflow: hidden`, dan tetap terlihat saat pengguna mulai mengetik
 * (padahal `value` sudah terisi sehingga dua teks bertumpuk). Jadi inputnya
 * memakai `placeholder=""` dan teksnya ditaruh di elemen bersaudara yang
 * diposisikan tepat di atasnya, lalu disembunyikan begitu input terisi.
 *
 * Kata-katanya diambil dari katalog yang sudah ada (nama menu populer), bukan
 * daftar karangan: yang dijanjikan di kolom pencarian harus benar-benar ada di
 * dalamnya.
 *
 * Berhenti saat pengguna menyentuh kolomnya. Saran yang terus bergerak ketika
 * seseorang sedang berpikir justru mengganggu, dan di app-mode ia juga
 * membangunkan compositor tanpa alasan.
 */
const SEARCH_SUGGESTIONS = [
  'Ayam Geprek',
  'Nasi Uduk Komplit',
  'Mie Goreng Spesial',
  'Kopi Susu Gula Aren',
  'Pisang Goreng',
]

/** Jarak antar-kata. Cukup lama untuk dibaca, cukup pendek untuk terasa hidup. */
const SUGGESTION_MS = 2600

function SearchSuggestions({ hidden }: { hidden: boolean }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (hidden) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SEARCH_SUGGESTIONS.length)
    }, SUGGESTION_MS)

    return () => window.clearInterval(id)
  }, [hidden])

  return (
    <span
      className={`s7-search__suggest${hidden ? ' s7-search__suggest--hidden' : ''}`}
      aria-hidden="true"
    >
      <span className="s7-search__suggest-word" key={index}>
        {SEARCH_SUGGESTIONS[index]}
      </span>
    </span>
  )
}

type Props = {
  userName?: string
  location?: string
  notificationCount?: number
  onChangeLocation?: () => void
  onOpenNotifications?: () => void
  onOpenFilters?: () => void
  onSubmitSearch?: (query: string) => void
}

export default function CustomerHomeHero({
  userName,
  location = '',
  notificationCount = 0,
  onChangeLocation,
  onOpenNotifications,
  onOpenFilters,
  onSubmitSearch,
}: Props) {
  // Saran disembunyikan begitu kolom punya isi. `useState` lokal, bukan nilai
  // dari store: ini murni tampilan kolom pencarian di halaman ini.
  const [query, setQuery] = useState('')
  // Label lokasi kosong sampai alamat nyata termuat (store/backend). Sebelumnya
  // ada nilai contoh `'44 Street Town'` bawaan yang bocor sebagai data dummy.
  const place = location || 'Lokasi'

  return (
    <section className="s7-hero s7-hero--customer s7-parallax--hero">
      <Sa7teinHeroPattern />

      <div className="s7-hero__content">
        <header className="s7-hero__topbar">
          <button
            type="button"
            className="s7-location"
            aria-label={`Ubah alamat pengiriman. Sekarang: ${place}`}
            aria-haspopup="dialog"
            onClick={onChangeLocation}
          >
            <span className="s7-location__pin" aria-hidden="true">
              <LocationPinIcon />
            </span>

            <span className="s7-location__text">
              <span className="s7-location__eyebrow">Antar ke</span>
              <span className="s7-location__value">
                <span>{place}</span>
                <ChevronDownIcon />
              </span>
            </span>
          </button>

          <div className="s7-hero__actions">
            <CustomerCurrencyButton />

            <button
              type="button"
              className="s7-notification"
              aria-label={
                notificationCount > 0
                  ? `Notifikasi, ${notificationCount} belum dibaca`
                  : 'Notifikasi'
              }
              onClick={onOpenNotifications}
            >
              <BellIcon />

              {notificationCount > 0 ? (
                <span className="s7-notification__badge" aria-hidden="true">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        <div className="s7-hero__intro">
          <h1 className="s7-hero__headline">
            Mau makan apa{userName ? `, ${userName}` : ''}?
          </h1>
          <p className="s7-hero__subtitle">Kuliner Nusantara di Bumi Syam</p>
        </div>

        <form
          className="s7-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            const value = new FormData(event.currentTarget).get('q')
            onSubmitSearch?.(typeof value === 'string' ? value : '')
          }}
        >
          <span className="s7-search__box">
            <SearchIcon />

            <span className="s7-search__field">
              <input
                type="search"
                name="q"
                placeholder=""
                aria-label="Cari menu atau restoran"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              <SearchSuggestions hidden={query.length > 0} />
            </span>
          </span>

          <button
            type="button"
            className="s7-search__filter"
            aria-label="Buka filter pencarian"
            onClick={onOpenFilters}
          >
            <FilterIcon />
          </button>
        </form>
      </div>
    </section>
  )
}
