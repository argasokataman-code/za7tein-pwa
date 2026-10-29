import { ChevronRight } from 'lucide-react'

import {
  deliveryBadge,
  orderAgeLabel,
  orderAgeMinutes,
  orderStatusLabel,
  orderUrgency,
  paymentGate,
} from '../../data/merchantOrders'
import type { MerchantOrder } from '../../types'
import { OrderTicketActions } from './OrderTicketActions'

interface MerchantOrderTicketProps {
  order: MerchantOrder
  moneyPlain: (value: number) => string
  readyHint: string
  onOpen: () => void
  onAccept: () => void
  onReject: () => void
  onPacked: () => void
  onDispatch: () => void
  onOpenBatch: () => void
}

/** Slip order di antrean dapur. Diekstrak supaya halaman tetap di bawah batas baris. */
export function MerchantOrderTicket({
  order,
  moneyPlain,
  readyHint,
  onOpen,
  onAccept,
  onReject,
  onPacked,
  onDispatch,
  onOpenBatch,
}: MerchantOrderTicketProps) {
  const ageMinutes = orderAgeMinutes(order)
  const urgency = orderUrgency(order, ageMinutes)
  const gate = paymentGate(order)
  const items = order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')

  return (
    <article className="merchant-ticket" data-order-status={order.status}>
      <button type="button" className="merchant-ticket-main" onClick={onOpen}>
        <span className="merchant-ticket-stub">
          <span className="merchant-ticket-code">{order.code}</span>
          <span className="merchant-ticket-stub-end">
            {ageMinutes !== null ? (
              <span
                className={
                  urgency === 'calm' ? 'merchant-ticket-age' : `merchant-ticket-age is-${urgency}`
                }
              >
                {orderAgeLabel(ageMinutes)}
              </span>
            ) : null}
            <span className="merchant-badge merchant-badge-soft">{deliveryBadge(order)}</span>
            <span className={`merchant-badge merchant-badge-${order.status}`}>
              {orderStatusLabel(order.status)}
            </span>
            {order.status === 'baru' && gate === 'awaiting' ? (
              <span className="merchant-badge">Menunggu bayar</span>
            ) : null}
          </span>
        </span>
        <span className="merchant-ticket-body">
          <img
            className="merchant-ticket-avatar"
            src={order.buyerAvatar}
            alt=""
            width={36}
            height={36}
          />
          <span className="merchant-ticket-copy">
            <span className="merchant-ticket-name">{order.customerName}</span>
            <span className="merchant-ticket-items">{items || order.address}</span>
          </span>
          <span className="merchant-ticket-total">{moneyPlain(order.total)}</span>
          <ChevronRight
            size={18}
            strokeWidth={1.75}
            className="merchant-ticket-chevron"
            aria-hidden="true"
          />
        </span>
      </button>

      {order.status === 'baru' ? (
        <>
          <div className="merchant-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={gate === 'awaiting'}
              onClick={onAccept}
            >
              {gate === 'verify' ? 'Verifikasi & Terima' : 'Terima'}
            </button>
            <button type="button" className="merchant-btn-ghost" onClick={onReject}>
              Tolak
            </button>
          </div>
          {gate === 'awaiting' ? (
            <p className="merchant-card-sub">
              Menunggu pembayaran, Terima aktif setelah pembayaran berhasil.
            </p>
          ) : null}
        </>
      ) : null}

      <OrderTicketActions
        order={order}
        hint={order.status === 'siap' ? readyHint : ''}
        onPacked={onPacked}
        onDispatch={onDispatch}
        onOpenBatch={onOpenBatch}
      />
    </article>
  )
}
