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
 * Pola latar hero, dipecah dua lapis.
 *
 * Versi sebelumnya memakai satu SVG dengan `preserveAspectRatio="none"`.
 * Itu memaksa viewBox 1000x520 bertemu kotak hero yang rasionya 1.31, jadi
 * skalanya tidak seragam: 0.390 mendatar melawan 0.572 tegak, beda 1.47x.
 * Akibatnya lingkaran r=5 tampil sebagai lonjong 3.9x5.7px, dan stroke 9 unit
 * menjadi 3.5px mendatar tapi 5.1px tegak — garisnya tidak sama tebal.
 *
 * Jadi hanya bentuk aliran yang boleh diregangkan; ia organik dan tidak punya
 * acuan bulat. Titik dan cloche dipisah ke lapisnya sendiri yang diskalakan
 * seragam, supaya lingkarannya tetap bulat dan tebal garisnya tetap rata.
 */
function Sa7teinHeroWaves() {
  return (
    <svg
      className="s7-hero-waves"
      viewBox="0 0 1000 260"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* Dua bentuk mengalir yang naik dari tepi bawah. Yang kedua memakai
          nada lebih gelap supaya terbaca sebagai lapisan, bukan tumpukan
          bentuk yang mengambang sendiri-sendiri. */}
      <path
        className="s7-pattern-fill s7-pattern-fill--one"
        d="M0 240
           C130 170 240 190 360 215
           C490 242 610 190 720 200
           C850 212 930 250 1000 260
           L1000 260
           L0 260 Z"
      />

      <path
        className="s7-pattern-fill s7-pattern-fill--two"
        d="M0 260
           C180 195 310 160 470 210
           C640 260 760 210 1000 180
           L1000 260 Z"
      />
    </svg>
  )
}

function Sa7teinHeroMotif() {
  return (
    <svg
      className="s7-hero-motif"
      viewBox="0 0 460 520"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {/* Bentuk organik besar yang terpotong di tepi kanan — memberi kesan
          komposisi yang lebih luas dari kotaknya. */}
      <path
        className="s7-pattern-fill s7-pattern-fill--three"
        d="M362 -30
           C437 70 422 180 402 270
           C382 350 392 450 492 540
           L492 -30 Z"
      />

      {/* Matriks titik — tekstur penunjang, jadi opasitasnya di bawah cloche. */}
      <g className="s7-dot-matrix">
        {[0, 1, 2, 3, 4].map((column) =>
          [0, 1, 2].map((row) => (
            <circle
              key={`${column}-${row}`}
              cx={216 + column * 26}
              cy={128 + row * 26}
              r="5"
            />
          )),
        )}
      </g>

      {/* Cloche. Opasitasnya di ujung atas rentang 6–14% yang diminta: pada
          11% bentuknya cuma terbaca sebagai bercak, padahal ini satu-satunya
          unsur yang benar-benar mengatakan "makanan". */}
      <g className="s7-cloche" data-hanya-lebar>
        <path d="M231 366 H401" />
        <path d="M251 351 C258 286 301 256 316 256 C356 256 381 296 386 351" />
        <path d="M312 256 C311 246 318 236 326 236" />
        <path d="M286 221 C276 206 281 194 291 181" />
        <path d="M331 221 C321 206 328 193 336 181" />
        <path d="M368 224 C361 210 366 198 375 188" />
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
      <Sa7teinHeroWaves />
      <Sa7teinHeroMotif />

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
