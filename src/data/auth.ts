import type { AuthBannerSlide, AuthPhoto } from '../types'

/**
 * Foto per layar auth. Semuanya sudah ada di `public/assets/img/menu/` dan
 * dipakai halaman menu toko, jadi tidak ada aset baru yang ditambahkan untuk
 * layar masuk. `alt` ditulis spesifik (bukan "foto makanan") karena halaman
 * ini adalah satu-satunya isi visual di layar.
 *
 * `width`/`height` adalah dimensi berkas yang sebenarnya (dibaca dari asetnya,
 * bukan ditebak): semuanya portrait, dan panel foto hanya setinggi ~150px di
 * ponsel, jadi yang terpakai cuma sepetak tengah lewat `object-fit: cover`.
 *
 * Setiap layar memakai foto berbeda supaya masuk dan daftar tidak terasa
 * seperti halaman yang sama.
 */
export const AUTH_PHOTO: Record<'signin' | 'signup' | 'merchant' | 'courier', AuthPhoto> = {
  signin: {
    src: '/assets/img/menu/sate-ayam.webp',
    alt: 'Sate ayam dibakar di atas bara, asap tipis menutupi panggangan',
    width: 800,
    height: 1200,
  },
  signup: {
    src: '/assets/img/menu/nasi-goreng.webp',
    alt: 'Nasi goreng di mangkuk keramik dengan irisan timun',
    width: 800,
    height: 1200,
  },
  merchant: {
    src: '/assets/img/menu/lontong.webp',
    alt: 'Lontong sayur di atas daun pisang, disajikan dengan sambal',
    width: 800,
    height: 1422,
  },
  courier: {
    src: '/assets/img/menu/es-teh-manis.webp',
    alt: 'Es teh manis dalam gelas tinggi, es batu dan irisan mangga di tepi gelas, permukaan gelas berembun',
    width: 800,
    height: 1200,
  },
}

/**
 * Foto kepala layar masuk customer (varian `brandLayout="cover"`).
 *
 * Empat foto lama, bukan aset baru: kepala kini foto penuh, bukan tekstur 12%,
 * jadi warnanya harus benar dan tidak ada lapisan oranye di atasnya. Urutannya
 * ditentukan supaya dua foto bersambung tidak sama-sama bernuansa cokelat, dan
 * foto pertama (yang selalu tampak saat animasi dimatikan) adalah yang paling
 * jelas "makanan".
 */
export const AUTH_COVER_PHOTOS: readonly AuthPhoto[] = [
  AUTH_PHOTO.signin,
  AUTH_PHOTO.courier,
  AUTH_PHOTO.signup,
  AUTH_PHOTO.merchant,
]

/**
 * Foto kepala layar daftar customer. Urutan mengikuti irisan
 * `docs/design/slice/signup-customer.html`: foto yang paling menandai layar
 * daftar (`signup` = nasi goreng) tampil lebih dulu, sama seperti layar masuk
 * dimulai dari foto `signin`.
 */
export const AUTH_SIGNUP_COVER_PHOTOS: readonly AuthPhoto[] = [
  AUTH_PHOTO.signup,
  AUTH_PHOTO.signin,
  AUTH_PHOTO.merchant,
  AUTH_PHOTO.courier,
]

/**
 * Foto kepala layar masuk kurir, urutan dari irisan
 * `docs/design/slice/login-courier.html`: es teh dulu (foto layar kurir).
 */
export const AUTH_COURIER_COVER_PHOTOS: readonly AuthPhoto[] = [
  AUTH_PHOTO.courier,
  AUTH_PHOTO.signin,
  AUTH_PHOTO.signup,
  AUTH_PHOTO.merchant,
]

/**
 * Foto kepala layar daftar toko. Urutan dari irisan
 * `docs/design/slice/signup-merchant.html`: lontong dulu (foto layar merchant),
 * lalu sate, nasi goreng, dan sate kambing. Foto terakhir belum ada di
 * `AUTH_PHOTO` karena hanya dipakai irisan ini; dimensinya dibaca dari berkas
 * (800x451, satu-satunya foto lanskap di kepala auth).
 */
export const AUTH_MERCHANT_COVER_PHOTOS: readonly AuthPhoto[] = [
  AUTH_PHOTO.merchant,
  AUTH_PHOTO.signin,
  AUTH_PHOTO.signup,
  {
    src: '/assets/img/menu/sate-kambing.webp',
    alt: 'Sate kambing di atas panggangan, ditata di piring saji',
    width: 800,
    height: 451,
  },
]

/**
 * Pembeda peran. Ditampilkan di panel foto supaya pengguna tahu ia sedang
 * masuk ke aplikasi yang benar, bukan hanya di judul yang mudah terlewat.
 * Aplikasi ini punya manifest terpisah per peran, jadi dua role memang dua
 * aplikasi terinstal yang berbeda.
 */
export const AUTH_ROLE_LABEL = {
  customer: 'Pembeli',
  merchant: 'Merchant',
  courier: 'Kurir',
} as const

/**
 * Banner carousel layar masuk. Tiap gambar memuat satu janji produk sebagai
 * teks besar di dalamnya, jadi `alt` menyalin janji itu (pembaca layar tidak
 * melihat gambarnya). Isinya tetap dari PRD aktif `irbid-mvp-v2-2026-09-21`:
 * estimasi masak 15/25/35 menit, ongkir ditanggung merchant, dan COD. Aset
 * lokal di `public/assets/img/auth/`, dibuat untuk repo ini.
 */
export const AUTH_BANNER_SLIDES: AuthBannerSlide[] = [
  {
    src: '/assets/img/auth/auth-banner-estimasi.webp',
    alt: 'Estimasi masak 15, 25, atau 35 menit, jelas sejak checkout.',
  },
  {
    src: '/assets/img/auth/auth-banner-ongkir.webp',
    alt: 'Ongkir ditanggung merchant, bukan ditambahkan ke pesananmu.',
  },
  {
    src: '/assets/img/auth/auth-banner-cod.webp',
    alt: 'Bayar di tempat (COD) saat pesanan tiba.',
  },
]
