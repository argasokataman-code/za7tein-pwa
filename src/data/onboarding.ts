import { ArrowRight, ArrowUpRight, Check, type LucideIcon } from 'lucide-react'

/**
 * Slide layar pengenalan customer.
 *
 * Semuanya memakai foto dari `public/assets/img/menu/` yang sudah ada di repo:
 * tidak ada ikon dekoratif sebagai pengganti gambar, dan tidak ada URL eksternal.
 * Foto menu dipakai karena layar ini menjelaskan produk makanan — bukan karena
 * asetnya kurang.
 *
 * `photoWidth`/`photoHeight` adalah dimensi berkas yang sebenarnya (dibaca dari
 * asetnya, bukan ditebak). Ketiganya portrait sedangkan panel hanya setinggi
 * bagian atas layar, jadi yang terpakai sepetak tengah lewat `object-fit: cover`.
 *
 * Urutannya mengikuti alur pesanan: pilih makanan → dapur memasak → kurir antar.
 * Isinya aturan PRD aktif, bukan copy pemasaran.
 */

export interface OnboardingSlide {
  id: string
  title: string
  text: string
  photo: string
  photoAlt: string
  photoWidth: number
  photoHeight: number
  cta: string
  /**
   * Ikon di dalam tombol aksi. Bagian dari tipe ini, bukan `types.ts`: tipe
   * domain di sana tidak boleh tahu-menahu soal komponen Lucide.
   */
  icon: LucideIcon
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'near',
    title: 'Makanan sekitar, selagi hangat',
    text: 'Pesan dari dapur di sekitarmu dan ikuti perjalanannya sampai tiba.',
    photo: '/assets/img/menu/sate-ayam.webp',
    photoAlt: 'Sate ayam dibakar di atas bara, asap tipis menutupi panggangan',
    photoWidth: 800,
    photoHeight: 1200,
    cta: 'Lanjut',
    icon: ArrowUpRight,
  },
  {
    id: 'kitchen',
    title: 'Antrean dapur terlihat',
    text: 'Estimasi masak 15, 25, atau 35 menit, jelas sejak checkout.',
    photo: '/assets/img/menu/nasi-goreng.webp',
    photoAlt: 'Nasi goreng di mangkuk keramik dengan irisan timun',
    photoWidth: 800,
    photoHeight: 1200,
    cta: 'Lanjut',
    icon: ArrowRight,
  },
  {
    id: 'deliver',
    title: 'Diantar satu perjalanan',
    text: 'Kurir menjemput beberapa pesanan sekaligus dengan rute terkunci.',
    photo: '/assets/img/menu/lontong.webp',
    photoAlt: 'Lontong sayur di atas daun pisang, disajikan dengan sambal',
    photoWidth: 800,
    photoHeight: 1422,
    cta: 'Mulai',
    icon: Check,
  },
]
