import { useEffect, useState } from 'react'

import { fetchCustomerOrderDetail, type CustomerOrderDetail } from '../api/orders'
import { numericOrderId } from '../api/liveLocation'

/**
 * Rincian order (toko, kurir, alamat, item, total) untuk layar journey.
 *
 * `null` = order demo/seed tanpa baris BE, atau BE menolak; pemanggil memakai
 * data mock seperti sebelumnya alih-alih menampilkan layar kosong.
 */
export function useCustomerOrderDetail(orderId: string | undefined): CustomerOrderDetail | null {
  const [detail, setDetail] = useState<CustomerOrderDetail | null>(null)

  useEffect(() => {
    const oid = numericOrderId(orderId)
    if (!oid) {
      setDetail(null)
      return
    }
    let alive = true
    fetchCustomerOrderDetail(String(oid))
      .then((row) => {
        if (alive) setDetail(row)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [orderId])

  return detail
}
