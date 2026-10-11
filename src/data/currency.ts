import type { ExchangeRate } from '../types'

/**
 * Fallback kurs IDR→JOD — dipakai sebelum sync live pertama berhasil, atau
 * ketika provider tak terjangkau (OQ-28: fetch gagal → pakai rate terakhir,
 * jangan blokir transaksi).
 *
 * Semua nominal disimpan **IDR** (source of truth); JOD hanya untuk tampilan dan
 * tidak pernah jadi nilai transaksi. Rate aktif dibaca lewat `getExchangeRate()`
 * dan di-seed sync live (sehari sekali, lihat `refreshLiveRate`).
 */
export const MOCK_EXCHANGE_RATE: ExchangeRate = {
  base: 'JOD',
  quote: 'IDR',
  rate: 23000,
  fetchedAt: '2026-09-23T06:00:00+07:00',
  source: 'Mock',
}

/** Kalimat wajib di dekat nominal JOD (R-CURR-01). */
export const RATE_DISCLAIMER = 'kurs estimasi, mengikuti kurs harian'

/**
 * Provider kurs live (keputusan menutup OQ-26): `fawazahmed0/exchange-api`,
 * JSON statis di CDN GitHub/jsDelivr — tanpa API key, tanpa backend. Mirror
 * kedua dipakai kalau CDN utama gagal.
 */
export const LIVE_RATE_SOURCE = 'fawazahmed0/exchange-api'
const LIVE_RATE_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jod.json'
const LIVE_RATE_MIRROR_URL = 'https://latest.currency-api.pages.dev/v1/currencies/jod.json'

/** Umur maksimal sebelum dianggap basi: **sehari sekali update**. */
export const RATE_TTL_MS = 24 * 60 * 60 * 1000
const RATE_CACHE_KEY = 'sa7tein.liveRate'

function readCachedRate(): ExchangeRate | null {
  try {
    const raw = localStorage.getItem(RATE_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ExchangeRate
    if (typeof parsed?.rate !== 'number' || !(parsed.rate > 0)) return null
    if (typeof parsed?.fetchedAt !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

// Rate aktif: cache live kalau ada dan masuk akal, selain itu mock. Modul-level
// supaya formatter murni (money, idrToJod, …) tetap bisa dipanggil tanpa
// menerima rate sebagai argumen di semua call-site.
let activeRate: ExchangeRate = readCachedRate() ?? MOCK_EXCHANGE_RATE

const rateListeners = new Set<() => void>()

/** Rate aktif saat ini (reaktif lewat `subscribeRate`). */
export function getExchangeRate(): ExchangeRate {
  return activeRate
}

/** Langganan perubahan rate — dipakai `useSyncExternalStore` di `useLiveRate`. */
export function subscribeRate(listener: () => void): () => void {
  rateListeners.add(listener)
  return () => {
    rateListeners.delete(listener)
  }
}

function setExchangeRate(next: ExchangeRate): void {
  activeRate = next
  try {
    localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(next))
  } catch {
    // localStorage bisa penuh/diblokir — rate tetap berlaku untuk sesi ini.
  }
  rateListeners.forEach((listener) => listener())
}

/** Rate basi kalau belum pernah live atau umurnya ≥ sehari. */
export function isRateStale(now: number = Date.now()): boolean {
  if (activeRate.source === MOCK_EXCHANGE_RATE.source) return true
  const fetched = Date.parse(activeRate.fetchedAt)
  if (Number.isNaN(fetched)) return true
  return now - fetched >= RATE_TTL_MS
}

/**
 * Ambil kurs live dari provider. Melempar kalau kedua URL gagal atau rate tak
 * valid — pemanggil memutuskan fallback (jangan blokir transaksi).
 */
export async function fetchLiveRate(fetchImpl: typeof fetch = fetch): Promise<ExchangeRate> {
  const load = async (url: string) => {
    const res = await fetchImpl(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as { jod?: Record<string, number> }
  }
  let data: { jod?: Record<string, number> }
  try {
    data = await load(LIVE_RATE_URL)
  } catch {
    data = await load(LIVE_RATE_MIRROR_URL)
  }
  const rate = Number(data?.jod?.idr)
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('rate live tidak valid')
  return {
    base: 'JOD',
    quote: 'IDR',
    rate,
    fetchedAt: new Date().toISOString(),
    source: LIVE_RATE_SOURCE,
  }
}

let inFlight: Promise<ExchangeRate> | null = null

/**
 * Segarkan rate bila basi (atau `force`). Aman dipanggil dari banyak tempat —
 * permintaan yang bersamaan berbagi satu promise. Gagal → rate lama dibiarkan,
 * promise-nya melempar supaya UI bisa memberi tahu.
 */
export function refreshLiveRate(force = false): Promise<ExchangeRate> {
  if (inFlight) return inFlight
  if (!force && !isRateStale()) return Promise.resolve(activeRate)
  inFlight = fetchLiveRate()
    .then((next) => {
      setExchangeRate(next)
      return next
    })
    .finally(() => {
      inFlight = null
    })
  return inFlight
}

/** IDR saja — untuk tempat sempit (label tombol, aria-label) yang tak muat pasangan. */
export function moneyPlain(idr: number): string {
  return 'Rp' + Math.round(idr).toLocaleString('id-ID')
}

/** Padanan JOD, dibulatkan 2 desimal — pembulatan hanya di layer tampilan. */
export function idrToJod(idr: number): number {
  return Number((idr / activeRate.rate).toFixed(2))
}

/**
 * Kembalikan nominal JOD ke IDR utuh. Dipakai untuk konstanta yang PRD tetapkan
 * dalam JOD (fee, ambang top-up) supaya state tetap IDR (R-CURR-01).
 */
export function jodToIdr(value: number): number {
  return Math.round(value * activeRate.rate)
}

/** Nominal JOD, mis. `100.223,71 JOD` — pemisah ribuan sama dengan `moneyPlain`. */
export function jod(value: number): string {
  return `${value.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} JOD`
}

/**
 * Nominal uang untuk UI: IDR + padanan JOD, mis. `Rp25.000 · ±1,09 JOD`.
 *
 * Nol dilewatkan tanpa padanan — `Rp0 · ±0,00 JOD` cuma menambah bising di baris
 * diskon/biaya yang memang kosong.
 */
export function money(idr: number): string {
  if (idr === 0) return moneyPlain(idr)
  return `${moneyPlain(idr)} · ±${jod(idrToJod(idr))}`
}

/**
 * Nominal uang dari angka yang tersimpan dalam JOD: IDR (source of truth) +
 * padanan JOD, mis. `Rp80.500 · ±3,50 JOD`. Dipakai konsol CS, yang angka
 * mock-nya ditulis dalam JOD — konversinya sekali di sini, bukan di tiap layar
 * (R-CURR-01).
 */
export function moneyFromJod(valueJod: number): string {
  return money(jodToIdr(valueJod))
}

/**
 * Waktu sync terakhir, ringkas — mis. `10 Okt, 07.00`.
 *
 * Locale + zona waktu sengaja **tidak dipaku** (`undefined`): tiap HP memakai
 * locale dan jam lokal device-nya sendiri, jadi label mengikuti ponsel masing-
 * masing user, bukan WIB tetap.
 */
export function rateSyncedLabel(): string {
  return new Date(activeRate.fetchedAt).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
