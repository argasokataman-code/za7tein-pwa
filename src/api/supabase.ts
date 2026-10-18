/**
 * Klien HTTP tipis — satu-satunya jalur HTTP repo ini.
 *
 * Dua backend, dipilih lewat env (lihat blok `useWorker` di bawah):
 * - **Worker Cloudflare** (`VITE_API_BASE_URL`) — D1 + R2. Baca `/rest/v1/{table}`,
 *   auth `magic-link` → JWT, media `/media/{bucket}/{key}`. Tulis tabel & RPC
 *   mayoritas belum ada → pemanggil jatuh ke mock.
 * - **Supabase PostgREST** (default demo) — `{base}/rest/v1/<tabel>` + `auth/v1`.
 *
 * Anon key Supabase memang publik (RLS yang membatasi). URL Worker juga publik.
 * Pemetaan endpoint ↔ flow ada di `docs/design/flows/INDEX.json` §contract.
 */
const DEFAULT_URL = 'https://dwzxtnfesmpobnepilhl.supabase.co'
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3enh0bmZlc21wb2JuZXBpbGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTk4NjgsImV4cCI6MjEwMzE3NTg2OH0.HFHrFYuq3l6B4mcqJy13-Loat0-36KenQ8feBCKWqAE'

/**
 * Backend dipilih lewat env:
 * - `VITE_API_BASE_URL` diisi → **Worker Cloudflare** (D1 + R2). Baca lewat
 *   `/rest/v1/{table}` (subset PostgREST; 35 tabel hidup), auth `magic-link` →
 *   JWT, media `/media/{bucket}/{key}`. Tulis tabel (POST/PATCH/DELETE) dan
 *   hampir semua RPC belum ada di Worker (404/501) → pemanggil jatuh ke mock.
 * - kosong → Supabase PostgREST (default demo repo).
 */
const workerUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || '').replace(/\/+$/, '')
const useWorker = Boolean(workerUrl)

const url = useWorker
  ? workerUrl
  : (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_URL
const anonKey = useWorker
  ? ''
  : (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_ANON_KEY

/** Aktif kalau backend tersedia. Hook jatuh ke data mock kalau ini false. */
export const apiEnabled = useWorker || Boolean(url && anonKey)

/** Backend yang sedang dipakai (dibaca modul lain, mis. media). */
export const backend = { worker: useWorker, url, anonKey }

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
  if (useWorker) return workerToken(email)
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`[api] auth ${res.status}`)
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? ''
}

/** Peran default dari alamat email demo (Worker magic-link butuh `role`). */
function workerRole(email: string): string {
  const local = email.split('@')[0].toLowerCase()
  if (local.startsWith('merchant')) return 'merchant'
  if (local.startsWith('courier')) return 'courier_inhouse'
  if (
    local.startsWith('cs') ||
    local.startsWith('ops') ||
    local.startsWith('admin') ||
    local.startsWith('sa')
  )
    return 'ops'
  return 'customer'
}

/**
 * Token Worker: `magic-link` (stub dev — email tidak benar-benar dikirim) →
 * `verify` → JWT. Password diabaikan; backend v2 belum punya login password.
 */
async function workerToken(email: string): Promise<string> {
  const ml = await fetch(`${url}/auth/magic-link`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, role: workerRole(email) }),
  })
  if (!ml.ok) throw new Error(`[api] magic-link ${ml.status}`)
  const { token } = (await ml.json()) as { token?: string }
  if (!token) throw new Error('[api] magic-link tanpa token')
  const vf = await fetch(`${url}/auth/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!vf.ok) throw new Error(`[api] verify ${vf.status}`)
  const data = (await vf.json()) as { access_token?: string }
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
 * Panggil fungsi PostgREST (`POST /rest/v1/rpc/<fn>`) dengan token eksplisit.
 * Dipakai untuk RPC yang menjaga aksesnya sendiri (`SECURITY DEFINER`) — mis.
 * daftar tugas kurir dan verifikasi OTP — sehingga tak perlu grant tabel.
 * `args` = parameter bernama; PostgREST memetakan ke argumen fungsi.
 */
export async function rpc<T>(token: string, fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`[api] rpc ${fn} ${res.status}`)
  return (await res.json()) as T
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
 * DELETE baris PostgREST. `query` wajib berisi filter (mis. `?id=eq.7`) —
 * tanpa filter PostgREST menolak agar tidak menghapus seluruh tabel.
 */export async function deleteWith(
  token: string,
  table: string,
  query: string,
): Promise<void> {
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
    method: 'DELETE',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      Prefer: 'return=minimal',
    },
  })
  if (!res.ok) throw new Error(`[api] DELETE ${table} ${res.status}`)
}

/**
 * POST yang **mengembalikan baris** (`Prefer: return=representation`) — dipakai
 * saat id/code baris baru diperlukan (mis. `orders` setelah checkout).
 *
 * `select` wajib menyebut kolom yang diminta. Tanpa itu PostgREST melakukan
 * `RETURNING *`, dan satu kolom yang SELECT-nya sengaja dicabut dari
 * `authenticated` (mis. `orders.otp`) membatalkan **seluruh** INSERT dengan
 * `42501 permission denied` — padahal INSERT-nya sendiri berhak.
 */
export async function createWithReturn<T>(
  token: string,
  table: string,
  body: Record<string, unknown>,
  select?: string,
): Promise<T[]> {
  const query = select ? `?select=${select}` : ''
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
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

/** Baca akun auth (metadata `user_metadata`: nama, avatar, peran) untuk token pengguna. */
export async function authUser<T>(token: string): Promise<T> {
  if (useWorker) return (await workerUser(token)) as T
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`[api] auth user ${res.status}`)
  return (await res.json()) as T
}

/**
 * Worker v2 tidak punya `/auth/v1/user`. `/auth/me` hanya `{ id, role, email }`;
 * bentuk Supabase (`user_metadata.name/avatar`) dilengkapi dari tabel `users`.
 */
async function workerUser(token: string): Promise<Record<string, unknown>> {
  const me = await fetch(`${url}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
  if (!me.ok) throw new Error(`[api] auth/me ${me.status}`)
  const u = (await me.json()) as { id?: number; role?: string; email?: string }
  let name = ''
  let avatar = ''
  if (u.email) {
    const rows = (await rest<{ name?: string; avatar?: string }>(
      'users',
      `?email=eq.${encodeURIComponent(u.email)}&select=name,avatar&limit=1`,
    )) as { name?: string; avatar?: string }[]
    name = rows[0]?.name ?? ''
    avatar = rows[0]?.avatar ?? ''
  }
  return { id: u.id, email: u.email, role: u.role, user_metadata: { name, avatar } }
}

/** Perbarui `user_metadata` akun auth (mis. nama/avatar) untuk token pengguna. */
export async function authUpdateUser<T>(token: string, data: Record<string, unknown>): Promise<T> {
  if (useWorker) throw new Error('[api] worker v2 belum punya endpoint ubah profil')
  const res = await fetch(`${url}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error(`[api] auth update ${res.status}`)
  return (await res.json()) as T
}

/** Bucket R2 yang didukung Worker v2. */
export type MediaBucket = 'menu-images' | 'merchant-photos' | 'avatars'

/** URL publik objek R2 lewat Worker (`GET /media/{bucket}/{key}`). */
export function mediaUrl(bucket: MediaBucket, key: string): string {
  return `${url}/media/${bucket}/${key}`
}

/**
 * Unggah objek ke R2 lewat Worker (`PUT /media/{bucket}/{key}`; 201).
 * Hanya untuk backend Worker — Supabase Storage bukan bentuk yang sama.
 */
export async function uploadMedia(
  bucket: MediaBucket,
  key: string,
  blob: Blob,
  token?: string,
): Promise<{ ok: boolean; key: string; bucket: string }> {
  if (!useWorker) throw new Error('[api] uploadMedia butuh VITE_API_BASE_URL (Worker)')
  const res = await fetch(mediaUrl(bucket, key), {
    method: 'PUT',
    headers: {
      'content-type': blob.type || 'application/octet-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: blob,
  })
  if (!res.ok) throw new Error(`[api] media PUT ${res.status}`)
  return (await res.json()) as { ok: boolean; key: string; bucket: string }
}
