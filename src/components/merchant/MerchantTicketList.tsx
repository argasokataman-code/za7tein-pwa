import type { MerchantOrder } from '../../types'
import { MerchantOrderTicket } from './MerchantOrderTicket'

interface MerchantTicketListProps {
  orders: MerchantOrder[]
  moneyPlain: (value: number) => string
  readyHint: (order: MerchantOrder) => string
  onOpen: (order: MerchantOrder) => void
  onAccept: (order: MerchantOrder) => void
  onReject: (order: MerchantOrder) => void
  onPacked: (order: MerchantOrder) => void
  onDispatch: (order: MerchantOrder) => void
  onOpenBatch: (order: MerchantOrder) => void
}

/**
 * Satu daftar slip order dengan aksi yang sama. Dipakai tab Antrean dan grup
 * "Belum masuk batch" di tampilan Batch dapur, supaya dua permukaan itu tidak
 * menyalin rantai `onOpen`/`onAccept`/… (dan tidak menyimpang saat aksi
 * bertambah).
 */
export function MerchantTicketList({
  orders,
  moneyPlain,
  readyHint,
  onOpen,
  onAccept,
  onReject,
  onPacked,
  onDispatch,
  onOpenBatch,
}: MerchantTicketListProps) {
  return orders.map((order) => (
    <MerchantOrderTicket
      key={order.id}
      order={order}
      moneyPlain={moneyPlain}
      readyHint={readyHint(order)}
      onOpen={() => onOpen(order)}
      onAccept={() => onAccept(order)}
      onReject={() => onReject(order)}
      onPacked={() => onPacked(order)}
      onDispatch={() => onDispatch(order)}
      onOpenBatch={() => onOpenBatch(order)}
    />
  ))
}
