// Langganan kuota merchant (§17). Dua langganan bisa aktif bersamaan: kuota
// **order** (order online) dan kuota **COD** — order COD hanya memakai kuota COD,
// order online memakai kuota order dulu lalu jatuh ke kuota COD. Kuota tersedia
// = paket − terpakai − ter-reserve; sisa hangus di akhir periode.
//
// **Pembelian belum tersedia.** BE belum punya tabel langganan
// (`merchant_subscriptions`/`quota_subscriptions` → 404) dan `src/api/` tak punya
// endpoint kuota, jadi paketnya ditampilkan apa adanya tetapi tombol beli mati
// dengan alasan. Saldo kuota di bawah berasal dari state aplikasi, bukan backend.
import { PackageCheck, ShoppingBag, Truck } from 'lucide-react'

import { DEMO_MERCHANT_ID } from '../api/reference'
import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { jodToIdr } from '../data/currency'
import {
  QUOTA_LOW_RATIO,
  QUOTA_PURCHASE_AVAILABLE,
  mockQuotaPackages,
} from '../data/marketplace'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'
import { quotaStatusFor, setAcceptWithoutQuota } from '../store/slices/quotaSlice'
import type { QuotaKind } from '../types'

const QUOTA_KINDS: QuotaKind[] = ['order', 'cod']

/** Keterangan tiap jenis kuota (satu bahasa: lucide untuk ikonnya). */
const KIND_COPY: Record<QuotaKind, { label: string; note: string }> = {
  order: { label: 'Kuota order', note: 'Order online (bayar lewat aplikasi)' },
  cod: { label: 'Kuota COD', note: 'Order bayar di tempat' },
}

const STATUS_LABEL = {
  available: 'Cukup',
  low: 'Hampir habis',
  exhausted: 'Habis',
  unknown: 'Belum ada langganan',
} as const

export default function MerchantSubscription() {
  const dispatch = useAppDispatch()
  const { money } = useMoney()
  const subs = useAppSelector((s) => s.quota.subscriptions)
  const acceptWithoutQuota = useAppSelector((s) => s.quota.acceptWithoutQuota)
  // §17: setting "terima order tanpa kuota" hanya bisa diubah saat toko tutup.
  const storeClosed = useAppSelector((s) => !s.merchant.isActive)
  const merchantId = String(DEMO_MERCHANT_ID)

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Langganan" title="Kuota order" back="/" />

        <PlatformNotice
          message={
            QUOTA_PURCHASE_AVAILABLE
              ? 'Beli kuota order atau kuota COD. Sisa kuota hangus di akhir periode.'
              : 'Pembelian kuota belum tersedia. Backend belum punya tabel langganan, jadi saldo kuota di bawah berasal dari data aplikasi dan setting di halaman ini belum tersimpan ke server.'
          }
        />

        {/* Dua jenis kuota berdampingan: angkanya dibaca lebih dulu. */}
        <section className="merchant-stats">
          {QUOTA_KINDS.map((kind) => (
            <div key={kind} className="merchant-stat">
              <span className="merchant-stat-value">
                {subs
                  .filter((s) => s.active && s.kind === kind && s.merchantId === merchantId)
                  .reduce((sum, s) => sum + (s.quota - s.used - s.reserved), 0)}
              </span>
              <span className="merchant-stat-label">{KIND_COPY[kind].label} · sisa</span>
            </div>
          ))}
        </section>

        {QUOTA_KINDS.map((kind) => {
          const mine = subs.filter((s) => s.active && s.kind === kind && s.merchantId === merchantId)
          const quota = mine.reduce((sum, s) => sum + s.quota, 0)
          const used = mine.reduce((sum, s) => sum + s.used, 0)
          const reserved = mine.reduce((sum, s) => sum + s.reserved, 0)
          const available = Math.max(0, quota - used - reserved)
          const status = quotaStatusFor(subs, merchantId, kind)
          const periode = mine[0]
          return (
            <section key={kind} className="merchant-card">
              <p className="merchant-card-title">
                {kind === 'order' ? (
                  <PackageCheck size={18} strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <ShoppingBag size={18} strokeWidth={1.75} aria-hidden="true" />
                )}{' '}
                {KIND_COPY[kind].label}
              </p>
              <p className="merchant-card-sub">{KIND_COPY[kind].note}</p>
              <div className="merchant-row">
                <span>Tersedia</span>
                <span className="merchant-badge">{STATUS_LABEL[status]}</span>
              </div>
              <div className="merchant-quota" role="presentation">
                <span
                  style={{ width: `${quota > 0 ? Math.round((available / quota) * 100) : 0}%` }}
                />
              </div>
              <div className="merchant-row">
                <span>Paket periode ini</span>
                <span>{quota} order</span>
              </div>
              <div className="merchant-row">
                <span>Terpakai</span>
                <span>{used} order</span>
              </div>
              <div className="merchant-row">
                <span>Ter-reserve</span>
                <span>{reserved} order</span>
              </div>
              <div className="merchant-row">
                <span>Periode</span>
                <span>{periode ? `${periode.periodStart} → ${periode.periodEnd}` : 'Belum ada'}</span>
              </div>
            </section>
          )
        })}

        {/* Dulu diulang di tiap kartu (audit 019 #6) — satu kali saja di bawah
            kedua kartu; kalimatnya memang sama untuk kuota order maupun COD. */}
        <p className="merchant-card-sub">
          Sisa ≤ {Math.round(QUOTA_LOW_RATIO * 100)}% paket dihitung hampir habis. Saat kuota order
          habis, toko disembunyikan dari beranda kecuali "terima order tanpa kuota" menyala.
        </p>

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Beli paket kuota</h2>
          </div>
          {mockQuotaPackages.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              className="merchant-quick-action"
              disabled={!QUOTA_PURCHASE_AVAILABLE}
            >
              <span className="merchant-quick-icon">
                {pkg.kind === 'order' ? (
                  <PackageCheck size={20} strokeWidth={1.75} />
                ) : (
                  <Truck size={20} strokeWidth={1.75} />
                )}
              </span>
              <div>
                <p className="merchant-quick-title">
                  {pkg.units} {pkg.kind === 'order' ? 'order' : 'order COD'}
                </p>
                <p className="merchant-quick-sub">
                  {pkg.days} hari · {money(jodToIdr(pkg.priceJod))}
                </p>
              </div>
              <span className="merchant-badge">
                {QUOTA_PURCHASE_AVAILABLE ? 'Beli' : 'Belum tersedia'}
              </span>
            </button>
          ))}
          <p className="merchant-card-sub">
            Pembelian = transaksi biasa: bayar QRIS kena biaya transaksi 1,5% (§16.2), saldo DANA
            tidak. Periode dimulai saat paket aktif, sisa hangus di akhir periode.
          </p>
        </section>

        <section className="merchant-card">
          <p className="merchant-card-title">Terima order tanpa kuota</p>
          <p className="merchant-card-sub">
            Saat menyala, toko tetap tampil di beranda meski kuota order habis; order seperti itu
            tidak memotong kuota.
          </p>
          {/* Seluruh baris jadi sasaran sentuh (audit 019 #1/#7): dulu hanya
              switch 52×28 di ujung yang bisa ditekan. Label membungkus input. */}
          <label className="merchant-row">
            <span>Izinkan order tanpa kuota</span>
            <span className="toggle-wrap">
              <input
                className="toggle-input"
                type="checkbox"
                checked={acceptWithoutQuota}
                disabled={!storeClosed}
                onChange={(e) => dispatch(setAcceptWithoutQuota(e.target.checked))}
              />
              <span className="toggle-slider" />
            </span>
          </label>
          <p className="merchant-card-sub">
            {storeClosed
              ? 'Toko sedang tutup, setting ini boleh diubah.'
              : 'Toko sedang buka, tutup dulu untuk mengubah setting ini (§17).'}
          </p>
        </section>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
