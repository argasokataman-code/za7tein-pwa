import { ArrowDownLeft, ArrowUpRight, Lock } from 'lucide-react'

import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { AdminBottomNav } from '../components/layout/AdminBottomNav'
import { useAppSelector } from '../hooks/useAppStore'
import { HOLD_EVENT_LABEL } from '../data/merchant'
import { idrToJod, jod, ledgerTypeLabel } from '../data/admin'

export default function AdminLedger() {
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
                <p className="admin-card-title">
                  {ledgerTypeLabel[entry.type]} · {entry.ref}
                </p>
                <p className="admin-card-sub">{entry.memo}</p>
                <p className="admin-card-sub">{entry.at}</p>
              </div>
              <span className={`admin-ledger-amount is-${entry.direction}`}>
                {entry.direction === 'credit' ? '+' : '−'}
                {jod(entry.amount)}
              </span>
            </div>
          ))}
        </section>

        <p className="admin-note">
          Agregat liability di Ringkasan diturunkan dari saldo wallet, bukan dari layar ini (M9).
        </p>

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
                <span className="admin-ledger-amount">{jod(idrToJod(entry.amountIdr))}</span>
              </div>
            ))}
            <p className="admin-note">
              Tiap transisi = 1 entry append-only dan tidak bisa disunting. Arah debit-credit hold
              belum diputuskan di mock ini, jadi hanya nominal dan waktunya yang ditampilkan —
              bukan pasangan double-entry yang dikarang.
            </p>
          </section>
        ) : null}
      </main>
      <AdminBottomNav />
    </div>
  )
}
