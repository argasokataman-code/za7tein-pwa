import { Calendar, ChevronRight, RotateCcw, ShoppingBag, Star, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { CustomerActiveOrder } from '../../api/orders'
import type { OrderHistoryItem } from '../../api/reviews'
import { ORDER_STAGE_STATUS } from '../../data/order-stage-copy'
import { useMoney } from '../../hooks/useMoney'
import type { OrderStage } from '../../types'
import { itemsLine, orderStampLabel } from './orderStatus'

/**
 * Kartu order untuk halaman Pesanan Saya.
 *
 * Satu bentuk untuk dua keadaan (riwayat selesai/dibatalkan dan order yang
 * sedang berjalan); yang berbeda hanya lencana status dan aksi di kaki kartu.
 * Geometri mengikuti irisan `docs/design/slice/order-history.html`: thumbnail
 * 84x70, kepala kartu 12px, baris item bergaris rambut, kaki 44px.
 */

interface HistoryOrderCardProps {
  order: OrderHistoryItem
  /** Gambar menu pertama (dicocokkan ke katalog live); kosong = ikon netral. */
  image?: string
  onOpen: () => void
  onReorder: () => void
}

function Thumb({ image }: { image?: string }) {
  return (
    <span className="oh-thumb">
      {image ? (
        <img src={image} alt="" width={84} height={70} loading="lazy" decoding="async" />
      ) : (
        <span className="oh-thumb__fallback" aria-hidden="true">
          <Utensils size={24} strokeWidth={1.5} />
        </span>
      )}
    </span>
  )
}

const REFUND_LABEL: Record<string, string> = {
  pending: 'Refund sedang diproses',
  refunded: 'Dana sudah dikembalikan',
}

/**
 * Warna lencana per tahap order. Lima tahap, lima warna peran (DNA MD-07: status
 * dibaca dari warna, bukan dari kata). Sebelumnya semua tahap berbagi satu kelas
 * `oh-badge--transit`, sehingga "Pesanan diterima" dan "Sedang diantar" tampak
 * sama.
 *
 * - `baru` amber: menunggu toko menjawab
 * - `disiapkan` biru: dapur bekerja
 * - `siap` oranye merek: tinggal diambil kurir
 * - `diantar` navy pekat: sedang di jalan
 * - `selesai` hijau: tuntas
 */
const STAGE_BADGE: Record<OrderStage, string> = {
  baru: 'oh-badge--new',
  disiapkan: 'oh-badge--prepare',
  siap: 'oh-badge--ready',
  diantar: 'oh-badge--transit',
  selesai: 'oh-badge--done',
}

export function HistoryOrderCard({ order, image, onOpen, onReorder }: HistoryOrderCardProps) {
  const { moneyPlain } = useMoney()
  const canceled = order.status === 'canceled'
  const qty = order.items.reduce((sum, item) => sum + (item.qty ?? 1), 0)

  return (
    <article className="oh-card">
      <button
        type="button"
        className="oh-card__head"
        onClick={onOpen}
        aria-label={`Rincian pesanan ${order.code} di ${order.merchantName}`}
      >
        <Thumb image={image} />
        <span className="oh-card__body">
          <span className="oh-card__name">{order.merchantName}</span>
          <span className="oh-card__meta">
            {order.code} · {orderStampLabel(order.createdAt)}
          </span>
          <span className={`oh-badge${canceled ? ' oh-badge--canceled' : ''}`}>
            <span className="oh-badge__dot" aria-hidden="true" />
            {canceled ? 'Dibatalkan' : 'Selesai'}
          </span>
        </span>
        <ChevronRight className="oh-card__chev" size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      <div className="oh-row">
        <ShoppingBag className="oh-row__icon" size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className="oh-row__items">
          <span className="oh-row__label">{qty} item pesanan</span>
          <span className="oh-row__name">{itemsLine(order.items, 3)}</span>
        </span>
        <span className="oh-row__total">{moneyPlain(order.totalIdr)}</span>
      </div>

      <div className="oh-foot">
        <span className="oh-half">
          {canceled ? (
            REFUND_LABEL[order.refundStatus ?? ''] ?? 'Dibatalkan'
          ) : (
            <>
              <Star
                className={order.reviewed ? 'oh-star' : undefined}
                size={16}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {order.reviewed ? 'Sudah dinilai' : 'Belum dinilai'}
            </>
          )}
        </span>
        <span className="oh-divider" aria-hidden="true" />
        {canceled || order.reviewed ? (
          <button type="button" className="oh-half oh-half--end" onClick={onReorder}>
            <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
            Pesan lagi
          </button>
        ) : (
          <Link className="oh-half oh-half--end" to={`/reviews?order=${order.code}`}>
            Beri rating
          </Link>
        )}
      </div>
    </article>
  )
}

interface ActiveOrderCardProps {
  order: CustomerActiveOrder
  image?: string
  onTrack: () => void
}

export function ActiveOrderCard({ order, image, onTrack }: ActiveOrderCardProps) {
  const { moneyPlain } = useMoney()
  const copy = ORDER_STAGE_STATUS[order.stage]
  const qty = order.items.reduce((sum, item) => sum + (item.qty ?? 1), 0)

  return (
    <article className="oh-card">
      <button
        type="button"
        className="oh-card__head"
        onClick={onTrack}
        aria-label={`Lacak pesanan ${order.code} di ${order.merchantName}`}
      >
        <Thumb image={image} />
        <span className="oh-card__body">
          <span className="oh-card__name">{order.merchantName}</span>
          <span className="oh-card__meta">
            {order.code} · {order.placedAt}
          </span>
          <span className={`oh-badge ${STAGE_BADGE[order.stage]}`}>
            <span className="oh-badge__dot" aria-hidden="true" />
            {copy.label}
          </span>
        </span>
        <ChevronRight className="oh-card__chev" size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      <div className="oh-row">
        <ShoppingBag className="oh-row__icon" size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className="oh-row__items">
          <span className="oh-row__label">{qty} item pesanan</span>
          <span className="oh-row__name">{itemsLine(order.items, 3)}</span>
        </span>
        <span className="oh-row__total">{moneyPlain(order.totalIdr)}</span>
      </div>

      <div className="oh-foot">
        <span className="oh-half">
          <Calendar size={16} strokeWidth={1.75} aria-hidden="true" />
          {copy.etaLabel} {copy.eta}
        </span>
        <span className="oh-divider" aria-hidden="true" />
        <button type="button" className="oh-half oh-half--end" onClick={onTrack}>
          Lacak pesanan
        </button>
      </div>
    </article>
  )
}
