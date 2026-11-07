/**
 * Uang tunai untuk order COD.
 *
 * Customer memilih berapa uang yang akan disiapkan (uang pas atau dibulatkan),
 * kurir memasukkan uang yang benar-benar diterima, dan kembalian selalu
 * dihitung dari selisihnya. Satu modul supaya dua sisi tidak memakai pembulatan
 * berbeda.
 *
 * Pembulatan memakai JOD karena itu mata uang tunai di tempat (PRD §16.5);
 * nominal internal tetap IDR seperti seluruh app.
 */
import { idrToJod, jodToIdr, moneyPlain } from './currency'
import type { CartItem } from '../types'

export interface CodCashOption {
  id: 'exact' | 'round-1' | 'round-5'
  /** Label chip, mis. "Uang pas" atau "1 JOD". */
  label: string
  receivedIdr: number
  changeIdr: number
}

/**
 * Batas atas nominal bebas yang boleh diketik customer (JOD). Bukan aturan
 * bisnis: penjaga salah ketik supaya `10.000` tidak tampil sebagai kembalian
 * raksasa di kartu pembayaran.
 */
export const COD_CASH_MAX_JOD = 500

/** Selisih uang diterima dan tagihan. Kurang dari tagihan = 0, bukan negatif. */
export function codChangeIdr(totalIdr: number, receivedIdr: number): number {
  return Math.max(0, receivedIdr - totalIdr)
}

/**
 * Baca nominal JOD yang diketik customer menjadi IDR.
 *
 * Menerima koma maupun titik desimal (keyboard ponsel mengirim keduanya),
 * menolak tanda minus, huruf, lebih dari dua desimal, nol, dan nominal di atas
 * `COD_CASH_MAX_JOD`. `null` = kosong/tidak sah, sehingga pemanggil bisa jatuh
 * ke nominal lain tanpa menampilkan angka palsu.
 */
export function parseCodCashJod(text: string): { jod: number; idr: number } | null {
  const clean = text.trim().replace(/\s/g, '').replace(',', '.')
  if (!clean || !/^\d*\.?\d{0,2}$/.test(clean) || clean === '.') return null
  const jod = Number(clean)
  if (!Number.isFinite(jod) || jod <= 0 || jod > COD_CASH_MAX_JOD) return null
  return { jod, idr: jodToIdr(jod) }
}

/** Rincian tagihan tunai + pilihan kembalian untuk merchant dan kurir. */
export interface CodCashDue {
  subtotalIdr: number
  /** Ongkir, layanan, dan tips: `total − subtotal`, tidak pernah negatif. */
  extraIdr: number
  totalIdr: number
  options: CodCashOption[]
}

/**
 * Pilihan nominal cepat: uang pas, dibulatkan ke 1 JOD berikutnya, lalu ke
 * kelipatan 5 JOD berikutnya. Nominal yang sama dengan tagihan tidak diulang.
 */
export function codCashOptions(totalIdr: number): CodCashOption[] {
  const totalJod = idrToJod(totalIdr)
  const candidates: Array<{ id: CodCashOption['id']; jod: number; label: string }> = [
    { id: 'exact', jod: totalJod, label: 'Uang pas' },
    { id: 'round-1', jod: Math.ceil(totalJod), label: `${Math.ceil(totalJod)} JOD` },
    {
      id: 'round-5',
      jod: Math.ceil(totalJod / 5) * 5,
      label: `${Math.ceil(totalJod / 5) * 5} JOD`,
    },
  ]

  const options: CodCashOption[] = []
  for (const candidate of candidates) {
    const receivedIdr = candidate.id === 'exact' ? totalIdr : jodToIdr(candidate.jod)
    // Lewati nominal yang tidak menambah pilihan (mis. total sudah 1,00 JOD).
    if (options.some((option) => option.receivedIdr === receivedIdr)) continue
    options.push({
      id: candidate.id,
      label: candidate.label,
      receivedIdr,
      changeIdr: codChangeIdr(totalIdr, receivedIdr),
    })
  }
  return options
}

/**
 * Rincian uang tunai yang dibayar customer di depan pintu, dipakai sisi
 * merchant dan kurir supaya keduanya menyiapkan kembalian dari angka yang sama.
 *
 * Subtotal dihitung dari item; sisanya (`total − subtotal`) adalah ongkir,
 * layanan, dan tips yang tidak dipecah karena `MerchantOrder`/`CourierTask`
 * tidak menyimpan kolomnya (lihat komentar `InvoiceRow` di types.ts).
 */
export function codCashDue(
  items: Pick<CartItem, 'price' | 'quantity'>[],
  totalIdr: number,
): CodCashDue {
  const subtotalIdr = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return {
    subtotalIdr,
    extraIdr: Math.max(0, totalIdr - subtotalIdr),
    totalIdr,
    options: codCashOptions(totalIdr),
  }
}

/**
 * Kalimat bantu di layar customer, mis. "Siapkan uang pas" / "Kembalian …".
 * `format` dioper dari layar karena mode tampilan (IDR/JOD) milik hook uang,
 * bukan modul data — tanpa itu satu kartu bisa mencampur dua satuan.
 */
export function codCashHint(
  totalIdr: number,
  receivedIdr: number | null,
  format: (idr: number) => string = moneyPlain,
): string {
  if (receivedIdr === null || receivedIdr <= totalIdr) return 'Siapkan uang pas, tanpa kembalian.'
  return `Siapkan ${format(receivedIdr)}, kembalian ${format(codChangeIdr(totalIdr, receivedIdr))}.`
}
