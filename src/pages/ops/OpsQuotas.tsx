import { useEffect, useState } from 'react'

import { fetchQuotaPackages } from '../../api/quota'
import { apiEnabled } from '../../api/supabase'
import { OpsShell } from '../../components/layout/OpsShell'
import { jod } from '../../data/currency'
import { mockQuotaPackages } from '../../data/marketplace'
import type { QuotaKind, QuotaPackage } from '../../types'

const KIND_LABEL: Record<QuotaKind, string> = {
  order: 'Kuota order',
  cod: 'Kuota COD',
}

/**
 * Paket kuota (M10, §17). Ops mengelola katalog paket yang bisa dibeli merchant.
 * Katalog dibaca **live** dari `quota_packages` (via `quota.ts`), dengan mock
 * sebagai fallback bila BE kosong/menolak — pola yang sama dengan layar lain
 * (AGENTS §1). Penyuntingan paket di sini mock (tampilan), bukan tulis BE.
 */
export default function OpsQuotas() {
  const [packages, setPackages] = useState<QuotaPackage[]>(mockQuotaPackages)

  useEffect(() => {
    if (!apiEnabled) return
    fetchQuotaPackages()
      .then((list) => {
        if (list.length) setPackages(list)
      })
      .catch(() => {})
  }, [])

  return (
    <OpsShell>
      <section className="sa-card">
        <p className="sa-card-label">Katalog paket kuota</p>
        <p className="sa-card-sub">
          Paket yang bisa dibeli merchant: kuota order (online) dan kuota COD. Kuota berkuota COD
          membuat biaya platform ditanggung paket, bukan merchant per order.
        </p>
      </section>

      <section className="sa-card">
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Jenis</th>
                <th>Jumlah order</th>
                <th>Masa berlaku</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td>
                    <strong>{KIND_LABEL[pkg.kind]}</strong>
                  </td>
                  <td>{pkg.units} order</td>
                  <td>{pkg.days} hari</td>
                  <td>{jod(pkg.priceJod)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sa-card">
        <p className="sa-note">
          Harga paket ditagih sebagai transaksi biasa: pembayaran QRIS kena `Ft` 1,5%, saldo DANA
          tidak. Menambah/mengubah paket di panel ini belum menulis ke BE (mock).
        </p>
      </section>
    </OpsShell>
  )
}
