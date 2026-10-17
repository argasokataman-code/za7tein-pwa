import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import CartQuickBar from './CartQuickBar'
import { CartSummarySheet } from './CartSummarySheet'
import { useAppSelector } from '../../hooks/useAppStore'
import { selectSubtotal } from '../../store/slices/cartSlice'

/**
 * Layar belanja customer: di sini bilah keranjang boleh muncul. Di luar daftar
 * ini (checkout, bayar, lacak, dompet, profil, onboarding) bilah disembunyikan
 * supaya tidak menutupi CTA funnel atau mengganggu layar yang bukan tempat
 * memilih menu.
 */
const SHOPPING_PREFIXES = ['/home', '/search', '/filter', '/favorites', '/merchant/', '/menu-detail/']

function isShoppingPath(pathname: string): boolean {
  return SHOPPING_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))
}

/**
 * Dok layar customer: bilah keranjang/pesanan yang mengambang di semua layar
 * belanja + sheet ringkasannya. Dipasang sekali di `RoleRouter` (rute customer),
 * bukan disalin ke tiap halaman.
 *
 * Isi bilah mengikuti keadaan: keranjang berisi → ringkasan keranjang (boleh
 * beberapa toko); keranjang kosong tapi ada order berjalan → ringkasan pesanan.
 */
export function CustomerCartDock() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const cartItems = useAppSelector((s) => s.cart.items)
  const otherCarts = useAppSelector((s) => s.cart.carts)
  const activeOrders = useAppSelector((s) => s.customerOrders.active)

  const cartStores = [
    ...(cartItems.length ? [cartItems] : []),
    ...Object.values(otherCarts).filter((items) => items.length > 0),
  ]
  const count = cartStores.reduce(
    (sum, items) => sum + items.reduce((s, i) => s + i.quantity, 0),
    0,
  )
  const subtotal = cartStores.reduce((sum, items) => sum + selectSubtotal(items), 0)
  const storeCount = cartStores.length

  if (!isShoppingPath(pathname)) return null
  if (count === 0 && activeOrders.length === 0) return null

  const mode = count > 0 ? 'cart' : 'orders'

  return (
    <>
      <CartQuickBar
        mode={mode}
        count={count}
        storeCount={storeCount}
        subtotal={subtotal}
        orderCount={activeOrders.length}
        onOpen={() => setOpen(true)}
      />
      <CartSummarySheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
