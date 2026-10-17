import { X } from 'lucide-react'

import type { CustomerActiveOrder } from '../../api/orders'
import { useMoney } from '../../hooks/useMoney'
import { canCancelOrder, itemsLine, statusLabelOf, statusTone } from './orderStatus'

interface ActiveOrderRowProps {
  order: CustomerActiveOrder
  /** Baris ini sedang minta konfirmasi batal (satu saja per daftar). */
  confirming: boolean
  onTrack: (order: CustomerActiveOrder) => void
  /** Ikon X memasang konfirmasi; tombol "Batal" melepasnya. */
  onToggleConfirm: (order: CustomerActiveOrder) => void
  onCancel: (order: CustomerActiveOrder) => void
}

/**
 * Satu baris pesanan berjalan. Dipakai sheet dok keranjang dan tab "Aktif" di
 * Pesanan Saya — bentuknya identik supaya customer mengenali baris yang sama di
 * mana pun ia melihatnya (AGENTS §12: turunkan dari komponen, jangan salin).
 *
 * Konfirmasi batal tumbuh **di baris itu** (`ck-confirm`), bukan sheet kedua.
 */
export function ActiveOrderRow({
  order,
  confirming,
  onTrack,
  onToggleConfirm,
  onCancel,
}: ActiveOrderRowProps) {
  const { money } = useMoney()
  const cancelable = canCancelOrder(order)

  return (
    <li className="ck-row">
      <button type="button" className="ck-row__line list-row" onClick={() => onTrack(order)}>
        <span className="ck-row__title">{order.merchantName}</span>
        <span className="ck-row__sum">{money(order.totalIdr)}</span>
        <span className="ck-row__meta">
          <span className="ck-row__code">{order.code}</span>
          <span className="ck-row__sep" aria-hidden="true">
            ·
          </span>
          <span className="ck-row__ago">{order.placedAt}</span>
        </span>
        <span className="ck-chip ck-chip--end">
          <span
            className={`ck-chip__dot ck-chip__dot--${statusTone(order.status)}`}
            aria-hidden="true"
          />
          {statusLabelOf(order)}
        </span>
        {order.items.length ? <span className="ck-row__sub">{itemsLine(order.items)}</span> : null}
      </button>
      {/* Kolom aksi selebar tetap; CSS menyembunyikannya untuk seluruh daftar
          bila tak ada satu pun baris beraksi, supaya gutter kanan tidak
          menyisakan 44px kosong. Bila ada aksi, semua baris tetap satu rel. */}
      <span className="ck-row__act">
        {cancelable && !confirming ? (
          <button
            type="button"
            className="ck-icon"
            aria-label={`Batalkan pesanan ${order.code}`}
            onClick={() => onToggleConfirm(order)}
          >
            <X size={16} strokeWidth={2.25} aria-hidden="true" />
          </button>
        ) : null}
      </span>
      {confirming ? (
        <span className="ck-confirm">
          <span className="ck-confirm__q">Batalkan {order.code}?</span>
          <button type="button" className="ck-confirm__btn" onClick={() => onToggleConfirm(order)}>
            Batal
          </button>
          <button
            type="button"
            className="ck-confirm__btn ck-confirm__btn--danger"
            onClick={() => onCancel(order)}
          >
            Batalkan
          </button>
        </span>
      ) : null}
    </li>
  )
}
