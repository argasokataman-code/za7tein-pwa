import { QUICK_DISPATCH_AVAILABLE } from '../../data/marketplace'
import { orderDeliveryType } from '../../data/merchantOrders'
import type { MerchantOrder } from '../../types'

interface OrderTicketActionsProps {
  order: MerchantOrder
  /** Kalimat langkah berikutnya setelah packing (dihitung di halaman). */
  hint: string
  onPacked: () => void
  onDispatch: () => void
  onOpenBatch: () => void
}

/**
 * Aksi di tiket antrean untuk order yang sudah diterima.
 *
 * Tujuannya satu: rel tidak boleh berhenti tanpa jalan keluar yang terlihat.
 * "Packing selesai" memindahkan tiket ke tab Siap, dan di tab itu tiket
 * menyebut langkah kurir yang harus diambil merchant (Quick: serahkan ke
 * partner; Regular: pilih kurir batch).
 */
export function OrderTicketActions({
  order,
  hint,
  onPacked,
  onDispatch,
  onOpenBatch,
}: OrderTicketActionsProps) {
  if (order.status === 'diterima' || order.status === 'disiapkan') {
    return (
      <div className="merchant-actions">
        <button type="button" className="btn btn-primary" onClick={onPacked}>
          Packing selesai
        </button>
      </div>
    )
  }

  if (order.status !== 'siap') return null

  return (
    <>
      <p className="merchant-card-sub">{hint}</p>
      <div className="merchant-actions">
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
            Pilih kurir batch
          </button>
        )}
      </div>
    </>
  )
}
