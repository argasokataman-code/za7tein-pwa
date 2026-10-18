import { Cloud, CloudOff, Server } from 'lucide-react'

import { apiEnabled, backend } from '../../api/supabase'

type Mode = 'worker' | 'supabase' | 'mock'

const MODE: Record<Mode, { tone: string; icon: typeof Server; label: string }> = {
  worker: { tone: 'tone-success', icon: Server, label: 'Worker D1 + R2' },
  supabase: { tone: 'tone-info', icon: Cloud, label: 'Supabase' },
  mock: { tone: 'tone-warning', icon: CloudOff, label: 'Mock lokal (API mati)' },
}

/**
 * Chip kecil yang menyatakan backend mana yang sedang dipakai. Ada supaya
 * "fallback diam-diam" kelihatan: begitu API mati, hampir tiap fitur kembali ke
 * data mock tanpa suara (mock-first). Chip ini satu-satunya tempat yang
 * mengatakannya di UI — dipakai di halaman dokumentasi (bagian Backend).
 */
export function BackendStatusBadge() {
  const mode: Mode = !apiEnabled ? 'mock' : backend.worker ? 'worker' : 'supabase'
  const { tone, icon: Icon, label } = MODE[mode]
  return (
    <span className={`tone-chip ${tone}`} role="status" title={backend.url || undefined}>
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </span>
  )
}
