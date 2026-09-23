import type { Customer, CustomerStatus } from '../types'

/**
 * Registri customer platform.
 *
 * Sebelum ini customer tidak punya entitas sama sekali: yang ada hanya
 * `customerName` (string tanpa id) yang diulang di `merchantOrders`,
 * `courier.ts`, dan `merchantReviews` — delapan nama yang sama di tiga modul,
 * tanpa apa pun yang mengikatnya. Akibatnya tidak ada satu pun pertanyaan
 * per-customer yang bisa dijawab: berapa order, kena berapa sengketa, uangnya
 * masuk ledger yang mana.
 *
 * Registri ini mengangkat nama-nama itu jadi entitas bertipe, jadi order,
 * sengketa, ulasan, dan ledger menunjuk orang yang sama lewat satu kunci.
 *
 * Nomornya sama dengan `CourierTask.customerPhone` di `courier.ts` — satu orang
 * satu nomor, jangan disalin dengan angka berbeda. `mockUser` (customer yang
 * sedang login, `src/data/user.ts`) memakai `cus-6`.
 *
 * Isinya mock seperti seluruh repo ini (AGENTS.md §1); yang penting bentuknya,
 * bukan angkanya.
 *
 * Flag risiko **tidak** di sini: ia keadaan yang berubah, hidup di
 * `admin.customerRiskFlags` (`src/store/slices/adminSlice.ts`) dengan
 * `customerId` sebagai kunci, supaya aksi blacklist COD CS langsung terlihat.
 */
export const customers: Customer[] = [
  {
    id: 'cus-1',
    name: 'Rani',
    phone: '+6281200000001',
    phoneVerified: true,
    avatar: '/assets/img/reviewer/user1.png',
    addressCount: 1,
    status: 'active',
    joinedAt: '3 bulan lalu',
  },
  {
    id: 'cus-2',
    name: 'Budi',
    phone: '+6281200000002',
    phoneVerified: true,
    avatar: '/assets/img/reviewer/user2.png',
    addressCount: 2,
    status: 'active',
    joinedAt: '2 bulan lalu',
  },
  {
    id: 'cus-3',
    name: 'Sinta',
    phone: '+6281200000003',
    phoneVerified: true,
    avatar: '/assets/img/reviewer/user3.png',
    addressCount: 1,
    status: 'active',
    joinedAt: '6 minggu lalu',
  },
  {
    id: 'cus-4',
    name: 'Andre',
    phone: '+6281200000005',
    phoneVerified: false,
    avatar: '/assets/img/reviewer/user4.png',
    addressCount: 1,
    status: 'active',
    joinedAt: '5 minggu lalu',
  },
  {
    id: 'cus-5',
    name: 'Maya',
    phone: '+6281200000006',
    phoneVerified: true,
    avatar: '/assets/img/reviewer/user5.png',
    addressCount: 3,
    status: 'active',
    joinedAt: '1 bulan lalu',
  },
  {
    id: 'cus-6',
    name: 'Dimas',
    phone: '+6281234567890',
    phoneVerified: true,
    avatar: '/assets/img/reviewer/user6.png',
    addressCount: 3,
    status: 'active',
    joinedAt: '1 bulan lalu',
  },
  {
    id: 'cus-7',
    name: 'Tia',
    phone: '+6281200000004',
    phoneVerified: true,
    avatar: '/assets/img/reviewer/user1.png',
    addressCount: 2,
    status: 'active',
    joinedAt: '3 minggu lalu',
  },
  {
    id: 'cus-8',
    name: 'Fajar',
    phone: '+6281200000007',
    phoneVerified: false,
    avatar: '/assets/img/reviewer/user2.png',
    addressCount: 1,
    status: 'active',
    joinedAt: '2 minggu lalu',
  },
]

/** Label status akun customer untuk tampilan. */
export const customerStatusLabel: Record<CustomerStatus, string> = {
  active: 'Aktif',
  suspended: 'Suspended',
  blacklisted: 'Blacklist',
}

/** Cari satu customer dari registri. `undefined` = id menggantung. */
export function findCustomer(id: string): Customer | undefined {
  return customers.find((customer) => customer.id === id)
}
