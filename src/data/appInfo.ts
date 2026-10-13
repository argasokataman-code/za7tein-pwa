/** Versi aplikasi yang ditampilkan di UI (badge dokumentasi + baris "Cek
 *  pembaruan"). Satu sumber, supaya keduanya tak pernah berbeda.
 *
 *  `BASE_VERSION` naik manual saat rilis fitur; sufiks `+<sha7>` disuntik saat
 *  build (lihat `vite.config.ts`) sehingga tiap deploy baru otomatis berubah dan
 *  SERAGAM di semua target dari commit yang sama. Build tanpa info commit =
 *  versi dasar saja. */
declare const __BUILD_SHA__: string

const BASE_VERSION = '3.4.20'

export const APP_VERSION =
  typeof __BUILD_SHA__ === 'string' && __BUILD_SHA__
    ? `${BASE_VERSION}+${__BUILD_SHA__}`
    : BASE_VERSION
