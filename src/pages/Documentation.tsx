import { useState } from 'react'

import { DOC_NAV } from './documentation/nav'
import { DocShellCtas } from './documentation/DocShellCtas'
import { APP_VERSION } from '../data/appInfo'
import { IntroductionSection } from './documentation/sections/IntroductionSection'
import { WhatsNewSection } from './documentation/sections/WhatsNewSection'
import { PagesRoutesSection } from './documentation/sections/PagesRoutesSection'
import { FileStructureSection } from './documentation/sections/FileStructureSection'
import { InstallationSection } from './documentation/sections/InstallationSection'
import { RouteProtectionSection } from './documentation/sections/RouteProtectionSection'
import { StateManagementSection } from './documentation/sections/StateManagementSection'
import { PwaSection } from './documentation/sections/PwaSection'
import { StylingSection } from './documentation/sections/StylingSection'
import { FormsSection } from './documentation/sections/FormsSection'
import { ComponentsSection } from './documentation/sections/ComponentsSection'
import { CourierDesignSection } from './documentation/sections/CourierDesignSection'
import { AdminDesignSection } from './documentation/sections/AdminDesignSection'
import { CurrencySection } from './documentation/sections/CurrencySection'
import { CheckoutFeeSection } from './documentation/sections/CheckoutFeeSection'
import { CodHoldSection } from './documentation/sections/CodHoldSection'
import { DeliveryCheckpointSection } from './documentation/sections/DeliveryCheckpointSection'
import { DisputeSection } from './documentation/sections/DisputeSection'
import { ConsistencySection } from './documentation/sections/ConsistencySection'
import { SuperAdminSection } from './documentation/sections/SuperAdminSection'
import { AddressZoneSection } from './documentation/sections/AddressZoneSection'
import { IncentiveSection } from './documentation/sections/IncentiveSection'
import { LedgerSection } from './documentation/sections/LedgerSection'
import { PushSection } from './documentation/sections/PushSection'
import { TaxSection } from './documentation/sections/TaxSection'
import { WalletSection } from './documentation/sections/WalletSection'
import { BackendSection } from './documentation/sections/BackendSection'
import { MerchantDesignSection } from './documentation/sections/MerchantDesignSection'
import { LayoutExceptionsSection } from './documentation/sections/LayoutExceptionsSection'
import { LandingSection } from './documentation/sections/LandingSection'
import { DesignTokensSection } from './documentation/sections/DesignTokensSection'
import { ButtonsSection } from './documentation/sections/ButtonsSection'
import { ElementsSection } from './documentation/sections/ElementsSection'
import { MotionIconsSection } from './documentation/sections/MotionIconsSection'
import { AuthSection } from './documentation/sections/AuthSection'
import { AppPolishSection } from './documentation/sections/AppPolishSection'
import { ChangelogSection } from './documentation/sections/ChangelogSection'

const SECTIONS = [
  IntroductionSection,
  WhatsNewSection,
  PagesRoutesSection,
  FileStructureSection,
  InstallationSection,
  RouteProtectionSection,
  StateManagementSection,
  PwaSection,
  StylingSection,
  FormsSection,
  ComponentsSection,
  BackendSection,
  MerchantDesignSection,
  LayoutExceptionsSection,
  LandingSection,
  DesignTokensSection,
  ButtonsSection,
  ElementsSection,
  MotionIconsSection,
  CourierDesignSection,
  AdminDesignSection,
  CurrencySection,
  CheckoutFeeSection,
  WalletSection,
  CodHoldSection,
  DeliveryCheckpointSection,
  DisputeSection,
  TaxSection,
  PushSection,
  LedgerSection,
  IncentiveSection,
  AddressZoneSection,
  ConsistencySection,
  SuperAdminSection,
  AuthSection,
  ChangelogSection,
  AppPolishSection,
]

// `SECTIONS` dan `DOC_NAV` (src/pages/documentation/nav.ts) dipakai berpasangan:
// render di bawah memakai DOC_NAV[index] sebagai key. Panjang yang tidak sama
// membuat entri terakhir undefined dan halaman ini mati tanpa pesan jelas —
// terjadi saat satu section ditambahkan tanpa entri nav. Gagalkan lebih awal
// dengan pesan yang menyebut sebabnya.
if (SECTIONS.length !== DOC_NAV.length) {
  throw new Error(
    `Documentation: SECTIONS (${SECTIONS.length}) dan DOC_NAV (${DOC_NAV.length}) tidak sepanjang`,
  )
}

const HERO_TAGS = [
  'React 19 + Vite',
  'React 19',
  'TypeScript',
  'Redux Toolkit',
  'Supabase Realtime',
  'SCSS',
  'PWA',
  'Leaflet',
  'Google Routes (WALK)',
  'Zod',
  'React Hook Form',
]

// CTA per peran (`DocShellCtas`) menautkan host peran ke PATH entry perannya,
// mis. `https://sa7tein-c.vercel.app/customer/home`, bukan root host. Root tetap
// 307 di server lewat `vercel.json`, tapi service worker lama bisa menyajikan
// `index.html` dari cache untuk `/` sehingga 307 tak jalan dan app mendarat di
// Landing; menautkan path peran membuat klik selalu mendarat di peran yang benar.
export default function Documentation() {
  const [active, setActive] = useState(0)
  // Sidebar di layar sempit tergeser keluar (`translateX(-100%)`) dan hanya
  // kelas `.open` yang memunculkannya. Sebelum ini tidak ada yang pernah
  // menambah `.open`, sementara tombol hamburger tidak punya handler: jadi di
  // ponsel daftar isi tidak bisa dibuka sama sekali. State ini yang menutupnya.
  const [navOpen, setNavOpen] = useState(false)

  const goTo = (index: number, id: string) => {
    setActive(index)
    setNavOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
    <div className="app-shell">
      <div className="doc-root">
        <div className="doc-topbar">
          <span className="doc-topbar-logo">
            Sa7tein
          </span>
          <button
            className="doc-hamburger"
            aria-label="Buka daftar isi"
            aria-expanded={navOpen}
            aria-controls="doc-nav"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <div
          className={`doc-overlay${navOpen ? ' open' : ''}`}
          onClick={() => setNavOpen(false)}
        />
        <aside className={`doc-sidebar${navOpen ? ' open' : ''}`} id="doc-nav">
          <div className="doc-sidebar-logo">
            <span className="doc-logo-mark">
              Sa7tein
            </span>
            <span className="doc-logo-sub">
              Documentation
            </span>
          </div>
          <div className="doc-sidebar-version">
            <span className="doc-version-badge">
              v{APP_VERSION}
            </span>
            <span>
              React 19 · Vite · TypeScript
            </span>
          </div>
          <nav className="doc-nav">
            <div className="doc-nav-label">
              Contents
            </div>
            {DOC_NAV.map((item, index) => (
              <button
                key={item.id}
                className={`doc-nav-item ${active === index ? 'active' : ''}`}
                onClick={() => goTo(index, item.id)}
              >
                <span className="doc-nav-num">
                  {item.num}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="doc-main">
          <div className="doc-hero">
            <div className="doc-hero-eyebrow">
              Documentation
            </div>
            <h1 className="doc-hero-title">
              Sa7tein 
              <span>
                PWA
              </span>
              <br />
              Developer Guide
            </h1>
            <p className="doc-hero-desc">
              Referensi PWA Sa7tein: arsitektur tiap layar, kontrak backend, sistem
              desain, dan riwayat perubahan per role. Data referensi (kurir, dompet,
              insentif merchant, zona, operator SA) dibaca live dari PostgREST lewat{' '}
              <code className="doc-inline">src/api/reference.ts</code> lalu disinkronkan ke
              Redux di root. Enam alur yang dulu ditahan backend &mdash; refund (
              <code className="doc-inline">refunds</code>), beli kuota (
              <code className="doc-inline">quota_subscriptions</code>/<code className="doc-inline">quota_packages</code>),
              program marketing (<code className="doc-inline">marketing_programs</code>),
              rating menu, dispatch kurir partner (
              <code className="doc-inline">dispatch_assignments</code>), dan coverage (
              <code className="doc-inline">coverage_zones</code>) &mdash; kini membaca dan menulis
              tabel live lewat <code className="doc-inline">src/api/</code> (mock tetap jadi
              fallback bila BE kosong/menolak, AGENTS &sect;1).
            </p>
            <div className="doc-hero-tags">
              {HERO_TAGS.map((tag) => (
                <span key={tag} className="doc-hero-tag">
                  {tag}
                </span>
              ))}
            </div>
            <p className="doc-p">
              Buka UI langsung. Tiap tautan membuka role di tab baru, tanpa login
              (semua data mock):
            </p>
            <DocShellCtas />
            <p className="doc-p">
              Rincian tiap perubahan ada di bagian <strong>Changelog (37)</strong>, dan
              tiap topik punya bagiannya sendiri di daftar isi. Sorotan terbaru:
            </p>
            <ul className="doc-list">
              <li>
                <strong>PRD aktif berganti</strong> ke{' '}
                <code className="doc-inline">sa7tein-mvp-2026-10-11</code> (marketplace +
                delivery), menggantikan <code className="doc-inline">irbid-mvp-v2-2026-09-21</code>{' '}
                yang jadi <code className="doc-inline">superseded</code> (catatan keputusan di{' '}
                <code className="doc-inline">docs/product/prd/decision-sa7tein-mvp.md</code>).
                Migrasi M0–M11 masuk bertahap: M0 menambah tipe domain + konstanta uang
                (Pc/Pm, multiplier Quick, Ft QRIS) dan slice{' '}
                <code className="doc-inline">batch</code>/<code className="doc-inline">partner</code>/
                <code className="doc-inline">quota</code>/<code className="doc-inline">marketing</code>;
                M1 (discovery) menggrup toko per tag, menyembunyikan toko blok-kuota, menonaktifkan
                toko tutup/luar-coverage, dan menambah bilah urut/filter di{' '}
                <code className="doc-inline">/customer/home</code>; M4 (konsol merchant) memecah
                accept order jadi <strong>Regular → batch</strong> (baru/gabung, hitung mundur,
                packing, tutup lebih awal, satu kurir inhouse) dan <strong>Quick → kurir partner</strong>{' '}
                di <code className="doc-inline">/merchant/orders</code> (flow{' '}
                <code className="doc-inline">f25-batch-lifecycle</code>). Milestone &amp; kriteria
                penerimaan: <code className="doc-inline">docs/product/prd/versions/sa7tein-mvp-2026-10-11/milestones.md</code>.
              </li>
              <li>
                <strong>Editor coverage merchant</strong> (M4b): Setelan toko &rarr;{' '}
                <em>Atur area layanan</em> (<code className="doc-inline">/merchant/coverage</code>) &mdash;
                merchant memilih <strong>mode area</strong> (beberapa polygon ber-fee yang tidak boleh
                tumpang tindih) atau <strong>mode radius</strong> (&le;2&nbsp;km + fee per satuan
                meter/km). Kanvas menggambar lat/lng hasil proyeksi seperti kanvas zona SA (tanpa tile
                peta); aturan murni di <code className="doc-inline">src/data/coverage.ts</code> ditahan{' '}
                <code className="doc-inline">scripts/coverage-check.mjs</code>. Tulis ke server belum
                ada (<code className="doc-inline">delivery_config</code> tanpa endpoint tulis), jadi
                perubahan hidup di aplikasi dan ditandai lewat notice. Flow{' '}
                <code className="doc-inline">f28-coverage-editor</code>.
              </li>
              <li>
                <strong>Kategori menu = taksonomi ops/BE (baca-saja)</strong> (M4c, MER-06):
                kategori <em>tidak</em> dikelola merchant &mdash; daftarnya disediakan ops/BE dan
                merchant hanya <strong>memilih</strong> lewat dropdown{' '}
                (<code className="doc-inline">ui/SelectField</code>) di form item; item tetap
                dikelompokkan per kategori. Alasan: CRUD kategori cuma hidup di browser (BE belum
                punya endpoint tulis) dan taksonomi telusur lintas toko jadi pecah &mdash; sama
                seperti tag toko yang ops-curated. Form item punya{' '}
                <strong>toggle catatan per menu</strong> (MER-05): kolom catatan pelanggan di halaman
                item hanya muncul bila menyala. Daftar kategori hidup di state{' '}
                <code className="doc-inline">catalog.categories</code> (ikon dipetakan dari modul,
                bukan state, karena komponen lucide tak selamat dari JSON persist; kelak diisi dari
                BE). Model attribute/varian Odoo (MER-07/MER-08) menyusul di bagian berikut.
              </li>
              <li>
                <strong>Varian &amp; tambahan ala Odoo</strong> (M4c, MER-07/MER-08): model{' '}
                <code className="doc-inline">CatalogAttribute</code>/
                <code className="doc-inline">MenuAttributeLine</code>/
                <code className="doc-inline">MenuAttributeValue</code>/{' '}
                <code className="doc-inline">AttributeExclusion</code>/
                <code className="doc-inline">MenuVariant</code> yang tadinya menganggur kini hidup di
                slice <code className="doc-inline">catalogAttributes</code>. Di form item merchant
                (<code className="doc-inline">MenuAttributeEditor</code>) merchant memasang atribut,
                menulis tambahan harga (<code className="doc-inline">price_extra</code>) per nilai, dan
                mematikan nilai atau kombinasi — ketersediaan tiga level. Pelanggan memilih di halaman
                item: harga = dasar + Σ tambahan, nilai yang mati/di-exclude tak bisa dipilih. Aturan
                murni di <code className="doc-inline">src/data/catalogOdoo.ts</code> ditahan{' '}
                <code className="doc-inline">scripts/catalog-check.mjs</code>.
              </li>
              <li>
                <strong>Profil &amp; tag toko</strong> (M4d, MER-01..03): Setelan toko menyunting
                nama/nomor/alamat/foto, dan kini kartu <strong>tag toko</strong> &mdash; multi-pilih
                dari daftar tag yang dikenal ops (maks 4, chip kelebihan nonaktif). Beranda pelanggan
                menggrup toko per tag; tag baru perlu moderasi ops, tapi BE belum punya kolom usulan
                tag, jadi profil maupun tag hanya hidup di sesi (ditandai muka, tanpa endpoint tulis).
              </li>
              <li>
                <strong>Kelola kurir inhouse</strong> (M4e, MER-16): di{' '}
                <code className="doc-inline">/merchant/couriers</code> tiap kurir kini bisa{' '}
                <strong>diubah</strong> (nama + nomor WA) lewat sheet yang sama dengan tambah; halaman
                menegaskan kurir di sini adalah kurir <em>inhouse</em> (karyawan toko) dan satu kurir
                ditugaskan ke satu batch di halaman Order. Rekrut kurir partner oleh tim ops (M6) belum
                ada.
              </li>
              <li>
                <strong>Keranjang ganda per toko</strong> (M1c): menambah menu dari toko berbeda
                tidak lagi menimpa keranjang sebelumnya — keranjang toko lain disimpan di{' '}
                <code className="doc-inline">cart.carts</code> dan layar{' '}
                <code className="doc-inline">/customer/checkout</code> menampilkan daftar
                &ldquo;Keranjang lain&rdquo; untuk dipindah atau dibuang, plus kolom catatan
                tingkat pesanan (<code className="doc-inline">cart.orderNote</code>); nama toko
                pada checkout kini diambil dari merchant keranjang aktif, daftar
                &ldquo;Keranjang lain&rdquo; tetap tampil walau keranjang aktif kosong, dan
                keranjang aktif disimpan lebih dulu sebelum ditimpa — item tidak hilang saat
                pindah.
              </li>
              <li>
                <strong>Aturan uang PRD baru</strong> (M2a) jadi fungsi murni JOD di{' '}
                <code className="doc-inline">src/data/marketplace.ts</code>:{' '}
                <code className="doc-inline">priceBreakdown()</code> menurunkan{' '}
                <code className="doc-inline">S − Dm − Da + F + Pc + Ft</code> dengan{' '}
                <code className="doc-inline">Ft</code> = 1,5% hanya untuk QRIS,{' '}
                <code className="doc-inline">settlementFor()</code> membelah tiga kolom
                (merchant/kurir/aplikator) yang selalu berjumlah total — kuota{' '}
                <code className="doc-inline">cod</code> memindahkan <code className="doc-inline">Pc</code>{' '}
                ke merchant — dan pembulatan tagihan ke atas ratusan vs payout ke bawah rupiah
                penuh. Diuji <code className="doc-inline">scripts/money-check.mjs</code>.
              </li>
              <li>
                <strong>Rincian uang itu kini terpasang</strong> (M2b): Checkout, layar bayar, dan
                layar DANA membaca satu hook{' '}
                <code className="doc-inline">useChargedBreakdown()</code> — dulu rumus total disalin
                di tiap layar. Baris <strong>Biaya transaksi QRIS (1,5%)</strong> hanya muncul untuk
                QRIS, biaya layanan memakai <code className="doc-inline">Pc</code> (§16.2), dan
                tagihan dibulatkan ke atas ratusan. Ditambah: masa berlaku kode pembayaran{' '}
                <strong>30 menit</strong>, tombol <strong>Simpan QR</strong> (PNG dari matriks yang
                tampil, warna dari token), dan gate <strong>kuota COD</strong> — COD nonaktif dengan
                alasan saat kuota toko habis (§17). Baris BE berkey{' '}
                <code className="doc-inline">qris</code> kini dipetakan ke QRIS (sebelumnya dibuang,
                jadi QRIS hilang dari layar walau aktif di database).
              </li>
              <li>
                <strong>Refund ditandai belum tersedia</strong> (M2c): layar{' '}
                <code className="doc-inline">/customer/refund</code> menampilkan alur §16.6 lengkap —
                saldo DANA (otomatis), rekening bank lewat BI-FAST (biaya{' '}
                <code className="doc-inline">Rp2.500</code> ditanggung aplikator), dan pilihan
                DANA/bank untuk QRIS + binding — tetapi <strong>nonaktif</strong>, karena BE demo
                belum punya tabel <code className="doc-inline">refunds</code> (404) maupun endpoint
                refund. Satu flag <code className="doc-inline">REFUND_AVAILABLE</code> membuka
                jalurnya begitu BE siap. Nominal refund diambil dari{' '}
                <code className="doc-inline">useChargedBreakdown()</code> — angka yang sama dengan
                Checkout.
              </li>
              <li>
                <strong>Kuota order (§17) kini bergerak, bukan sekadar ditampilkan</strong> (M3a):
                sisa kuota = paket − terpakai − ter-reserve, dengan status{' '}
                <em>hampir habis</em> saat sisa ≤ 20% paket. Order meng-<em>reserve</em> kuota saat
                dibuat, <em>mengonsumsi</em>-nya saat pesanan selesai, dan{' '}
                <em>mengembalikan</em>-nya saat dibatalkan — kolam yang dipakai (kuota order atau
                kuota COD) dipilih sekali lalu diingat, jadi COD tak pernah memakai kuota order.
                Toko yang kuota ordernya habis dan belum mengizinkan order tanpa kuota{' '}
                <strong>disembunyikan dari beranda</strong>, bukan sekadar dikartu-abukan.
              </li>
              <li>
                <strong>Layar langganan kuota (merchant).</strong> Halaman{' '}
                <code className="doc-inline">/merchant/subscription</code> menampilkan dua jenis kuota
                berdampingan — kuota <strong>order</strong> dan kuota <strong>COD</strong> — beserta
                paket, terpakai, ter-reserve, periode, dan status (Cukup / Hampir habis / Habis /
                Belum ada langganan), plus daftar paket yang bisa dibeli. Pembeliannya{' '}
                <strong>ditandai belum tersedia</strong> (flag{' '}
                <code className="doc-inline">QUOTA_PURCHASE_AVAILABLE</code>): BE belum punya tabel
                langganan, jadi tombolnya mati dengan alasan. Setting "terima order tanpa kuota"
                hanya bisa diubah <strong>saat toko tutup</strong> (§17) — saat toko buka, sakelarnya
                mati dan sebabnya ditulis di tempat. Saat menyala, kartunya menjadi hijau penuh; di
                atas permukaan pekat itu sakelar dan labelnya dinetralkan (trek translucent, tombol
                navy) supaya oranye merek tidak bertabrakan dengan latar hijau.
              </li>
              <li>
                <strong>Program marketing ala Odoo (§15).</strong> Program punya tipe, pemilik (toko
                / aplikator), pemicu (otomatis / kode), jendela tanggal, dan{' '}
                <code className="doc-inline">isStackable</code>. Halaman toko menampilkan daftar
                program beserta hadiah &amp; syaratnya; keranjang menghitung yang benar-benar
                berlaku: program stackable digabung, program yang berdiri sendiri hanya sendiri —
                yang paling menguntungkan yang dipakai (semantik kombinasi masih{' '}
                <strong>OPEN-23</strong>, jadi aturannya ditulis di kode, bukan disembunyikan).
                Hadiah yang belum dihitung (produk, gratis ongkir, item termurah, tukar poin) tetap
                tampil dengan alasan dan bernilai 0 — bukan hilang diam-diam.
              </li>
              <li>
                <strong>Program toko jadi kupon yang bisa diklaim.</strong> Halaman toko (§15)
                menampilkan program dua lapis: <em>carousel kupon</em> — satu tiket per layar
                (kartu berikut mengintip di tepi kanan) dengan titik navigasi, tiket bergaya sobek
                (stub oranye berisi pemilik + angka hadiah besar di kiri, perforasi putus, badan
                putih berisi rincian + tombol <code className="doc-inline">Klaim</code>) — lalu
                <em>daftar rincian</em> semua program sebagai kartu putih. Tombol Klaim menandai
                kupon "punyaku" (state <code className="doc-inline">marketing.claimedProgramIds</code>,
                ikut persist / reload); header menghitungnya ("N aktif · M diklaim") dan di checkout
                baris program yang diklaim diberi label <em>kupon kamu</em>. Klaim sengaja{' '}
                <strong>tidak mengubah hitungan</strong>: diskon tetap otomatis dari §15.3, jadi
                urutan program tidak bisa membuat total berbeda dari yang dihitung keranjang.
              </li>
              <li>
                <strong>Lantai huruf &amp; sasaran sentuh (audit 019).</strong> Isi/kalimat minimal{' '}
                <code className="doc-inline">--text-sm</code> 15px dan caption{' '}
                <code className="doc-inline">--text-xs</code> 13px — dulu kalimat penjelas dan baris
                rincian uang turun ke 12–13px. Baris sakelar kini satu{' '}
                <code className="doc-inline">&lt;label&gt;</code> setinggi 48px, jadi seluruh baris
                dapat ditekan, bukan hanya switch 52×28 di ujungnya. Teks sekunder di atas permukaan
                berwarna (chip status, keadaan kosong) memakai{' '}
                <code className="doc-inline">--text-secondary-strong</code> agar lolos WCAG AA.
                Halaman <code className="doc-inline">/merchant/subscription</code> juga turun dari
                tumpukan baris tabel: satu kartu per jenis kuota dengan warna status (hijau / kuning /
                merah dari token status), angka sisa sebagai fokus, dan paket sebagai grid kartu —
                bukan lima baris list. Baris berikon (
                <code className="doc-inline">.merchant-row</code> yang beranak{' '}
                <code className="doc-inline">svg</code>) menyejajarkan ikon ke baris pertama judul,
                bukan ke tengah blok: di kartu berparagraf panjang ikon 20px dulu terukur 48px di
                bawah judul dan terbaca kecil.
              </li>
              <li>
                <strong>Nada kartu (<code className="doc-inline">.tone-*</code>).</strong> Design system
                punya enam nada — <code className="doc-inline">tone-brand</code>,{' '}
                <code className="doc-inline">tone-info</code>,{' '}
                <code className="doc-inline">tone-success</code>,{' '}
                <code className="doc-inline">tone-warning</code>,{' '}
                <code className="doc-inline">tone-danger</code>,{' '}
                <code className="doc-inline">tone-navy</code> — yang <em>menyediakan warna</em> dari token
                peran. Aksen kecil dipakai lewat chip (<code className="doc-inline">.tone-chip</code>);
                kartu yang warnanya = jenis diisi penuh lewat{' '}
                <code className="doc-inline">.tone-fill</code>: permukaan pekat berteks putih (kartu
                program marketing), dengan warna dari token{' '}
                <code className="doc-inline">--premium-*</code> (palet pekat &amp; hangat, disetujui
                pemilik 2026-10-15) sehingga tidak ada warna mentah di CSS, dan tiap
                isian lolos AA (5,4–14,0:1). Kartu terisi itu terangkat{' '}
                <code className="doc-inline">--shadow-card</code>, chip/badge-nya jadi permukaan putih,
                dan sakelarnya memakai trek putih + tombol navy supaya tidak tenggelam di warna pekat.
              </li>
              <li>
                <strong>Kelas kartu bersama tidak boleh diberi gaya interaktif.</strong>{' '}
                <code className="doc-inline">.merchant-card</code> dipakai konsol merchant <em>dan</em>{' '}
                daftar toko customer. Gaya daftar toko (hover, active, zoom logo) karena itu menempel di{' '}
                <code className="doc-inline">.merchant-store-card</code>. Dulu ia menempel di{' '}
                <code className="doc-inline">.merchant-card</code>, sehingga kartu konsol ikut{' '}
                <code className="doc-inline">display:flex</code> baris dan <code className="doc-inline">:hover</code>{' '}
                (kartu mobile yang berkedip saat disentuh mouse). Akarnya dibereskan 2026-10-15.
              </li>
              <li>
                <strong>Kartu kuota bertema jenis.</strong> Di{' '}
                <code className="doc-inline">/merchant/subscription</code>, kuota order dan kuota COD
                tidak lagi tampil sama: order memakai tema merek (<code className="doc-inline">--orange-soft</code>)
                dan COD memakai permukaan navy premium (<code className="doc-inline">--navy</code>),
                keduanya terangkat dengan <code className="doc-inline">--shadow-card</code> (keputusan
                pemilik 2026-10-15). Status kuota tetap terbaca dari chip putih dan bar, bukan dari warna
                permukaan kartu.
              </li>
              <li>
                <strong>Kartu kode promo punya permukaan merek sendiri.</strong> Isinya satu aksi,
                bukan baris struk, jadi kartunya memakai{' '}
                <code className="doc-inline">--orange-soft</code> +{' '}
                <code className="doc-inline">--orange-border</code> (peran token itu) dengan ikon{' '}
                <code className="doc-inline">Tag</code>, bukan putih seperti kartu ringkasan. Judul
                kartunya sudah berbunyi "Kode promo", jadi label kedua dihapus (nama aksesibel input
                lewat <code className="doc-inline">aria-label</code>) dan input + tombol diletakkan
                satu baris: dua kontrol yang ditumpuk terbaca seperti dua hal terpisah. Sudut input
                dan tombol sama-sama <code className="doc-inline">--radius-md</code>, dan tombolnya
                selalu solid oranye: kode kosong dijawab pesan di bawahnya, bukan tombol mati yang
                diredupkan sampai terbaca seperti kolom kedua.
              </li>
              <li>
                <strong>Program marketing dikelola di console merchant.</strong> Halaman{' '}
                <code className="doc-inline">/merchant/promos</code> kini punya seksi "Program
                marketing": program milik toko (promosi, beli X gratis Y, loyalty) beserta jenis,
                hadiah, syarat, dan jendela tanggal, plus sakelar "boleh digabung" yang benar-benar
                mengubah potongan yang dilihat pembeli di keranjang. Backend belum punya tabel
                program (<code className="doc-inline">loyalty_programs</code> → 404), jadi
                membuat/mengubah program ditandai belum tersedia.
              </li>
              <li>
                <strong>Aksi utama turun ke zona jempol, lonceng ke layar akar.</strong> Tombol
                "Buat" tidak lagi di pojok kanan atas bar judul (pojok atas adalah tempat mata, bukan
                tempat jempol): halaman promo memakai tombol melayang{' '}
                <code className="doc-inline">.page-fab</code> di kanan bawah, di atas bilah
                navigasi, dan slot aksi di <code className="doc-inline">PageHeader</code> dihapus
                supaya pola lama tidak kembali. Lonceng notifikasi kini hanya di beranda akar peran
                (beranda merchant/kurir sudah punya lonceng hero sendiri), bukan di 23 halaman anak.
                Semua aksi "tambah" merchant kini memakai FAB yang sama — item (
                <code className="doc-inline">/merchant/menu</code>), kurir (
                <code className="doc-inline">/merchant/couriers</code>, mati saat kuota penuh), dan
                rekening (<code className="doc-inline">/merchant/payout-accounts</code>) — menggantikan
                pil selebar kartu <code className="doc-inline">.merchant-add-btn</code> yang dihapus.
                Halaman anak merchant selalu menyediakan tombol kembali;{' '}
                <code className="doc-inline">/merchant/reviews</code> sempat jadi satu-satunya yang
                tak punya (layar buntu) dan kini memakai{' '}
                <code className="doc-inline">back=&quot;/&quot;</code>.
              </li>
              <li>
                <strong>Dropdown sendiri, bukan <code className="doc-inline">&lt;select&gt;</code>{' '}
                peramban.</strong> Pemilih bank di{' '}
                <code className="doc-inline">/merchant/payout-accounts</code> dan{' '}
                <code className="doc-inline">/courier/payout-accounts</code> memakai komponen{' '}
                <code className="doc-inline">ui/SelectField.tsx</code>: trigger berbentuk field
                (mixin <code className="doc-inline">field-shape</code>, jadi sama dengan{' '}
                <code className="doc-inline">.form-control</code>) plus daftar opsi dari token
                peran. Daftarnya dibuka <em>inline</em>, mengalir di bawah trigger — bukan{' '}
                <code className="doc-inline">BottomSheet</code> kedua, karena panel sheet yang
                menumpuk membuat satu tap menutup dua panel sekaligus, dan menu melayang akan
                terpotong <code className="doc-inline">overflow: auto</code> panel form. Tercatat
                sebagai komponen bersama di bagian <strong>Key Components (11)</strong> dan di
                kontrak desain <code className="doc-inline">docs/design/DNA.md</code>.
              </li>
              <li>
                <strong>Batch kurir inhouse (M5).</strong> Kurir kini melihat{' '}
                <strong>batch</strong> yang ditugaskan merchant di{' '}
                <code className="doc-inline">/courier/batch</code>: kepala batch (status, hitung
                mundur, panjang rute, sisa kapasitas), sakelar <strong>auto-sort</strong> (ON = rute
                nearest-neighbour dari dapur, OFF = manual), tombol <em>Mulai antar</em> (aktif saat
                hitung mundur habis atau merchant menutup batch lebih awal, BR-B09), dan daftar
                urutan antar bernomor. Order diselesaikan satu per satu lewat halaman tugas
                (checkpoint + OTP) yang sudah ada, lalu kemajuan batch dan penanda berikutnya ikut
                bergeser. Ongkir order Regular online tampil sebagai <strong>fee ke DANA</strong>;
                COD tetap dibayar merchant di luar aplikasi. Aturan murni di{' '}
                <code className="doc-inline">src/data/courierBatch.ts</code> ditahan{' '}
                <code className="doc-inline">scripts/courier-batch-check.mjs</code>. Catatan: rute
                memakai jarak garis lurus (mock), bukan Google Routes (WALK), dan batch demo di-seed
                karena BE belum punya tabel <code className="doc-inline">batches</code>.
              </li>
              <li>
                <strong>Urutan antar bisa digeser saat auto-sort mati (M5).</strong> Sakelar OFF
                tidak lagi cuma berlabel &ldquo;manual&rdquo;: tiap henti punya tombol naik/turun
                (target 44&times;44, jarak 8px) yang menyusun ulang{' '}
                <code className="doc-inline">batch.routeOrder</code> lewat{' '}
                <code className="doc-inline">moveBatchStop</code>. Daftar, pin peta, dan
                &ldquo;berikutnya&rdquo; tetap satu urutan, nomor serta panjang rute ikut berubah,
                dan henti yang sudah selesai tidak ikut tergeser. Kartunya pindah dari tautan ke
                baris supaya tombol geser terbaca milik baris itu (bukan kontrol melayang di
                sampingnya), dan meta jarak/fee menjadi satu item per baris. Aturan murninya
                ditahan <code className="doc-inline">scripts/courier-batch-check.mjs</code>.
              </li>
              <li>
                <strong>Kurir partner: cabang tanpa respons kini punya jalur (M6).</strong>{' '}
                Kalau prepare habis tanpa respons (Q06, §9.5), assignment jadi{' '}
                <em>Kedaluwarsa</em>, mitra turun ke <strong>offline</strong>, SP tercatat
                (&ldquo;N SP aktif&rdquo; + &ldquo;SP dicatat ke mitra&rdquo;), dan order dilempar
                ke <strong>pengganti</strong> (&ldquo;Diganti oleh &lt;nama&gt;&rdquo;) — aturan
                murninya ditahan <code className="doc-inline">scripts/partner-check.mjs</code>.
                Pemicunya BE (<code className="doc-inline">expire_assignments()</code>) dan
                penerbit SP masih UNRESOLVED (OPS-10), jadi layar menyediakan tombol{' '}
                <strong>simulasi</strong> setinggi 44px tanpa warna merek — bukan aksi yang
                berpura-pura menjadi ops. Chip <code className="doc-inline">offline</code> (keadaan
                paling penting bagi kurir) naik ke{' '}
                <code className="doc-inline">--text-secondary-strong</code> karena versi lama
                3,86:1 di atas <code className="doc-inline">--border</code> gagal AA. Sisa M6: fee
                Quick 100%, talangan COD Quick, dan dispatch nyata (OPEN-11).
              </li>
              <li>
                <strong>Chat order jadi group per order (M7).</strong> Sebelumnya chat
                hanya customer &harr; kurir walau PRD &sect;20.1 meminta group berisi
                customer + merchant sejak order dibuat, dengan kurir masuk setelah batch
                di-assign (inhouse) atau assignment di-approve (partner). Sekarang peserta
                diturunkan dari state (<code className="doc-inline">src/data/chat.ts</code>),
                chip peserta menandai yang <em>belum bergabung</em>, tiap gelembung pihak
                lain membawa <strong>nama pengirim</strong> supaya toko dan kurir bisa
                dibedakan, thread ditutup saat order selesai/batal (composer diganti notice,
                riwayat tetap terbaca), dan lampiran gambar ditandai belum tersedia karena
                butuh R2. Ditahan <code className="doc-inline">scripts/chat-check.mjs</code>.
                Sisa M7: feed event realtime di layar (publication BE masih hanya tabel
                <code className="doc-inline">orders</code>).
              </li>
              <li>
                <strong>Pin kurir bergerak + ambang hampir sampai (M7b, R-TRACK).</strong>{' '}
                Peta customer dulu hanya menaruh pin kurir sekali di awal rute, jadi
                &ldquo;lokasi live&rdquo; (&sect;9.7) tak bisa dibedakan dari gambar statis.
                Sekarang satu marker <strong>digeser</strong> (<code className="doc-inline">useLeafletMap</code>{' '}
                opsi <code className="doc-inline">courier</code> &rarr; <code className="doc-inline">setLatLng</code>,
                peta tak dibangun ulang) mengikuti kemajuan waktu tempuh di demo karena event{' '}
                <code className="doc-inline">courier_location</code> belum ada. Ambang
                &ldquo;kurir hampir sampai&rdquo; <strong>berbasis waktu</strong> dan{' '}
                <strong>bertanda konfigurasi ops</strong>{' '}
                (<code className="doc-inline">ALMOST_ARRIVED_MINUTES</code> = 5,{' '}
                <code className="doc-inline">ALMOST_ARRIVED_CONFIGURABLE = false</code> — panel ops
                M10 belum ada, dan itu ditulis di baris ETA), labelnya berganti dengan{' '}
                <code className="doc-inline">role=&quot;status&quot;</code>; siaran lokasi berhenti di
                luar delivery aktif (<code className="doc-inline">diantar</code>/
                <code className="doc-inline">tiba</code>). Aturan murni di{' '}
                <code className="doc-inline">src/data/tracking.ts</code>, ditahan{' '}
                <code className="doc-inline">scripts/tracking-check.mjs</code>. Belum: ETA per urutan batch
                (id batch belum bergabung dengan id order).
              </li>
              <li>
                <strong>Notifikasi: katalog emit + penjaga audience (M7c, R-NOTIF).</strong>{' '}
                PRD &sect;20.3 menyebut empat kanal customer, tapi tak ada tempat di kode yang
                memetakan &ldquo;event apa menjadi notifikasi apa, ke siapa&rdquo; &mdash; jadi jalur
                yang belum ada tak bisa dibedakan dari yang sudah. Sekarang{' '}
                <code className="doc-inline">src/data/notif.ts</code> memuat katalognya{' '}
                <strong>dengan penanda</strong>{' '}
                <code className="doc-inline">emit: fe|be</code>: promosi aplikator dan toko baru
                yang menjangkau alamat default ditandai <code className="doc-inline">be</code>{' '}
                (butuh data lintas pengguna), bukan diklaim ada. Inbox menyaring baris per peran di
                klien (<code className="doc-inline">notificationsFor</code>) di atas filter query BE,
                dan kolom <code className="doc-inline">notifications.audience</code> kini ikut
                dibaca; siaran <code className="doc-inline">all</code> terlihat semua peran,
                sedangkan baris tanpa kolom itu tidak disembunyikan. &ldquo;Kurir hampir
                sampai&rdquo; memakai <strong>ambang yang sama</strong> dengan R-TRACK dan dikirim
                sekali per pengantaran. Komentar usang &ldquo;repo tak punya SW push&rdquo;
                diperbaiki: service workernya ada (<code className="doc-inline">public/push-sw.js</code>),
                yang belum adalah pengiriman otomatis dari BE. Ditahan{' '}
                <code className="doc-inline">scripts/notif-check.mjs</code>.
              </li>
              <li>
                <strong>Realtime: matriks §19 utuh + kontrak ber-versi (M7d, R-REALTIME).</strong>{' '}
                Langganan realtime cuma satu tabel (<code className="doc-inline">orders</code>) dan
                matriks audiens PRD &sect;19 tak ada di kode, jadi &ldquo;event apa ke siapa&rdquo;
                hanya bisa dijawab dengan membaca PDF; versi kontrak pesan (NFR-06) pun cuma
                angka hardcode di URL socket, sedangkan dokumennya tak memuat versi sama sekali.
                Sekarang <code className="doc-inline">src/data/realtime.ts</code> memuat{' '}
                <strong>22 baris §19 apa adanya</strong> (label Indonesia, tanpa slug karangan;
                nama snake_case hanya kalau terdokumentasi) dengan{' '}
                <code className="doc-inline">eventAudience()</code>/
                <code className="doc-inline">eventsFor()</code>, versi jadi satu konstanta{' '}
                <code className="doc-inline">WS_MESSAGE_VERSION</code> yang dipakai socket{' '}
                <em>dan</em> tertulis di <code className="doc-inline">contract.realtime.message_version</code>{' '}
                pada <code className="doc-inline">INDEX.json</code>, serta muatan yang disusulkan
                setelah kembali online kini terlihat di kotak masuk. Ditahan{' '}
                <code className="doc-inline">scripts/realtime-check.mjs</code> (22 baris, jumlah
                per kolom, asersi pikap peran, versi kode &harr; dokumen, topik terdaftar).
                Belum: feed event di layar karena publication BE masih hanya{' '}
                <code className="doc-inline">orders</code>.
              </li>
              <li>
                <strong>Posisi kurir terlihat merchant juga (M7e, R-TRACK AC2).</strong> PRD
                &sect;9.7 memberi merchant hak tahu kurir sudah di mana tanpa menelepon, tapi
                konsol merchant hanya punya <code className="doc-inline">JourneyLine</code> —
                peta kurir cuma ada di sisi customer. Sheet detail order di{' '}
                <code className="doc-inline">/merchant/orders</code> kini memasang{' '}
                <code className="doc-inline">MerchantCourierMap</code> untuk order{' '}
                <code className="doc-inline">diantar</code>/<code className="doc-inline">tiba</code>,
                memakai <strong>aturan posisi dan ambang yang sama</strong> dengan sisi customer
                (<code className="doc-inline">useCourierTracking</code> + ambang ops), sehingga
                kedua sisi tak bisa melihat kurir di tempat berbeda. Sekalian diperbaiki: emit
                notifikasi &ldquo;hampir sampai&rdquo; pindah ke{' '}
                <code className="doc-inline">useAlmostArrivedNotice</code> yang hanya dipakai sisi
                customer — sebelumnya menempel di hook pelacakan, jadi konsol merchant akan ikut
                memancarkan notifikasi milik customer. Diukur di Chromium: marker kurir bergerak
                dalam 6 detik dan ETA ikut turun, tanpa overflow-x.
              </li>
              <li>
                <strong>Rating: aturan §20.2 dikunci + menu riwayat pesanan (M8a, R-CUS-RATING).</strong>{' '}
                PRD meminta penilaian &ldquo;diisi di layar detail order, yang dibuka lewat{' '}
                <strong>menu riwayat order</strong>&rdquo;, tapi menu itu tidak ada: satu-satunya
                pintu ke form rating adalah tautan &ldquo;Lihat semua&rdquo; di detail menu yang
                artinya justru &ldquo;semua ulasan hidangan ini&rdquo;. Sekarang{' '}
                <code className="doc-inline">/orders</code> memuat pesanan selesai dengan penanda
                sudah dinilai atau belum (pintunya dari Profil), dan tiap baris membuka form lewat{' '}
                <code className="doc-inline">/reviews?order=&lt;kode&gt;</code>. Aturan §20.2/§14
                jadi fungsi murni di <code className="doc-inline">src/data/rating.ts</code>: skala
                1&ndash;5, merchant <strong>butuh</strong> review sedangkan menu item{' '}
                <strong>bintang saja</strong>, larangan rating per variant, tanpa batas waktu, tanpa
                moderasi ops. Ditahan <code className="doc-inline">scripts/rating-check.mjs</code>.
                Belum: jalur tulis rating menu item (BE belum mengirim daftar hidangan pesanan, dan
                itu ditulis di form, bukan ditutupi bintang kosong).
              </li>
              <li>
                <strong>Pesanan Saya: satu menu dua tab + &ldquo;Pesan lagi&rdquo;.</strong> Menu{' '}
                &ldquo;My Order&rdquo; di bilah bawah dulu membuka halaman checkout, sementara
                riwayat pesanan hidup di halaman terpisah yang hanya bisa dicapai dari Profil —
                dua menu mirip, dan tak ada jalan memesan ulang. Kini{' '}
                <code className="doc-inline">/orders</code> jadi <strong>Pesanan Saya</strong>: tab{' '}
                <strong>Aktif</strong> (kartu keranjang + pesanan berjalan) dan{' '}
                <strong>Riwayat</strong> (pesanan selesai). Baris pesanan berjalan turun dari
                komponen bersama <code className="doc-inline">ActiveOrderRow</code> yang dipakai
                juga oleh sheet dok keranjang — dua daftar tak lagi menyalin baris. Tiap riwayat
                dapat tombol <strong>Pesan lagi</strong> yang memetakan nama hidangan ke katalog dan
                mengisi keranjang dengan harga sekarang (bukan harga arsip), berdampingan dengan
                pintasan <code className="doc-inline">Beri rating</code>. Bilah bawah ikut tampil di
                halaman ini — sebelumnya destinasi nav justru tanpa nav. Terukur: rel kanan baris
                satu nilai (410px), tombol aksi 44px seragam, tak ada elemen di bawah nav; gate{' '}
                <code className="doc-inline">/orders</code> +
                <code className="doc-inline">/orders?tab=history</code> 2/2 PASS, sapuan customer
                94/94 PASS.
              </li>
              <li>
                <strong>Rule sengketa: mesin §18 + pilihan merchant (M9a, R-DISPUTE-RULE).</strong>{' '}
                PRD memisahkan <strong>model</strong> rule dari <strong>isinya</strong> (&ldquo;dibuat dan
                dikelola ops&rdquo;), jadi yang dibangun mesinnya: katalog di{' '}
                <code className="doc-inline">src/data/rules.ts</code> (5 kategori insiden, 7 rule,
                kompensasi &amp; punishment sebagai bagian rule), pilihan <strong>multi-select</strong>{' '}
                toko di <code className="doc-inline">/merchant/settings</code> seksi &ldquo;Rule
                sengketa&rdquo;, dan <code className="doc-inline">ruleForOrder()</code> yang menentukan
                rule berlaku pada satu order beserta konsekuensinya, bagi toko, pelanggan, dan kurir
                sekaligus karena §18 menulis ketiganya mengikuti rule yang sama. Bila toko belum memilih
                rule untuk sebuah kategori, hasilnya ditandai <strong>OPEN-18</strong>: rule dasar tidak
                dikarang. Snapshot rule ke order (Usulan §18) sudah punya bentuknya, belum disimpan BE.
                Sekalian dibereskan: seed rule lama menunjuk id yang tidak pernah ada di katalog.
              </li>
              <li>
                <strong>Kolom klien tahan refetch (BUG-88046).</strong>{' '}
                <code className="doc-inline">mergeOrders</code> dulu mengganti seluruh antrean
                dengan baris BE. Tiga kolom hanya hidup di klien (
                <code className="doc-inline">packed</code>, <code className="doc-inline">batchId</code>,{' '}
                <code className="doc-inline">cookMinutes</code>) dan tak ada di{' '}
                <code className="doc-inline">orders</code> BE, jadi tiap refetch realtime
                menghapusnya. Nyata: setelah merchant menandai packing dan menyetujui mulai lebih
                awal, tulis status ke BE memicu realtime, <code className="doc-inline">packed</code>{' '}
                hilang, panel batch balik "Belum packing" padahal justru itu syarat BR-B09. Kini
                merge <strong>per id</strong> dan membawa kolom klien dari baris lama; penjagaan ini
                boleh dibuang begitu BE punya kolomnya.
              </li>
              <li>
                <strong>Satu rel kanan per baris daftar (MD-11).</strong> Baris ringkasan dulu
                menaruh nominal di kolom kanan baris pertama, sementara chip status, kode, dan waktu
                dijejalkan di kolom kiri baris kedua. Akibatnya (terukur, bukan kesan):{' '}
                <strong>9 dari 13 baris</strong> meta membungkus ke dua baris (39px vs 28px), kode
                order ikut pecah, dan tepi kanan kiri bergerigi (268 vs 277) — relnya{' '}
                <code className="doc-inline">auto</code> sehingga lebar kolom kiri ikut berubah tiap
                baris. Sekarang barisnya grid dua kolom dengan rel kanan lebar tetap, dan polanya
                menjadi primitif <code className="doc-inline">@include list-row</code> + kelas marker{' '}
                <code className="doc-inline">.list-row</code> di{' '}
                <code className="doc-inline">src/styles/system/_list-row.scss</code> — baris daftar
                berikutnya memakai kelas itu, bukan dirakit ulang, dan kelas itulah yang dibaca
                gerbang browser untuk memeriksa relnya. Sesudah: satu nilai{' '}
                <code className="doc-inline">right</code> untuk kolom kiri, satu garis untuk nominal
                dan chip, tinggi meta seragam.
              </li>
              <li>
                <strong>Gerbang browser dibuat se-detail DNA.</strong> Gerbang dulu cuma mengukur
                lebar kolom, overflow, target sentuh, scroller, dan bilah fixed — sehingga empat
                butir DNA (MD-06 panel sheet, MD-07 nominal sebaris judul, MD-10 posisi bilah
                ditanya DOM, MD-11 rel kanan) tidak pernah diperiksa, dan tiap temuan tidak menyebut
                ID aturannya. Sekarang tiap pengukuran mencetak checklist{' '}
                <code className="doc-inline">DNA MD-01 &hellip; MD-11</code>: tiap butir bertanda{' '}
                <strong>lolos</strong>, <strong>temuan</strong>, atau <strong>tak diperiksa</strong>{' '}
                (butir yang di halaman itu memang tidak punya apa pun untuk diukur). Dua hal yang
                membuatnya mungkin: gerbang <strong>membuka panel sheetnya sendiri</strong> lewat
                klik nyata lalu mengukur ulang sebagai baris{' '}
                <code className="doc-inline">(sheet terbuka)</code> (MD-06/07/11 hidup di dalam
                panel), dan baris daftar memakai kelas marker{' '}
                <code className="doc-inline">list-row</code>. Pengecualian DNA juga dihormati:
                scroller di dalam panel sheet tetap sah (MD-03), dan MD-10 dilewati saat sheet
                terbuka karena modal memang menutupi bilah bawah. Dibuktikan dengan probe: rel
                diubah ke <code className="doc-inline">auto</code> + nominal di-{' '}
                <code className="doc-inline">start</code> membuat gerbang menandai MD-07 dan MD-11
                sebagai temuan, lalu kembali hijau setelah dikembalikan.
              </li>
              <li>
                <strong>Gerbang menangkap konten yang keluar dari kotaknya (MD-12).</strong> Gerbang
                hanya melihat overflow tingkat <em>halaman</em>, jadi baris badge slip order merchant
                yang meluber <strong>89px</strong> lalu dipangkas <code className="doc-inline">overflow: clip</code>{' '}
                di level shell lolos tanpa suara — chip-nya hilang dan pemilik yang menemukannya.
                Halaman juga diukur sebelum data BE mendarat. Sekarang <strong>MD-12</strong> memeriksa
                dua arah (kontrol yang terpotong; anak yang melewati content-box induknya) dan
                <strong> selalu FAIL</strong> — pengecualian sahnya hanya carousel/rail geser, art yang
                sengaja dipangkas di tepi membulat, dan bleed margin negatif. Gerbang juga{' '}
                <strong>menunggu halaman diam</strong> (tiga sampel DOM identik) sebelum mengukur.
                Temuan warisan yang muncul <strong>dibetulkan, bukan dimaafkan</strong>: slip merchant
                dapat <code className="doc-inline">flex-wrap</code> +{' '}
                <code className="doc-inline">min-width: 0</code>, label nav dapat penjaga{' '}
                <code className="doc-inline">.nav-label</code> ber-ellipsis (dan &ldquo;Onboarding&rdquo;
                jadi &ldquo;Tenant&rdquo;), <code className="doc-inline">.admin-history &gt; *</code> dan{' '}
                <code className="doc-inline">.sa-search</code> boleh menyusut, baris izin SA naik ke{' '}
                <code className="doc-inline">--touch-min</code>, dan halaman tak lagi membuka di tengah
                saat dimuat ulang (<code className="doc-inline">history.scrollRestoration = manual</code>{' '}
                + posisi per rute untuk tombol kembali). Rute non-app (
                <code className="doc-inline">/</code>, <code className="doc-inline">/documentation</code>)
                tidak dicetak DNA-nya — keduanya website penuh, bukan shell PWA — hanya overflow-x.
                Sapuan penuh: 200/200 PASS di 390 dan 1440, semua role,{' '}
                <code className="doc-inline">--strict</code>.
              </li>
              <li>
                <strong>Aksi keranjang &amp; pesanan di ringkasan (MD-06).</strong> Baris keranjang
                dan pesanan di sheet <code className="doc-inline">CartSummarySheet</code> kini membawa
                aksinya sendiri: keranjang toko bisa dibuang (<code className="doc-inline">clearCart</code>{' '}
                untuk yang aktif, <code className="doc-inline">removeCart</code> untuk toko lain) dan
                order yang belum diterima toko bisa dibatalkan customer. Konfirmasinya{' '}
                <strong>inline di baris itu</strong> — bukan sheet kedua bertumpuk — dengan tombol{' '}
                <code className="doc-inline">Batal</code>/<code className="doc-inline">Buang</code>{' '}
                setinggi 44px. Pembatalan menulis{' '}
                <code className="doc-inline">orders.status = &#39;canceled&#39;</code>; trigger BE{' '}
                <code className="doc-inline">orders_validate_transition</code> mengisi{' '}
                <code className="doc-inline">cancel_by = customer</code>. Baris hilang seketika dan
                gelembung realtime menariknya kembali bila BE menolak transisi.
              </li>
              <li>
                <strong>Checkout tak lagi lahir sebagai draft.</strong> Default kolom{' '}
                <code className="doc-inline">orders.status</code> adalah{' '}
                <code className="doc-inline">&#39;cart&#39;</code> (draft), dan{' '}
                <code className="doc-inline">createOrder</code> dulu tidak menulis kolom itu — jadi
                setiap pesanan yang sudah dibayar tetap berstatus draft selamanya dan tak pernah masuk
                sebagai pesanan toko. Enum BE tak punya <code className="doc-inline">&#39;placed&#39;</code>;
                tahap &ldquo;sudah dikirim, menunggu toko menerima&rdquo; adalah{' '}
                <code className="doc-inline">&#39;quotation&#39;</code> (transisi berikutnya{' '}
                <code className="doc-inline">prepare</code>). Kini checkout menulis{' '}
                <code className="doc-inline">status: &#39;quotation&#39;</code> +{' '}
                <code className="doc-inline">placed_at</code>, dan baris lama yang masih draft tampil
                sebagai chip <strong>Draft</strong> — bukan menyamar jadi &ldquo;Baru&rdquo;.
              </li>
              <li>
                <strong>Sakelar mata uang IDR/JOD dihapus.</strong> Pemilih mata uang tampilan
                (customer/merchant/kurir, disimpan per peran di slice{' '}
                <code className="doc-inline">preferences</code>) tidak dipakai lagi: layar peran
                selalu JOD dan nominal tetap IDR di state, sementara satu-satunya kontrol mata uang
                yang tersisa adalah tombol kurs live di kaki hero. Slice{' '}
                <code className="doc-inline">preferences</code> ikut gugur, jadi tak ada lagi state
                tersimpan yang bisa menyimpang dari default.
              </li>
              <li>
                <strong>Pesan sukses tak boleh bohong.</strong> Layar yang belum punya jalur tulis ke
                backend menandainya di muka: refund (§16.6) memakai flag{' '}
                <code className="doc-inline">REFUND_AVAILABLE</code>, dan <strong>Setelan toko</strong>{' '}
                (merchant) kini menyebut bahwa profil &amp; foto hanya berlaku selama sesi ini —
                sebelumnya ia menampilkan "Setelan toko disimpan" padahal state-nya tidak pernah
                dikirim ke server (dan tak ikut persist).
              </li>
              <li>
                Checkout kini <strong>tak lagi menelan kegagalan diam-diam</strong>: kalau{' '}
                <code className="doc-inline">POST /orders</code> ditolak BE, order dicatat lokal
                dengan kode yang sama (bukan jatuh ke <code className="doc-inline">mockOrder</code>{' '}
                yang tak nyambung) dan muncul peringatan. Pelacakan customer lalu menampilkan
                pesanan itu; status live menyusul begitu BE menerima tulisannya (flow{' '}
                <strong>f1</strong> / <strong>f18</strong>).
              </li>
              <li>
                Konfirmasi merchant kini <strong>tergerbang pembayaran</strong> (f18): order tetap
                muncul di Antrean begitu checkout, tapi tombol <strong>Terima</strong> nonaktif sampai
                pembayaran terkonfirmasi — DANA VA/QRIS dan saldo harus{' '}
                <code className="doc-inline">paid</code>, <strong>COD dibayar tunai saat serah
                terima</strong> (bukan hold — PRD aktif menggantikan alur hold saldo f2), transfer
                diverifikasi merchant saat diterima. Order belum lunas membawa chip &ldquo;Menunggu
                bayar&rdquo;. Setelah diterima, order <strong>Regular</strong> masuk batch kurir
                inhouse dan order <strong>Quick</strong> menunggu kurir partner (flow{' '}
                <strong>f25</strong>).
              </li>
              <li>
                Tugas kurir kini dari <strong>satu RPC BE</strong> (
                <code className="doc-inline">courier_orders()</code>): nama/HP customer, alamat,
                lantai/unit, item, dan tip ikut dari database (bukan lagi placeholder{' '}
                <code className="doc-inline">Customer N</code>/<code className="doc-inline">-</code>).
                OTP diverifikasi <strong>di server</strong> — customer membacanya lewat RPC{' '}
                <code className="doc-inline">my_order_otp</code>, kurir lewat{' '}
                <code className="doc-inline">verify_order_otp</code>; tulis status pakai sesi kurir,
                bukan token merchant.
              </li>
              <li>
                Coverage alamat kini dari <strong>RPC BE</strong>{' '}
                <code className="doc-inline">resolve_coverage</code> (poligon zona + radius merchant
                + toggle zona aktif), bukan hitung poligon klien; konsol SA menulis master zona ke
                tabel <code className="doc-inline">zones</code> lewat{' '}
                <code className="doc-inline">updateZonePolygon()</code>.
              </li>
              <li>
                Konsol SA: pengecualian <strong>lebar penuh</strong> kini dikenali gerbang browser
                (<code className="doc-inline">wideShell</code> membaca{' '}
                <code className="doc-inline">.sa-root</code>), target sentuh sidebar dinaikkan ke{' '}
                <code className="doc-inline">--touch-min</code> (44px, select operator + baris tautan),
                dan tautan lompat-ke-konten dibuang mengikuti panel CS.
              </li>
              <li>
                <strong>Promo merchant</strong>: tabel{' '}
                <code className="doc-inline">marketing</code> kini punya{' '}
                <code className="doc-inline">merchant_id</code> + RLS{' '}
                <code className="doc-inline">marketing_merchant</code>, dan validasi dikerjakan
                server lewat RPC <code className="doc-inline">validate_promo</code>. Halaman{' '}
                <code className="doc-inline">/merchant/promos</code> membuat/menghapus kode;
                checkout customer memasangnya (<code className="doc-inline">cart.promo</code> →{' '}
                <code className="doc-inline">orders.promo_id</code> /{' '}
                <code className="doc-inline">promo_amount_jod</code>). Scope produk (MARK-1) masih
                terbuka; kontrak di{' '}
                <code className="doc-inline">docs/integration/promos/be-contract.md</code>.
              </li>
              <li>
                <strong>Ulasan merchant &amp; hidangan</strong>: tabel{' '}
                <code className="doc-inline">rating_reviews</code> menyimpan ulasan toko
                (<code className="doc-inline">merchant_id</code>) dan ulasan hidangan
                (<code className="doc-inline">menu_id</code>) dalam satu baris — dipisah{' '}
                <code className="doc-inline">check ((merchant_id is not null) &lt;&gt; (menu_id is not
                null))</code>. Halaman <code className="doc-inline">/merchant/reviews</code> membaca
                keduanya (ulasan hidangan lewat join{' '}
                <code className="doc-inline">menus.merchant_id</code>) dan membalas ke{' '}
                <code className="doc-inline">review_replies</code>; customer mengirim penilaian toko
                dari <code className="doc-inline">/reviews</code>. Nama pemberi ulasan hanya terbaca
                sesi ops (<code className="doc-inline">customers</code> RLS), jadi daftar dibaca lewat
                sesi referensi. Kontrak di{' '}
                <code className="doc-inline">docs/integration/reviews/be-contract.md</code>.
              </li>
              <li>
                Tulis order kini benar-benar sampai ke BE: <code className="doc-inline">createWithReturn</code>{' '}
                meminta kolom eksplisit (<code className="doc-inline">select=id,code</code>) karena{' '}
                <code className="doc-inline">return=representation</code> tanpa{' '}
                <code className="doc-inline">select</code> menjalankan{' '}
                <code className="doc-inline">RETURNING *</code> yang menyentuh{' '}
                <code className="doc-inline">orders.otp</code> (SELECT-nya dicabut dari{' '}
                <code className="doc-inline">authenticated</code>) — dulu itu membatalkan seluruh INSERT
                dengan <code className="doc-inline">42501</code> dan checkout jatuh ke order lokal. Rincian
                di bagian <strong>Connecting a Real Backend (12)</strong>.
              </li>
              <li>
                Antrean merchant kini <strong>murni dari BE</strong>: state order mulai kosong,
                seed demo <code className="doc-inline">mo-*</code> tak lagi dirender karena
                id-nya non-numerik (Terima/Tolak tak bisa dipersist, kartu "hidup lagi" saat
                reload). Terima pada order nyata pindah ke Diproses dan tetap begitu. Rincian
                di bagian <strong>Merchant Console (13)</strong>.
              </li>
              <li>
                Metode bayar di checkout kini <strong>dibaca dari BE</strong>: tabel publik{' '}
                <code className="doc-inline">payment_methods</code> menyetir daftar, urutan, dan
                status aktifnya (mock jadi cadangan). Label tetap teks kurasi karena kolom deskripsi
                BE memuat kode internal; <code className="doc-inline">key</code> provider lama{' '}
                <code className="doc-inline">xendit_*</code> dipetakan ke DANA di{' '}
                <code className="doc-inline">src/api/payments.ts</code>.
              </li>
              <li>
                Metode bayar <strong>DANA</strong> (keputusan PO 2026-10-13): layar{' '}
                <code className="doc-inline">/customer/payment-dana</code> menampilkan
                nomor Virtual Account atau pola QRIS dengan hitung mundur dan tiga state
                (menunggu / dibayar / kedaluwarsa). Masih mock sandbox; kredensial DANA
                tidak pernah menyentuh browser (kontrak di{' '}
                <code className="doc-inline">docs/integration/dana/be-contract.md</code>).
              </li>
              <li>
                <strong>EDISI 02 (UI v2)</strong>: brand{' '}
                <code className="doc-inline">--sa7tein-orange</code>, latar{' '}
                <code className="doc-inline">--bg-warm</code>, font Plus Jakarta Sans,
                langit-langit radius 32px. Aturan dan cara migrasi di{' '}
                <code className="doc-inline">docs/design/ui-v2.md</code>.
              </li>
              <li>
                Audit mobile 013 sampai 015 (form menu merchant, konsol kurir, panel CS):
                baris aksi sheet jadi sticky, chip kategori menggantikan{' '}
                <code className="doc-inline">&lt;select&gt;</code>, kontras dinaikkan, dan{' '}
                <code className="doc-inline">/admin</code> punya layout desktop dari 901px.
              </li>
              <li>
                <strong>Rapi konsol menu merchant.</strong> Baris kategori di{' '}
                <code className="doc-inline">/merchant/menu</code> kini memakai corak chip
                kategori customer (kotak ikon + label, aktif oranye penuh), bukan pil
                filter. Editor varian/atribut dirapikan: tiap baris nilai jadi grid tiga
                kolom (nama, tambahan harga, sakelar), satuan{' '}
                <code className="doc-inline">JOD</code> tak lagi terlipat dua baris, input
                seragam 72px, dan <em>Lepas</em> jadi tombol ikon dengan{' '}
                <code className="doc-inline">aria-label</code>.
              </li>
              <li>
                Backend live: konsol CS menandai risiko customer lewat registri customers
                dan <code className="doc-inline">customer_risk_flags</code>; checkout
                menulis order lewat <code className="doc-inline">POST /orders</code> dan
                antrean merchant membacanya kembali; notifikasi inbox per audience dengan
                lonceng dan badge.
              </li>
              <li>
                Kartu <strong>pasang aplikasi</strong> yang muncul sendiri kini bilah bawah yang
                tidak menutup halaman, bukan modal. Dulu lapisan gelapnya{' '}
                <code className="doc-inline">inset: 0</code> menangkap seluruh layar sehingga di{' '}
                <code className="doc-inline">/merchant/orders</code> ia menutupi tombol "Terima"
                sampai "Nanti saja" ditekan; sekarang pembungkusnya{' '}
                <code className="doc-inline">pointer-events: none</code> dan kartunya tetap di
                dalam kolom 430px, jadi sisa halaman bisa dibaca dan diklik.
              </li>
              <li>
                <strong>Dompet kurir dipisah tegas</strong> (keputusan PO 2026-10-16, PRD §16.4):
                fee pengantaran order Regular online dikirim platform <em>otomatis ke DANA kurir</em>{' '}
                saat order selesai, jadi ia bukan saldo aplikasi. Saldo yang bisa ditarik lewat{' '}
                <code className="doc-inline">/courier/payout</code> kini{' '}
                <code className="doc-inline">courierTipsBreakdown</code> = tips − pencairan
                (<code className="doc-inline">courierTipsAvailable</code>, menggantikan{' '}
                <code className="doc-inline">courierWalletBreakdown</code> yang mencampur fee), dan
                fee tampil sebagai seksi penghasilan terpisah (
                <code className="doc-inline">courierFeeEntries</code>/
                <code className="doc-inline">courierFeesPaid</code>). Dompet, beranda, profil, dan
                pencairan tetap membaca satu fungsi, jadi angkanya tak bisa berbeda.
              </li>
              <li>
                <strong>Layar kurir partner</strong> (<code className="doc-inline">/courier/partner</code>)
                dibangun dari <code className="doc-inline">partnerSlice</code> yang sudah ada tapi belum
                berpenghuni: status offline/available/reserved/busy, plus assignment yang dijawab{' '}
                <em>Terima</em> atau <em>Tolak ber-alasan</em> (submit mati sampai alasan diisi, COU-18).
                Dispatch nyata (OPEN-11) dan SP ops belum ada, jadi halaman menandai assignment sebagai
                data demo lewat <code className="doc-inline">PlatformNotice</code>. Alurnya
                di <code className="doc-inline">f26-quick-dispatch</code>.
              </li>
              <li>
                <strong>Kelas aksi kurir partner diselaraskan</strong>: tombol{' '}
                <em>Terima</em> memakai{' '}
                <code className="doc-inline">btn btn-primary</code> seperti halaman kurir lain, jadi
                tak lagi tampil tombol peramban polos. Gutter{' '}
                <code className="doc-inline">PlatformNotice</code> kini milik induk (hanya{' '}
                <code className="doc-inline">margin-block</code>) supaya sejajar kartu di semua
                layar yang sudah ber-padding 20px; Checkout, satu-satunya pemakaian di luar konten
                ber-padding, mengembalikan gutter itu lewat{' '}
                <code className="doc-inline">.checkout-screen &gt; .platform-notice</code>.
              </li>
            </ul>
          </div>
          {SECTIONS.map((Section, index) => (
            <Section key={DOC_NAV[index].id} />
          ))}
        </main>
      </div>
    </div>
    </>
  )
}
