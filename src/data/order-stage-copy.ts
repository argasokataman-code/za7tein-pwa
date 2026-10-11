import { mockOrder } from './merchant'
import type { OrderStage } from '../types'

/**
 * Copy layar pelacakan order per tahap. Dipindah dari komponen supaya berkas
 * `OrderStageScreen` tetap di bawah batas 600 baris (AGENTS §3) dan teks tahap
 * hidup bersama data mock lain (§11).
 */
export const ORDER_STAGE_STATUS: Record<
  OrderStage,
  { label: string; etaLabel: string; eta: string; courier: string }
> = {
  baru: {
    label: 'Pesanan diterima',
    etaLabel: 'Estimasi siap',
    eta: mockOrder.readyEstimate,
    courier: 'Menunggu konfirmasi toko',
  },
  disiapkan: {
    label: 'Sedang disiapkan',
    etaLabel: 'Estimasi siap',
    eta: mockOrder.readyEstimate,
    courier: 'Dapur menyiapkan pesananmu',
  },
  siap: {
    label: 'Pesanan siap',
    etaLabel: 'Estimasi siap',
    eta: mockOrder.readyEstimate,
    courier: 'Menunggu kurir mengambil',
  },
  diantar: {
    label: 'Sedang diantar',
    etaLabel: 'Estimasi tiba',
    eta: mockOrder.arriveEstimate,
    courier: 'Menuju alamatmu',
  },
  selesai: {
    label: 'Pesanan selesai',
    etaLabel: 'Tiba pukul',
    eta: mockOrder.arriveEstimate,
    courier: 'Pesanan sudah diterima',
  },
}
