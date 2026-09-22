/**
 * Nomor WA sebagai identitas + jalur fallback (R-PUSH-01, M8).
 *
 * PRD v2 meminta validasi E.164 dengan dua kode negara: `+962` (Jordan/Irbid)
 * dan `+62` (Indonesia). Fungsi di sini satu-satunya tempat aturan itu ditulis —
 * form, halaman pengaturan, dan tombol fallback WA memakai ini, bukan regex
 * masing-masing.
 */
export const WA_COUNTRY_CODES = ['+962', '+62'] as const

export type WaCountryCode = (typeof WA_COUNTRY_CODES)[number]

/** E.164 ringkas: `+` lalu kode negara yang didukung dan 7–12 digit lagi. */
export function isE164(value: string): boolean {
  return /^\+(962|62)\d{7,12}$/.test(value.replace(/[\s.-]/g, ''))
}

/**
 * Normalisasi input pengguna ke E.164. Nomor lokal (`0812…`) memakai kode negara
 * yang dipilih; nomor yang sudah ber-kode negara dibiarkan. Idempoten.
 */
export function toE164(value: string, countryCode: WaCountryCode = '+62'): string {
  const digits = value.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('0')) return `${countryCode}${digits.slice(1)}`
  if (digits.startsWith('962') || digits.startsWith('62')) return `+${digits}`
  return `${countryCode}${digits}`
}

/** Deep link fallback WA — `wa.me` menerima digit saja, tanpa `+`. */
export function waLink(e164: string, text: string): string {
  return `https://wa.me/${e164.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

export const WA_PHONE_HINT =
  'Nomor WhatsApp, format internasional: +62… (Indonesia) atau +962… (Jordan).'
