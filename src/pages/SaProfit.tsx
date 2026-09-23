import { ArrowDownToLine, Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import { ExchangeRateNote } from '../components/ui/ExchangeRateNote'
import { aggregateLiability, moneyFromJod, totalLiability } from '../data/admin'
import { profitBalance, roleForOperator, roleHasPermission, withdrawnTotal } from '../data/superadmin'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { withdrawProfit } from '../store/slices/superAdminSlice'

const METHODS = ['Rekening platform · IDR', 'Rekening platform · JOD', 'Kartu korporat']

/**
 * Saldo keuntungan platform. Layar ini yang paling mudah disalahpahami, jadi
 * urutannya sengaja: angka yang **boleh** ditarik dulu, lalu rincian dari mana
 * angkanya datang, lalu pengingat bahwa dana user di sebelahnya bukan milik SA.
 *
 * Penarikan divalidasi di layar (harus > 0 dan ≤ saldo) dan lagi di reducer,
 * karena satu jalur validasi saja gampang dilewati.
 */
export default function SaProfit() {
  const dispatch = useAppDispatch()
  const profit = useAppSelector((s) => s.superAdmin.profit)
  const storedLiability = useAppSelector((s) => s.admin.liability)
  const walletIdr = useAppSelector((s) => s.wallet.balance.balance)
  // Izin ditegakkan di tombolnya, bukan hanya di nav: role yang boleh melihat
  // saldo belum tentu boleh menariknya.
  const operators = useAppSelector((s) => s.superAdmin.operators)
  const roles = useAppSelector((s) => s.superAdmin.roles)
  const activeOperatorId = useAppSelector((s) => s.superAdmin.activeOperatorId)
  const activeRole = roleForOperator(
    roles,
    operators.find((operator) => operator.id === activeOperatorId) ?? operators[0],
  )
  const canWithdraw = roleHasPermission(activeRole, 'profit.withdraw')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState(METHODS[0])

  const balance = profitBalance(profit)
  const liability = aggregateLiability(storedLiability, walletIdr)
  const parsed = Number(amount.replace(',', '.'))
  const invalidReason = !amount
    ? 'Isi nominal yang mau ditarik.'
    : Number.isNaN(parsed) || parsed <= 0
      ? 'Nominal harus lebih besar dari 0.'
      : parsed > balance
        ? `Nominal melebihi saldo yang bisa ditarik (${balance.toFixed(2)} JOD).`
        : null

  return (
    <SuperAdminShell>
      <section className="sa-hero">
        <article className="sa-card sa-card--brand">
          <p className="sa-card-label">Bisa ditarik sekarang</p>
          <p className="sa-card-value">{moneyFromJod(balance)}</p>
          <p className="sa-card-sub">
            Fee terkumpul {profit.feeGrossJod.toFixed(2)} JOD − biaya operasional{' '}
            {profit.costJod.toFixed(2)} JOD − PPh final {profit.pphFinalJod.toFixed(2)} JOD −
            penarikan {withdrawnTotal(profit).toFixed(2)} JOD.
          </p>
        </article>

        <article className="sa-card">
          <p className="sa-card-label">
            <Lock size={14} strokeWidth={1.75} aria-hidden="true" /> Dana user di luar perhitungan
          </p>
          <p className="sa-card-value sa-card-value--plain">{moneyFromJod(totalLiability(liability))}</p>
          <p className="sa-card-sub">
            Saldo wallet customer, merchant, dan tips kurir yang belum di-payout. Itu kewajiban
            platform, bukan pendapatan: tidak ada tombol tarik untuk angka ini, dan top-up/payout
            jalan sendiri oleh sistem.
          </p>
        </article>
      </section>

      <section className="sa-card">
        <p className="sa-card-label">Tarik keuntungan</p>
        <form
          className="sa-form-grid"
          onSubmit={(event) => {
            event.preventDefault()
            if (invalidReason) return
            dispatch(withdrawProfit({ amountJod: Number(parsed.toFixed(2)), method }))
            toast.success(`Penarikan ${parsed.toFixed(2)} JOD dicatat sebagai processing`)
            setAmount('')
          }}
        >
          <label className="sa-field">
            <span>Nominal (JOD)</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={balance.toFixed(2)}
              aria-invalid={Boolean(invalidReason && amount)}
            />
          </label>
          <label className="sa-field">
            <span>Tujuan</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              {METHODS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="sa-btn sa-btn--primary"
            disabled={Boolean(invalidReason) || !canWithdraw}
            title={
              !canWithdraw ? `Role ${activeRole?.name} tidak punya izin tarik saldo` : invalidReason ?? undefined
            }
          >
            <ArrowDownToLine size={16} strokeWidth={1.75} aria-hidden="true" />
            {canWithdraw ? 'Tarik keuntungan' : 'Tidak punya izin tarik'}
          </button>
        </form>
        <p className="sa-note">
          {!canWithdraw
            ? `Role ${activeRole?.name} boleh melihat saldo, tapi tidak boleh menariknya (izin profit.withdraw).`
            : (invalidReason ?? `Sisa setelah penarikan ini: ${(balance - parsed).toFixed(2)} JOD.`)}{' '}
          Penarikan masuk sebagai <em>processing</em>; jadwal settlement final masih UNRESOLVED.
        </p>
      </section>

      <section className="sa-card">
        <p className="sa-card-label">Riwayat penarikan</p>
        {profit.withdrawals.length === 0 ? (
          <p className="sa-empty">Belum ada penarikan keuntungan.</p>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th scope="col">Waktu</th>
                  <th scope="col">Nominal</th>
                  <th scope="col">Tujuan</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {profit.withdrawals.map((item) => (
                  <tr key={item.id}>
                    <td className="sa-nowrap">{item.at}</td>
                    <td>{item.amountJod.toFixed(2)} JOD</td>
                    <td>{item.method}</td>
                    <td>
                      <span className={`sa-chip${item.status === 'settled' ? ' is-ok' : ''}`}>
                        {item.status === 'settled' ? 'Selesai' : 'Processing'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ExchangeRateNote />
      </section>
    </SuperAdminShell>
  )
}
