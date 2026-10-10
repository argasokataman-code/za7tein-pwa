import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

interface OrderCelebrationProps {
  /** Judul perayaan, mis. "Pesanan selesai!". */
  title: string
  /** Satu kalimat penjelas di bawah judul. */
  message: string
  /** Baris atas opsional (mis. tombol kembali customer). Overlay kurir tak butuh. */
  header?: ReactNode
  /** Aksi di bawah pesan (tombol/link). Opsional. */
  children?: ReactNode
}

/**
 * Blok perayaan pasca-order: lingkaran centang + konfeti + judul + pesan.
 *
 * Diekstrak dari layar `/order-arrived` (customer) supaya sisi kurir bisa
 * memakai perayaan yang sama tanpa menyalin markup. Struktur memakai kelas
 * `.order-arrived-*` yang sudah ada, jadi gerakannya (`_post-order.scss`)
 * ikut tanpa CSS baru. Pemakai membungkusnya: customer sebagai halaman
 * penuh, kurir sebagai overlay (`.order-celebration-overlay`).
 */
export function OrderCelebration({ title, message, header, children }: OrderCelebrationProps) {
  return (
    <div className="order-arrived-screen">
      {header}
      <div className="order-arrived-content">
        <div className="order-arrived-icon-wrapper">
          <div className="order-arrived-confetti">
            <span className="confetti-dot" />
            <span className="confetti-dot" />
            <span className="confetti-dot" />
            <span className="confetti-dot" />
            <span className="confetti-dot" />
            <span className="confetti-dot" />
            <span className="confetti-x" />
            <span className="confetti-x" />
            <span className="confetti-x" />
            <span className="confetti-x" />
          </div>
          <div className="order-arrived-icon-circle">
            {/* Centang oranye di lingkaran krem, bukan putih (kontras 1,02:1). */}
            <Check size={60} strokeWidth={1.75} color="var(--sa7tein-orange)" />
          </div>
        </div>
        <h1 className="order-arrived-title">{title}</h1>
        <p className="order-arrived-message">{message}</p>
        {children}
      </div>
    </div>
  )
}
