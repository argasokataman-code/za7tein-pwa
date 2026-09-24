import type { ReactNode } from 'react'

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
  /** Kontrol di kanan baris judul: tombol kembali, atau satu aksi utama. */
  action?: ReactNode
}

/**
 * Header halaman untuk merchant, kurir, dan panel CS.
 *
 * Menggantikan isi tiga komponen yang sama persis — `MerchantPageHeader`,
 * `CourierPageHeader`, dan `AdminPageHeader` — yang berbeda hanya pada awalan
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
 * Satu perilaku yang dibaca dari markup, bukan selera: begitu ada `action` di
 * baris judul, judulnya mengecil ke langkah header (`--text-lg`). Sebabnya sama
 * dengan judul yang berdampingan tombol kembali — kontrol 44px memakan ruang di
 * baris yang sama, dan judul hero `--text-2xl` akan mendorong atau bersinggungan
 * dengannya saat judulnya panjang. Tanpa `action`, judulnya tetap hero.
 */
export function PageHeader({ title, prefix, eyebrow, action }: PageHeaderProps) {
  return (
    <header className={action ? `${prefix}-header ${prefix}-header--has-control` : `${prefix}-header`}>
      <div className={`${prefix}-header-copy`}>
        {eyebrow ? <p className={`${prefix}-eyebrow`}>{eyebrow}</p> : null}
        <h1 className={`${prefix}-title`}>{title}</h1>
      </div>
      {action ? <div className={`${prefix}-header-action`}>{action}</div> : null}
    </header>
  )
}
