/**
 * Pola latar hero oranye — dipakai beranda pelanggan (`CustomerHomeHero`) dan
 * beranda dapur merchant (`MerchantHomeHero`).
 *
 * Komposisinya dari versi terbaru: dua gelombang organik, kluster titik di
 * kanan atas. Bentuknya dipertahankan apa adanya. Yang disesuaikan hanya yang
 * bertabrakan dengan palet:
 *
 * - <linearGradient> merah menyala. Itu merah, bukan oranye Sa7tein. Karena
 *   <rect>-nya menutup penuh, ia akan mengganti warna merek di seluruh hero,
 *   bukan menambah di atasnya.
 * - <filter> feGaussianBlur. Glow terbaca sebagai neon, dan blur 140% area
 *   mahal di perangkat mobile.
 * - Warna di luar palet pada pin dan titik tengahnya.
 *
 * Opasitasnya ada di CSS dan ditahan di 4-14% (lihat `system/_hero.scss`):
 * angka di berkas aslinya mencapai 90% pada pin dan 45% pada uap — dikomposit
 * ke atas oranye merek, keduanya berhenti jadi oranye.
 *
 * `slice` membuat skalanya seragam, jadi lingkaran tetap bulat dan tebal garis
 * tetap rata di lebar layar mana pun. SVG inline diizinkan sebagai ornamen
 * dekoratif hero (docs/design/legacy-debt.json); ikon fungsional tetap lucide.
 */
export function Sa7teinHeroPattern() {
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
