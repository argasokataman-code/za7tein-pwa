import { BackButton } from './BackButton'
import { NotificationBell } from './NotificationBell'

export interface PageHeaderProps {
  /** Judul halaman. */
  title: string
  /**
   * Awalan kelas peran, mis. `merchant` — menghasilkan `merchant-header`,
   * `merchant-header-copy`, `merchant-eyebrow`, `merchant-title`. Tiap role
   * memakai pola yang sama, jadi awalannya cukup satu kata.
   */
  prefix: string
  /** Baris kecil di atas judul, mis. "Antrean dapur". Opsional. */
  eyebrow?: string
  /** Baris keterangan di bawah judul. Opsional; hanya dipakai header konsol desktop. */
  subtitle?: string
  /**
   * Tombol kembali di tepi **kiri** bar. `true` kembali satu langkah
   * (`navigate(-1)`); string = tujuan tetap. Ini kontrol 44px, jadi judulnya
   * ikut turun ke langkah header. Tombol kembali **selalu** di sini — jangan
   * ditaruh di ujung halaman; tepi kiri adalah tempat jempol mencarinya.
   */
  back?: string | boolean
  /**
   * Lonceng notifikasi di kanan baris judul. **Mati secara default.** Lonceng
   * hanya milik layar **akar** peran (beranda), tempat inbox memang jadi tujuan
   * tingkat atas; halaman anak sudah punya tombol kembali + judul, dan ikon
   * inbox di sana hanya menambah keramaian di pojok yang tak dijangkau jempol.
   * Beranda merchant/kurir memakai lonceng hero-nya sendiri; hanya beranda CS
   * yang menyalakan prop ini. Lonceng adalah kontrol 44px, jadi kehadirannya
   * juga mengecilkan judul ke langkah header — sama seperti `back`.
   */
  bell?: boolean
  /**
   * Di konsol web desktop (≥901px) lonceng membuka popup daftar notifikasi
   * alih-alih pindah halaman; di lebar ponsel tetap pindah ke inbox. Hanya
   * selubung konsol desktop yang menyalakannya. Default mati.
   */
  bellPanel?: boolean
}

/**
 * Header halaman untuk merchant, kurir, dan panel CS.
 *
 * Menggantikan isi tiga komponen yang sama persis — `MerchantPageHeader`,
 * `CourierPageHeader` — yang berbeda hanya pada awalan
 * kelas. Prop dan markup-nya identik, jadi tiga salinan itu tidak menambah
 * kemampuan apa pun; ia hanya membuat satu perbaikan harus diulang tiga kali,
 * persis pola yang dilarang DNA ("pola sama muncul dua kali, ekstrak komponen
 * bersama").
 *
 * Awalan kelas tetap berbeda per role dan tidak disatukan: 27 halaman sudah
 * memakainya, dan `.courier-back` misalnya bergantung pada awalan itu untuk hal
 * di luar header. Yang disatukan di sini **struktur dan perilakunya**, bukan
 * namanya.
 *
 * Satu perilaku yang dibaca dari markup, bukan selera: begitu ada kontrol di
 * baris judul (`back` atau lonceng), judulnya mengecil ke langkah header
 * (`--text-lg`). Sebabnya sama dengan judul yang berdampingan tombol kembali —
 * kontrol 44px memakan ruang di baris yang sama, dan judul hero `--text-2xl`
 * akan mendorong atau bersinggungan dengannya saat judulnya panjang. Tanpa
 * kontrol, judulnya tetap hero.
 *
 * **Tidak ada slot aksi di sini.** Aksi utama halaman tinggal di zona jempol
 * (bilah bawah atau tombol melayang), bukan di pojok kanan atas: pojok itu
 * tempat mata, bukan tempat jempol (senior-fe mobile G-02/G-03). Slot `action`
 * dulu ada dan hanya dipakai satu halaman, jadi ia dihapus — bukan karena tidak
 * terpakai, tapi karena kehadirannya mengundang pola yang salah.
 */
export function PageHeader({
  title,
  prefix,
  eyebrow,
  subtitle,
  back,
  bell = false,
  bellPanel = false,
}: PageHeaderProps) {
  const hasControl = Boolean(back) || bell
  return (
    <header className={hasControl ? `${prefix}-header ${prefix}-header--has-control` : `${prefix}-header`}>
      {back ? (
        <BackButton className={`${prefix}-back`} to={typeof back === 'string' ? back : undefined} />
      ) : null}
      <div className={`${prefix}-header-copy`}>
        {eyebrow ? <p className={`${prefix}-eyebrow`}>{eyebrow}</p> : null}
        <h1 className={`${prefix}-title`}>{title}</h1>
        {subtitle ? <p className={`${prefix}-header-sub`}>{subtitle}</p> : null}
      </div>
      {bell ? (
        <div className={`${prefix}-header-action`}>
          <NotificationBell panel={bellPanel} />
        </div>
      ) : null}
    </header>
  )
}
