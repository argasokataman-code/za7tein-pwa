import { useEffect } from 'react'

import { fetchQuotaSubscriptions } from '../api/quota'
import { replaceQuotaSubscriptions } from '../store/slices/quotaSlice'
import { useAppDispatch } from './useAppStore'

/**
 * Sinkron kuota merchant dari BE untuk layar yang memutuskan boleh/tidaknya
 * sebuah order (`PaymentAmount`, `PaymentSelection`).
 *
 * Sebelumnya gate COD membaca `mockQuotaSubscriptions` (`src/data/marketplace.ts`):
 * angkanya milik toko demo (`am-N`, sisa 2 dari 40) dan toko live (id numerik)
 * tidak punya catatan sama sekali. Dua akibat nyata: COD toko 1 habis setelah
 * dua order di sesi yang sama walau BE punya 10, dan COD toko 10/11/12 selalu
 * ditolak karena "tanpa catatan" diperlakukan sebagai habis.
 *
 * Hanya id numerik (id toko BE) yang ditanyakan, dan hasil kosong tidak
 * menimpa apa pun — RLS/sesi merchant bisa memblokir toko lain, dan §17
 * menetapkan data yang tak ada tidak boleh memblokir order.
 */
export function useQuotaSync(merchantId: string | null): void {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!merchantId || !/^\d+$/.test(merchantId)) return
    let alive = true
    fetchQuotaSubscriptions(merchantId)
      .then((subs) => {
        if (alive && subs.length) dispatch(replaceQuotaSubscriptions(subs))
      })
      .catch(() => {
        /* gate memakai angka terakhir; kegagalan jaringan bukan alasan menolak order */
      })
    return () => {
      alive = false
    }
  }, [merchantId, dispatch])
}
