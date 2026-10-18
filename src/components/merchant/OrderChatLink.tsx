import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface OrderChatLinkProps {
  orderId: string | number
}

/**
 * Tautan ke chat group order (pembeli + toko + kurir, PRD §20.1) dari konsol
 * merchant. Param `?as=merchant` membuat `OrderChat` memakai sudut pandang
 * merchant, bukan customer. Komponen terpisah supaya `MerchantOrders.tsx` tetap
 * di bawah batas 700 baris.
 */
export function OrderChatLink({ orderId }: OrderChatLinkProps) {
  return (
    <Link className="merchant-btn-ghost" to={`/order-chat?order=${orderId}&as=merchant`}>
      <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" />
      Chat pesanan
    </Link>
  )
}
