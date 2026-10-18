/**
 * Audit trail (konsol SA) ↔ `audit_logs`.
 *
 * Kontrak live (diverifikasi 2026-10-17): `actor_id`, `actor_role`, `action`,
 * `target`, `target_id`, `at`, dan `kind` (kolom baru, migrasi
 * `supabase/migrations/2026-10-17-ops-sa-columns.sql`). Tabel append-only —
 * trigger `deny_mutation()` menolak UPDATE/DELETE, jadi jalur ini baca saja.
 *
 * Nama aktor diambil dari `users.email` (tabel `users` tak punya kolom nama),
 * sama seperti `fetchOperators`. Baca lewat sesi `cs@` (`refToken`). `[]` kalau
 * tabel kosong → pemanggil mempertahankan mock.
 */
import type { AuditEntry, AuditKind } from '../types'
import { refToken } from './reference'
import { apiEnabled, restWith } from './supabase'

const KINDS: ReadonlySet<string> = new Set([
  'onboarding',
  'dispute',
  'merchant',
  'zone',
  'role',
  'operator',
  'tax',
  'profit',
  'switch',
  'escalate',
])

interface AuditRow {
  id: number
  actor_id: number | null
  actor_role: string | null
  action: string
  /** D1 memakai `target_id` (bukan `target`); ditampilkan sebagai teks. */
  target_id: string | number | null
  kind: string | null
  at: string
}
interface UserRow {
  id: number
  email: string | null
}

/** `Hari ini HH:MM` / `Kemarin HH:MM` / `N hari lalu` — sama nuansa seed audit. */
function stamp(iso: string): string {
  const at = new Date(iso)
  const now = new Date()
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((day(now) - day(at)) / 86_400_000)
  const hhmm = `${String(at.getHours()).padStart(2, '0')}.${String(at.getMinutes()).padStart(2, '0')}`
  if (diff <= 0) return `Hari ini ${hhmm}`
  if (diff === 1) return `Kemarin ${hhmm}`
  return `${diff} hari lalu`
}

/** Baris audit BE, terbaru dulu. `[]` = tabel kosong (pakai mock). */
export async function fetchAudit(): Promise<AuditEntry[]> {
  if (!apiEnabled) return []
  const token = await refToken()
  const rows = await restWith<AuditRow>(
    token,
    'audit_logs',
    '?select=id,actor_id,actor_role,action,target_id,kind,at&order=at.desc&limit=200',
  )
  if (!rows.length) return []
  const ids = [...new Set(rows.map((r) => r.actor_id).filter((v): v is number => v !== null))]
  const users = ids.length
    ? await restWith<UserRow>(token, 'users', `?select=id,email&id=in.(${ids.join(',')})`)
    : []
  const byId = new Map(users.map((u) => [u.id, u]))
  return rows.map((row) => {
    const email = row.actor_id !== null ? byId.get(row.actor_id)?.email : null
    return {
      id: `au-${row.id}`,
      at: stamp(row.at),
      actor: email?.split('@')[0] || 'Sistem',
      // actor_id BE = users.id, bukan operators.id — ditautkan hanya untuk tampilan.
      actorId: row.actor_id !== null ? `op-${row.actor_id}` : null,
      actorRole: /sa|super|owner/i.test(row.actor_role ?? '') ? 'sa' : 'cs',
      // ponytail: baris lama tanpa `kind` (pra-migrasi) masuk ember `operator`.
      kind: (KINDS.has(row.kind ?? '') ? row.kind : 'operator') as AuditKind,
      action: row.action,
      target: row.target_id != null ? String(row.target_id) : '',
    }
  })
}
