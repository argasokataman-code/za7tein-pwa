import { etaCopy } from '../../data/tracking'
import { useCourierTracking } from '../../hooks/useCourierTracking'
import { useLeafletMap } from '../../hooks/useLeafletMap'

interface MerchantCourierMapProps {
  /** Id order: id elemen peta harus unik supaya dua sheet tak berebut elemen. */
  orderId: string
  /** Tahap order dari sisi merchant (`diantar`/`tiba` = delivery aktif). */
  stage: 'diantar' | 'tiba'
}

/**
 * Posisi kurir di konsol merchant (R-TRACK AC2, §9.7). Aturan posisi dan ETA-nya
 * **sama** dengan layar customer (`useCourierTracking`): merchant dan customer
 * tidak boleh melihat kurir di tempat berbeda, dan "hampir sampai" memakai ambang
 * ops yang sama.
 *
 * Yang **tidak** dilakukan di sini: mengirim notifikasi. Itu milik sisi customer
 * (`useAlmostArrivedNotice`), plus penerbit sesungguhnya BE.
 */
export function MerchantCourierMap({ orderId, stage }: MerchantCourierMapProps) {
  const mapId = `merchant-courier-map-${orderId}`
  const tracking = useCourierTracking(stage)
  useLeafletMap(mapId, 'delivery', { courier: tracking.courierPosition })

  return (
    <section className="track-map track-map--delivery" data-courier-map={orderId}>
      <div className="order-map-container" id={mapId} />
      {tracking.etaMinutes === null ? null : (
        <p className="merchant-order-meta">{etaCopy(tracking.etaMinutes, tracking.almost)}</p>
      )}
    </section>
  )
}
