// Refund penuh satu order online (§16.6). Cabangnya bergantung metode bayar
// order: saldo DANA → refund otomatis ke saldo; QRIS tanpa akun DANA → pending
// refund + rekening bank (BI-FAST); QRIS + binding DANA → pilih; COD → tidak
// perlu refund (tunai sudah di tangan kurir).
//
// **Layanan ini belum tersedia.** BE demo belum punya tabel `refunds` (404) dan
// `api/orders.ts` belum punya endpoint refund, jadi layar ini menampilkan
// bentuk alurnya lengkap dengan tanda "belum tersedia" dan tidak mengirim apa
// pun. Menampilkan flow yang seolah berjalan lebih buruk daripada mengakui
// belum ada (AGENTS §1). Flag: `REFUND_AVAILABLE`.
import { Link } from 'react-router-dom'
import { Landmark, RefreshCw, Wallet } from 'lucide-react'

import { BackButton } from '../components/ui/BackButton'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { REFUND_AVAILABLE, REFUND_BI_FAST_FEE_IDR } from '../data/marketplace'
import { useChargedBreakdown } from '../hooks/useChargedBreakdown'
import { useMoney } from '../hooks/useMoney'

/** Cabang refund yang dijanjikan PRD, dengan metode bayar pemicunya. */
const REFUND_BRANCHES = [
  {
    id: 'dana',
    label: 'Saldo DANA',
    description: 'DANA otomatis — tanpa rekening, kembali ke saldo e-wallet',
    triggersOn: 'Bayar dengan saldo DANA',
  },
  {
    id: 'bank',
    label: 'Rekening bank (BI-FAST)',
    description: 'Isi nama bank + nomor rekening; transfer BI-FAST ke rekening itu',
    triggersOn: 'QRIS tanpa akun DANA',
  },
  {
    id: 'choose',
    label: 'Pilih DANA atau bank',
    description: 'QRIS yang sudah terhubung ke akun DANA — pilih tujuannya',
    triggersOn: 'QRIS + binding DANA',
  },
] as const

export default function CustomerRefund() {
  const { money } = useMoney()
  // Nominal yang dikembalikan = yang benar-benar dibayar order online, termasuk
  // `Ft` dan pembulatan tagihan (§16.2) — sumber yang sama dengan checkout.
  const charged = useChargedBreakdown()

  return (
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header">
              <BackButton className="back-btn-profile" to="/wallet" />
              <h1 className="profile-flow-title">Refund pesanan</h1>
            </header>
            <main className="wallet-main">
              <PlatformNotice
                message={
                  REFUND_AVAILABLE
                    ? 'Refund penuh: dana kembali ke saldo DANA atau rekening bank (BI-FAST).'
                    : 'Layanan refund belum tersedia — pengembalian dana belum berjalan di backend. Layar ini menampilkan alurnya saja; tidak ada dana yang berpindah.'
                }
              />

              <section className="order-summary-section" aria-label="Nominal refund">
                <h2 className="section-title">Nominal refund</h2>
                <div className="summary-item">
                  <span>Dibayarkan</span>
                  <span>{money(charged.totalIdr)}</span>
                </div>
                {charged.transactionFeeIdr > 0 ? (
                  <div className="summary-item">
                    <span>Termasuk biaya transaksi QRIS</span>
                    <span>{money(charged.transactionFeeIdr)}</span>
                  </div>
                ) : null}
                <div className="summary-divider" />
                <div className="summary-total">
                  <span>Total refund</span>
                  <span>{money(charged.totalIdr)}</span>
                </div>
                <p className="summary-info-note">
                  Refund penuh. Biaya transfer BI-FAST {money(REFUND_BI_FAST_FEE_IDR)} ditanggung
                  aplikator, tidak dipotong dari nominal di atas.
                </p>
              </section>

              <section className="order-summary-section" aria-label="Tujuan pengembalian">
                <h2 className="section-title">Tujuan pengembalian</h2>
                <div className="payment-list" role="radiogroup" aria-label="Tujuan pengembalian dana">
                  {REFUND_BRANCHES.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      role="radio"
                      aria-checked={false}
                      aria-disabled={!REFUND_AVAILABLE}
                      disabled={!REFUND_AVAILABLE}
                      className="payment-item is-blocked"
                    >
                      <div className="payment-icon">
                        {branch.id === 'dana' ? (
                          <Wallet size={26} strokeWidth={1.75} aria-hidden="true" />
                        ) : (
                          <Landmark size={26} strokeWidth={1.75} aria-hidden="true" />
                        )}
                      </div>
                      <div className="payment-info">
                        <h3 className="payment-name">{branch.label}</h3>
                        <p className="payment-number">
                          {branch.description} · {branch.triggersOn}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="order-summary-section" aria-label="Rekening bank">
                <h2 className="section-title">Rekening bank</h2>
                <form className="merchant-form" noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="refund-bank">
                      Bank
                    </label>
                    <input
                      id="refund-bank"
                      name="refund-bank"
                      className="form-control"
                      placeholder="mis. Bank Mandiri"
                      disabled={!REFUND_AVAILABLE}
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="refund-account">
                      Nomor rekening
                    </label>
                    <input
                      id="refund-account"
                      name="refund-account"
                      className="form-control"
                      placeholder="mis. 1234567890"
                      disabled={!REFUND_AVAILABLE}
                      autoComplete="off"
                      inputMode="numeric"
                    />
                  </div>
                </form>
                <p className="summary-info-note">
                  Diperlukan hanya untuk QRIS tanpa akun DANA (pending refund). Refund saldo DANA
                  tidak butuh rekening.
                </p>
              </section>

              <section className="order-summary-section" aria-label="Status refund">
                <h2 className="section-title">Status</h2>
                <div className="summary-item">
                  <span>Pending refund</span>
                  <span>Belum berjalan</span>
                </div>
                <p className="summary-info-note">
                  Setelah BE siap, order yang dibatalkan/ditolak akan membuat{' '}
                  <code className="doc-inline">pending_refund</code> di sini, lalu{' '}
                  <code className="doc-inline">processing</code> →{' '}
                  <code className="doc-inline">completed</code>.
                </p>
              </section>

              <button type="button" className="btn btn-primary" disabled={!REFUND_AVAILABLE}>
                {REFUND_AVAILABLE ? 'Kirim permintaan refund' : 'Refund belum tersedia'}
              </button>

              <p className="summary-info-note">
                <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" />{' '}
                <Link className="summary-change-link" to="/order-placed">
                  Kembali ke pesanan
                </Link>
              </p>
            </main>
          </div>
        </div>
      </main>
    </div>
  )
}
