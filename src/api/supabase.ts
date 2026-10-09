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

/** Login email/kata sandi Supabase (password grant). Menyimpan token untuk request berikutnya. */
export async function signIn(email: string, password: string): Promise<void> {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`[api] auth ${res.status}`)
  const data = (await res.json()) as { access_token?: string }
  sessionToken = data.access_token ?? null
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
