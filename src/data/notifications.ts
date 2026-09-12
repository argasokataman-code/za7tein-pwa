// Isi kotak masuk notifikasi. Sebelumnya satu-satunya jejak notifikasi di
// aplikasi ini adalah ui.notificationCount = 3 — angka tanpa data apa pun yang
// mendasarinya — sementara halaman /notifications ternyata berisi preferensi
// toggle, bukan daftar notifikasi. Jadi lonceng berbadge "3" membuka halaman
// yang tidak memuat satu pun notifikasi.
import type { AppNotification } from '../types'

/** Tiga yang belum dibaca, supaya cocok dengan badge lonceng yang sudah ada. */
export const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    kind: 'order',
    title: 'Pesanan sedang dimasak',
    body: 'Warung Sate Pak Ali sedang menyiapkan pesanan S7-772292.',
    time: '12.32',
    unread: true,
  },
  {
    id: 'n2',
    kind: 'order',
    title: 'Kurir menuju lokasimu',
    body: 'Budi Santoso sedang mengantar pesananmu ke Green View Apartment.',
    time: '12.41',
    unread: true,
  },
  {
    id: 'n3',
    kind: 'promo',
    title: 'Diskon 30% untuk pesanan pertamamu',
    body: 'Berlaku sampai akhir bulan, minimum belanja Rp50.000.',
    time: '09.15',
    unread: true,
  },
  {
    id: 'n4',
    kind: 'payment',
    title: 'Pembayaran diterima',
    body: 'Transfer Manual Rp118.000 sudah dikonfirmasi.',
    time: 'Kemarin',
    unread: false,
  },
  {
    id: 'n5',
    kind: 'order',
    title: 'Pesanan selesai',
    body: 'Pesanan S7-1019 sudah diterima. Beri rating untuk kurirnya?',
    time: '2 hari lalu',
    unread: false,
  },
  {
    id: 'n6',
    kind: 'system',
    title: 'Pembaruan aplikasi',
    body: 'Versi baru tersedia dengan perbaikan pada pelacakan pesanan.',
    time: '3 hari lalu',
    unread: false,
  },
]

