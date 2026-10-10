/**
 * Klien tipis Supabase PostgREST — satu-satunya jalur HTTP repo ini.
 *
 * Backend live = Supabase PostgREST (bukan gateway REST `api.sa7tein.app` yang
 * belum dibangun). Tabel = nama resource: `{base}/rest/v1/<tabel>`. Anon key
 * memang publik (dipasang di bundle klien portal `sa7tein-*`); yang membatasi
 * data adalah RLS, bukan kerahasiaan key.
 *
 * Nilai default menunjuk backend demo repo `baihaqybeki/sa7tein`; timpa lewat
 * env Vite `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` bila backend pindah.
 * Pemetaan endpoint ↔ flow ada di `docs/design/flows/INDEX.json` §contract.
 */
const DEFAULT_URL = 'https://dwzxtnfesmpobnepilhl.supabase.co'
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3enh0bmZlc21wb2JuZXBpbGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTk4NjgsImV4cCI6MjEwMzE3NTg2OH0.HFHrFYuq3l6B4mcqJy13-Loat0-36KenQ8feBCKWqAE'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_URL
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_ANON_KEY

/** Aktif kalau URL + key ada. Hook jatuh ke data mock kalau ini false. */
export const apiEnabled = Boolean(url && anonKey)

/** URL + anon key untuk koneksi Realtime (WebSocket). Dipakai `realtime.ts`. */
export const apiBase = { url, anonKey }

/**
 * GET satu tabel PostgREST. `query` = string filter PostgREST mentah, mis.
 * `?select=*&merchant_id=eq.3&order=id.asc`. Lempar kalau status bukan 2xx —
 * pemanggil (hook) menangkapnya dan tetap memakai mock.
 */
/**
 * Token sesi user (JWT) setelah `signIn`. Katalog bisa dibaca anon, tapi tabel
 * milik user (`orders`) dijaga RLS: tanpa token, `select` mengembalikan nol
 * baris. `null` = belum login, jadi pakai anon key seperti semula.
 */
let sessionToken: string | null = null

function bearer(): string {
  return sessionToken ?? anonKey
}

/**
 * Login email/kata sandi Supabase (password grant). Mengembalikan access token
 * **tanpa** menyentuh `sessionToken` global — `reference.ts` butuh sesi per-akun,
 * dan menyetel token global di sini membuat dua login paralel (mis. customer +
 * merchant) saling menimpa.
 */
export async function signInToken(email: string, password: string): Promise<string> {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`[api] auth ${res.status}`)
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? ''
}

/** Login email/kata sandi; menyimpan token untuk `rest`/`create` berikutnya. */
export async function signIn(email: string, password: string): Promise<void> {
  sessionToken = (await signInToken(email, password)) || null
}

/**
 * GET satu tabel PostgREST. `query` = string filter PostgREST mentah, mis.
 * `?select=*&merchant_id=eq.3&order=id.asc`. Lempar kalau status bukan 2xx —
 * pemanggil (hook) menangkapnya dan tetap memakai mock.
 */
export async function rest<T>(table: string, query = ''): Promise<T[]> {
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${bearer()}`,
      accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`[api] ${table} ${res.status}`)
  return (await res.json()) as T[]
}

/**
 * `rest` dengan token eksplisit, untuk tabel yang butuh sesi akun tertentu
 * (`reference.ts` membaca sebagai `cs@`) tanpa mengganggu token global.
 */
export async function restWith<T>(token: string, table: string, query = ''): Promise<T[]> {
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}`, accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`[api] ${table} ${res.status}`)
  return (await res.json()) as T[]
}

/**
 * PATCH satu baris (mis. `merchants.store_status`). Token eksplisit karena RLS
 * hanya mengizinkan pemilik baris — merchant menulis status tokonya sendiri.
 */
export async function patch(
  token: string,
  table: string,
  query: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
    method: 'PATCH',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`[api] PATCH ${table} ${res.status}`)
}

/**
 * PATCH dengan token global (`bearer()`) — pasangan `patch` untuk tabel yang
 * RLS-nya cukup dengan sesi aktif (mis. merchant mengubah `courier_id` order
 * miliknya sendiri), tanpa mengoper token eksplisit.
 */
export async function patchRow(
  table: string,
  query: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
    method: 'PATCH',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${bearer()}`,
      'content-type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`[api] PATCH ${table} ${res.status}`)
}

/**
 * POST satu baris ke PostgREST. `Prefer: return=minimal` supaya balasan 201
 * tanpa body. Lempar kalau bukan 2xx — pemanggil menangkapnya (tulis order
 * bersifat best-effort, UI tetap jalan sebagai mock).
 */
export async function create(table: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${bearer()}`,
      'content-type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`[api] POST ${table} ${res.status}`)
}

/**
 * `create` dengan token eksplisit, untuk menulis dari sesi tertentu
 * (notifikasi lewat sesi `reference.ts`) tanpa mengganggu token global `orders`.
 */
export async function createWith(
  token: string,
  table: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`[api] POST ${table} ${res.status}`)
}

/**
 * POST yang **mengembalikan baris** (`Prefer: return=representation`) — dipakai
 * saat id/code baris baru diperlukan (mis. `orders` setelah checkout).
 */
export async function createWithReturn<T>(
  token: string,
  table: string,
  body: Record<string, unknown>,
): Promise<T[]> {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`[api] POST ${table} ${res.status}`)
  return (await res.json()) as T[]
}
