import type { CartItem, MerchantOrder, MerchantOrderStatus, OrderType } from '../types'
import { batchNumber } from './batch'

/** Label jenis pengantaran (PRD §7.2 Regular/batch, §7.3 Quick/partner). */
export const DELIVERY_TYPE_LABEL: Record<OrderType, string> = {
  regular: 'Regular · batch',
  quick: 'Quick · partner',
}

/** Versi pendek untuk chip di baris antrean (satu kata, muat di tiket). */
export const DELIVERY_TYPE_SHORT: Record<OrderType, string> = {
  regular: 'Regular',
  quick: 'Quick',
}

/**
 * `orders` di BE belum punya kolom jenis pengantaran, jadi demo memakai overlay
 * per kode order supaya kedua cabang (Regular → batch, Quick → partner)
 * benar-benar terlihat di konsol. Begitu kolomnya ada, `toMerchantOrder` memakai
 * nilainya (`src/api/orders.ts`) — lihat `ui-impact.md` §8.
 */
export const MOCK_ORDER_DELIVERY_TYPE: Record<string, OrderType> = {
  'SA-1041': 'quick',
  'SA-1040': 'regular',
  'SA-1039': 'regular',
  'SA-1038': 'regular',
  'SA-1037': 'quick',
  'SA-1036': 'regular',
  'SA-1035': 'regular',
  'SA-1034': 'quick',
}

/**
 * Pilihan mode yang dibuat customer saat checkout. `orders` BE belum punya
 * kolom jenis pengantaran (ui-impact.md §8), jadi pilihan itu disimpan di
 * localStorage dengan kode order sebagai kunci — jembatan demo yang sama
 * sifatnya dengan overlay di atas. Begitu kolomnya ada, `toMerchantOrder`
 * membaca `row.delivery_type` dan lapisan ini dihapus.
 */
const DELIVERY_TYPE_KEY = 'sa7tein:order-delivery-type'

function storedDeliveryTypes(): Record<string, OrderType> {
  try {
    return JSON.parse(localStorage.getItem(DELIVERY_TYPE_KEY) ?? '{}') as Record<string, OrderType>
  } catch {
    return {}
  }
}

export function rememberDeliveryType(code: string, type: OrderType): void {
  try {
    localStorage.setItem(
      DELIVERY_TYPE_KEY,
      JSON.stringify({ ...storedDeliveryTypes(), [code]: type }),
    )
  } catch {
    // localStorage penuh/diblokir — mode tetap benar untuk sesi merchant yang
    // sedang terbuka lewat overlay; tak ada yang perlu dihentikan.
  }
}

/** Jenis pengantaran order; default `regular` bila belum ada yang menyimpannya. */
export function deliveryTypeFor(code: string): OrderType {
  return storedDeliveryTypes()[code] ?? MOCK_ORDER_DELIVERY_TYPE[code] ?? 'regular'
}

/** Jenis pengantaran efektif sebuah order: nilai tersimpan menang, lalu overlay. */
export function orderDeliveryType(order: Pick<MerchantOrder, 'deliveryType' | 'code'>): OrderType {
  return order.deliveryType ?? deliveryTypeFor(order.code)
}

/**
 * Chip jenis pengantaran di tiket antrean. Order Regular yang sudah masuk batch
 * menyertakan nomornya (`Regular · #2`) supaya merchant langsung tahu order ini
 * di batch mana — sebelumnya info batch hanya ada di dalam sheet detail.
 */
export function deliveryBadge(
  order: Pick<MerchantOrder, 'deliveryType' | 'code' | 'batchId'>,
): string {
  const type = orderDeliveryType(order)
  const number = batchNumber(order.batchId)
  return number === null ? DELIVERY_TYPE_SHORT[type] : `${DELIVERY_TYPE_SHORT[type]} · #${number}`
}

/** Tab antrean merchant — satu sumber untuk label dan status anggotanya. */
export const QUEUE_TABS = [
  { id: 'masuk', label: 'Antrean', statuses: ['baru'] },
  { id: 'diproses', label: 'Diproses', statuses: ['diterima', 'disiapkan', 'siap', 'diantar', 'tiba'] },
  { id: 'selesai', label: 'Selesai', statuses: ['selesai'] },
  { id: 'batal', label: 'Batal', statuses: ['ditolak', 'batal'] },
] as const

export type QueueTabId = (typeof QUEUE_TABS)[number]['id']

export const ORDER_STATUS_LABEL: Record<MerchantOrderStatus, string> = {
  baru: 'Baru',
  diterima: 'Diterima',
  disiapkan: 'Disiapkan',
  siap: 'Siap',
  diantar: 'Diantar',
  tiba: 'Tiba',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
  batal: 'Batal',
};

export function orderStatusLabel(status: MerchantOrderStatus): string {
  return ORDER_STATUS_LABEL[status];
}

const items = {
  geprek: [{ id: 'ayam-geprek', name: 'Ayam Geprek + Nasi', price: 22000, quantity: 2, image: '' }],
  mie: [{ id: 'mie-goreng', name: 'Mie Goreng Spesial', price: 18000, quantity: 1, image: '' }],
  nasi: [{ id: 'nasi-uduk', name: 'Nasi Uduk Komplit', price: 20000, quantity: 3, image: '' }],
  es: [{ id: 'es-teh', name: 'Es Teh Manis', price: 6000, quantity: 2, image: '' }],
} satisfies Record<string, CartItem[]>

/**
 * Epoch "sekarang" untuk seed mock, dihitung sekali saat modul dimuat. Umur
 * order ikut berjalan selama sesi, dan `placedAt` (teks) tetap sinkron karena
 * keduanya berasal dari offset yang sama.
 */
const MOCK_NOW = Date.now()
const minutesAgo = (minutes: number) => MOCK_NOW - minutes * 60_000

export const merchantOrders: MerchantOrder[] = [
  {
    id: 'mo-1',
    code: 'SA-1041',
    customerId: 'cus-1',
    customerName: 'Rani',
    buyerAvatar: '/assets/img/reviewer/user1.png',
    buyerRating: 5,
    address: 'Menara Sudirman, Lt. 12 Unit B',
    items: items.geprek,
    total: 44000,
    distanceMeters: 480,
    zone: 'hijazi',
    status: 'baru',
    placedAt: '2 menit lalu',
    placedAtMs: minutesAgo(2),
    paymentMethod: 'cod',
  },
  {
    id: 'mo-2',
    code: 'SA-1040',
    customerId: 'cus-2',
    customerName: 'Budi',
    buyerAvatar: '/assets/img/reviewer/user2.png',
    buyerRating: 4,
    address: 'Jl. Kebon Sirih No. 8, Jakarta Pusat',
    items: items.mie,
    total: 18000,
    distanceMeters: 900,
    zone: 'syimali',
    status: 'baru',
    placedAt: '5 menit lalu',
    placedAtMs: minutesAgo(5),
    paymentMethod: 'transfer',
  },
  {
    id: 'mo-3',
    code: 'SA-1039',
    customerId: 'cus-3',
    customerName: 'Sinta',
    buyerAvatar: '/assets/img/reviewer/user3.png',
    buyerRating: 5,
    address: 'Apartemen Casablanca, Tower B Lt. 7',
    items: items.nasi,
    total: 60000,
    distanceMeters: 1300,
    zone: 'syimali',
    status: 'disiapkan',
    placedAt: '14 menit lalu',
    placedAtMs: minutesAgo(14),
    paymentMethod: 'cod',
    cookMinutes: 25,
  },
  {
    id: 'mo-4',
    code: 'SA-1038',
    customerId: 'cus-4',
    customerName: 'Andre',
    buyerAvatar: '/assets/img/reviewer/user4.png',
    buyerRating: 3,
    address: 'Jl. Sabang No. 22, Jakarta Pusat',
    items: items.geprek,
    total: 44000,
    distanceMeters: 1750,
    zone: 'hijazi',
    status: 'siap',
    placedAt: '18 menit lalu',
    placedAtMs: minutesAgo(18),
    paymentMethod: 'transfer',
    cookMinutes: 25,
  },
  {
    id: 'mo-5',
    code: 'SA-1037',
    customerId: 'cus-5',
    customerName: 'Maya',
    buyerAvatar: '/assets/img/reviewer/user5.png',
    buyerRating: 4,
    address: 'Wisma BNI 46, Lt. 20',
    items: items.es,
    total: 12000,
    distanceMeters: 620,
    zone: 'syimali',
    status: 'diantar',
    placedAt: '26 menit lalu',
    placedAtMs: minutesAgo(26),
    paymentMethod: 'cod',
  },
  {
    id: 'mo-6',
    code: 'SA-1036',
    customerId: 'cus-6',
    customerName: 'Dimas',
    buyerAvatar: '/assets/img/reviewer/user6.png',
    buyerRating: 5,
    address: 'Jl. Wahid Hasyim No. 4, Jakarta Pusat',
    items: items.nasi,
    total: 60000,
    distanceMeters: 1900,
    zone: 'hijazi',
    status: 'tiba',
    placedAt: '34 menit lalu',
    placedAtMs: minutesAgo(34),
    paymentMethod: 'transfer',
  },
  {
    id: 'mo-7',
    code: 'SA-1035',
    customerId: 'cus-7',
    customerName: 'Tia',
    buyerAvatar: '/assets/img/reviewer/user1.png',
    buyerRating: 5,
    address: 'Menara Imperium, Lt. 3 Unit A',
    items: items.mie,
    total: 18000,
    distanceMeters: 540,
    zone: 'hijazi',
    status: 'selesai',
    placedAt: '1 jam lalu',
    placedAtMs: minutesAgo(60),
    paymentMethod: 'cod',
  },
  {
    id: 'mo-8',
    code: 'SA-1034',
    customerId: 'cus-8',
    customerName: 'Fajar',
    buyerAvatar: '/assets/img/reviewer/user2.png',
    buyerRating: 2,
    address: 'Jl. Jaksa No. 30, Jakarta Pusat',
    items: items.geprek,
    total: 44000,
    distanceMeters: 1600,
    zone: 'hijazi',
    status: 'ditolak',
    placedAt: '2 jam lalu',
    placedAtMs: minutesAgo(120),
    paymentMethod: 'transfer',
  },
]

export function ordersForStatuses(
  orders: MerchantOrder[],
  statuses: readonly MerchantOrderStatus[],
): MerchantOrder[] {
  return orders.filter((order) => statuses.includes(order.status))
}

export function countByTab(orders: MerchantOrder[], tabId: QueueTabId): number {
  const tab = QUEUE_TABS.find((t) => t.id === tabId)
  if (!tab) return 0
  return ordersForStatuses(orders, tab.statuses).length
}

/** Umur order dalam menit, atau `null` kalau waktunya tak tersedia. */
export function orderAgeMinutes(order: MerchantOrder, now = Date.now()): number | null {
  if (order.placedAtMs === undefined) return null
  return Math.max(0, Math.round((now - order.placedAtMs) / 60_000))
}

/** Label umur ringkas untuk chip tiket: `baru`, `12 mnt`, `1 j 20 m`. */
export function orderAgeLabel(minutes: number): string {
  if (minutes < 1) return 'baru'
  if (minutes < 60) return `${minutes} mnt`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} j ${rest} m` : `${hours} j`
}

export type OrderUrgency = 'calm' | 'warning' | 'danger'

/**
 * Urgensi = berapa lama order menunggu **diterima**. Hanya `baru` yang punya
 * tenggat yang merchant kendalikan; order yang sudah jalan atau selesai tidak
 * diwarnai peringatan (umurnya wajar makin tua). Ambang 10/20 menit = keputusan
 * dapur, bukan angka PRD.
 */
export function orderUrgency(order: MerchantOrder, minutes: number | null): OrderUrgency {
  if (order.status !== 'baru' || minutes === null) return 'calm'
  if (minutes >= 20) return 'danger'
  if (minutes >= 10) return 'warning'
  return 'calm'
}
