import { PackageCheck } from 'lucide-react'

import { QUICK_DISPATCH_AVAILABLE } from '../../data/marketplace'
import { orderDeliveryType } from '../../data/merchantOrders'
import type { MerchantOrder } from '../../types'

/* Estimasi masak sebagai pilihan tetap, bukan slider. Slider adalah kontrol
   desktop (tarik presisi) dan di ponsel terasa seperti form web; segmented
   control adalah pola native untuk rentang kecil yang diskret. */
const COOK_OPTIONS = [15, 25, 35] as const
export const DEFAULT_COOK_MINUTES = 25

interface MerchantCookPanelProps {
  order: MerchantOrder
  /** Kalimat langkah berikutnya setelah packing (dihitung di halaman). */
  hint: string
  onCookMinutes: (minutes: number) => void
  onTogglePacked: () => void
  onDispatch: () => void
  onOpenBatch: () => void
  onCancel: () => void
}

/**
 * Blok dapur di sheet detail: estimasi masak, packing, lalu langkah setelahnya.
 *
 * Dipisah dari halaman karena `MerchantOrders.tsx` sudah menyentuh batas 700
 * baris (AGENTS §3); isinya presentasional, keputusan status tetap di halaman.
 */
export function MerchantCookPanel({
  order,
  hint,
  onCookMinutes,
  onTogglePacked,
  onDispatch,
  onOpenBatch,
  onCancel,
}: MerchantCookPanelProps) {
  return (
    <div className="merchant-cook">
      <div className="merchant-cook-head">
        <span>Estimasi masak</span>
        <strong>{order.cookMinutes ?? DEFAULT_COOK_MINUTES} menit</strong>
      </div>
      <div
        className="merchant-cook-segments"
        role="group"
        aria-label={`Estimasi masak ${order.code}`}
      >
        {COOK_OPTIONS.map((minutes) => {
          const active = (order.cookMinutes ?? DEFAULT_COOK_MINUTES) === minutes
          return (
            <button
              key={minutes}
              type="button"
              className={active ? 'is-active' : ''}
              aria-pressed={active}
              onClick={() => onCookMinutes(minutes)}
            >
              {minutes}
            </button>
          )
        })}
      </div>

      {/* Packing (MER-13): syarat kurir boleh mulai lebih awal saat batch
          ditutup lebih awal (BR-B09). Statusnya terlihat di tiket packing,
          bukan tersembunyi di sheet. */}
      <button
        type="button"
        className={`merchant-pack${order.packed ? ' is-packed' : ''}`}
        aria-pressed={Boolean(order.packed)}
        onClick={onTogglePacked}
      >
        <PackageCheck size={18} strokeWidth={1.75} aria-hidden="true" />
        {order.packed ? 'Packing selesai' : 'Tandai packing selesai'}
      </button>

      {/* Langkah setelah packing: jalan mana yang harus ditempuh merchant,
          ditulis di tempat tombolnya, bukan di dokumentasi. */}
      {order.packed ? (
        <>
          <p className="merchant-card-sub">{hint}</p>
          {orderDeliveryType(order) === 'quick' ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!QUICK_DISPATCH_AVAILABLE}
              onClick={onDispatch}
            >
              Serahkan ke kurir partner
            </button>
          ) : (
            <button type="button" className="merchant-btn-ghost" onClick={onOpenBatch}>
              Buka panel batch &amp; kurir
            </button>
          )}
        </>
      ) : null}

      <button
        type="button"
        className="merchant-btn-ghost merchant-signout"
        onClick={onCancel}
      >
        Batalkan pesanan
      </button>
    </div>
  )
}
