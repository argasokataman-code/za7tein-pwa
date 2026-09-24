/**
 * Isi layar masuk dan daftar.
 *
 * Teksnya sengaja hidup di sini, bukan di dalam JSX, karena dua alasan:
 *
 *   1. `AuthLayout` adalah satu-satunya kerangka untuk lima layar. Yang berbeda
 *      antar layar hanya judul, pembuka, dan bentuk formulirnya — jadi yang
 *      berbeda tinggal data, bukan markup.
 *   2. Sebelumnya layar customer dan merchant menulis copy masing-masing dan
 *      hasilnya bercampur: satu halaman berbahasa Inggris ("Create Your
 *      Account", "Join us today and unlock endless possibilities"), halaman
 *      lain berbahasa Indonesia. Satu berkas = satu tempat untuk memeriksa.
 *
 * Tidak ada klaim yang tidak bisa dibuktikan. Angka yang disebut (estimasi
 * masak 15/25/35 menit, fee merchant 0,15 JOD, fee customer 0,22 JOD, modal 5
 * JOD, kota Irbid) berasal dari PRD aktif `irbid-mvp-v2-2026-09-21`. Tidak ada
 * testimoni, tidak ada jumlah pengguna, tidak ada logo mitra.
 */

/** Judul layar status merchant; halaman perlu judul yang sama. */
export const PENDING_COPY = {
  title: 'Menunggu persetujuan',
  subtitle: 'Pendaftaran tokomu sedang ditinjau tim CS. Setelah disetujui, toko bisa menerima order.',
  note: 'Halaman ini hanya alur layar: repo ini front-end, jadi belum ada backend yang benar-benar menyetujui toko.',
} as const

/**
 * Dua fakta yang menentukan isi formulir. Merchant punya alamat toko (dipakai
 * kurir dan guard zona), pembeli tidak. Kalau salah satu berubah, ubah di sini
 * supaya layar masuk/daftar tidak diam-diam berbeda.
 */
export const AUTH_FACTS = {
  /** PRD aktif memakai Irbid sebagai kota layanan. */
  city: 'Irbid',
  /** Dua zona layanan PRD aktif; ditampilkan sebagai pilihan, bukan teks bebas. */
  zones: ['Hijazi', 'Syimali'],
} as const
