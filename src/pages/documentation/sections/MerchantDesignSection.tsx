import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function MerchantDesignSection() {
  return (
    <DocSection id="merchant-design" num="13" title="Merchant Console — Design Consistency">
      <p className="doc-p">
        The merchant console (<code className="doc-inline">/merchant</code>) was redesigned to reuse the
        customer design system rather than maintaining a parallel set of styles.
        Below are the key integration points and conscious exceptions.
      </p>
      <h3 className="doc-h3">
        Header — sticky, edge-to-edge
      </h3>
      <p className="doc-p">
        <code className="doc-inline">.merchant-header</code> follows the same convention as the customer
        header: <code className="doc-inline">position: sticky</code>, negative margin + padding to bleed
        to the shell edges. No separate header component — CSS class reuse only.
      </p>
      <h3 className="doc-h3">
        Cards — shared surface token
      </h3>
      <p className="doc-p">
        Merchant card selectors now <code className="doc-inline">@extend %card-surface</code>, inheriting
        the same <code className="doc-inline">--surface</code>,
        <code className="doc-inline">--border</code>, and <code className="doc-inline">--shadow-sm</code> as customer cards. No new
        card token was introduced.
      </p>
      <h3 className="doc-h3">
        BottomNav — parametrizable
      </h3>
      <p className="doc-p">
        <code className="doc-inline">MerchantBottomNav</code> no longer duplicates bottom navigation
        markup. It delegates to the shared <code className="doc-inline">BottomNav</code> component via
        an <code className="doc-inline">items</code> prop:
      </p>
      <DocCode lang="tsx">
        {`// src/components/layout/MerchantBottomNav.tsx
import { Bike, ClipboardList, LayoutDashboard, Settings, UtensilsCrossed } from 'lucide-react'

import { useAppSelector } from '../../hooks/useAppStore'
import { BottomNav } from './BottomNav'
import type { BottomNavItem } from './BottomNav'
import { countByTab } from '../../data/merchantOrders'

export function MerchantBottomNav() {
  const orders = useAppSelector((s) => s.merchant.orders)
  const incoming = countByTab(orders, 'masuk')

  const items: BottomNavItem[] = [
    { to: '/merchant', label: 'Beranda', Icon: LayoutDashboard, end: true },
    {
      to: '/merchant/orders',
      label: 'Order',
      Icon: ClipboardList,
      end: false,
      badge: incoming,
      srText: incoming > 0 ? \`\${incoming} pesanan masuk\` : undefined,
    },
    { to: '/merchant/menu', label: 'Menu', Icon: UtensilsCrossed, end: false },
    { to: '/merchant/couriers', label: 'Kurir', Icon: Bike, end: false },
    { to: '/merchant/settings', label: 'Setelan', Icon: Settings, end: false },
  ]

  return <BottomNav items={items} />
}`}
      </DocCode>
      <h3 className="doc-h3">
        Order status — human labels
      </h3>
      <p className="doc-p">
        Raw enum values (e.g. <code className="doc-inline">masuk</code>,
        <code className="doc-inline">dimasak</code>) are displayed via
        <code className="doc-inline">orderStatusLabel()</code>, which returns Indonesian
        labels:
      </p>
      <DocCode lang="typescript">
        {`// src/data/merchantOrders.ts
import type { MerchantOrderStatus } from '../types'

export const ORDER_STATUS_LABEL: Record<MerchantOrderStatus, string> = {
  masuk: 'Baru',
  diterima: 'Diterima',
  dimasak: 'Dimasak',
  diantar: 'Diantar',
  tiba: 'Tiba',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
  batal: 'Batal',
}

export function orderStatusLabel(status: MerchantOrderStatus): string {
  return ORDER_STATUS_LABEL[status]
}`}
      </DocCode>
      <h3 className="doc-h3">
        Badge contrast fix
      </h3>
      <p className="doc-p">
        Status badges previously used dark-ink colors as backgrounds, producing
        near-invisible text on dark themes. The fix applies
        <code className="doc-inline">--orange-soft</code> background with
        <code className="doc-inline">--orange-soft-ink</code> text — matching
        the customer badge palette without introducing new tokens.
      </p>
      <h3 className="doc-h3">
        Components deliberately NOT reused
      </h3>
      <p className="doc-p">
        <code className="doc-inline">FoodCard</code>,
        <code className="doc-inline">CustomerHomeHero</code>, and
        <code className="doc-inline">JourneyLine</code> are not shared with merchant
        screens. Merchant content is admin-oriented (order rows, status badges,
        menu management) — not customer food browsing. Reusing those components
        would force merchant-specific props into a customer-shaped interface.
        This is a conscious decision, not an oversight.
      </p>
      <h3 className="doc-h3">
        Menu &amp; Stok — katalog operasional
      </h3>
      <p className="doc-p">
        Ringkasan 3 kartu adalah filter interaktif: Semua menu, Menipis, dan Habis.
        Setiap item hanya muncul satu kali dalam daftar yang dipilih. Kartu item
        memisahkan identitas (foto, nama, kategori, harga) dari tindakan (ubah stok,
        ubah ketersediaan, opsi lain). Semua kontrol memiliki target minimal 44 px.
      </p>
      <p className="doc-p">
        Ubah stok membuka <code className="doc-inline">BottomSheet</code> dengan
        stepper dan tombol Simpan. Opsi Ubah/Hapus tetap di menu tambahan; Hapus
        meminta konfirmasi dan menjelaskan dampaknya ke katalog pelanggan.
        Form tambah/ubah memiliki label yang terhubung ke input.
      </p>
      <p className="doc-p">
        Setiap thumbnail memakai <code className="doc-inline">alt</code> nama item
        (bukan kosong) supaya daftar tetap terbaca screen reader; gambar pratinjau
        memberi dimensi eksplisit + lazy loading agar tata letak tidak bergeser.
        Aturan <code className="doc-inline">.merchant-menu-*</code> dikonsolidasi ke
        satu blok — properti yang hanya ada di blok lama (object-fit, ellipsis nama,
        warna stok, state tidak tersedia) dipindah dulu sebelum blok duplikat dihapus.
      </p>
      <h3 className="doc-h3">
        Unified catalog
      </h3>
      <p className="doc-p">
        Merchant menu and customer app read from the same Redux
        <code className="doc-inline">catalog</code> slice, seeded by
        <code className="doc-inline">src/data/catalog.ts</code>. Merchant edits —
        including image upload via <code className="doc-inline">FileReader</code> to
        data-URL — are visible to customers immediately.
      </p>
      <h3 className="doc-h3">
        Bottom nav — 5 tabs
      </h3>
      <p className="doc-p">
        The merchant bottom nav now has five tabs: Beranda, Order, Menu, Kurir,
        Setelan. <code className="doc-inline">/merchant/menu</code> is active on the
        Menu page. The <code className="doc-inline">Menu</code> icon (lucide
        <code className="doc-inline">UtensilsCrossed</code>) sits between Order and
        Kurir.
      </p>
    </DocSection>
  )
}
