import { useEffect, useRef } from 'react'

import { insertNotification } from '../api/notifications'
import { NOTIF_EMIT } from '../data/notif'

/**
 * Kirim notifikasi "kurir hampir sampai" **sekali** saat ambangnya terlewati
 * (R-NOTIF AC4). Isi & ambangnya dari katalog `NOTIF_EMIT`, jadi satu angka
 * dengan label yang dibaca customer di layar.
 *
 * Dipisah dari `useCourierTracking` karena bukan semua pemakai posisi kurir boleh
 * mengirim notifikasi customer: konsol merchant menampilkan posisi yang sama
 * (`MerchantCourierMap`), dan kalau efek ini menempel di hook pelacakan, merchant
 * ikut memancarkan notifikasi milik customer. Penerbit sesungguhnya tetap BE —
 * ini jalur demo.
 */
export function useAlmostArrivedNotice(almost: boolean): void {
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (!almost || notifiedRef.current) return
    notifiedRef.current = true
    // Best-effort: gagal jaringan tak menghalangi layar.
    void insertNotification(NOTIF_EMIT.courier_almost_arrived).catch(() => {})
  }, [almost])
}
