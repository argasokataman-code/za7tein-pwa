import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

import { useAppDispatch } from '../../hooks/useAppStore'
import { addItem } from '../../store/slices/cartSlice'
import type { Food } from '../../types'

/**
 * Tombol tambah ke keranjang.
 *
 * Dibuat sebagai satu komponen karena sebelumnya FoodCard dan Favorites
 * masing-masing menulis tombolnya sendiri dengan nama kelas yang sama tapi
 * perilaku berbeda: Favorites memanggil navigate('/checkout') setelah menambah,
 * sementara FoodCard hanya menambah. Tombol berlabel sama yang melakukan dua
 * hal berbeda itulah yang membingungkan.
 *
 * Tombolnya menambah dan berhenti di situ — tidak pindah halaman. Yang berubah
 * setelah ditekan adalah angka di badge keranjang pada BottomNav, jadi
 * pengguna melihat keranjangnya bertambah tanpa kehilangan tempatnya membaca.
 */
export function AddToCartButton({
  food,
  className = 'buy-now-btn',
}: {
  food: Food
  className?: string
}) {
  const dispatch = useAppDispatch()

  return (
    <button
      type="button"
      className={className}
      aria-label={`Tambah ${food.name} ke keranjang`}
      onClick={(e) => {
        // Kartu di Favorites membungkus seluruh isinya dengan <Link>, jadi
        // tanpa ini klik tombol ikut membuka halaman detail.
        e.preventDefault()
        e.stopPropagation()
        dispatch(addItem({ food }))
        toast.success(`${food.name} masuk keranjang`)
      }}
    >
      <Plus size={16} strokeWidth={2} aria-hidden="true" />
      Tambah
    </button>
  )
}
