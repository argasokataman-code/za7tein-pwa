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
 * Susunannya dari versi yang dipakai sekarang: tiga lapis gelombang, matriks
 * titik, dan cloche yang lengkap (uap, handle, kubah, tatakan).
 *
 * Tiga hal dibuang dari berkas aslinya:
 *
 * - <linearGradient> #FF5722->#E64A19. Hero sudah memakai --sa7tein-orange,
 *   jadi rect gradien itu hanya menimpa warna merek dengan oranye yang bukan
 *   milik Sa7tein. Gradient juga dilarang brief.
 * - <filter> feGaussianBlur. Glow = kesan neon, dan blur 140% area mahal di
 *   perangkat mobile.
 * - #FFE0B2 pada kilauan. Di luar palet, dan pada 60% ia menggeser rona
 *   oranye ke peach.
 *
 * Semua opasitasnya kini di CSS, dalam rentang 4-14%: pada 70% dan 40% seperti
 * berkas aslinya, handle dan uap dikomposit jadi pink dan salmon, bukan lagi
 * oranye.
 *
 * `slice` dipakai supaya skalanya seragam — tanpa itu lingkaran dan tebal garis
 * ikut gepeng, masalah yang sudah pernah muncul di pola sebelumnya.
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
      {/* Gelombang dasar, dari tepi bawah. */}
      <path
        className="s7-wave s7-wave--one"
        d="M0 360 C 220 440, 420 380, 620 420 C 800 450, 910 410, 1000 430 L 1000 520 L 0 520 Z"
      />
      <path
        className="s7-wave s7-wave--two"
        d="M0 420 C 250 370, 500 460, 750 410 C 880 380, 940 430, 1000 410 L 1000 520 L 0 520 Z"
      />

      {/* Aliran tipis di sudut kanan atas. */}
      <path
        className="s7-wave s7-wave--three"
        d="M600 0 C 720 140, 840 180, 1000 190 L 1000 0 Z"
      />

      <g className="s7-dot-matrix">
        {[0, 1, 2, 3, 4].map((column) =>
          [0, 1, 2].map((row) => (
            <circle
              key={`${column}-${row}`}
              cx={720 + column * 24}
              cy={150 + row * 24}
              r="3.5"
            />
          )),
        )}
      </g>

      <g className="s7-cloche">
        {/* Uap. */}
        <g className="s7-cloche__steam">
          <path d="M 765 210 Q 755 190 765 170 T 765 135" />
          <path d="M 800 200 Q 790 180 800 160 T 800 125" />
          <path d="M 835 210 Q 825 190 835 170 T 835 135" />
        </g>

        {/* Kubah: isian tipis plus garis luar. */}
        <path
          className="s7-cloche__dome"
          d="M 710 350 C 710 250, 890 250, 890 350 Z"
        />

        <circle className="s7-cloche__handle" cx="800" cy="235" r="9" />

        {/* Tatakan. */}
        <rect className="s7-cloche__tray" x="690" y="350" width="220" height="10" rx="5" />
        <rect className="s7-cloche__tray-2" x="670" y="362" width="260" height="6" rx="3" />
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
