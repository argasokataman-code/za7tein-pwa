/**
 * Baris invoice untuk dua sisi transaksi.
 *
 * Sumber angkanya sudah ada dan dipakai layar lain: `ChargedBreakdown` (yang
 * benar-benar ditagih ke customer) dan konstanta fee platform PRD §16.3. Modul
 * ini hanya menyusunnya jadi baris + total bersih, supaya invoice customer dan
 * invoice merchant tidak menghitung ulang dengan cara berbeda.
 */
import { jodToIdr, moneyPlain } from './currency'
import {
  PLATFORM_FEE_CUSTOMER_DEFAULT_JOD,
  PLATFORM_FEE_MERCHANT_DEFAULT_JOD,
  type ChargedBreakdown,
} from './marketplace'
import type { CartItem, InvoiceRow, PaymentMethodId, QuotaKind } from '../types'

/** Baris tagihan customer, urut seperti struk: subtotal → tambahan → potongan. */
export function customerInvoiceRows(charged: ChargedBreakdown): InvoiceRow[] {
  const rows: InvoiceRow[] = [
    { label: 'Subtotal menu', amountIdr: charged.subtotalIdr },
    { label: 'Ongkir', amountIdr: charged.deliveryFeeIdr },
    { label: 'Biaya layanan', amountIdr: charged.platformFeeCustomerIdr },
  ]
  // Ft hanya ada untuk QRIS (§16.2); baris nol tidak ditampilkan.
  if (charged.transactionFeeIdr > 0) {
    rows.push({ label: 'Biaya transaksi QRIS (1,5%)', amountIdr: charged.transactionFeeIdr })
  }
  if (charged.discountIdr > 0) {
    rows.push({ label: 'Diskon', amountIdr: charged.discountIdr, kind: 'discount' })
  }
  return rows
}

export interface MerchantInvoice {
  rows: InvoiceRow[]
  subtotalIdr: number
  /** Uang yang masuk ke toko: subtotal − `Pm` (COD: `Pm` = 0, §16.5). */
  netIdr: number
}

/**
 * Teks rincian untuk dibagikan (`navigator.share`) atau disalin. Di ponsel,
 * "cetak" bukan kebiasaan: yang dicari customer/merchant adalah mengirim bukti
 * ke WhatsApp atau menyimpannya, jadi teks yang bisa dibagi lebih berguna
 * daripada dialog printer.
 */
export function invoiceShareText(
  title: string,
  rows: InvoiceRow[],
  total: { label: string; amountIdr: number },
): string {
  const lines = rows.map(
    (row) => `${row.label}  ${row.kind === 'discount' ? '−' : ''}${moneyPlain(row.amountIdr)}`,
  )
  return [`Sa7tein · ${title}`, ...lines, `${total.label}  ${moneyPlain(total.amountIdr)}`].join(
    '\n',
  )
}

/**
 * Invoice sisi merchant. Ongkir dan biaya layanan customer tidak masuk
 * pendapatan toko (keduanya milik kurir/aplikator, §16.4), jadi subtotal item
 * yang jadi dasarnya.
 *
 * Order **COD tidak memotong `Pm`** (§16.5: "tidak ada platform fee merchant
 * yang perlu ditagih dari order COD"), dan platform fee customer menjadi 100%
 * hak merchant (§17 tabel) — jadi net COD = subtotal item + `Pc`. Order online
 * yang memakai kuota juga tidak memotong `Pm` (§17).
 */
export function merchantInvoice(
  items: Pick<CartItem, 'price' | 'quantity'>[],
  options: { paymentMethod?: PaymentMethodId; quotaKind?: QuotaKind | null } = {},
): MerchantInvoice {
  const subtotalIdr = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isCod = options.paymentMethod === 'cod'
  // §17: `Pm` tidak dipotong saat order memakai kuota (order atau COD), dan
  // tidak ada sama sekali untuk COD (§16.5). `quotaKind` kosong = BE belum
  // menyimpan kolam yang dipakai, jadi jatuh ke tarif default yang ditandai.
  const feeWaived = isCod || Boolean(options.quotaKind)
  const feeIdr = feeWaived ? 0 : jodToIdr(PLATFORM_FEE_MERCHANT_DEFAULT_JOD)
  // §17 tabel: pada kuota COD, platform fee customer jadi 100% hak merchant.
  const customerFeeIdr = isCod ? jodToIdr(PLATFORM_FEE_CUSTOMER_DEFAULT_JOD) : 0

  const rows: InvoiceRow[] = [{ label: 'Subtotal menu', amountIdr: subtotalIdr }]
  if (feeIdr > 0) {
    rows.push({
      label: `Biaya platform (${PLATFORM_FEE_MERCHANT_DEFAULT_JOD} JOD)`,
      amountIdr: feeIdr,
      kind: 'discount',
    })
  }
  if (customerFeeIdr > 0) {
    rows.push({
      label: `Platform fee customer (COD, 100% merchant)`,
      amountIdr: customerFeeIdr,
    })
  }
  return {
    subtotalIdr,
    netIdr: Math.max(0, subtotalIdr - feeIdr + customerFeeIdr),
    rows,
  }
}
