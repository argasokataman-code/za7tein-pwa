import { ChevronLeft, Coins, Info, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { jod, jodToIdr } from '../data/currency'
import { CREDIT_EVENT_LABEL, MERCHANT_CREDIT_JOD, MERCHANT_CREDIT_ORDERS, REBATE_TIERS, rebateProgress } from '../data/incentive'
import { money } from '../data/merchant'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { payRebate, recordSettledOrder } from '../store/slices/merchantSlice'

/**
 * Rincian insentif merchant (R-INCENTIVE-01, flow F9, milestone M10). Layar ini
 * tempat riwayat modal & cashback tinggal — beranda hanya menampilkan ringkasan.
 *
 * Dua aksi di bawah sengaja diberi tanda **simulasi platform**: menurut PRD
 * cashback dibayar platform di akhir bulan ke dompet deposit merchant, dan tidak
 * ada jalur pencairan (I-3 non-withdrawal). Jadi tidak ada tombol yang
 * menggambarkan merchant membayar atau menarik apa pun; keduanya hanya memicu
 * state demo supaya penanda tier dan event `rebate_paid` bisa diperiksa.
 */
export default function MerchantRebate() {
  const dispatch = useAppDispatch()
  const credit = useAppSelector((state) => state.merchant.credit)

  const progress = rebateProgress(credit.settledThisPeriod)
  const creditUsedRatio = 1 - credit.merchantCreditBalance / MERCHANT_CREDIT_JOD

  const statusCashback = credit.rebateTier
    ? credit.rebatePaidAt
      ? `Sudah masuk dompet deposit ${money(jodToIdr(credit.rebateAmountJod))} (${jod(credit.rebateAmountJod)})`
      : `Menunggu dibayar platform akhir bulan: ${money(jodToIdr(credit.rebateAmountJod))} (${jod(credit.rebateAmountJod)})`
    : 'Belum ada ambang tier yang terlewati periode ini'

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Insentif Founding" title="Modal & cashback" />

        <section className="merchant-card">
          <div className="merchant-row">
            <Coins size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="merchant-card-title">Sisa modal</p>
              <p className="merchant-card-sub">
                {money(jodToIdr(credit.merchantCreditBalance))} · {jod(credit.merchantCreditBalance)}{' '}
                dari {jod(MERCHANT_CREDIT_JOD)} · non-withdrawal
              </p>
            </div>
          </div>
          <div className="merchant-quota" role="presentation">
            <span style={{ width: `${Math.round(creditUsedRatio * 100)}%` }} />
          </div>
          <p className="merchant-card-sub">
            {MERCHANT_CREDIT_ORDERS} order pertama memakai modal ini. Fee merchant 0,15 JOD per
            order dipotong dari sini, bukan dari dompet, jadi selama modal masih ada fee itu tidak
            terasa.
          </p>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <Sparkles size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="merchant-card-title">Cashback tier bulanan</p>
              <p className="merchant-card-sub">Periode {credit.rebatePeriod}</p>
            </div>
          </div>

          <p className="merchant-card-sub">
            {credit.settledThisPeriod} order settled ·{' '}
            {progress.next
              ? `${progress.next - credit.settledThisPeriod} lagi ke ambang ${progress.next}`
              : 'semua ambang terlewati'}
          </p>
          <div className="merchant-quota" role="presentation">
            <span style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
          </div>

          <ul className="merchant-tier-list">
            {REBATE_TIERS.map((tier) => {
              const tercapai = credit.settledThisPeriod >= tier.threshold
              return (
                <li key={tier.id} className={tercapai ? 'is-reached' : undefined}>
                  <span className="merchant-tier-threshold">{tier.threshold} order</span>
                  <span className="merchant-tier-amount">{jod(tier.amountJod)}</span>
                </li>
              )
            })}
          </ul>

          <p className="merchant-card-sub">{statusCashback}</p>
          <p className="merchant-card-sub">
            Dompet deposit sekarang {money(jodToIdr(credit.depositBalanceJod))} (
            {jod(credit.depositBalanceJod)}).
          </p>
        </section>

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Riwayat modal &amp; cashback</h2>
          </div>
          <ul className="merchant-event-list">
            {credit.events.map((entry) => (
              <li key={entry.id}>
                <span className="merchant-event-label">{CREDIT_EVENT_LABEL[entry.event]}</span>
                <span className="merchant-event-amount">{jod(entry.amountJod)}</span>
                <span className="merchant-event-at">{entry.at}</span>
              </li>
            ))}
          </ul>
          <p className="merchant-hint-inline">
            Urut dari yang terbaru. Daftar ini bertambah, tidak pernah disunting.
          </p>
        </section>

        <section className="merchant-card merchant-sim">
          <div className="merchant-row">
            <Info size={18} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="merchant-card-title">Simulasi platform (bukan aksi merchant)</p>
              <p className="merchant-card-sub">
                Cashback dibayar platform ke dompet deposit di akhir bulan, dan tidak ada jalur
                pencairan untuk modal maupun cashback. Dua tombol di bawah hanya untuk memeriksa
                state demo.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary merchant-sim-btn"
            disabled={!credit.rebateTier || credit.rebatePaidAt !== null}
            onClick={() => {
              dispatch(payRebate())
              toast.success('Simulasi: platform membayar cashback ke dompet deposit')
            }}
          >
            {credit.rebatePaidAt
              ? 'Cashback periode ini sudah dibayar'
              : 'Simulasi: platform bayar cashback'}
          </button>
          <button
            type="button"
            className="merchant-btn-ghost merchant-sim-btn"
            onClick={() => {
              // Satu order settled = satu hitungan periode + satu potongan fee.
              dispatch(recordSettledOrder())
              toast.success('Simulasi: 1 order settled dicatat')
            }}
          >
            Simulasi: catat 1 order settled
          </button>
        </section>

        <section className="merchant-card">
          <p className="merchant-card-title">Yang belum final</p>
          <ul className="merchant-open-list">
            <li>
              <strong>I-4</strong> — periode tier: bulan kalender, dan perlakuan naik tier di
              tengah bulan (proporsional atau tier akhir bulan).
            </li>
            <li>
              <strong>I-5</strong> — kuota Founding: dibatasi jumlah merchant atau berlaku untuk
              semua merchant baru, dan berapa lama.
            </li>
          </ul>
          <p className="merchant-card-sub">
            Dua yang sudah putus: cashback <strong>non-withdrawal</strong> (I-3) dan sisa modal{' '}
            <strong>hangus</strong> kalau merchant berhenti (I-6). Angka di layar ini adalah state
            demo, bukan counter sungguhan.
          </p>
        </section>

        <a className="merchant-back-link" href="/merchant">
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          Kembali ke beranda dapur
        </a>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
