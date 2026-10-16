/**
 * Katalog emit notifikasi + penjaga audience (PRD aktif `sa7tein-mvp-2026-10-11`
 * §20.3, CUS-29). Fungsi murni: layar hanya membaca katalog, keputusan "event apa
 * ke siapa" tinggal di sini supaya bisa diuji tanpa browser.
 *
 * Empat kanal customer §20.3 masing-masing punya satu entri, dan tiap entri
 * menyebut **siapa yang mengirimnya**. Itu penting: promo baru dan toko baru yang
 * menjangkau alamat default adalah **job BE** (butuh data lintas pengguna), jadi
 * repo ini tidak boleh mengaku punya jalur emit-nya.
 */
import type { AppNotification, NotificationKind, NotifAudience } from '../types'
import { ALMOST_ARRIVED_CONFIGURABLE, ALMOST_ARRIVED_MINUTES } from './tracking'

/** Event yang layak jadi notifikasi menurut §20.3 (CUS-29). */
export type NotifEvent =
  | 'order_status'
  | 'courier_almost_arrived'
  | 'promo_published'
  | 'merchant_new_coverage'

export interface NotifEmit {
  audience: NotifAudience
  kind: NotificationKind
  title: string
  body: string
  /** `fe` = ada pemanggil di repo ini; `be` = job backend, belum ada di repo. */
  emit: 'fe' | 'be'
  /** Baris PRD yang menuntutnya — katalog tidak boleh jadi daftar karangan. */
  sumber: string
}

export const NOTIF_EMIT: Record<NotifEvent, NotifEmit> = {
  order_status: {
    audience: 'customer',
    kind: 'order',
    title: 'Status pesanan berubah',
    body: 'Buka pesanan untuk melihat tahap terbarunya.',
    emit: 'fe',
    sumber: '§20.3, CUS-29',
  },
  courier_almost_arrived: {
    audience: 'customer',
    kind: 'courier',
    title: 'Kurir hampir sampai',
    body:
      `Kurir masuk ambang ${ALMOST_ARRIVED_MINUTES} menit dari alamat` +
      (ALMOST_ARRIVED_CONFIGURABLE ? '.' : ' (ambang konfigurasi ops).'),
    emit: 'fe',
    sumber: '§20.3, §9.7',
  },
  promo_published: {
    audience: 'customer',
    kind: 'promo',
    title: 'Program baru dari Sa7tein',
    body: 'Ada program baru yang berlaku untuk pesananmu.',
    // Butuh tabel program + job penyiaran di BE (agenda M10).
    emit: 'be',
    sumber: '§20.3, CUS-29',
  },
  merchant_new_coverage: {
    audience: 'customer',
    kind: 'system',
    title: 'Toko baru menjangkau alamatmu',
    body: 'Ada toko baru yang meng-cover alamat default kamu.',
    // Butuh perbandingan coverage toko vs alamat default lintas pengguna (BE).
    emit: 'be',
    sumber: '§20.3, CUS-29',
  },
}

/**
 * Audience dari nilai mentah kolom `notifications.audience`. Nilai yang tidak
 * dikenal → `undefined` (bukan ditebak ke peran mana pun).
 */
const NOTIF_AUDIENCES: NotifAudience[] = ['customer', 'merchant', 'courier', 'cs']

export function notifAudienceOf(
  raw: string | null | undefined,
): NotifAudience | 'all' | undefined {
  if (raw === 'all') return 'all'
  return NOTIF_AUDIENCES.includes(raw as NotifAudience) ? (raw as NotifAudience) : undefined
}

/**
 * Baris ini boleh terlihat oleh audience ini?
 *
 * `all` = siaran (§20.3, kolom `notifications.audience`); `undefined` = baris tanpa
 * kolom audience, dan itu **tidak disembunyikan** karena menyembunyikan data yang
 * tak bisa dibuktikan kepemilikannya justru bikin inbox kosong tanpa sebab.
 */
export function notifVisibleTo(
  row: NotifAudience | 'all' | undefined,
  audience: NotifAudience,
): boolean {
  if (row === undefined) return true
  return row === 'all' || row === audience
}

/**
 * Kotak masuk satu peran. Query BE sudah menyaring per audience; ini penjaga
 * kedua di klien supaya baris yang salah audience (sisa cache, siaran yang tidak
 * ditandai, balasan endpoint lain) tidak muncul di peran yang salah.
 */
export function notificationsFor(
  items: AppNotification[],
  audience: NotifAudience,
): AppNotification[] {
  return items.filter((n) => notifVisibleTo(n.audience, audience))
}
