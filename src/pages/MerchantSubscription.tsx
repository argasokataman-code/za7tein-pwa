// Langganan kuota merchant (§17). Dua langganan bisa aktif bersamaan: kuota
// **order** (order online) dan kuota **COD** — order COD hanya memakai kuota COD,
// order online memakai kuota order dulu lalu jatuh ke kuota COD. Kuota tersedia
// = paket − terpakai − ter-reserve; sisa hangus di akhir periode.
//
// **Pembelian belum tersedia.** BE belum punya tabel langganan
// (`merchant_subscriptions`/`quota_subscriptions` → 404) dan `src/api/` tak punya
// endpoint kuota, jadi paketnya ditampilkan apa adanya tetapi tombol beli mati
// dengan alasan. Saldo kuota di bawah berasal dari state aplikasi, bukan backend.
//
// Tata letak: satu kartu per jenis kuota dengan **warna status** (hijau/kuning/
// merah) dan angka sisa sebagai fokus, bukan empat baris key-value yang terbaca
// seperti tabel. Paket ditampilkan sebagai grid kartu (dulu lima baris list).
import { PackageCheck, ShoppingBag } from 'lucide-react'

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
  order: { label: 'Kuota order', note: 'Order online' },
  cod: { label: 'Kuota COD', note: 'Bayar di tempat' },
}

const STATUS_LABEL = {
  available: 'Cukup',
  low: 'Hampir habis',
  exhausted: 'Habis',
  unknown: 'Belum ada langganan',
} as const

/** Status → nada warna kartu. Satu nada satu kelas; warnanya dari token status. */
const STATUS_TONE = {
  available: 'ok',
  low: 'low',
  exhausted: 'out',
  unknown: 'none',
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

        {/* Satu kartu per jenis kuota: angka sisa besar, warna = status. Dulu
            angkanya kecil di atas lalu diulang sebagai baris tabel di bawah. */}
        {QUOTA_KINDS.map((kind) => {
          const mine = subs.filter((s) => s.active && s.kind === kind && s.merchantId === merchantId)
          const quota = mine.reduce((sum, s) => sum + s.quota, 0)
          const used = mine.reduce((sum, s) => sum + s.used, 0)
          const reserved = mine.reduce((sum, s) => sum + s.reserved, 0)
          const available = Math.max(0, quota - used - reserved)
          const status = quotaStatusFor(subs, merchantId, kind)
          const tone = STATUS_TONE[status]
          const periode = mine[0]
          return (
            <section key={kind} className={`merchant-quota-card merchant-quota-card--${tone}`}>
              <div className="merchant-quota-card__head">
                <span className="merchant-quota-card__label">
                  {kind === 'order' ? (
                    <PackageCheck size={18} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <ShoppingBag size={18} strokeWidth={1.75} aria-hidden="true" />
                  )}
                  {KIND_COPY[kind].label}
                </span>
                <span className="merchant-quota-chip">{STATUS_LABEL[status]}</span>
              </div>

              <p className="merchant-quota-card__value">
                {available}
                <span className="merchant-quota-card__unit">
                  {quota > 0 ? `/ ${quota} order` : 'belum ada paket'}
                </span>
              </p>

              <div className={`merchant-quota merchant-quota--${tone}`} role="presentation">
                <span
                  style={{ width: `${quota > 0 ? Math.round((available / quota) * 100) : 0}%` }}
                />
              </div>

              <p className="merchant-quota-card__meta">
                {KIND_COPY[kind].note} · terpakai {used} · ter-reserve {reserved}
              </p>
              <p className="merchant-quota-card__meta">
                {periode ? `${periode.periodStart} → ${periode.periodEnd}` : 'Belum ada periode aktif'}
              </p>
            </section>
          )
        })}

        <p className="merchant-card-sub">
          Sisa ≤ {Math.round(QUOTA_LOW_RATIO * 100)}% paket dihitung hampir habis. Saat kuota order
          habis, toko disembunyikan dari beranda kecuali sakelar di bawah menyala.
        </p>

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Beli paket kuota</h2>
          </div>
          <div className="merchant-quota-packages">
            {mockQuotaPackages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                className="merchant-quota-package"
                disabled={!QUOTA_PURCHASE_AVAILABLE}
              >
                <span className="merchant-quota-package__kind">
                  {pkg.kind === 'order' ? 'Order' : 'COD'}
                </span>
                <span className="merchant-quota-package__units">{pkg.units}</span>
                <span className="merchant-quota-package__days">{pkg.days} hari</span>
                <span className="merchant-quota-package__price">
                  {money(jodToIdr(pkg.priceJod))}
                </span>
                <span className="merchant-quota-package__chip">
                  {QUOTA_PURCHASE_AVAILABLE ? 'Beli' : 'Belum tersedia'}
                </span>
              </button>
            ))}
          </div>
          <p className="merchant-card-sub">
            Pembelian lewat QRIS dikenai biaya transaksi 1,5% (§16.2) — saldo DANA tidak. Sisa hangus
            di akhir periode.
          </p>
        </section>

        {/* Nada kartu mengikuti keadaan sakelar: hijau saat "terima order tanpa
            kuota" menyala, netral saat mati. Latar penuh karena kartunya sendiri
            adalah status. */}
        <section className={acceptWithoutQuota ? 'merchant-card tone-success tone-fill' : 'merchant-card'}>
          <p className="merchant-card-title">Terima order tanpa kuota</p>
          <p className="merchant-card-sub">
            Saat menyala, toko tetap tampil di beranda meski kuota order habis; order seperti itu
            tidak memotong kuota.
          </p>
          {/* Seluruh baris jadi sasaran sentuh (audit 019): label membungkus input. */}
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
