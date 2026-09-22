import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { mockUser } from '../../data/user'
import type { Address, CartItem, Food, OrderStage } from '../../types'

interface CartState {
  items: CartItem[]
  /** Alamat dibagi ke seluruh alur checkout, bukan state lokal per layar. */
  addresses: Address[]
  selectedAddressId: string | null
  selectedPaymentId: string | null
  /** Nama file bukti transfer; wajib ada sebelum pesanan transfer dikirim. */
  transferProof: string | null
  /** Tahap berjalan; halaman pelacakan menyesuaikan tampilannya dari sini. */
  orderStage: OrderStage
}

const initialState: CartState = {
  // Contoh pesanan #S7-1024 dari PRD: 2× Sate Ayam dengan modifier.
  items: [
    {
      id: '1',
      name: 'Sate Ayam',
      price: 28000,
      quantity: 2,
      image: '/assets/img/menu-details/menu-details-thumb.png',
      modifiers: 'Sedang',
    },
  ],
  addresses: mockUser.addresses,
  selectedAddressId: 'tower-a',
  selectedPaymentId: 'wallet',
  transferProof: null,
  orderStage: 'dimasak',
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(
      state,
      action: PayloadAction<{
        food: Food
        quantity?: number
        /** harga satuan setelah modifier, mis. Sate Ayam + Lontong */
        unitPrice?: number
        modifiers?: string
      }>,
    ) {
      const { food, quantity = 1, unitPrice, modifiers } = action.payload
      // Sate Ayam "Pedas" dan "Tidak Pedas" adalah baris terpisah di keranjang.
      const existing = state.items.find(
        (i) => i.id === food.id && (i.modifiers ?? '') === (modifiers ?? ''),
      )
      if (existing) existing.quantity += quantity
      else
        state.items.push({
          id: food.id,
          name: food.name,
          price: unitPrice ?? food.price,
          quantity,
          image: food.image,
          modifiers,
        })
    },
    setOrderStage(state, action: PayloadAction<OrderStage>) {
      state.orderStage = action.payload
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (!item) return
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((i) => i.id !== action.payload.id)
      } else {
        item.quantity = action.payload.quantity
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload)
    },
    clearCart(state) {
      state.items = []
    },
    setAddress(state, action: PayloadAction<string>) {
      state.selectedAddressId = action.payload
    },
    setPayment(state, action: PayloadAction<string>) {
      state.selectedPaymentId = action.payload
      // Bukti transfer hanya relevan untuk metode transfer.
      if (action.payload !== 'transfer') state.transferProof = null
    },
    setTransferProof(state, action: PayloadAction<string | null>) {
      state.transferProof = action.payload
    },
    addAddress(state, action: PayloadAction<Address>) {
      state.addresses.push(action.payload)
    },
  },
})

export const {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  setAddress,
  setPayment,
  setTransferProof,
  addAddress,
} = cartSlice.actions

export const selectCartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0)

export const selectSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export default cartSlice.reducer
