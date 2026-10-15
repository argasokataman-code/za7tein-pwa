import { useMemo } from 'react'

import { idrToJod, jod } from '../data/currency'
import type { CurrencyCode } from '../types'
import { useLiveRate } from './useLiveRate'

/**
 * Mata uang tampilan untuk layar peran: **selalu JOD**.
 *
 * Dulu ada sakelar IDR/JOD per peran (slice `preferences`). Sakelarnya dihapus
 * karena tidak dipakai lagi — jadi tidak ada lagi preferensi yang bisa
 * mengubahnya, dan tak ada state tersimpan yang bisa menyimpang dari default.
 * Nominal tetap disimpan IDR (source of truth); padanan JOD dipasang di layer
 * tampilan.
 */
export const DEFAULT_CURRENCY: CurrencyCode = 'JOD'

/**
 * Pemformat uang **satu mata uang** (JOD), bukan pasangan IDR + JOD seperti
 * `data/currency.money`.
 *
 * Nama kembaliannya sengaja sama dengan helper data (`money`, `moneyPlain`,
 * `moneyFromJod`) supaya call-site cukup menukar impor + satu baris hook, tanpa
 * menyentuh tiap pemanggilan. Karena tampilannya kini tunggal, `moneyPlain` dan
 * `money` berperilaku sama — pasangan JOD sudah tidak dirender.
 *
 * Konsol SA tetap memakai helper pasangan di `data/currency` (dua mata uang
 * berdampingan) dan tidak memakai hook ini.
 */
export function useMoney() {
  // Berlangganan rate supaya nominal ikut berubah saat sync harian memperbarui
  // kurs. Formatter membaca rate aktif dari `data/currency` (modul-level).
  const { rate } = useLiveRate()
  return useMemo(() => {
    const format = (idr: number) => jod(idrToJod(idr))
    return {
      currency: DEFAULT_CURRENCY,
      money: format,
      moneyPlain: format,
      moneyFromJod: (valueJod: number) => jod(valueJod),
    }
  }, [rate.rate])
}
