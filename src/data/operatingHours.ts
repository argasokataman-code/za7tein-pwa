/**
 * Jadwal buka toko per hari (MER, setelan merchant).
 *
 * Backend hanya punya satu pasang `merchants.open_time`/`close_time`, jadi
 * jadwal 7 hari ini hidup di state sesi. Saat disimpan, pasangan hari berjalan
 * ikut ditulis ke dua kolom itu supaya sisi pelanggan tidak bertentangan.
 */
import type { OperatingHoursDay } from '../types'

/** Label hari, indeks = `Date#getDay()` (0 = Minggu). */
export const WEEKDAY_LABELS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const

/** Urutan tampilan mulai Senin, bukan urutan `getDay`. */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

/** Jam cadangan bila toko belum pernah mengatur jadwal. */
export const DEFAULT_OPEN = '07:00'
export const DEFAULT_CLOSE = '22:00'

export const mockOperatingHours: OperatingHoursDay[] = WEEKDAY_ORDER.map((day) => ({
  day,
  open: day === 0 ? '09:00' : DEFAULT_OPEN,
  close: day === 0 ? '20:00' : DEFAULT_CLOSE,
  closed: false,
}))

/** Baris jadwal untuk satu hari; tak ada baris = pakai jam cadangan. */
export function hoursForDay(
  schedule: OperatingHoursDay[],
  day: number = new Date().getDay(),
): OperatingHoursDay {
  return (
    schedule.find((row) => row.day === day) ?? {
      day,
      open: DEFAULT_OPEN,
      close: DEFAULT_CLOSE,
      closed: false,
    }
  )
}

/** Jam toko hari ini siap tampil, mis. "07:00 – 22:00" atau "Tutup". */
export function hoursLabel(row: OperatingHoursDay): string {
  return row.closed ? 'Tutup' : `${row.open} – ${row.close}`
}

/**
 * Baris yang jamnya tidak masuk akal (tutup sebelum/sama dengan buka) — hanya
 * hari yang tidak libur yang diperiksa. `HH:MM` 24 jam, jadi perbandingan
 * string sudah benar.
 */
export function invalidHoursRows(schedule: OperatingHoursDay[]): OperatingHoursDay[] {
  return schedule.filter((row) => !row.closed && row.close <= row.open)
}
