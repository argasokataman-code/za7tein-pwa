import { useAppSelector } from '../../hooks/useAppStore'
import { useMoney } from '../../hooks/useMoney'
import { codCashHint, codChangeIdr } from '../../data/codCash'

interface CodCashSectionProps {
  orderCode: string
  canCancel: boolean
  onCancel: () => void
}

/**
 * Kartu pembayaran COD di layar pesanan customer.
 *
 * Menggantikan tampilan "Hold COD" untuk order tunai: customer melihat tagihan,
 * uang yang dia siapkan, dan kembalian yang akan diterima. Angkanya membaca
 * pilihan yang sama dengan layar bayar (`cart.codCashIdr`), bukan dihitung ulang
 * dengan pembulatan berbeda.
 */
export function CodCashSection({ orderCode, canCancel, onCancel }: CodCashSectionProps) {
  const { money } = useMoney()
  const receipt = useAppSelector((s) => s.cart.lastReceipt)
  const cashIdr = useAppSelector((s) => s.cart.codCashIdr)
  const paymentId = useAppSelector((s) => s.cart.selectedPaymentId)

  if (paymentId !== 'cod' || !receipt || receipt.code !== orderCode) return null

  const totalIdr = receipt.totalIdr
  const preparedIdr = receipt.cashIdr ?? cashIdr ?? totalIdr
  const changeIdr = codChangeIdr(totalIdr, preparedIdr)

  return (
    <section className="track-section">
      <h2 className="track-section-title">Pembayaran COD</h2>
      <div className="cod-cash-card">
        <div className="cod-cash-row">
          <span>Tagihan tunai</span>
          <span className="cod-cash-amount">{money(totalIdr)}</span>
        </div>
        <div className="cod-cash-row">
          <span>Uang disiapkan</span>
          <span className="cod-cash-amount">{money(preparedIdr)}</span>
        </div>
        <div className="cod-cash-row cod-cash-row--total">
          <span>Kembalian</span>
          <span className="cod-cash-amount">{money(changeIdr)}</span>
        </div>
        <p className="cod-cash-hint">{codCashHint(totalIdr, preparedIdr, money)}</p>
        {canCancel ? (
          <button type="button" className="cod-cash-cancel" onClick={onCancel}>
            Batalkan pesanan
          </button>
        ) : null}
      </div>
    </section>
  )
}
