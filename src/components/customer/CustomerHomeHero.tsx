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

      {/* Garis rute pengiriman. */}
      <path
        className="s7-route"
        d="M 706 200 Q 790 212 800 238 T 892 228"
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

      {/* Gelas soda, geometri lucide cup-soda apa adanya, dimiringkan 9 derajat.
          scale(3.8) dengan stroke-width 0.8 di dalamnya -> 3 unit viewBox,
          sekitar 1.7px di layar, setara ketebalan ornamen lain di hero ini. */}
      <g
        className="s7-cup"
        transform="translate(730 258) translate(12 12) rotate(-9) scale(3.8) translate(-12 -12)"
      >
        <path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8" />
        <path d="M5 8h14" />
        <path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0" />
        <path d="m12 8 1-6h2" />

        {/* Pin lokasi. */}
        <g className="s7-cup__pin" data-hanya-lebar transform="translate(22 2)">
          <circle className="s7-cup__pin-halo" cx="4" cy="4" r="3.4" />
          <path
            className="s7-cup__pin-mark"
            d="M 4 1.4 C 2.9 1.4 2 2.3 2 3.4 C 2 4.9 4 6.4 4 6.4 C 4 6.4 6 4.9 6 3.4 C 6 2.3 5.1 1.4 4 1.4 Z"
          />
          <circle className="s7-cup__pin-dot" cx="4" cy="3.2" r="0.8" />
        </g>
      </g>
    </svg>
  )
}

function LocationPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="s7-icon" aria-hidden="true">
      <path
        d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="10"
        r="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" className="s7-chevron" aria-hidden="true">
      <path
        d="m5.5 7.5 4.5 4.5 4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="s7-bell-icon" aria-hidden="true">
      <path
        d="M6.8 9.4a5.2 5.2 0 0 1 10.4 0v3.3l1.5 2.7H5.3l1.5-2.7V9.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.1c.4.9 1.1 1.4 2 1.4s1.6-.5 2-1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="s7-search-icon" aria-hidden="true">
      <circle
        cx="10.5"
        cy="10.5"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="m15 15 4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="s7-filter-icon" aria-hidden="true">
      <path d="M5 7h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="9" cy="7" r="2" fill="currentColor" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
      <path d="M5 17h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="11" cy="17" r="2" fill="currentColor" />
    </svg>
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
                  <svg viewBox="0 0 24 24" className="s7-icon">
                    <path
                      d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    />
                  </svg>
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
