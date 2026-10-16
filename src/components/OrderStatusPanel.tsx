import type { OrderStage } from '../types'

import { ORDER_STAGE_STATUS } from '../data/order-stage-copy'
import { etaCopy } from '../data/tracking'
import type { CourierTracking } from '../hooks/useCourierTracking'

interface OrderStatusPanelProps {
  /** Tahap order; menentukan salinan label dan ETA-nya. */
  stage: OrderStage
  cancelled?: boolean
  /** Pelacakan kurir: ETA dinamis + ambang "hampir sampai" (§9.7). */
  tracking: CourierTracking
}

/**
 * Kartu status di puncak layar pesanan. Dipisah dari `OrderStageScreen` supaya
 * berkas itu tetap di bawah batas baris komponen; yang berpindah hanya label
 * tahap dan baris ETA — sisanya tetap di layar.
 *
 * Saat kurir masuk ambang "hampir sampai", labelnya berganti dan `role="status"`
 * supaya pembaca layar ikut mengumumkannya, bukan hanya berubah diam-diam.
 */
export function OrderStatusPanel({ stage, cancelled, tracking }: OrderStatusPanelProps) {
  const copy = ORDER_STAGE_STATUS[stage]

  return (
    <section className="track-status" aria-live="polite">
      <p className="track-status-label">{cancelled ? 'Pesanan dibatalkan' : copy.label}</p>
      {cancelled ? (
        <p className="track-status-time">Pengiriman tidak dilanjutkan.</p>
      ) : (
        <>
          <p className="track-status-eta" role={tracking.almost ? 'status' : undefined}>
            {tracking.almost ? 'Kurir hampir sampai' : copy.etaLabel}
          </p>
          <p className="track-status-time">
            {tracking.etaMinutes === null
              ? copy.eta
              : etaCopy(tracking.etaMinutes, tracking.almost)}
          </p>
        </>
      )}
    </section>
  )
}
