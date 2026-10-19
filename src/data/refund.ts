import type { RefundStatus } from '../types'

/**
 * Status yang boleh ditampilkan untuk baris `refunds` yang SUDAH tersimpan.
 *
 * BE menyimpan `pending` untuk permintaan yang sudah terkirim, dan layar ini
 * memakai `pending_refund` untuk "belum dikirim". Kalau nilai itu dipakai balik
 * setelah POST (atau saat memuat refund yang sudah ada), form terbuka lagi dan
 * refund bisa dikirim dua kali. Status di luar tiga langkah (`failed`) juga
 * dijinakkan supaya panel tidak menunjuk langkah -1.
 */
export function savedRefundStatus(status: RefundStatus): RefundStatus {
  return status === 'completed' ? 'completed' : 'processing'
}
