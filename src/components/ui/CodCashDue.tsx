import { codCashDue } from '../../data/codCash'
import { useMoney } from '../../hooks/useMoney'
import type { CartItem } from '../../types'

interface CodCashDueProps {
  items: Pick<CartItem, 'price' | 'quantity'>[]
  totalIdr: number
}

/**
 * Rincian uang tunai COD (subtotal, ongkir + layanan, tagihan, kembalian per
 * nominal) untuk layar merchant dan kurir. Angkanya dari `codCashDue` supaya
 * kedua sisi tidak menghitung sendiri-sendiri.
 */
export function CodCashDue({ items, totalIdr }: CodCashDueProps) {
  const { money } = useMoney()
  const due = codCashDue(items, totalIdr)

  return (
    <div className="cod-cash-card">
      <div className="cod-cash-row">
        <span>Subtotal menu</span>
        <span className="cod-cash-amount">{money(due.subtotalIdr)}</span>
      </div>
      {due.extraIdr > 0 ? (
        <div className="cod-cash-row">
          <span>Ongkir, layanan &amp; tips</span>
          <span className="cod-cash-amount">{money(due.extraIdr)}</span>
        </div>
      ) : null}
      <div className="cod-cash-row cod-cash-row--total">
        <span>Tagihan tunai</span>
        <span className="cod-cash-amount">{money(due.totalIdr)}</span>
      </div>
      <p className="cod-cash-hint">Kembalian bila customer membayar:</p>
      {due.options.map((option) => (
        <div className="cod-cash-row" key={option.id}>
          <span>{option.label}</span>
          <span className="cod-cash-amount">
            {option.changeIdr > 0 ? `Kembali ${money(option.changeIdr)}` : 'Tanpa kembalian'}
          </span>
        </div>
      ))}
    </div>
  )
}
