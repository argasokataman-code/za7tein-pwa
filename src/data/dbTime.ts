/**
 * Waktu DB (D1/Postgres) → milidetik epoch.
 *
 * Bentuk yang keluar dari D1: `2026-10-18 09:15:00+00` (spasi, offset `+00`),
 * kadang tanpa offset sama sekali. `new Date()` mentah menebak **waktu lokal**
 * untuk bentuk tanpa offset, jadi selisihnya sebesar zona waktu (Jakarta +07).
 * Akibatnya jendela batal 1 menit lahir sudah lewat sebelum sempat tampil.
 *
 * Ditaruh di lapisan `data/` seperti logika turunan lain (AGENTS §11) supaya
 * murni dan bisa diperiksa tanpa React: `npm run check:db-time`.
 */
export function dbTimeMs(value: string): number {
  const trimmed = value.trim().replace(' ', 'T')
  const iso = /[zZ]$/.test(trimmed)
    ? trimmed
    : /[+-]\d{2}$/.test(trimmed)
      ? `${trimmed}:00`
      : /[+-]\d{2}:?\d{2}$/.test(trimmed)
        ? trimmed
        : `${trimmed}Z`
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? ms : Date.now()
}
