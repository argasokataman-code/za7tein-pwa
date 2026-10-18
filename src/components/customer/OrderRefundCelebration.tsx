import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { OrderCelebration } from '../ui/OrderCelebration'

interface OrderRefundCelebrationProps {
  /** Kode order yang dibatalkan, ditampilkan di pesan. */
  code: string
  onClose: () => void
}

/** Selaras denyut perayaan `celebrate-*` (`_post-order.scss` ±2,4 dtk) + jeda baca. */
const AUTO_CLOSE_MS = 3200

/**
 * Splash "dana dikembalikan" setelah customer membatalkan order di dalam jendela
 * 1 menit. Blok `.order-arrived-*` yang sama dengan `/order-arrived` dan splash
 * pembayaran, jadi tak ada CSS/animasi baru — cuma judul dan pesannya beda.
 *
 * Di-portal ke body supaya `position: fixed` tak terjebak containing block
 * transisi halaman atau panel sheet yang menggulir. Tutup otomatis, dan tombol
 * "Tutup" tetap ada supaya bisa dipercepat (juga jalur keyboard).
 */
export function OrderRefundCelebration({ code, onClose }: OrderRefundCelebrationProps) {
  useEffect(() => {
    const id = window.setTimeout(onClose, AUTO_CLOSE_MS)
    return () => window.clearTimeout(id)
  }, [onClose])

  return createPortal(
    <div
      className="order-celebration-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Pesanan dibatalkan, dana dikembalikan"
    >
      <OrderCelebration
        title="Dana anda dikembalikan"
        message={`Pesanan ${code} dibatalkan. Dana yang ditahan platform dilepas kembali ke saldo kamu.`}
      >
        <button type="button" className="order-arrived-rate-btn" onClick={onClose}>
          Tutup
        </button>
      </OrderCelebration>
    </div>,
    document.body,
  )
}
