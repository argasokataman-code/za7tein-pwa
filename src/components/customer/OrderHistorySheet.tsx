import { useState } from 'react'
import { Link } from 'react-router-dom'

import type { OrderHistoryItem, OrderReceipt } from '../../api/reviews'
import { useAppSelector } from '../../hooks/useAppStore'
import { useMoney } from '../../hooks/useMoney'
import { BottomSheet } from '../ui/BottomSheet'
import { OrderInvoice } from './OrderInvoice'

interface OrderHistorySheetProps {
  /** Order yang sedang dibuka; `null` = sheet tertutup. */
  order: OrderHistoryItem | null
  onClose: () => void
  onReorder: (order: OrderHistoryItem) => void
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
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

function dateLabel(iso: string | null): string {
  if (!iso) return '-'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID', DATE_FORMAT)
}

/**
 * Rincian satu pesanan selesai, dibuka dari baris riwayat `/orders`.
 *
 * Kenapa sheet, bukan accordion di dalam baris: daftar riwayat bisa ratusan
 * baris dan tiap baris sudah punya dua aksi sendiri, jadi baris yang mengembang
 * akan mendorong sisa daftar turun dan membuat tiga lapis kontrol berebut di
 * satu baris. Sheet menjaga posisi gulir daftar, dan back menutupnya lewat
 * `useBackClose` di `BottomSheet` (MD-13 `NB-02`).
 *
 * Isinya bentuk nota, bukan sekadar total: baris hidangan dengan harga satuan x
 * jumlah, pecahan biaya, lalu metode dan status bayar. Sumbernya kolom `orders`
 * + `order_items` di BE; kolom yang kosong ditulis "-" dan status "Lunas" hanya
 * muncul kalau `paid_at` benar-benar tercatat (data demo banyak yang belum).
 */
export function OrderHistorySheet({ order, onClose, onReorder }: OrderHistorySheetProps) {
  const { moneyPlain } = useMoney()
  const receipt = useAppSelector((s) => s.cart.lastReceipt)
  const [showInvoice, setShowInvoice] = useState(false)

  const hasInvoice = Boolean(order && receipt && receipt.code === order.code)
  const breakdown = order ? receiptLines(order.receipt) : []
  /* "Lunas" mengikuti `payment_status`, bukan `paid_at`: di D1 ada 794 order
     `paid` yang `paid_at`-nya kosong, jadi menuntut timestamp membuat nota
     lunas tidak pernah tampil. Tanggal bayar ditulis "-" bila memang tak ada. */
  const paid = order?.receipt.paymentStatus === 'paid'
  const isCanceled = order?.status === 'canceled'
  const isCod = order?.receipt.paymentMethod === 'cod'
  /* Uang tunai hanya diketahui kalau order ini dibuat dari perangkat yang sama
     (`cart.lastReceipt`). Selain itu "-", bukan angka karangan. */
  const cashIdr = order && receipt && receipt.code === order.code ? receipt.cashIdr : null
  const changeIdr =
    cashIdr != null && order ? Math.max(0, cashIdr - order.totalIdr) : null

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
          <p className="order-sheet-meta">
            <span className="order-sheet-code">{order.code}</span>
            <span className="order-sheet-dot" aria-hidden="true">
              ·
            </span>
            <time className="order-sheet-date" dateTime={order.createdAt}>
              {new Date(order.createdAt).toLocaleDateString('id-ID', DATE_FORMAT)}
            </time>
            <span
              className={`order-sheet-chip${
                isCanceled
                  ? ' order-sheet-chip--canceled'
                  : order.reviewed
                    ? ' order-sheet-chip--done'
                    : ''
              }`}
            >
              <span className="order-sheet-chip__dot" aria-hidden="true" />
              {isCanceled ? 'Dibatalkan' : order.reviewed ? 'Sudah dinilai' : 'Belum dinilai'}
            </span>
          </p>

          {paid && !isCanceled ? (
            <div className="order-sheet-stamp" aria-label="Pesanan sudah lunas">
              <span className="order-sheet-stamp__main">LUNAS</span>
              {/* Tanggal hanya dicetak kalau BE mencatatnya. "LUNAS -" terbaca
                  seperti nota setengah jadi, dan 794 order demo memang `paid`
                  tanpa `paid_at`. */}
              {order.receipt.paidAt ? (
                <span className="order-sheet-stamp__date">{dateLabel(order.receipt.paidAt)}</span>
              ) : null}
            </div>
          ) : null}

          {order.items.length ? (
            <ul className="order-sheet-items">
              {order.items.map((dish) => (
                <li className="order-sheet-item list-row" key={dish.id}>
                  <span className="order-sheet-name">{dish.name}</span>
                  <span className="order-sheet-line-sum">
                    {dish.lineIdr == null ? '-' : moneyPlain(dish.lineIdr)}
                  </span>
                  <span className="order-sheet-sub">
                    {dish.unitIdr == null
                      ? `${dish.qty ?? 1} porsi`
                      : `${dish.qty ?? 1} × ${moneyPlain(dish.unitIdr)}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <ul className="order-sheet-fees">
            {breakdown.map((line) => (
              <li className="order-sheet-fee list-row" key={line.label}>
                <span className="order-sheet-fee-label">{line.label}</span>
                <span className={`order-sheet-fee-sum${line.discount ? ' is-discount' : ''}`}>
                  {line.valueIdr == null
                    ? '-'
                    : `${line.discount ? '−' : ''}${moneyPlain(Math.abs(line.valueIdr))}`}
                </span>
              </li>
            ))}
          </ul>

          <ul className="order-sheet-payment">
            <li className="order-sheet-fee list-row">
              <span className="order-sheet-fee-label">Metode bayar</span>
              <span className="order-sheet-fee-sum">{paymentLabel(order.receipt.paymentMethod)}</span>
            </li>
            <li className="order-sheet-fee list-row">
              <span className="order-sheet-fee-label">Status bayar</span>
              <span className={`order-sheet-pay${paid ? ' order-sheet-pay--paid' : ''}`}>
                <span className="order-sheet-chip__dot" aria-hidden="true" />
                {paid
                  ? order.receipt.paidAt
                    ? `Lunas ${dateLabel(order.receipt.paidAt)}`
                    : 'Lunas'
                  : 'Belum tercatat lunas'}
              </span>
            </li>
            {isCanceled ? (
              <>
                <li className="order-sheet-fee list-row">
                  <span className="order-sheet-fee-label">Dibatalkan oleh</span>
                  <span className="order-sheet-fee-sum">
                    {order.cancelBy ? (CANCEL_BY_LABEL[order.cancelBy] ?? order.cancelBy) : '-'}
                  </span>
                </li>
                <li className="order-sheet-fee list-row">
                  <span className="order-sheet-fee-label">Alasan batal</span>
                  <span className="order-sheet-fee-sum">{order.cancelReason ?? '-'}</span>
                </li>
                <li className="order-sheet-fee list-row">
                  <span className="order-sheet-fee-label">Pengembalian dana</span>
                  <span className="order-sheet-fee-sum">
                    {order.refundStatus ? (REFUND_LABEL[order.refundStatus] ?? order.refundStatus) : '-'}
                  </span>
                </li>
              </>
            ) : null}
            {/* Uang tunai: yang disiapkan customer saat COD dan kembaliannya.
                Hanya ada bila order dibuat dari perangkat ini; selain itu "-". */}
            {isCod ? (
              <li className="order-sheet-fee list-row">
                <span className="order-sheet-fee-label">Dibayar tunai</span>
                <span className="order-sheet-fee-sum">
                  {cashIdr == null ? '-' : moneyPlain(cashIdr)}
                </span>
              </li>
            ) : paid ? (
              <li className="order-sheet-fee list-row">
                <span className="order-sheet-fee-label">Dibayar</span>
                <span className="order-sheet-fee-sum">{moneyPlain(order.totalIdr)}</span>
              </li>
            ) : null}
            {isCod ? (
              <li className="order-sheet-fee list-row">
                <span className="order-sheet-fee-label">Kembalian</span>
                <span className="order-sheet-fee-sum">
                  {changeIdr == null ? '-' : moneyPlain(changeIdr)}
                </span>
              </li>
            ) : null}
          </ul>

          {hasInvoice && showInvoice ? <OrderInvoice orderCode={order.code} /> : null}

          {/* Kaki panel menempel: total dan aksi tidak boleh menghilang di bawah
              gulir saat nota panjang. Sisanya (item, pecahan biaya, pembayaran)
              yang menggulir. */}
          <div className="order-sheet-foot">
            <div className="order-sheet-total">
              <span>Total dibayar</span>
              <span className="order-sheet-total__sum">{moneyPlain(order.totalIdr)}</span>
            </div>

            <div className="order-sheet-actions">
            {order.reviewed || isCanceled ? null : (
              <Link className="my-order-cta order-sheet-rate" to={`/reviews?order=${order.code}`}>
                Beri rating
              </Link>
            )}
            {hasInvoice ? (
              <button
                type="button"
                className="order-sheet-invoice"
                aria-expanded={showInvoice}
                onClick={() => setShowInvoice((open) => !open)}
              >
                {showInvoice ? 'Tutup invoice' : 'Lihat invoice'}
              </button>
            ) : null}
            <button
              type="button"
              className={
                /* Tanpa "Beri rating" (sudah dinilai atau batal), "Pesan lagi"
                   adalah satu-satunya aksi, jadi ia yang jadi tombol penuh. */
                order.reviewed || isCanceled
                  ? 'my-order-cta order-sheet-reorder'
                  : 'order-sheet-reorder order-sheet-secondary'
              }
              onClick={() => {
                onClose()
                onReorder(order)
              }}
            >
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
  /* Baris tambahan hanya muncul kalau nilainya ada dan bukan nol: nota tanpa
     tip tidak perlu baris "Tip 0,00", dan baris kosong menyembunyikan diskon
     yang benar-benar memotong total. */
  if (receipt.tipIdr) lines.push({ label: 'Tip kurir', valueIdr: receipt.tipIdr })
  if (receipt.transactionFeeIdr)
    lines.push({ label: 'Biaya transaksi', valueIdr: receipt.transactionFeeIdr })
  if (receipt.discountMerchantIdr)
    lines.push({ label: 'Diskon toko', valueIdr: receipt.discountMerchantIdr, discount: true })
  if (receipt.discountApplicatorIdr)
    lines.push({ label: 'Diskon aplikator', valueIdr: receipt.discountApplicatorIdr, discount: true })
  if (receipt.promoIdr) lines.push({ label: 'Promo', valueIdr: receipt.promoIdr, discount: true })
  return lines
}
