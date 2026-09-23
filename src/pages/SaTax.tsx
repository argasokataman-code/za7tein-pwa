import { useState } from 'react'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { MoneyPair } from '../components/ui/MoneyPair'
import { jod } from '../data/currency'
import { PPH_FINAL_PERCENT, gstFoodFor, taxReports } from '../data/superadmin'

/**
 * Laporan pajak aplikasi. Dua objek pajak yang berbeda ditampilkan terpisah
 * supaya tidak tertukar: GST makanan ditanggung **merchant** atas penjualan
 * (info-only), sedangkan PPh final adalah beban **platform** atas fee.
 *
 * Semua tarif masih placeholder: tarif final menunggu konsultan pajak
 * (OQ-2/3/4, OQ-17/18), jadi layar menyebutnya, bukan menyembunyikannya.
 */
export default function SaTax() {
  const [period, setPeriod] = useState<string>('all')
  const rows = period === 'all' ? taxReports : taxReports.filter((r) => r.period === period)

  const totals = rows.reduce(
    (acc, row) => ({
      orders: acc.orders + row.orders,
      salesIdr: acc.salesIdr + row.salesIdr,
      feeGrossJod: acc.feeGrossJod + row.feeGrossJod,
      gstOnFeeJod: acc.gstOnFeeJod + row.gstOnFeeJod,
      pphFinalJod: acc.pphFinalJod + row.pphFinalJod,
    }),
    { orders: 0, salesIdr: 0, feeGrossJod: 0, gstOnFeeJod: 0, pphFinalJod: 0 },
  )

  return (
    <SuperAdminShell>
      <section className="sa-card">
        <div className="sa-card-head">
          <div>
            <p className="sa-card-label">Laporan pajak</p>
            <p className="sa-card-sub">
              {totals.orders} order · {rows.length} periode · angka demo
            </p>
          </div>
          <div className="sa-filters" role="group" aria-label="Pilih periode">
            <button
              type="button"
              className={`sa-filter${period === 'all' ? ' is-active' : ''}`}
              aria-pressed={period === 'all'}
              onClick={() => setPeriod('all')}
            >
              Semua periode
            </button>
            {taxReports.map((row) => (
              <button
                key={row.period}
                type="button"
                className={`sa-filter${period === row.period ? ' is-active' : ''}`}
                aria-pressed={period === row.period}
                onClick={() => setPeriod(row.period)}
              >
                {row.period}
              </button>
            ))}
          </div>
        </div>

        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th scope="col">Periode</th>
                <th scope="col">Order</th>
                <th scope="col">Penjualan merchant</th>
                <th scope="col">GST makanan (16%, merchant)</th>
                <th scope="col">Fee platform</th>
                <th scope="col">GST fee (16%, info)</th>
                <th scope="col">PPh final ({PPH_FINAL_PERCENT}%)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.period}>
                  <td className="sa-nowrap">{row.period}</td>
                  <td>{row.orders}</td>
                  <td>
                    <MoneyPair idr={row.salesIdr} />
                  </td>
                  <td>
                    <MoneyPair idr={gstFoodFor(row.salesIdr)} />
                  </td>
                  <td className="sa-nowrap">{jod(row.feeGrossJod)}</td>
                  <td className="sa-nowrap">{jod(row.gstOnFeeJod)}</td>
                  <td className="sa-nowrap">{jod(row.pphFinalJod)}</td>
                </tr>
              ))}
              <tr>
                <td className="sa-nowrap">
                  <strong>Total</strong>
                </td>
                <td>{totals.orders}</td>
                <td>
                  <MoneyPair idr={totals.salesIdr} />
                </td>
                <td>
                  <MoneyPair idr={gstFoodFor(totals.salesIdr)} />
                </td>
                <td className="sa-nowrap">{jod(totals.feeGrossJod)}</td>
                <td className="sa-nowrap">{jod(totals.gstOnFeeJod)}</td>
                <td className="sa-nowrap">{jod(totals.pphFinalJod)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="sa-note">
          <strong>Dua objek, dua penanggung.</strong> GST makanan dibebankan ke merchant atas
          penjualan, bukan ke platform. Yang menjadi beban platform hanya PPh final atas fee,
          itulah yang mengurangi saldo keuntungan di layar berikutnya. GST atas fee belum
          dipungut, jadi ditandai info.
        </p>
        <p className="sa-note">
          Tarif di tabel ini <strong>placeholder</strong>: tarif GST dan struktur PPh final
          menunggu konsultan pajak (OQ-2/3/4, OQ-17/18). Jangan dipakai sebagai angka setor.
        </p>
        <ExchangeRateNote />
      </section>
    </SuperAdminShell>
  )
}
