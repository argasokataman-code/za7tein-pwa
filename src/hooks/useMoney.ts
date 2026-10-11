import { useMemo } from 'react'

import { idrToJod, jod, jodToIdr, moneyPlain } from '../data/currency'
import type { CurrencyCode } from '../types'
import { useAppSelector } from './useAppStore'
import { useLiveRate } from './useLiveRate'

/** Mata uang default saat peran belum pernah memilih. */
export const DEFAULT_CURRENCY: CurrencyCode = 'JOD'

/** Mata uang tampilan aktif untuk peran yang sedang masuk. */
export function useDisplayCurrency(): CurrencyCode {
  const role = useAppSelector((s) => s.auth.role)
  return useAppSelector(
    (s) => (role ? s.preferences?.currency?.[role] : undefined) ?? DEFAULT_CURRENCY,
  )
}

/**
 * Pemformat uang **satu mata uang** sesuai preferensi peran (bukan pasangan
 * IDR + JOD seperti `data/currency.money`).
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
  const currency = useDisplayCurrency()
  // Berlangganan rate supaya nominal ikut berubah saat sync harian memperbarui
  // kurs. Formatter membaca rate aktif dari `data/currency` (modul-level).
  const { rate } = useLiveRate()
  return useMemo(() => {
    const format = (idr: number) =>
      currency === 'JOD' ? jod(idrToJod(idr)) : moneyPlain(idr)
    return {
      currency,
      money: format,
      moneyPlain: format,
      moneyFromJod: (valueJod: number) => format(jodToIdr(valueJod)),
    }
  }, [currency, rate.rate])
}
