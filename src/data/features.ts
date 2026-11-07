/**
 * Sakelar demo: fitur yang **disembunyikan**, bukan dihapus.
 *
 * Kode, data, tipe, dan reducer tetap utuh di repo supaya bisa dinyalakan lagi
 * tanpa menulis ulang. Yang berubah hanya permukaan UI-nya.
 *
 * `TIPS_ENABLED = false` (permintaan demo 2026-11-02: "app kurir tanpa tips").
 * Yang ikut hilang saat false:
 *   - tab **Tips** di bilah bawah kurir inhouse, halaman `/tips`
 *   - kartu statistik "Tips" + grafik "Tips 7 hari terakhir" di beranda kurir
 *   - menu "Dompet kurir" dan "Rekening pencairan", karena saldo yang bisa
 *     ditarik di demo ini **hanya** tips (`src/data/courierWallet.ts`)
 *   - rute `/wallet`, `/payout`, `/payout-accounts` milik kurir
 *   - kalimat "Tips kamu ... masuk dompet" di pesan selesai tugas
 *   - pilihan nominal tip di layar rating customer, dan baris "Tip kurir" di nota
 *
 * Menyalakan lagi: set `true`, lalu cek ulang bilah bawah kurir (tab ketiga
 * kembali) dan `node scripts/browser-gate.mjs --role courier --strict --click`.
 */
export const TIPS_ENABLED = false

/**
 * Sakelar demo: pengantaran **Quick** (satu order, kurir partner).
 *
 * `QUICK_ENABLED = false` (permintaan demo 2026-11-08: "quick order berarti
 * tidak ada" karena kurir partner tidak dipakai lagi). Yang ikut hilang saat
 * false:
 *   - kartu **Quick** di checkout customer; mode kembali ke Regular saja
 *   - pengali tarif Quick di `useChargedBreakdown` (order tersimpan yang masih
 *     `quick` ditagih seperti Regular, bukan tarif yang tak bisa dipilih)
 *   - tombol "Serahkan ke kurir partner" di konsol merchant dan panel dispatch
 *     partner; order berjalan memakai jalur batch seperti Regular
 *   - catatan "(Quick)" di ringkasan bayar
 *
 * Data, tipe, reducer, kanal partner, dan setelan `quickMultiplier` di ops tetap
 * utuh supaya bisa dinyalakan lagi tanpa menulis ulang.
 */
export const QUICK_ENABLED = false
