import type { AuthPhoto } from '../types'

/**
 * Foto per layar auth. Semuanya sudah ada di `public/assets/img/menu/` dan
 * dipakai halaman menu toko, jadi tidak ada aset baru yang ditambahkan untuk
 * layar masuk. `alt` ditulis spesifik (bukan "foto makanan") karena halaman
 * ini adalah satu-satunya isi visual di layar.
 *
 * Setiap layar memakai foto berbeda supaya masuk dan daftar tidak terasa
 * seperti halaman yang sama.
 */
export const AUTH_PHOTO: Record<'signin' | 'signup' | 'merchant', AuthPhoto> = {
  signin: {
    src: '/assets/img/menu/sate-ayam.webp',
    alt: 'Sate ayam dibakar di atas bara, asap tipis menutupi panggangan',
  },
  signup: {
    src: '/assets/img/menu/nasi-goreng.webp',
    alt: 'Nasi goreng di mangkuk keramik dengan irisan timun',
  },
  merchant: {
    src: '/assets/img/menu/lontong.webp',
    alt: 'Lontong sayur di atas daun pisang, disajikan dengan sambal',
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
} as const
