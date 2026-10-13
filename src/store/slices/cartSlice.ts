import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { mockUser } from '../../data/user'
import type {
  Address,
  CartItem,
  Food,
  HoldEvent,
  HoldEventName,
  HoldStatus,
  OrderStage,
  ZoneId,
} from '../../types'

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
  /**
   * Order BE aktif (dibuat checkout). `id` numerik sebagai string, `code` =
   * kode order. Dipakai pelacakan customer untuk membaca status live (`orders.status`)
   * + menampilkan kode benar, bukan `mockOrder`.
   */
  activeOrder: { id: string; code: string } | null
  /**
   * Hold COD via wallet (R-COD-01, F2). Satu urutan: none → held → cut →
   * settled, dengan jalur batal released/reversed. Nominalnya disimpan sekali
   * saat hold dibuat supaya transisi berikutnya tidak bisa memakai angka lain.
   */
  holdStatus: HoldStatus
  holdAmountIdr: number
  /** Ledger hold append-only — tiap transisi menambah satu entry. */
  holdLedger: HoldEvent[]
  /** Order selesai — dasar window sengketa 24 jam (M6). */
  orderCompletedAt: string | null
  /** Customer membatalkan order (F1/F2 terminal `batal`) — driver UI & hold. */
  orderCancelled: boolean
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
  // Order demo dimulai dari tahap yang sama dengan yang dilihat merchant
  // ('baru' di `merchantOrders` SA-1041) dan kurir (checkpoint 'masuk', belum diambil).
  orderStage: 'baru',
  activeOrder: null,
  holdStatus: 'none',
  holdAmountIdr: 0,
  holdLedger: [],
  orderCompletedAt: null,
  orderCancelled: false,
}

/** Id entry hold: urutan + waktu, cukup unik untuk mock satu sesi. */
const holdEvent = (event: HoldEventName, amountIdr: number, index: number): HoldEvent => ({
  id: `${event}-${index + 1}-${Date.now()}`,
  event,
  amountIdr,
  at: new Date().toISOString(),
})

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
        notes?: string
      }>,
    ) {
      const { food, quantity = 1, unitPrice, modifiers, notes } = action.payload
      // Sate Ayam "Pedas" dan "Tidak Pedas" adalah baris terpisah di keranjang;
      // catatan beda juga jadi baris sendiri (dapurnya memasak beda).
      const existing = state.items.find(
        (i) =>
          i.id === food.id &&
          (i.modifiers ?? '') === (modifiers ?? '') &&
          (i.notes ?? '') === (notes ?? ''),
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
          notes,
        })
    },
    setOrderStage(state, action: PayloadAction<OrderStage>) {
      state.orderStage = action.payload
    },
    /** Simpan order BE aktif (dipanggil setelah checkout menulis order). */
    setActiveOrder(state, action: PayloadAction<{ id: string; code: string }>) {
      state.activeOrder = action.payload
      // Order baru → bersihkan penanda batal dari order sebelumnya.
      state.orderCancelled = false
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
    /**
     * Ganti seluruh daftar alamat (hasil sinkron BE). Pilihan yang menunjuk
     * alamat hilang dipindah ke alamat utama, lalu yang pertama.
     */
    setAddresses(state, action: PayloadAction<Address[]>) {
      state.addresses = action.payload
      if (state.addresses.some((item) => item.id === state.selectedAddressId)) return
      state.selectedAddressId =
        state.addresses.find((item) => item.isDefault)?.id ?? state.addresses[0]?.id ?? null
    },
    addAddress(state, action: PayloadAction<Address>) {
      // Alamat pertama otomatis jadi alamat utama.
      if (!state.addresses.some((item) => item.isDefault)) action.payload.isDefault = true
      state.addresses.push(action.payload)
    },
    /** Ubah alamat yang sudah ada — form edit memakai ini, bukan menambah baris baru. */
    updateAddress(state, action: PayloadAction<Address>) {
      const index = state.addresses.findIndex((item) => item.id === action.payload.id)
      if (index < 0) return
      state.addresses[index] = action.payload
      if (action.payload.isDefault) {
        state.addresses.forEach((item) => {
          item.isDefault = item.id === action.payload.id
        })
        state.selectedAddressId = action.payload.id
      }
    },
    removeAddress(state, action: PayloadAction<string>) {
      state.addresses = state.addresses.filter((item) => item.id !== action.payload)
      if (state.selectedAddressId !== action.payload) return
      // Yang dihapus tadi sedang dipilih — jatuh ke alamat utama, lalu yang pertama.
      state.selectedAddressId =
        state.addresses.find((item) => item.isDefault)?.id ?? state.addresses[0]?.id ?? null
    },
    /** Jadikan satu alamat sebagai utama; sekaligus pilih untuk order ini. */
    setDefaultAddress(state, action: PayloadAction<string>) {
      state.addresses.forEach((item) => {
        item.isDefault = item.id === action.payload
      })
      state.selectedAddressId = action.payload
    },
    /**
     * Validasi ulang satu alamat terhadap master zona yang baru. Di produksi ini
     * kerja server; di repo ini konsol SA yang memicunya setelah poligon disimpan
     * supaya daftar alamat customer tidak menyimpan hasil validasi yang basi.
     */
    revalidateAddress(
      state,
      action: PayloadAction<{ id: string; zone: ZoneId | null; distanceMeters: number }>,
    ) {
      const address = state.addresses.find((item) => item.id === action.payload.id)
      if (!address) return
      address.zone = action.payload.zone
      address.distanceMeters = action.payload.distanceMeters
    },
    /** Order COD dibuat → saldo ditahan (event `hold_created`). */
    createOrderHold(state, action: PayloadAction<{ amountIdr: number }>) {
      if (state.holdStatus !== 'none') return
      state.holdStatus = 'held'
      state.holdAmountIdr = action.payload.amountIdr
      state.holdLedger.push(
        holdEvent('hold_created', action.payload.amountIdr, state.holdLedger.length),
      )
    },
    /** Kurir match → potongan dikunci (event `hold_cut`). */
    matchCourier(state) {
      if (state.holdStatus !== 'held') return
      state.holdStatus = 'cut'
      state.holdLedger.push(holdEvent('hold_cut', state.holdAmountIdr, state.holdLedger.length))
    },
    /** OTP sukses → dana ke merchant (event `hold_settled`). */
    settleOrderHold(state) {
      if (state.holdStatus !== 'cut') return
      state.holdStatus = 'settled'
      state.holdLedger.push(
        holdEvent('hold_settled', state.holdAmountIdr, state.holdLedger.length),
      )
    },
    /**
     * Batal dua jalur (F2): sebelum match → `released`, sesudah match →
     * `reversed`. Status lain diabaikan, jadi tidak ada transisi liar.
     */
    cancelOrder(state) {
      if (state.holdStatus === 'held') {
        state.holdStatus = 'released'
        state.holdLedger.push(
          holdEvent('hold_released', state.holdAmountIdr, state.holdLedger.length),
        )
      } else if (state.holdStatus === 'cut') {
        state.holdStatus = 'reversed'
        state.holdLedger.push(
          holdEvent('hold_reversed', state.holdAmountIdr, state.holdLedger.length),
        )
      }
    },
    /** Reset hold saat pesanan baru dimulai dari keranjang kosong. */
    resetOrderHold(state) {
      state.holdStatus = 'none'
      state.holdAmountIdr = 0
      state.holdLedger = []
    },
    /**
     * Catat order selesai dari sisi customer (window sengketa 24 jam, M6).
     * Penyelesaian kini datang dari status order live (realtime/kurir), bukan
     * tombol demo lokal — layar customer memanggil ini saat tahap jadi `selesai`.
     */
    markOrderCompleted(state, action: PayloadAction<string>) {
      state.orderCompletedAt = action.payload
    },
    /**
     * Customer membatalkan order (F1/F2) — dipakai aksi batal di layar customer
     * dan gema realtime `orders.status = canceled`. Terminal: tidak ada jalan balik.
     */
    markOrderCancelled(state) {
      state.orderCancelled = true
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
  setAddresses,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  revalidateAddress,
  createOrderHold,
  matchCourier,
  settleOrderHold,
  cancelOrder,
  resetOrderHold,
  markOrderCompleted,
  markOrderCancelled,
  setOrderStage,
  setActiveOrder,
} = cartSlice.actions

export const selectCartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0)

export const selectSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export default cartSlice.reducer
