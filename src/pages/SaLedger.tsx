import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { ledgerPartyLabel, ledgerTypeLabel } from '../data/admin'
import { jod } from '../data/currency'
import { useAppSelector } from '../hooks/useAppStore'
import type { LedgerEntryType } from '../types'

const TYPES = Object.keys(ledgerTypeLabel) as LedgerEntryType[]

/**
 * Monitoring ledger merchant & customer. **Read-only**: tidak ada tombol aksi
 * di sini, karena top-up dan payout berjalan self-service oleh sistem (PO
 * 2026-09-23), SA memantau, bukan mengesahkan. Ledger sendiri append-only,
 * jadi tidak ada yang bisa diubah dari layar mana pun.
 */
export default function SaLedger() {
  const ledger = useAppSelector((s) => s.admin.ledger)
  const [type, setType] = useState<LedgerEntryType | 'all'>('all')
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return ledger.filter((entry) => {
      if (type !== 'all' && entry.type !== type) return false
      if (!needle) return true
      return `${entry.ref} ${entry.memo} ${entry.party.name}`
        .toLowerCase()
        .includes(needle)
    })
  }, [ledger, type, query])

  const netJod = rows.reduce(
    (sum, entry) => sum + (entry.direction === 'credit' ? entry.amount : -entry.amount),
    0,
  )

  return (
    <SuperAdminShell>
      <section className="sa-card">
        <div className="sa-card-head">
          <div>
            <p className="sa-card-label">Ledger merchant &amp; customer</p>
            <p className="sa-card-sub">
              {rows.length} dari {ledger.length} entry · netto{' '}
              {netJod >= 0 ? '+' : '−'}
              {jod(Math.abs(netJod))} · tanpa aksi, hanya baca
            </p>          </div>
          <label className="sa-search">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="sa-sr">Cari ref order atau memo</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari ref atau memo…"
            />
          </label>
        </div>

        <div className="sa-filters" role="group" aria-label="Filter jenis entry">
          <button
            type="button"
            className={`sa-filter${type === 'all' ? ' is-active' : ''}`}
            aria-pressed={type === 'all'}
            onClick={() => setType('all')}
          >
            Semua
          </button>
          {TYPES.map((item) => (
            <button
              key={item}
              type="button"
              className={`sa-filter${type === item ? ' is-active' : ''}`}
              aria-pressed={type === item}
              onClick={() => setType(item)}
            >
              {ledgerTypeLabel[item]}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="sa-empty">Tidak ada entry yang cocok dengan filter ini.</p>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th scope="col">Waktu</th>
                  <th scope="col">Jenis</th>
                  <th scope="col">Pihak</th>
                  <th scope="col">Arah</th>
                  <th scope="col">Nominal</th>
                  <th scope="col">Ref</th>
                  <th scope="col">Memo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id}>
                    <td className="sa-nowrap">{entry.at}</td>
                    <td>{ledgerTypeLabel[entry.type]}</td>
                    <td>
                      {entry.party.name}
                      <span className="sa-table-sub">{ledgerPartyLabel[entry.party.kind]}</span>
                    </td>
                    <td>
                      <span className={`sa-chip${entry.direction === 'credit' ? ' is-ok' : ' is-off'}`}>
                        {entry.direction === 'credit' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="sa-nowrap">{jod(entry.amount)}</td>
                    <td className="sa-nowrap">{entry.ref}</td>
                    <td>{entry.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="sa-note">
          Angka di sini adalah bagian dari kewajiban platform (liability). Karena itu tidak ada
          tombol aksi: menahan atau melepas dana user bukan keputusan SA. Kolom{' '}
          <strong>Pihak</strong> menunjuk id di registri pengguna — sebelumnya ledger tidak
          menyimpan pihaknya sama sekali, jadi "monitoring detail merchant &amp; customer" tidak
          bisa dijawab dari layar ini.
        </p>
        <ExchangeRateNote />
      </section>
    </SuperAdminShell>
  )
}
