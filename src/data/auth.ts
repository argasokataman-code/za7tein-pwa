import type { AuthPhoto } from '../types'

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
