import { RefreshCw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ORDER_STAGE_STATUS } from '../../data/order-stage-copy'
import type { OrderStage } from '../../types'

interface OrderUpdateNoticeProps {
  /** Tahap order yang sedang tampil; perubahan tahap memicu pemberitahuan. */
  stage: OrderStage
}

/**
 * Pemberitahuan perubahan status pesanan.
 *
 * Muncul saat tahap order **berubah** (status live dari BE/kurir), bukan saat
 * halaman pertama dibuka — pemberitahuan untuk keadaan yang sudah terlihat di
 * layar hanya menambah bunyi. Naik dari bawah, diumumkan oleh `role="status"`,
 * hitung mundur 6 detik, dan bisa ditutup lebih awal lewat tombol atau Escape.
 *
 * Ditempatkan di dalam kolom aplikasi seperti semua bilah `position: fixed`
 * lain (AGENTS §5); `body.is-order-update` menambah ruang di dasar halaman
 * supaya baris terakhir tetap bisa digulir ke atas pemberitahuan.
 */
export function OrderUpdateNotice({ stage }: OrderUpdateNoticeProps) {
  const [shown, setShown] = useState<OrderStage | null>(null)
  const prevStage = useRef(stage)

  useEffect(() => {
    if (prevStage.current === stage) return
    prevStage.current = stage
    setShown(stage)
  }, [stage])

  useEffect(() => {
    if (!shown) return
    document.body.classList.add('is-order-update')
    const timer = window.setTimeout(() => setShown(null), 6000)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShown(null)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('is-order-update')
    }
  }, [shown])

  if (!shown) return null

  const copy = ORDER_STAGE_STATUS[shown]

  return (
    <div
      className="order-update"
      role="status"
      aria-live="polite"
      key={shown}
    >
      <span className="order-update__icon" aria-hidden="true">
        <RefreshCw size={17} strokeWidth={1.75} />
      </span>
      <span className="order-update__text">
        <strong className="order-update__title">Status pesanan berubah</strong>
        <span className="order-update__body">
          {copy.label} · {copy.courier}
        </span>
      </span>
      <button
        type="button"
        className="order-update__close"
        aria-label="Tutup pemberitahuan"
        onClick={() => setShown(null)}
      >
        <X size={14} strokeWidth={2} aria-hidden="true" />
      </button>
      <span className="order-update__bar" aria-hidden="true" />
    </div>
  )
}
