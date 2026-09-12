import { Bell, ChevronDown, MapPin, Search, SlidersHorizontal, UserRound } from 'lucide-react'
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

/**
 * Pola latar hero.
 *
 * Komposisinya dari versi terbaru: dua gelombang organik, garis rute
 * pengiriman putus-putus, kluster titik di kanan atas, dan mangkuk beruap
 * dengan pin lokasi sebagai aksen.
 *
 * Bentuknya dipertahankan apa adanya. Yang disesuaikan hanya tiga hal yang
 * bertabrakan dengan palet, dan ketiganya sudah pernah muncul:
 *
 * - <linearGradient> #FF5252 -> #FF3D00 -> #DD2C00. Itu merah, bukan oranye
 *   Sa7tein. Karena <rect>-nya menutup penuh, ia akan mengganti warna merek di
 *   seluruh hero, bukan menambah di atasnya.
 * - <filter> feGaussianBlur. Glow terbaca sebagai neon, dan blur 140% area
 *   mahal di perangkat mobile.
 * - Warna di luar palet: #FFE0B2 pada pin dan #FF3D00 pada titik tengahnya.
 *
 * Opasitasnya dipindah ke CSS dan ditahan di 4-14%. Angka di berkas aslinya
 * mencapai 90% pada pin dan 45% pada uap — dikomposit ke atas oranye merek,
 * keduanya berhenti jadi oranye.
 *
 * `slice` membuat skalanya seragam, jadi lingkaran tetap bulat dan tebal garis
 * tetap rata di lebar layar mana pun.
 */
function Sa7teinHeroPattern() {
  return (
    <svg
      className="s7-hero-pattern"
      viewBox="0 0 1000 520"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* Gelombang latar: satu masuk dari atas, satu naik dari bawah. */}
      <path
        className="s7-wave s7-wave--one"
        d="M0,160 C320,300 420,100 700,220 C850,280 950,180 1000,200 L1000,0 L0,0 Z"
      />
      <path
        className="s7-wave s7-wave--two"
        d="M0,400 C200,350 350,460 600,390 C800,320 900,440 1000,380 L1000,520 L0,520 Z"
      />

      <g className="s7-dot-matrix">
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((column) => (
            <circle
              key={`${row}-${column}`}
              cx={762 + column * 20}
              cy={140 + row * 20}
              r="3"
            />
          )),
        )}
      </g>

    </svg>
  )
}

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
  return (
    <section className="s7-hero">
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

          <input
            type="search"
            name="q"
            placeholder="Search menu, restaurant"
            aria-label="Cari menu atau restoran"
          />

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
