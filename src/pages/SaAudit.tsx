import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import { auditKindLabel } from '../data/superadmin'
import { useAppSelector } from '../hooks/useAppStore'
import type { AuditKind } from '../types'

const KINDS = Object.keys(auditKindLabel) as AuditKind[]

/**
 * Audit trail. Read-only dan append-only: tidak ada tombol hapus atau edit, dan
 * itu disengaja, audit yang bisa diubah bukan audit. Aksi CS ikut masuk lewat
 * jembatan audit di `src/store/index.ts`, jadi satu tabel ini memuat kerja SA
 * maupun CS.
 */
export default function SaAudit() {
  const audit = useAppSelector((s) => s.superAdmin.audit)
  const [kind, setKind] = useState<AuditKind | 'all'>('all')
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return audit.filter((entry) => {
      if (kind !== 'all' && entry.kind !== kind) return false
      if (!needle) return true
      return `${entry.actor} ${entry.target} ${entry.action}`.toLowerCase().includes(needle)
    })
  }, [audit, kind, query])

  return (
    <SuperAdminShell>
      <section className="sa-card">
        <div className="sa-card-head">
          <div>
            <p className="sa-card-label">Audit trail</p>
            <p className="sa-card-sub">
              {rows.length} dari {audit.length} baris · append-only, tanpa aksi edit atau hapus
            </p>
          </div>
          <label className="sa-search">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="sa-sr">Cari aksi, aktor, atau objek</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari aksi, aktor, objek…"
            />
          </label>
        </div>

        <div className="sa-filters" role="group" aria-label="Filter jenis aksi">
          <button
            type="button"
            className={`sa-filter${kind === 'all' ? ' is-active' : ''}`}
            aria-pressed={kind === 'all'}
            onClick={() => setKind('all')}
          >
            Semua
          </button>
          {KINDS.map((item) => (
            <button
              key={item}
              type="button"
              className={`sa-filter${kind === item ? ' is-active' : ''}`}
              aria-pressed={kind === item}
              onClick={() => setKind(item)}
            >
              {auditKindLabel[item]}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="sa-empty">
            Tidak ada aktivitas yang cocok. Coba ganti filter atau kosongkan pencarian.
          </p>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th scope="col">Waktu</th>
                  <th scope="col">Aktor</th>
                  <th scope="col">Jenis</th>
                  <th scope="col">Aksi</th>
                  <th scope="col">Objek</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id}>
                    <td className="sa-nowrap">{entry.at}</td>
                    <td>
                      {entry.actor}
                      <span className="sa-actor-role">
                        {entry.actorRole === 'sa' ? 'Super Admin' : 'CS'}
                      </span>
                    </td>
                    <td>{auditKindLabel[entry.kind]}</td>
                    <td>{entry.action}</td>
                    <td>{entry.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SuperAdminShell>
  )
}
