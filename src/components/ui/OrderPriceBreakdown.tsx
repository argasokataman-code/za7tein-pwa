import { Copy, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { useMoney } from '../../hooks/useMoney'
import type { InvoiceRow } from '../../types'

interface OrderPriceBreakdownProps {
  title: string
  rows: InvoiceRow[]
  total: { label: string; amountIdr: number }
  /** Keterangan di bawah total (mis. batas perhitungan atau pajak info-only). */
  footnote?: string
  /**
   * Rincian siap dibagikan. Di ponsel aksi yang masuk akal adalah mengirim
   * bukti ke WhatsApp atau menyimpannya, bukan membuka dialog printer — jadi
   * `navigator.share` dipakai lebih dulu, dan clipboard jadi cadangan.
   */
  share?: { title: string; text: string }
}

/**
 * Invoice bersama: dipakai layar customer setelah bayar dan detail order
 * merchant. Satu bentuk untuk dua sisi supaya baris tagihan dan angka bersih
 * tidak dirakit ulang di tiap layar.
 */
export function OrderPriceBreakdown({
  title,
  rows,
  total,
  footnote,
  share,
}: OrderPriceBreakdownProps) {
  const { moneyPlain } = useMoney()
  // Aplikasi ini SPA (tanpa SSR), jadi kemampuan peramban boleh dibaca saat
  // render: label tombol jujur menyebut aksi yang benar-benar terjadi.
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator

  const shareOrCopy = async () => {
    if (!share) return
    try {
      if (canShare) {
        await navigator.share({ title: share.title, text: share.text })
        return
      }
      await navigator.clipboard.writeText(share.text)
      toast.success('Rincian disalin')
    } catch (error) {
      // Batal dari share sheet bukan kegagalan; jangan munculkan toast merah.
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.error('Rincian gagal dibagikan')
    }
  }

  return (
    <section className="invoice-card">
      <header className="invoice-head">
        <h3 className="invoice-title">{title}</h3>
      </header>

      <ul className="invoice-rows">
        {rows.map((row) => (
          <li className="invoice-row" key={`${row.label}-${row.amountIdr}`}>
            <span className="invoice-label">{row.label}</span>
            <span className={row.kind === 'discount' ? 'invoice-amount is-discount' : 'invoice-amount'}>
              {row.kind === 'discount' ? '−' : ''}
              {moneyPlain(row.amountIdr)}
            </span>
          </li>
        ))}
      </ul>

      <div className="invoice-total">
        <span>{total.label}</span>
        <span className="invoice-amount">{moneyPlain(total.amountIdr)}</span>
      </div>

      {footnote ? <p className="invoice-note">{footnote}</p> : null}

      {share ? (
        <button type="button" className="invoice-share-btn" onClick={shareOrCopy}>
          {canShare ? (
            <Share2 size={16} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Copy size={16} strokeWidth={1.75} aria-hidden="true" />
          )}
          {canShare ? 'Bagikan rincian' : 'Salin rincian'}
        </button>
      ) : null}
    </section>
  )
}
