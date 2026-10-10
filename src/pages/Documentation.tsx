import { useState } from 'react'

import { DOC_NAV } from './documentation/nav'
import { DOC_SHELLS } from './documentation/routes'
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
  'Zod',
  'React Hook Form',
]

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
              v3.2.0
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
              Panduan PWA Sa7tein: data referensi (kurir, dompet, insentif merchant, zona/role/
              operator SA, kill switch) kini dibaca live dari PostgREST lewat
              src/api/reference.ts dan disinkronkan ke Redux di root — termasuk rating/jam buka
              toko dari kolom merchants, profil toko (nama/kontak/foto/config kirim), registri
              merchant lengkap (pemilik/kota/tier/tenant/deposit/zona/COD) untuk panel CS & konsol SA,
              role & operator konsol SA (izinnya sudah sepadan dengan katalog UI), dan riwayat
              kredit dari merchant_credit_events, dan notifikasi live: inbox dibaca per audience
              (customer/merchant/courier/cs) dengan lonceng+badge di header merchant/kurir/CS — kini otomatis di tiap halaman konsol (default selubung header peran, onboarding dikecualikan) dan di hero beranda dapur, bukan lagi ditempel per halaman — dengan gaya tombol ikon polos (transparan) di header dan lonceng hero beranda dapur yang memakai kelas `.s7-notification` yang sama persis dengan beranda pelanggan, tiap
              transisi order (checkout, terima/tolak/siap/serahkan/batal, checkpoint kurir, OTP)
              mengemit notifikasi ke peran terkait, dan klik baris menulis balik
              notifications.read (kind tak dikenal jatuh ke system; mock tetap jadi fallback),
              penugasan kurir ditulis ke orders.courier_id (pemilih kurir di antrean merchant
              berbentuk kartu terpilih: monogram + status live, dan wajib dipilih sebelum pesanan
              diserahkan); tiap transisi status order kini
              ditulis balik ke orders.status (cart/prepare/waitingCourier/delivery/done) dan
              checkpoint kurir ke tabel checkpoints (picked_up/arrived/otp_verified); kotak masuk
              dan antrean diperbarui otomatis lewat WebSocket Supabase Realtime (kanal orders,
              src/api/realtime.ts) tanpa refresh — polling 30s hanya jaring pengaman; saat koneksi
              putus tiap peran beralih ke layar /offline, dan begitu online kembali aplikasi
              memulihkan sendiri (naik kembali dari /offline + toast "Kembali online") sambil
              menyegarkan data referensi; foto toko dari backend yang menunjuk aset tak ada
              (mis. /assets/img/merchant/*.svg) kini jatuh ke gambar menu lewat onError, bukan
              kotak rusak; tombol lokasi di beranda membuka pemilih alamat dan labelnya ikut
              berubah begitu alamat diganti; label lokasi tak lagi memakai nilai contoh
              ("44 Street Town") — placeholder "Lokasi" sampai alamat nyata termuat; kotak masuk
              notifikasi kini murni dari backend — seed mock + badge "3" dihapus, dan daftar
              dikosongkan bila API tak mengembalikan baris; registrasi push di Pengaturan
              Notifikasi kini berupa sakelar "Notifikasi push" yang berlangganan Web Push VAPID
              sungguhan (endpoint dari push service peramban) dan menyimpan baris ke tabel
              push_subscriptions (dibaca kembali saat mount, detail teknis dipindah ke halaman
              dokumentasi; pemberitahuan diantar lewat service worker push — pengirim produksi
              adalah Edge Function Supabase send-push yang dipicu Database Webhook pada tabel
              notifications, dengan skrip scripts/send-push.mjs untuk uji lokal); toggle
              buka/tutup toko
              menulis balik merchants.store_status. Beranda customer memakai lokasi live
              (alamat default dari addresses) dan menghitung jarak/waktu antar ke tiap toko
              secara lokal; chip kategori tidak dirender selama kolom menus.category backend
              masih kosong, supaya tidak lagi menyaring daftar toko jadi kosong. Checkout customer menulis order ke API
              (POST /orders) dan antrean merchant membacanya kembali (GET /orders). Antrean merchant kini bergaya slip tiket dapur: nomor order jadi identitas yang dipindai cepat (angka tabular), chip umur menandai order yang menunggu diterima (kuning di 10 menit, merah di 20 menit), nama pelanggan naik jadi judul, dan nominal baris memakai Rupiah saja (padanan JOD tetap di sheet detail); tab aktif jadi segmented tinted supaya hanya satu aksen oranye dan count-nya lolos kontras, dan state kosong tiap tab kini berikon dan berkonteks. Halaman Profil
              customer kini memakai identitas sesi live — email/HP dari tabel users, nama dari
              user_metadata akun auth (keduanya bisa diedit di form Profil; tanggal lahir & jenis
              kelamin belum punya kolom, foto belum ada Storage bucket), badge lonceng
              mengikuti jumlah notifikasi belum dibaca, dan daftar Alamat Pengantaran dibaca dari
              tabel addresses lengkap dengan zona + jarak dari poligon master — tiap tambah/ubah/
              hapus/jadikan-utama menulis balik ke backend (form Profil menyimpan nama/email/HP). Tiap peran punya prefix URL dan instalasi sendiri (/customer, /merchant, /courier, /admin — panel admin yang dikelola CS). Super Admin adalah role terpisah: website penuh non-PWA di /superadmin, dengan Ringkasan berupa dashboard chart tulis tangan (donut + bar, tanpa library). Landing dengan satu aksi utama per section, cache yang aman, scroll native, dan simulator desktop yang scroll-nya terkunci pada layar perangkat. Kartu promo beranda kini bergaya kartu (lingkaran sepusat di atas oranye merek, tanpa gradient) dengan bilah aksi selebar kartu. Beranda dapur merchant memakai hero oranye bergaya beranda pelanggan (bidang + pola gelombang bersama) yang menyatukan identitas toko, status buka/tutup, dan kuota harian; modal aplikasi di-portal ke body supaya tidak lagi tertutup bilah nav. Konfirmasi merchant kini seragam lewat ConfirmSheet dengan dua tombol sejajar, dan kepala tiap grup kategori di daftar menu menempel tepat di bawah bar filter (offset diukur runtime) sehingga label kategori tetap terbaca saat digulir. Menu merchant disaring per kategori (chip Makanan/Minuman/Camilan) plus status stok di satu bar sticky, dan daftar dikelompokkan per kategori. Dompet merchant kini ada: saldo dari order selesai, pencairan ke rekening (Xendit payout, flow f6), plus CRUD rekening tujuan dengan satu rekening utama. Dompet kurir menyusul dengan aturan yang berbeda: hanya menampung tips (ongkir dan gaji bukan milik kurir, C-06), saldonya diturunkan dari tips dikurangi pencairan, fee payout Rp2.500 ditanggung kurir dan dipotong dari nilai tarik, dengan ambang akumulasi yang masih contoh PRD (ditandai jelas, belum final) plus CRUD rekening tujuan. Beranda kurir kini berupa dashboard: identitas + status siap/jeda dalam satu kartu, ringkasan hari ini, kartu performa tujuh hari (sparkline tips) plus menu dua kolom berisi pintasan dompet tips, rekening, riwayat tips, dan profil, baru daftar tugas berjalan dan riwayat. Onboarding kini lengkap per peran (keputusan PO 2026-09-25): merchant mengisi form profil toko di /merchant/onboarding (identitas + foto + konfigurasi pengiriman) setelah daftar sebelum menunggu persetujuan, dan kurir punya layar onboarding sendiri di /courier/onboarding (nama, nomor WA, kendaraan) sebelum masuk. Di sisi pelanggan alur belanja kini toko-dulu: beranda menampilkan daftar toko, halaman toko (/customer/merchant/:id) memuat sampul, status buka/tutup, promo, dan menunya, baru detail menu per item; kepala halaman Filter dan Favorit kini mengikuti kontrak bar dan Favorit memakai kartu menu bersama.
            </p>
            <div className="doc-hero-tags">
              {HERO_TAGS.map((tag) => (
                <span key={tag} className="doc-hero-tag">
                  {tag}
                </span>
              ))}
            </div>
            <p className="doc-p">
              Buka UI langsung — tiap tautan membuka role di tab baru, tanpa login
              (semua data mock):
            </p>
            <p className="doc-p">
              Metode Pembayaran customer dirapikan di audit 007: kartu terpilih kini lolos AA
              (permukaan <code className="doc-inline">--orange-soft</code>, bukan isian oranye pekat),
              dokumen kembali jadi satu-satunya penggulung dengan header sticky, judul turun ke
              langkah header, dan radiogroup dapat navigasi panah. Kartu metode di /payment-amount
              (audit 008) kini berwarna <code className="doc-inline">--orange-soft</code> bertopi
              merek sebagai titik fokus, lebar penuh, judul Indonesia; warna terpilih yang sama
              dipakai kartu alamat. Halaman Alamat Pengantaran dirapikan di audit 009:
              warna krem/abu mentah dipetakan ke token, tombol Batal dan Simpan kini rata
              (margin warisan 8px dibuang), cabang status antar memakai kelayakan sebenarnya,
              dan meta jarak tak lagi menulis "0 m". Detail menu customer (audit 010) berhenti
              menampilkan data contoh: saat API hidup halaman menunggu data asli (splash skeleton,
              bukan menu mock "Sate Ayam"), id tak dikenal tampil kosong, dan halaman
              ulasan tidak lagi di-hardcode. Beranda dapur merchant kini memakai status jualan
              tiga keadaan — Buka, Sibuk, Tutup — dalam satu kontrol segmented. Audit mobile beranda
              (011) menemukan kartunya berbaris lalu terpotong karena tabrakan kelas
              <code className="doc-inline">.merchant-card</code>; kini kartu menumpuk dan teks utuh.
              Kartu &ldquo;Pendapatan&rdquo; juga menjadi bidang oranye merek supaya setingkat
              dengan hero, bukan kartu putih keempat. Kartu &ldquo;Modal &amp; insentif&rdquo; menyusul
              sebagai bidang navy (token design system <code className="doc-inline">--navy</code>) dan aksinya
              jadi baris tap mobile dengan chevron. Kartu navy-nya diberi elevasi (bayangan
              bernuansa navy) supaya terbaca mengambang. Legenda &ldquo;Komposisi order&rdquo; ditata
              ulang jadi baris penuh satu-baris (angka rata kanan). Saat refresh, beranda dapur
              kini menahan angka seed di balik kerangka sampai data API mendarat, jadi tak ada
              lompatan nilai mock → data nyata, dan status &ldquo;Sibuk&rdquo; bertahan antar-reload.
              Tiap perubahan status jualan kini minta konfirmasi ketuk-kedua, dan tombol pop-up-nya
              disamakan bentuknya dengan tombol utama. Audit mobile beranda (012) memadatkan
              permukaan oranye merchant (<code className="doc-inline">--merchant-brand</code>) agar
              teks putih kecil di hero dan kartu &ldquo;Pendapatan&rdquo; lolos AA (terukur 4,73:1),
              menambah state kosong terdesain dan banner &ldquo;data terakhir&rdquo; saat hidrasi API
              gagal, memindahkan legenda &ldquo;Komposisi order&rdquo; ke samping donut sehingga kartunya
              menyusut 554 &rarr; 414px, serta menyatukan sistem radius (lingkaran 50%, track/badge
              --radius-xs) dan ritme jarak antar blok ke 16px. Periode tier insentif kini
              diputuskan (I-4): bulan kalender dengan tier dinilai akhir bulan — naik tier di
              tengah bulan tidak proporsional — tertulis di PRD, flow F9/F16, dan layar
              /merchant/insentif. Kartu &ldquo;Sisa modal&rdquo; di layar itu kini memakai bidang
              navy yang sama dengan kartu insentif beranda (token{' '}
              <code className="doc-inline">--navy</code> dan elevasi navy dari design system).
              Tombol kembali kini satu komponen{' '}
              <code className="doc-inline">BackButton</code> di seluruh halaman (kotak 44px, ikon
              24/1,75, aria &ldquo;Kembali&rdquo;), dan selalu di tepi kiri top bar lewat prop{' '}
              <code className="doc-inline">back</code> pada header peran — bukan lagi tautan teks
              di ujung konten, bukan pula <code className="doc-inline">&lt;a href&gt;</code> yang
              reload.
              Rinciannya di bagian Changelog.
            </p>
            <div className="doc-cta-grid">
              {DOC_SHELLS.map((s) => (
                <a key={s.role} className="doc-cta" href={s.url} target="_blank" rel="noreferrer">
                  <span className="doc-cta-role">{s.role}</span>
                  <span className="doc-cta-url">{s.url}</span>
                  <span className="doc-card-sub">{s.desc}</span>
                </a>
              ))}
            </div>
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
