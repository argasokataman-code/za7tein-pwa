import { ArrowDownLeft, ArrowUpRight, Lock } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminKpi } from '../../components/admin/AdminKpi'
import { OpsShell } from '../../components/layout/OpsShell'
import { useAppSelector } from '../../hooks/useAppStore'
import { useMoney } from '../../hooks/useMoney'
import { HOLD_EVENT_LABEL } from '../../data/merchant'
import { ledgerTypeLabel } from '../../data/admin'
import { ledgerFlow } from '../../data/dashboard'
import { jod } from '../../data/currency'
import { ExchangeRateNote } from '../../components/ui/ExchangeRateNote'
import type { LedgerEntryType } from '../../types'

/** Berapa baris ledger ditampilkan sekaligus; sisanya lewat "Muat lebih banyak". */
const LEDGER_PAGE = 20

export default function OpsLedger() {
  const { money, moneyFromJod } = useMoney()
  const ledger = useAppSelector((s) => s.admin.ledger)
  // Transisi hold order yang sedang berjalan ikut terlihat di sini: satu
  // transisi memang satu entry append-only (F2/M4), dan antrean CS perlu melihat
  // order berjalan sebelum saldonya pindah.
  // `?? []`: state `cart` dipersist, jadi sesi lama bisa belum punya kunci ini.
  const holdLedger = useAppSelector((s) => s.cart.holdLedger ?? [])
  const flow = ledgerFlow(ledger)

  // Alat kerja ledger (audit 017 F-08): saring + cari + urut. Tanpa ini konsol
  // append-only tak bisa diaudit begitu entry bertambah.
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | LedgerEntryType>('all')
  const [newestFirst, setNewestFirst] = useState(true)
  const [visible, setVisible] = useState(LEDGER_PAGE)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = ledger.filter(
      (entry) =>
        (typeFilter === 'all' || entry.type === typeFilter) &&
        (q === '' ||
          entry.memo.toLowerCase().includes(q) ||
          entry.ref.toLowerCase().includes(q) ||
          ledgerTypeLabel[entry.type].toLowerCase().includes(q)),
    )
    return newestFirst ? rows : [...rows].reverse()
  }, [ledger, query, typeFilter, newestFirst])

  const shown = filtered.slice(0, visible)

  function resetPaging() {
    setVisible(LEDGER_PAGE)
  }

  return (
    <OpsShell>
      <div className="admin-page">
        <div className="admin-kpi">
          <AdminKpi label="Total entry" value={ledger.length} sub="Append-only" />
          <AdminKpi label="Masuk" value={jod(flow.credit)} sub="Credit" />
          <AdminKpi label="Keluar" value={jod(flow.debit)} sub="Debit" />
          <AdminKpi label="Bersih" value={jod(flow.net)} sub="Credit − debit" />
        </div>

        <section className="admin-card admin-card--wide">
          <div className="admin-row">
            <Lock size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="admin-card-title">Entry tidak bisa diubah atau dihapus</p>
              <p className="admin-card-sub">
                Koreksi dilakukan lewat entry baru (reversal), bukan menyunting yang lama.
              </p>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">
            Entry terbaru ({filtered.length}
            {filtered.length !== ledger.length ? ` dari ${ledger.length}` : ''})
          </h2>

          <div className="admin-tools">
            <input
              className="admin-tools__search"
              type="search"
              value={query}
              placeholder="Cari memo, ref, atau jenis"
              aria-label="Cari entry ledger"
              onChange={(event) => {
                setQuery(event.target.value)
                resetPaging()
              }}
            />
            <select
              className="admin-tools__select"
              value={typeFilter}
              aria-label="Saring jenis entry"
              onChange={(event) => {
                setTypeFilter(event.target.value as 'all' | LedgerEntryType)
                resetPaging()
              }}
            >
              <option value="all">Semua jenis</option>
              {(Object.keys(ledgerTypeLabel) as LedgerEntryType[]).map((type) => (
                <option key={type} value={type}>
                  {ledgerTypeLabel[type]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="admin-link"
              onClick={() => {
                setNewestFirst((value) => !value)
                resetPaging()
              }}
            >
              {newestFirst ? 'Terbaru dulu' : 'Terlama dulu'}
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="admin-empty">Tidak ada entry yang cocok.</p>
          ) : (
            <>
              {shown.map((entry) => (
                <div key={entry.id} className="admin-ledger-row">
                  <span className={`admin-ledger-icon is-${entry.direction}`} aria-hidden="true">
                    {entry.direction === 'credit' ? (
                      <ArrowDownLeft size={16} strokeWidth={1.75} />
                    ) : (
                      <ArrowUpRight size={16} strokeWidth={1.75} />
                    )}
                  </span>
                  <div className="admin-ledger-copy">
                    <p className="admin-card-title">{ledgerTypeLabel[entry.type]}</p>
                    <p className="admin-card-sub admin-ledger-memo">{entry.memo}</p>
                    <p className="admin-card-sub">
                      {entry.ref} · {entry.at}
                    </p>
                  </div>
                  <span className={`admin-ledger-amount is-${entry.direction}`}>
                    {entry.direction === 'credit' ? '+' : '−'}
                    {moneyFromJod(entry.amount)}
                  </span>
                </div>
              ))}
              {filtered.length > visible ? (
                <button
                  type="button"
                  className="admin-link"
                  onClick={() => setVisible((value) => value + LEDGER_PAGE)}
                >
                  Muat lebih banyak ({filtered.length - visible} lagi)
                </button>
              ) : null}
            </>
          )}
        </section>

        <div className="admin-footnote">
          <p className="admin-note">
            Angka kewajiban di Ringkasan datang dari saldo wallet, bukan dari layar ini.
          </p>
          <ExchangeRateNote />
        </div>

        {holdLedger.length > 0 ? (
          <section className="admin-section">
            <h2 className="admin-section-title">
              Transisi hold order berjalan ({holdLedger.length})
            </h2>
            {holdLedger.map((entry) => (
              <div key={entry.id} className="admin-ledger-row">
                <span className="admin-ledger-icon" aria-hidden="true">
                  <Lock size={16} strokeWidth={1.75} />
                </span>
                <div className="admin-ledger-copy">
                  <p className="admin-card-title">{HOLD_EVENT_LABEL[entry.event]}</p>
                  <p className="admin-card-sub">
                    {new Date(entry.at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="admin-ledger-amount">{money(entry.amountIdr)}</span>
              </div>
            ))}
            <p className="admin-note">
              Tiap transisi tidak bisa disunting. Arah debit-credit hold belum diputuskan
              di demo ini, jadi hanya nominal dan waktunya yang ditampilkan.
            </p>
          </section>
        ) : null}
      </div>
    </OpsShell>
  )
}
