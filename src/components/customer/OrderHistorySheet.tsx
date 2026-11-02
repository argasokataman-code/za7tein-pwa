import { RotateCcw, Star } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { TIPS_ENABLED } from '../../data/features'
import type { OrderHistoryItem, OrderReceipt } from '../../api/reviews'
import { useAppSelector } from '../../hooks/useAppStore'
import { useMoney } from '../../hooks/useMoney'
import { BottomSheet } from '../ui/BottomSheet'
import { orderStampLabel } from './orderStatus'
import { OrderInvoice } from './OrderInvoice'

interface OrderHistorySheetProps {
  /** Order yang sedang dibuka; `null` = sheet tertutup. */
  order: OrderHistoryItem | null
  onClose: () => void
  onReorder: (order: OrderHistoryItem) => void
}

/** `payment_method` di D1 memakai enum ketat (`qris | dana_balance | cod`). */
const CANCEL_BY_LABEL: Record<string, string> = {
  customer: 'Pembeli',
  merchant: 'Toko',
  system: 'Sistem',
}

const REFUND_LABEL: Record<string, string> = {
  none: 'Tidak ada',
  pending: 'Sedang diproses',
  refunded: 'Sudah dikembalikan',
}

const PAYMENT_LABEL: Record<string, string> = {
  qris: 'QRIS',
  dana_balance: 'Saldo DANA',
  cod: 'COD (bayar di tempat)',
  transfer: 'Transfer bank',
}

function paymentLabel(method: string | null): string {
  if (!method) return '-'
  return PAYMENT_LABEL[method] ?? method
}

/**
 * Nota satu pesanan, dibuka dari kartu riwayat `/customer/orders`.
 *
 * Bentuknya nota, bukan ringkasan: baris hidangan dengan harga satuan × jumlah,
 * pecahan biaya, lalu metode dan status bayar. Sumbernya kolom `orders` +
 * `order_items` di BE; kolom kosong ditulis "-", bukan angka karangan. Uang
 * tunai hanya muncul kalau order ini dibuat dari perangkat yang sama
 * (`cart.lastReceipt`) — di luar itu kembalian tidak bisa diketahui.
 *
 * Tata letak mengikuti irisan `docs/design/slice/order-history.html` bagian
 * `.nota-*`: satu daftar bergaris rambut, total bergaris putus-putus, kaki panel
 * yang menempel di dasar.
 */
export function OrderHistorySheet({ order, onClose, onReorder }: OrderHistorySheetProps) {
  const { moneyPlain } = useMoney()
  const receipt = useAppSelector((s) => s.cart.lastReceipt)
  const [showInvoice, setShowInvoice] = useState(false)

  const localReceipt = Boolean(order && receipt && receipt.code === order.code)
  const breakdown = order ? receiptLines(order.receipt) : []
  const paid = order?.receipt.paymentStatus === 'paid'
  const isCanceled = order?.status === 'canceled'
  const isCod = order?.receipt.paymentMethod === 'cod'
  const cashIdr = order && localReceipt ? receipt!.cashIdr : null
  const changeIdr = cashIdr != null && order ? Math.max(0, cashIdr - order.totalIdr) : null

  return (
    <BottomSheet
      open={Boolean(order)}
      title={order?.merchantName}
      onClose={() => {
        setShowInvoice(false)
        onClose()
      }}
    >
      {order ? (
        <>
          <p className="nota-meta">
            <span>{order.code}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={order.createdAt}>{orderStampLabel(order.createdAt)}</time>
            <span className={`oh-badge${isCanceled ? ' oh-badge--canceled' : ''}`}>
              {isCanceled ? 'Dibatalkan' : order.reviewed ? 'Sudah dinilai' : 'Belum dinilai'}
            </span>
          </p>

          {order.items.length ? (
            <section className="nota-section">
              <h3 className="nota-section__title">Rincian pesanan</h3>
              <ul className="nota-list">
                {order.items.map((dish) => (
                  <li className="nota-line" key={dish.id}>
                    <span className="nota-line__label">
                      {dish.qty ?? 1} × {dish.name}{' '}
                      {dish.unitIdr == null ? null : (
                        <span className="nota-line--muted">@ {moneyPlain(dish.unitIdr)}</span>
                      )}
                    </span>
                    <span className="nota-amount">
                      {dish.lineIdr == null ? '-' : moneyPlain(dish.lineIdr)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="nota-section">
            <h3 className="nota-section__title">Rincian pembayaran</h3>
            <ul className="nota-list">
              {breakdown.map((line) => (
                <li className="nota-line" key={line.label}>
                  <span className="nota-line__label">{line.label}</span>
                  <span className="nota-amount">
                    {line.valueIdr == null
                      ? '-'
                      : `${line.discount ? '−' : ''}${moneyPlain(Math.abs(line.valueIdr))}`}
                  </span>
                </li>
              ))}
              <li className="nota-line nota-line--total">
                <span className="nota-line__label">
                  Total bayar
                  {paid && !isCanceled ? <span className="nota-stamp">LUNAS</span> : null}
                </span>
                <span className="nota-amount">{moneyPlain(order.totalIdr)}</span>
              </li>
              {/* Uang tunai: nominal yang disiapkan customer dan kembaliannya. */}
              {isCod ? (
                <li className="nota-line">
                  <span className="nota-line__label">Uang diterima</span>
                  <span className="nota-amount">
                    {cashIdr == null ? '-' : moneyPlain(cashIdr)}
                  </span>
                </li>
              ) : null}
              {isCod ? (
                <li className={`nota-line${changeIdr == null ? '' : ' nota-line--change'}`}>
                  <span className="nota-line__label">Kembalian</span>
                  <span className="nota-amount">
                    {changeIdr == null ? '-' : moneyPlain(changeIdr)}
                  </span>
                </li>
              ) : null}
            </ul>
            <dl className="nota-list">
              <div className="nota-pair">
                <dt>Metode</dt>
                <dd>{paymentLabel(order.receipt.paymentMethod)}</dd>
              </div>
              <div className="nota-pair">
                <dt>Status bayar</dt>
                <dd>{paid ? 'Sudah dibayar' : 'Belum dibayar'}</dd>
              </div>
            </dl>
          </section>

          {isCanceled ? (
            <section className="nota-section">
              <h3 className="nota-section__title">Pembatalan</h3>
              <dl className="nota-list">
                <div className="nota-pair">
                  <dt>Dibatalkan oleh</dt>
                  <dd>
                    {order.cancelBy ? (CANCEL_BY_LABEL[order.cancelBy] ?? order.cancelBy) : '-'}
                  </dd>
                </div>
                <div className="nota-pair">
                  <dt>Alasan batal</dt>
                  <dd>{order.cancelReason ?? '-'}</dd>
                </div>
                <div className="nota-pair">
                  <dt>Pengembalian dana</dt>
                  <dd>
                    {order.refundStatus ? (REFUND_LABEL[order.refundStatus] ?? order.refundStatus) : '-'}
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          {localReceipt && showInvoice ? <OrderInvoice orderCode={order.code} /> : null}

          <div className="nota-foot">
            <div className="nota-total">
              <span>Total</span>
              <strong>{moneyPlain(order.totalIdr)}</strong>
            </div>
            <div className="nota-actions">
              {localReceipt ? (
                <button
                  type="button"
                  className="nota-action"
                  aria-expanded={showInvoice}
                  onClick={() => setShowInvoice((open) => !open)}
                >
                  {showInvoice ? 'Tutup invoice' : 'Invoice'}
                </button>
              ) : null}
              {order.reviewed || isCanceled ? null : (
                <Link className="nota-action" to={`/reviews?order=${order.code}`}>
                  <Star size={15} strokeWidth={1.75} aria-hidden="true" />
                  Beri rating
                </Link>
              )}
              <button
                type="button"
                className="nota-action nota-action--primary"
                onClick={() => {
                  onClose()
                  onReorder(order)
                }}
              >
                <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" />
                Pesan lagi
              </button>
            </div>
          </div>
        </>
      ) : null}
    </BottomSheet>
  )
}

interface ReceiptLine {
  label: string
  /** `null` = kolom kosong di BE; UI menulis "-". */
  valueIdr: number | null
  discount?: boolean
}

/**
 * Urutan baris nota. Diskon ditandai supaya bisa diberi tanda minus sekali saja
 * di satu tempat, bukan di JSX. Tip hanya muncul kalau order punya tip: baris
 * "Tip -" di setiap nota hanya menambah kebisingan, bukan informasi.
 */
function receiptLines(receipt: OrderReceipt): ReceiptLine[] {
  const lines: ReceiptLine[] = [
    { label: 'Subtotal menu', valueIdr: receipt.subTotalIdr },
    { label: 'Ongkir', valueIdr: receipt.deliveryFeeIdr },
    { label: 'Biaya layanan', valueIdr: receipt.platformFeeIdr },
  ]
  if (TIPS_ENABLED && receipt.tipIdr) lines.push({ label: 'Tip kurir', valueIdr: receipt.tipIdr })
  if (receipt.transactionFeeIdr)
    lines.push({ label: 'Biaya transaksi', valueIdr: receipt.transactionFeeIdr })
  if (receipt.discountMerchantIdr)
    lines.push({ label: 'Diskon toko', valueIdr: receipt.discountMerchantIdr, discount: true })
  if (receipt.discountApplicatorIdr)
    lines.push({ label: 'Diskon aplikator', valueIdr: receipt.discountApplicatorIdr, discount: true })
  if (receipt.promoIdr) lines.push({ label: 'Promo', valueIdr: receipt.promoIdr, discount: true })
  return lines
}
