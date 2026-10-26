import { EvidencePhotos } from '../ui/EvidencePhotos'

import type { MerchantOrder } from '../../types'

interface OrderPaymentProofProps {
  order: MerchantOrder
}

/**
 * Bukti transfer di detail order merchant (metode legacy `transfer`).
 *
 * Merchant harus melihat apa yang ia verifikasi. Kalau buktinya tidak ada,
 * keadaan itu ditulis apa adanya: tombol "Terima tanpa bukti" di halaman
 * order menjelaskan konsekuensinya, bukan menyembunyikannya.
 */
export function OrderPaymentProof({ order }: OrderPaymentProofProps) {
  if (order.paymentMethod !== 'transfer') return null

  return (
    <div className="merchant-order-proof">
      <p className="merchant-order-meta">Bukti transfer</p>
      {order.paymentProof ? (
        <EvidencePhotos
          photos={[order.paymentProof]}
          label="Bukti transfer"
          emptyLabel="Belum ada bukti transfer"
        />
      ) : (
        <p className="merchant-order-proof-empty">
          Pelanggan belum melampirkan bukti yang bisa dilihat. Minta lewat chat sebelum menandai
          lunas.
        </p>
      )}
    </div>
  )
}
