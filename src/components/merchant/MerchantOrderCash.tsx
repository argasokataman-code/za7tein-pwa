import { CodCashDue } from '../ui/CodCashDue'
import type { MerchantOrder } from '../../types'

interface MerchantOrderCashProps {
  order: MerchantOrder
}

/**
 * Uang tunai yang dibayar customer di tempat untuk order COD, tampil di detail
 * order masuk supaya merchant menyiapkan kembalian sebelum menerima order.
 *
 * Order non-COD dan order batal tidak menagih tunai, jadi tidak dirender.
 * Dipisah dari halaman supaya detail order tidak menumpuk baris JSX dan batas
 * 700 baris halaman tetap terjaga (sama seperti `MerchantEarnings`).
 */
export function MerchantOrderCash({ order }: MerchantOrderCashProps) {
  if (order.paymentMethod !== 'cod' || order.status === 'batal') return null
  return (
    <div className="cod-cash">
      <h3 className="cod-cash-title">Uang tunai dari customer</h3>
      <CodCashDue items={order.items} totalIdr={order.total} />
    </div>
  )
}
