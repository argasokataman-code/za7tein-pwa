import { useEffect, useState } from 'react'
import { Bell, ChevronDown, MapPin, Search, SlidersHorizontal, UserRound } from 'lucide-react'

import { Sa7teinHeroPattern } from '../ui/Sa7teinHeroPattern'
/**
 * Hero beranda pelanggan.
 *
 * Arah desainnya mengikuti spesifikasi: baris atas (avatar, lokasi,
 * notifikasi), judul dua baris, lalu kotak pencarian putih yang tinggi.
 *
 * Tiga hal sengaja berbeda dari contoh kode, dan alasannya:
 *
 * 1. Warna. Contohnya mendeklarasikan set `--s7-*` sendiri di `:root`.
 *    Aplikasi ini sudah punya token oranye, ivory, dan charcoal, dan versi
 *    sebelumnya sempat punya dua skala radius yang saling menimpa karena
 *    hal serupa. Jadi di sini dipakai token proyek, dan dua nada oranye khas
 *    hero disimpan sebagai variabel lokal di `.s7-hero` supaya tidak bocor.
 *
 * 2. Avatar. Contohnya memakai layanan avatar eksternal sebagai nilai bawaan.
 *    Hero ini memakai foto dari store, dengan berkas lokal sebagai cadangan,
 *    sehingga tidak ada permintaan jaringan ke pihak ketiga.
 *
 * 3. Kolom pencarian. Contohnya adalah form yang tidak melakukan apa pun
 *    (`preventDefault`). Di sini ketikan tetap membawa ke layar pencarian,
 *    karena kolom yang bisa diketik tapi tidak bereaksi lebih buruk daripada
 *    tombol palsu yang digantikannya.
 */

import './CustomerHomeHero.css'

function LocationPinIcon() {
  return <MapPin className="s7-icon" strokeWidth={1.75} aria-hidden="true" />
}

function ChevronDownIcon() {
  return <ChevronDown className="s7-chevron" strokeWidth={1.75} aria-hidden="true" />
}

function BellIcon() {
  return <Bell className="s7-bell-icon" strokeWidth={1.75} aria-hidden="true" />
}

function SearchIcon() {
  return <Search className="s7-search-icon" strokeWidth={1.75} aria-hidden="true" />
}

function FilterIcon() {
  return <SlidersHorizontal className="s7-filter-icon" strokeWidth={1.75} aria-hidden="true" />
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
  avatarUrl?: string
  avatarAlt?: string
  location?: string
  notificationCount?: number
  onOpenProfile?: () => void
  onChangeLocation?: () => void
  onOpenNotifications?: () => void
  onOpenFilters?: () => void
  onSubmitSearch?: (query: string) => void
}

export default function CustomerHomeHero({
  avatarUrl,
  avatarAlt = '',
  location = '44 Street Town',
  notificationCount = 0,
  onOpenProfile,
  onChangeLocation,
  onOpenNotifications,
  onOpenFilters,
  onSubmitSearch,
}: Props) {
  // Saran disembunyikan begitu kolom punya isi. `useState` lokal, bukan nilai
  // dari store: ini murni tampilan kolom pencarian di halaman ini.
  const [query, setQuery] = useState('')

  return (
    <section className="s7-hero s7-hero--customer s7-parallax--hero">
      <Sa7teinHeroPattern />

      <div className="s7-hero__content">
        <header className="s7-hero__topbar">
          <div className="s7-profile-location">
            <button
              className="s7-avatar-button"
              aria-label="Open profile"
              type="button"
              onClick={onOpenProfile}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={avatarAlt} className="s7-avatar" />
              ) : (
                <span className="s7-avatar s7-avatar--kosong" aria-hidden="true">
                  <UserRound className="s7-icon" strokeWidth={1.75} aria-hidden="true" />
                </span>
              )}
            </button>

            <button
              type="button"
              className="s7-location"
              aria-label={`Ubah alamat pengiriman. Sekarang: ${location}`}
              aria-haspopup="dialog"
              onClick={onChangeLocation}
            >
              <span className="s7-location__label">
                Delivery location
                <ChevronDownIcon />
              </span>

              <span className="s7-location__value">
                <LocationPinIcon />
                <span>{location}</span>
              </span>
            </button>
          </div>

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
        </header>

        <div className="s7-hero__intro">
          <h1 className="s7-hero__headline">
            What would you like
            <br />
            to eat today?
          </h1>
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

          <span className="s7-search__divider" aria-hidden="true" />

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
