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
import { Bike, BookOpenText, ClipboardList, LayoutDashboard, Settings } from 'lucide-react'

import { useAppSelector } from '../../hooks/useAppStore'
import { BottomNav } from './BottomNav'
import type { BottomNavItem } from './BottomNav'
import { countByTab } from '../../data/merchantOrders'

export function MerchantBottomNav() {
  const orders = useAppSelector((s) => s.merchant.orders)
  const incoming = countByTab(orders, 'masuk')

  const items: BottomNavItem[] = [
    { to: '/', label: 'Beranda', Icon: LayoutDashboard, end: true },
    {
      to: '/orders',
      label: 'Order',
      Icon: ClipboardList,
      end: false,
      badge: incoming,
      srText: incoming > 0 ? \`\${incoming} pesanan masuk\` : undefined,
    },
    { to: '/menu', label: 'Menu', Icon: BookOpenText, end: false },
    { to: '/couriers', label: 'Kurir', Icon: Bike, end: false },
    { to: '/settings', label: 'Setelan', Icon: Settings, end: false },
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
        Profil &amp; rating pembeli di kartu order
      </h3>
      <p className="doc-p">
        Setiap kartu order menampilkan avatar pembeli (40&nbsp;px, pill) di sebelah
        kode dan nama, plus rating bintang 1–5 (lucide
        <code className="doc-inline">Star</code>, token
        <code className="doc-inline">--star</code>) di kolom kanan di atas badge
        status. Pola yang sama dipakai di daftar "Order terbaru" pada dashboard
        merchant. Data mock memakai avatar
        <code className="doc-inline">/assets/img/reviewer/user1–6.png</code> dan
        rating per order di <code className="doc-inline">merchantOrders.ts</code>.
      </p>
      <h3 className="doc-h3">
        Lokasi presisi di Setelan toko
      </h3>
      <p className="doc-p">
        Peta Setelan berubah dari pratinjau statis jadi pemilih lokasi: pin
        oranye bisa digeser (mode <code className="doc-inline">picker</code> di
        <code className="doc-inline">useLeafletMap</code>), tombol "Pakai lokasi
        saat ini" memakai <code className="doc-inline">navigator.geolocation</code>
        dan memindahkan pin, lalu koordinat terpilih tampil real-time di kartu
        Koordinat. Geolokasi ditolak? Pin tetap bisa digeser manual.
      </p>
      <h3 className="doc-h3">
        Statistik dashboard berwarna
      </h3>
      <p className="doc-p">
        Empat kartu stat di dashboard memakai tint per peran agar tidak monoton:
        Antrean <code className="doc-inline">--warning-soft</code>, Diproses
        <code className="doc-inline">--orange-soft</code>, Selesai
        <code className="doc-inline">--success-soft</code>, dan Pendapatan
        (kartu hero) <code className="doc-inline">--sa7tein-orange</code> dengan
        teks <code className="doc-inline">--on-brand</code>. Tidak ada token baru.
      </p>
      <h3 className="doc-h3">
        Menu &amp; Stok — katalog operasional
      </h3>
      <p className="doc-p">
        Quick action "Kelola" di dashboard memakai kartu aksi terpisah
        (<code className="doc-inline">merchant-quick-action</code>): ikon dalam
        lingkaran oranye (<code className="doc-inline">--orange-soft</code> /
        <code className="doc-inline">--orange-ink</code>) plus chevron kanan — bukan
        baris order, supaya jelas bisa diketuk.
      </p>
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
        <code className="doc-inline">BookOpenText</code>) sits between Order and
        Kurir.
      </p>
      <h3 className="doc-h3">
        Kelola kurir &amp; pemilihan kurir per order
      </h3>
      <p className="doc-p">
        Halaman <code className="doc-inline">/merchant/couriers</code> adalah pengelola
        kurir toko: tambah (nama + nomor WA, validasi <code className="doc-inline">phoneField</code>{' '}
        yang sama dengan pendaftaran), jam tugas (Aktifkan/Nonaktifkan), dan hapus dengan
        konfirmasi. Kuota dibaca dari <code className="doc-inline">MAX_COURIERS_PER_MERCHANT</code>{' '}
        (3) — bukan angka di JSX. Status <code className="doc-inline">delivering</code> tidak
        bisa diubah dari sini karena datang dari checkpoint kurir sendiri (F13).
      </p>
      <p className="doc-p">
        Order yang sudah diterima punya pemilih kurir di{' '}
        <code className="doc-inline">/merchant/orders</code>. Memilih kurir mengisi{' '}
        <code className="doc-inline">MerchantOrder.courierId</code> dan menambah hitungan
        order aktif kurir itu — cermin <code className="doc-inline">C-06</code> (platform
        tidak menugaskan kurir, merchant memilih sendiri) dan edge F12{' '}
        <code className="doc-inline">:assign → hold_cut</code>. Copy status hold diambil dari{' '}
        <code className="doc-inline">HOLD_STATUS_COPY</code>, jadi tidak ada kalimat
        karangan tentang dana.
      </p>
      <h3 className="doc-h3">
        Ulasan pembeli — di luar PRD aktif (UNRESOLVED)
      </h3>
      <p className="doc-p">
        Halaman <code className="doc-inline">/merchant/reviews</code> memberi
        pemilik toko membaca ulasan pembeli per hidangan dan membalasnya. Ini
        <strong> di luar PRD aktif</strong>: tidak ada requirement <code className="doc-inline">R-*</code>
        di <code className="doc-inline">irbid-mvp-v2-2026-09-21</code> maupun
        milestone <code className="doc-inline">M0–M11</code> di
        <code className="doc-inline">docs/product/prd/versions/irbid-mvp-v2-2026-09-21/milestones.md</code>
        yang menyebut ulasan atau respons pembeli. Karena itu item ini ditandai
        <code className="doc-inline">UNRESOLVED</code> (out-of-PRD), bukan
        diisi dengan asumsi.
      </p>
      <p className="doc-p">
        Entry-nya kartu "Ulasan Pembeli" di section Kelola dashboard; bottom nav
        tetap 5 tab (keputusan desain tidak diubah). Mock hidup di
        <code className="doc-inline">src/data/merchantReviews.ts</code>, terikat
        ke id katalog nyata (<code className="doc-inline">mm-1..mm-5</code>).
        Balasan disimpan di slice <code className="doc-inline">merchant</code>
        sebagai <code className="doc-inline">reviewReplies</code> dan
        <strong> tidak dipersist</strong> — sama seperti field merchant lain, jadi
        balasan reset saat reload. Form balasan memakai
        <code className="doc-inline">BottomSheet</code> bersama; tidak ada
        komponen, token, atau warna baru.
      </p>
      <h3 className="doc-h3">
        Grafik beranda dapur
      </h3>
      <p className="doc-p">
        Beranda dapur menampilkan dua grafik tren (order &amp; pendapatan per hari, tujuh hari) dan
        satu donut komposisi status order. Grafiknya memakai primitif yang <strong>sudah ada</strong>{' '}
        — <code className="doc-inline">BarChart</code> dan{' '}
        <code className="doc-inline">DonutChart</code> di{' '}
        <code className="doc-inline">src/components/ui/</code> dengan{' '}
        <code className="doc-inline">_charts.scss</code>, sama seperti Ringkasan Super Admin.
        Tidak ada library chart baru.
      </p>
      <p className="doc-p">
        Datanya hidup di <code className="doc-inline">src/data/merchantTrend.ts</code>. Merchant
        tidak menyimpan tanggal pesanan (<code className="doc-inline">placedAt</code> berbentuk
        teks relatif seperti "2 menit lalu"), jadi deret harian disimpan terpisah dan{' '}
        <strong>dijaga konsisten dengan kartu di atasnya</strong>: jumlah order tujuh hari sama
        dengan jumlah order mock, dan pendapatan tujuh hari sama dengan total order yang
        benar-benar berjalan (order <code className="doc-inline">ditolak</code>/
        <code className="doc-inline">batal</code> tidak pernah jadi uang).
      </p>
      <p className="doc-p">
        Dua hal yang <strong>sengaja tidak dipakai</strong>, supaya tidak diusulkan ulang:
      </p>
      <ul className="doc-list">
        <li>
          <strong>Dua chart berdampingan di satu baris.</strong> Percobaan dua kolom pernah dibuat
          untuk memendekkan kartu, dan diukur gagal: kolom 150px menyisakan 11,1px per batang
          sementara teks nilai selebar 24,4px, jadi nilai tumpang tindih 1,3px di lima pasang dan
          label hari menyatu. Chart kembali penuh lebar; kartu lebih tinggi, tapi terbaca.
        </li>
        <li>
          <strong>Judul "Komposisi hari ini".</strong> Mock tidak punya tanggal pesanan, jadi
          klaim "hari ini" tidak bisa dibuktikan. Judulnya "Komposisi order".
        </li>
      </ul>
      <p className="doc-p">
        Perbandingan COD vs transfer tidak memakai donut kedua: split 4/4 tidak menambah
        informasi di atas satu bar dua warna, dan donut kedua membuat kartu komposisi 468px.
        Sekarang bar perbandingan 10px dengan legenda, tinggi kartu 395px.
      </p>
    </DocSection>
  )
}
