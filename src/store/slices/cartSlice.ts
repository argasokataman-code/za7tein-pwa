import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, Food } from '../../types'

interface CartState {
  items: CartItem[]
  selectedAddressId: string | null
  selectedPaymentId: string | null
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
  selectedAddressId: 'tower-a',
  selectedPaymentId: 'cod',
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<{ food: Food; quantity?: number }>) {
      const { food, quantity = 1 } = action.payload
      const existing = state.items.find((i) => i.id === food.id)
      if (existing) existing.quantity += quantity
      else
        state.items.push({
          id: food.id,
          name: food.name,
          price: food.price,
          quantity,
          image: food.image,
        })
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
} = cartSlice.actions

export const selectCartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0)

export const selectSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export default cartSlice.reducer
