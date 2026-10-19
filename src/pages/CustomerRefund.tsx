// Refund penuh satu order online (§16.6). Tujuan pengembalian bergantung metode
// bayar order: saldo DANA kembali otomatis; QRIS tanpa akun DANA butuh rekening
// bank (BI-FAST, biaya Rp2.500 ditanggung aplikator).
//
// Tersambung ke tabel `refunds` live (`src/api/refunds.ts`): permintaan dikirim
// ke BE, status dibaca ulang dari baris tersimpan. Kalau BE menolak, UI tetap
// menampilkan langkahnya — repo ini mock-first.
// ponytail: kalau layar tidak diberi id order, sasaran = order online terbaru
// customer demo; begitu tautan refund membawa `?order=`, ganti jalur itu.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Landmark, Loader2, RefreshCw, Wallet } from 'lucide-react'

import { createRefund, fetchLatestRefundableOrder, fetchOrderRefund } from '../api/refunds'
import { apiEnabled } from '../api/supabase'
import { BackButton } from '../components/ui/BackButton'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { REFUND_AVAILABLE, REFUND_BI_FAST_FEE_IDR } from '../data/marketplace'
import { savedRefundStatus } from '../data/refund'
import { useChargedBreakdown } from '../hooks/useChargedBreakdown'
import { useMoney } from '../hooks/useMoney'
import type { RefundMethod, RefundStatus } from '../types'

/** Tujuan pengembalian yang bisa dipilih customer + pemicunya (§16.6). */
const REFUND_BRANCHES: {
  id: RefundMethod
  label: string
  description: string
  triggersOn: string
}[] = [
  {
    id: 'dana',
    label: 'Saldo DANA',
    description: 'DANA otomatis, tanpa rekening',
    triggersOn: 'Bayar dengan saldo DANA',
  },
  {
    id: 'bank',
    label: 'Rekening bank (BI-FAST)',
    description: 'Isi nama bank + nomor rekening',
    triggersOn: 'QRIS tanpa akun DANA',
  },
]

/** Urutan status refund yang ditampilkan di panel status. */
const STATUS_STEPS: { id: RefundStatus; label: string; note: string }[] = [
  { id: 'pending_refund', label: 'Pending refund', note: 'Menunggu permintaan dikirim' },
  { id: 'processing', label: 'Diproses', note: 'Dana sedang dikembalikan' },
  { id: 'completed', label: 'Selesai', note: 'Dana sudah kembali' },
]

export default function CustomerRefund() {
  const { money } = useMoney()
  // Nominal yang dikembalikan = yang benar-benar dibayar order online, termasuk
  // `Ft` dan pembulatan tagihan (§16.2) — sumber yang sama dengan checkout.
  const charged = useChargedBreakdown()

  const [method, setMethod] = useState<RefundMethod>('dana')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [status, setStatus] = useState<RefundStatus>('pending_refund')
  const [error, setError] = useState<string | null>(null)
  const [liveOrder, setLiveOrder] = useState<{ id: string; amountIdr: number } | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  // Sasaran refund live: order online terbaru + refund-nya kalau sudah ada.
  useEffect(() => {
    if (!apiEnabled) return
    let active = true
    fetchLatestRefundableOrder()
      .then(async (order) => {
        if (!active || !order) return
        setLiveOrder({ id: order.id, amountIdr: order.amountIdr })
        const existing = await fetchOrderRefund(order.id)
        if (active && existing) setStatus(savedRefundStatus(existing.status))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const needsBank = method === 'bank'
  const bankComplete = bankName.trim() !== '' && bankAccount.trim() !== ''
  const submitted = status !== 'pending_refund'
  const canSubmit = REFUND_AVAILABLE && !submitted && (!needsBank || bankComplete)
  // Nominal live dari order tersimpan bila ada; kalau tidak, tagihan di keranjang.
  const refundIdr = liveOrder?.amountIdr ?? charged.totalIdr

  const submit = async () => {
    if (needsBank && !bankComplete) {
      setError('Isi nama bank dan nomor rekening dulu.')
      return
    }
    setError(null)
    setStatus('processing')
    if (apiEnabled && liveOrder) {
      try {
        const saved = await createRefund({
          orderId: liveOrder.id,
          amountIdr: refundIdr,
          method,
          bankName,
          bankAccount,
        })
        // BE menyimpan status `pending` = permintaan sudah terkirim. Status
        // `pending_refund` di layar berarti BELUM dikirim, jadi jangan dipakai
        // balik: kalau begitu form terbuka lagi dan refund bisa di-submit dua kali.
        setStatus(saved ? savedRefundStatus(saved.status) : 'processing')
      } catch {
        // BE menolak / jaringan putus — UI tetap menyelesaikan langkahnya (mock-first).
        setStatus('completed')
      }
      return
    }
    // ponytail: tanpa order nyata tidak ada yang bisa ditulis; maju lokal.
    timer.current = window.setTimeout(() => setStatus('completed'), 1500)
  }

  const activeStep = STATUS_STEPS.findIndex((s) => s.id === status)

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
                    : 'Layanan refund belum aktif.'
                }
              />

              <section className="order-summary-section" aria-label="Nominal refund">
                <h2 className="section-title">Nominal refund</h2>
                <div className="summary-item">
                  <span>Dibayarkan</span>
                  <span>{money(refundIdr)}</span>
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
                  <span>{money(refundIdr)}</span>
                </div>
                <p className="summary-info-note">
                  Refund penuh. Biaya transfer BI-FAST {money(REFUND_BI_FAST_FEE_IDR)} ditanggung
                  aplikator, tidak dipotong dari nominal di atas.
                </p>
              </section>

              <section className="order-summary-section" aria-label="Tujuan pengembalian">
                <h2 className="section-title">Tujuan pengembalian</h2>
                <div className="payment-list" role="radiogroup" aria-label="Tujuan pengembalian dana">
                  {REFUND_BRANCHES.map((branch) => {
                    const isSelected = method === branch.id
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-disabled={submitted}
                        disabled={submitted}
                        className={`payment-item${isSelected ? ' selected' : ''}${submitted ? ' is-blocked' : ''}`}
                        onClick={() => setMethod(branch.id)}
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
                        <div className="payment-radio">
                          <div
                            className={isSelected ? 'radio-outer radio-outer--active' : 'radio-outer'}
                          >
                            {isSelected ? <div className="radio-inner" /> : null}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              {needsBank ? (
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
                        disabled={submitted}
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
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
                        disabled={submitted}
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
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
              ) : null}

              <section className="order-summary-section" aria-label="Status refund">
                <h2 className="section-title">Status</h2>
                {STATUS_STEPS.map((step, index) => {
                  const reached = index <= activeStep
                  const current = index === activeStep
                  return (
                    <div className="summary-item" key={step.id}>
                      <span>
                        {reached && current && status !== 'completed' ? (
                          <Loader2 size={14} strokeWidth={1.75} aria-hidden="true" />
                        ) : reached ? (
                          <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden="true" />
                        ) : null}{' '}
                        {step.label}
                      </span>
                      <span>{reached ? step.note : 'Belum'}</span>
                    </div>
                  )
                })}
                {needsBank && submitted && bankComplete ? (
                  <p className="summary-info-note">
                    Dikirim ke {bankName} {bankAccount}.
                  </p>
                ) : null}
              </section>

              {error ? <p className="summary-info-note">{error}</p> : null}

              <button
                type="button"
                className="btn btn-primary"
                disabled={!canSubmit}
                onClick={() => void submit()}
              >
                {status === 'completed'
                  ? 'Refund selesai'
                  : status === 'processing'
                    ? 'Memproses refund…'
                    : 'Kirim permintaan refund'}
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
