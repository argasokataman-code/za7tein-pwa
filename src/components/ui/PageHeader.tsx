import type { ReactNode } from 'react'

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
  /** Kontrol di kanan baris judul: satu aksi utama (mis. "Tambah"). */
  action?: ReactNode
  /**
   * Lonceng notifikasi di kanan baris judul. Selubung peran (merchant/kurir/CS)
   * menyalakannya secara default supaya tiap halaman konsol punya satu pintu ke
   * inbox peran; halaman pra-konsol (onboarding) mematikannya. Lonceng adalah
   * kontrol 44px, jadi kehadirannya juga mengecilkan judul ke langkah header —
   * perilaku yang sama dengan `back`/`action`.
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
 * Satu perilaku yang dibaca dari markup, bukan selera: begitu ada kontrol di
 * baris judul (`back` atau `action`), judulnya mengecil ke langkah header
 * (`--text-lg`). Sebabnya sama dengan judul yang berdampingan tombol kembali —
 * kontrol 44px memakan ruang di baris yang sama, dan judul hero `--text-2xl`
 * akan mendorong atau bersinggungan dengannya saat judulnya panjang. Tanpa
 * kontrol, judulnya tetap hero.
 */
export function PageHeader({
  title,
  prefix,
  eyebrow,
  subtitle,
  back,
  action,
  bell = false,
  bellPanel = false,
}: PageHeaderProps) {
  const hasControl = Boolean(back) || Boolean(action) || bell
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
      {bell || action ? (
        <div className={`${prefix}-header-action`}>
          {bell ? <NotificationBell panel={bellPanel} /> : null}
          {action}
        </div>
      ) : null}
    </header>
  )
}
