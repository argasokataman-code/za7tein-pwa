import { ArrowDownLeft, ArrowUpRight, Lock } from 'lucide-react'

import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { AdminBottomNav } from '../components/layout/AdminBottomNav'
import { useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'
import { HOLD_EVENT_LABEL } from '../data/merchant'
import { ledgerTypeLabel } from '../data/admin'
import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'

export default function AdminLedger() {
  const { money, moneyFromJod } = useMoney()
  const ledger = useAppSelector((s) => s.admin.ledger)
  // Transisi hold order yang sedang berjalan ikut terlihat di sini: satu
  // transisi memang satu entry append-only (F2/M4), dan antrean CS perlu melihat
  // order berjalan sebelum saldonya pindah.
  const holdLedger = useAppSelector((s) => s.cart.holdLedger)

  return (
    <div className="app-shell">
      <main className="admin-page">
        <AdminPageHeader eyebrow="Append-only" title="Ledger" />

        <section className="admin-card">
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
          <h2 className="admin-section-title">Entry terbaru ({ledger.length})</h2>
          {ledger.map((entry) => (
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
      </main>
      <AdminBottomNav />
    </div>
  )
}
