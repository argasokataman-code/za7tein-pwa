/**
 * Katalog metode bayar dari BE (tabel `payment_methods`, publik).
 *
 * Dua hal yang disengaja:
 *
 * 1. **DB masih memakai nama provider lama.** Kolom `key` di BE berisi
 *    `xendit_va`/`xendit_qris` sementara produk menampilkan DANA (keputusan PO
 *    2026-10-13) — pemetaannya di sini, satu tempat, sama seperti `OUT_PAYMENT`
 *    di `orders.ts`. Begitu BE mengganti `key`-nya, alias lama cukup dibuang.
 * 2. **Label/deskripsi tidak diambil dari BE.** Kolom `description`-nya memuat
 *    catatan internal (kode PRD seperti `C-01, DEC-1039`) yang tidak boleh
 *    tampil di layar; teks yang dilihat user tetap milik `PAYMENT_METHODS`.
 *    Yang dikonsumsi dari BE: **daftar + urutan + status aktif**.
 */
import { rest } from './supabase'
import type { PaymentMethodId } from '../types'

interface PaymentMethodRow {
  key: string
  active: boolean | null
  sort_order: number | null
}

/** Alias key DB → id domain. `transfer` legacy dan key asing diabaikan. */
const KEY_ALIAS: Record<string, PaymentMethodId> = {
  wallet: 'wallet',
  cod: 'cod',
  dana_va: 'dana_va',
  dana_qris: 'dana_qris',
  xendit_va: 'dana_va',
  xendit_qris: 'dana_qris',
}

/** Urutan id metode bayar aktif menurut BE. Kosong kalau tak ada yang dikenali. */
export async function fetchPaymentMethodIds(): Promise<PaymentMethodId[]> {
  const rows = await rest<PaymentMethodRow>(
    'payment_methods',
    '?select=key,active,sort_order&active=is.true&order=sort_order.asc',
  )
  const ids: PaymentMethodId[] = []
  for (const row of rows) {
    const id = KEY_ALIAS[row.key]
    if (id && !ids.includes(id)) ids.push(id)
  }
  return ids
}
