import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function SuperAdminSection() {
  return (
    <DocSection id="superadmin" num="34" title="Konsol Super Admin (SA), Website Penuh">
      <p className="doc-p">
        <strong>Super Admin adalah role terpisah</strong>, bukan halaman di dalam panel CS.
        Keputusan PO 2026-09-23 (<code className="doc-inline">decision-irbid-mvp.md</code>)
        menetapkannya sebagai <strong>website penuh non-PWA</strong> dengan prefix{' '}
        <code className="doc-inline">/superadmin</code>, dipakai owner &amp; team dari desktop.
        Flow-nya <code className="doc-inline">F22</code>.
      </p>

      <h3 className="doc-h3">Pengecualian lebar yang disengaja</h3>
      <p className="doc-p">
        Konsol ini <strong>tidak</strong> memakai kolom 430px seperti keempat role PWA. Itu
        keputusan sadar, bukan kebocoran: SA memakai dashboard bertabel dan matriks izin, yang
        tidak terbaca di kolom ponsel. Shell-nya{' '}
        <code className="doc-inline">.sa-root</code> (sidebar 248px + konten sampai 1180px), dan
        aturan lama yang mengunci <code className="doc-inline">body &gt; div</code> ke{' '}
        <code className="doc-inline">--shell-max</code> dibatalkan khusus saat{' '}
        <code className="doc-inline">#root</code> memuat <code className="doc-inline">.sa-root</code>{' '}
       , pola yang sama dengan <code className="doc-inline">.doc-root</code>. Di bawah 900px
        sidebar berubah jadi bilah atas yang bisa digeser mendatar, jadi konsol tetap terpakai di
        layar sempit.
      </p>
      <DocCode lang="text">
        {`/superadmin          konsol SA, sidebar + konten penuh, tanpa MobileDeviceFrame
/admin               panel CS , PWA 430px, tetap seperti role lain
manifest             dilepas di /superadmin (non-PWA, tidak ditawarkan untuk install)`}
      </DocCode>

      <h3 className="doc-h3">Batas CS dan SA</h3>
      <p className="doc-p">
        CS <strong>menjalankan</strong> operasi harian: approval tenant, putusan sengketa level-1,
        dan blacklist COD, semuanya di <code className="doc-inline">/admin/*</code>. SA{' '}
        <strong>mengonfigurasi platform dan mengawasi</strong>: master zona, role &amp; permission,
        audit trail, laporan pajak, saldo keuntungan, kill switch, dan banding sengketa. Top-up
        dan payout customer/merchant berjalan <em>self-service</em> oleh sistem, SA hanya
        memantau ledger-nya, tidak mengesahkan.
      </p>

      <h3 className="doc-h3">Dua angka uang yang paling mudah tertukar</h3>
      <p className="doc-p">
        <strong>Saldo keuntungan platform</strong> = fee terkumpul (0,37 JOD/order) dikurangi
        biaya operasional, PPh final 0,5%, dan penarikan sebelumnya. Hanya dana ini yang boleh
        ditarik SA. <strong>Kewajiban platform</strong> = saldo wallet customer + merchant + tips
        kurir yang belum di-payout, itu uang user, tidak pernah bisa ditarik SA. Keduanya
        ditampilkan berdampingan di Ringkasan supaya tidak tertukar.
      </p>
      <DocCode lang="typescript">
        {`profitBalance(profit)   // fee − biaya − PPh final − withdrawn  → boleh ditarik
totalLiability(liab)    // customer + merchant + tips kurir        → tidak boleh disentuh
feeGrossFor(orders)     // orders × PLATFORM_FEE_JOD (0,37)
pphFinalFor(fee)        // 0,5%, PPH_FINAL_PERCENT (placeholder, OQ-17/18)`}
      </DocCode>

      <h3 className="doc-h3">Audit trail menjangkau kerja CS</h3>
      <p className="doc-p">
        Semua aksi konsol tercatat append-only: aksi SA lewat reducer{' '}
        <code className="doc-inline">superAdminSlice</code>, aksi CS lewat jembatan audit berupa
        satu middleware di <code className="doc-inline">src/store/index.ts</code>. Jembatan itu
        memetakan tiap aksi <code className="doc-inline">admin/*</code> yang sudah ada ke satu
        baris audit, jadi delapan halaman CS tidak perlu disentuh satu per satu dan tidak ada aksi
        CS yang lolos dari pengawasan.
      </p>

      <h3 className="doc-h3">Yang bisa diklik di konsol</h3>
      <ul className="doc-list">
        <li>
          <strong>Master zona</strong>, geser titik di kanvas, atau pilih satu titik lalu isi
          lat/lng (jalur yang bisa dipakai keyboard). Kanvas menampilkan dapur merchant dan
          lingkaran jangkauan 2 km, plus titik alamat demo yang ikut berubah status begitu poligon
          digeser. <em>Simpan poligon</em> menulis bentuk baru, memvalidasi ulang alamat demo, dan
          menambah satu baris audit; <em>Bentuk awal</em> mengembalikannya. Merchant tetap hanya
          mengaktifkan zona, tidak pernah mengubah poligonnya.
        </li>
        <li>
          <strong>Role &amp; operator</strong>, checkbox izin per role. Role pemilik platform
          dikunci (semua checkbox nonaktif) supaya konsol tidak bisa mengunci dirinya sendiri.
          Form <em>Buat operator</em> membuat akun CS berstatus Diundang.
        </li>
        <li>
          <strong>Audit trail</strong>, filter per jenis aksi dan pencarian aktor/objek. Tabelnya
          read-only dan append-only: tidak ada tombol edit atau hapus, dan itu disengaja.
        </li>
        <li>
          <strong>Laporan pajak</strong>, pemilih periode, tabel per periode + baris total. Dua
          objek pajak dipisah kolomnya: GST makanan (merchant, info) dan PPh final atas fee
          platform.
        </li>
        <li>
          <strong>Saldo keuntungan</strong>, form penarikan dengan validasi (&gt; 0 dan ≤ saldo,
          dicek di layar <em>dan</em> di reducer), riwayat penarikan, plus kartu pengingat bahwa
          dana user di sebelahnya bukan milik SA.
        </li>
        <li>
          <strong>Ledger</strong>, filter jenis entry + pencarian ref/memo, murni baca. Tidak ada
          tombol aksi di sini karena menahan atau melepas dana user bukan keputusan SA.
        </li>
        <li>
          <strong>Banding sengketa</strong>, putusan level-1 CS ditampilkan sebagai konteks, lalu
          SA memilih <em>perkuat</em> atau <em>ubah</em> dengan salah satu dari empat resolusi yang
          sama. Mengubah putusan menambah entry ledger baru, tidak menghapus yang lama.
        </li>
        <li>
          <strong>Kill switch</strong>, tiga jalur (COD, payout, maintenance) dengan konfirmasi
          yang menyebut akibatnya. Konfirmasinya memakai komponen{' '}
          <code className="doc-inline">BottomSheet</code> yang sudah ada, dengan override gaya
          ter-scope supaya dialognya di tengah pada layar desktop.
        </li>
      </ul>

      <h3 className="doc-h3">Kontras kartu fokus: oranye gelap, bukan oranye merek</h3>
      <p className="doc-p">
        Kartu saldo keuntungan memakai latar <code className="doc-inline">--orange-deep</code>,
        bukan <code className="doc-inline">--sa7tein-orange</code>. Alasannya terukur: teks putih di
        atas oranye merek hanya <strong>3,4:1</strong>, gagal WCAG AA untuk label 12px dan sub 14px
        (butuh 4,5:1). Di oranye gelap rasionya <strong>6,5:1</strong>. Aksen oranye merek tetap dipakai untuk nav
        aktif, tombol primer, dan garis; hanya permukaan berteks kecil yang digelapkan.
      </p>
      <p className="doc-p">
        Catatan: pola putih di atas <code className="doc-inline">--sa7tein-orange</code> masih ada di
        tombol lama di luar konsol SA (mis. <code className="doc-inline">.proceed-btn</code> di
        checkout, rasio 3,4:1 untuk teks 16px). Itu utang repo-wide, bukan bagian dari konsol ini,
        dan belum diubah.
      </p>

      <h3 className="doc-h3">Responsif &amp; tabel lebar</h3>
      <p className="doc-p">
        Halaman tidak pernah menggulir mendatar: overflow horizontal terukur 0 pada 1440px maupun
        390px. Tabel yang lebih lebar dari kolomnya menggulir <em>di dalam pembungkusnya</em>{' '}
        (<code className="doc-inline">.sa-table-wrap</code>), jadi penggulung dokumen tetap satu,
        aturan DNA soal gulir bersarang tetap dipegang untuk arah vertikal.
      </p>

      <h3 className="doc-h3">Poligon zona bukan hiasan</h3>
      <p className="doc-p">
        Master zona menyimpan vertices sebagai <strong>lat/lng sungguhan</strong>, bukan koordinat
        gambar, karena gate coverage menguji "titik di dalam poligon" pada koordinat asli. Konsol SA
        mengeditnya, dan gate membaca hasil editnya saat alamat disimpan lewat{' '}
        <code className="doc-inline">resolveCoverage()</code> di{' '}
        <code className="doc-inline">src/data/zones.ts</code>, stand-in server di repo ini, karena
        di produksi zona dihitung backend (flow <code className="doc-inline">F20</code>). Jadi
        mengecilkan poligon Hijazi sampai alamat demo keluar memang membuat alamat itu diblokir di
        checkout, bukan sekadar mengubah gambar.
      </p>
      <DocCode lang="typescript">
        {`pointInPolygon(point, vertices)     // ray casting, syarat pertama coverage
zoneForPoint(point, polygons)       // titik masuk zona mana, atau null
resolveCoverage(point, polygons)    // { zone, distanceMeters } — dipakai saat alamat disimpan
zoneAreaKm2(vertices)               // luas asli, dihitung di ruang meter
zoneView() / projectPoint()         // lat/lng → kanvas; kanvas hanya cara menggambar`}
      </DocCode>
      <p className="doc-p">
        Setelah poligon disimpan, alamat yang tersimpan <strong>divalidasi ulang</strong> terhadap
        bentuk baru (<code className="doc-inline">revalidateAddress</code>), supaya daftar alamat
        customer tidak memegang hasil validasi basi. Order yang sudah jalan tidak ikut berubah,
        zonanya snapshot saat order dibuat, sesuai PRD.
      </p>

      <h3 className="doc-h3">Kill switch menular ke role lain</h3>
      <p className="doc-p">
        Kill switch bukan state yang hanya hidup di konsol. Setiap jalur yang dimatikan ditegakkan
        di layar tempat jalur itu dipakai, lewat <code className="doc-inline">switchBlockCopy()</code>{' '}
        dan komponen <code className="doc-inline">PlatformNotice</code>:
      </p>
      <ul className="doc-list">
        <li>
          <strong>COD dihentikan</strong>: opsi COD di layar metode bayar nonaktif dan menyebut
          alasannya, bukan hilang begitu saja. Saldo Sa7tein dan transfer tetap bisa dipilih.
        </li>
        <li>
          <strong>Payout dihentikan</strong>: pintu Tarik Saldo di halaman saldo berubah jadi baris
          tanpa tautan, dan tombol tarik di layar penarikan nonaktif. Ditutup di dua tempat supaya
          tidak bisa dilewati lewat URL langsung.
        </li>
        <li>
          <strong>Maintenance aktif</strong>: semua metode bayar dan tombol lanjut di checkout
          ditutup, dan dapur merchant menampilkan pemberitahuan supaya merchant tahu kenapa order
          berhenti masuk.
        </li>
      </ul>
      <p className="doc-p">
        Teks blokir selalu menyebut jalan keluar ("pilih Saldo Sa7tein atau transfer"), bukan hanya
        "tidak tersedia". Order yang sudah berjalan tidak dibatalkan oleh kill switch.
      </p>

      <h3 className="doc-h3">Izin benar-benar menahan, bukan pajangan</h3>
      <p className="doc-p">
        Matriks izin di halaman Role dipakai tiga tempat sekaligus, dari satu peta yang sama
        (<code className="doc-inline">SA_ROUTE_PERMISSIONS</code> di{' '}
        <code className="doc-inline">src/data/superadmin.ts</code>):
      </p>
      <ul className="doc-list">
        <li>
          <strong>Nav</strong>: menu yang izinnya tidak dimiliki dinonaktifkan dan menyebut izin
          yang kurang, bukan disembunyikan tanpa penjelasan.
        </li>
        <li>
          <strong>Gate rute</strong>: URL yang diketik langsung ditolak sebelum halamannya
          dirender. Halaman terlarang tidak pernah ter-mount, jadi tidak ada kontrol yang bisa
          diklik dari jalan samping.
        </li>
        <li>
          <strong>Tombol sensitif</strong>: izin yang lebih halus dari rutenya dicek di tombolnya.
          Contohnya <code className="doc-inline">profit.read</code> membuka halaman saldo, tapi{' '}
          <code className="doc-inline">profit.withdraw</code> yang menentukan tombol tarik aktif.
          Role Staf SA bisa melihat saldo dan tidak bisa menariknya.
        </li>
      </ul>
      <p className="doc-p">
        Ada pemilih <strong>Bertindak sebagai</strong> di sidebar untuk mencoba ini: ganti ke Staf
        SA, dan Role &amp; operator, Banding sengketa, serta Kill switch langsung terkunci.
      </p>

      <h3 className="doc-h3">Siapa yang tercatat di audit trail</h3>
      <p className="doc-p">
        Nama di audit trail dibaca dari operator yang sedang bertugas, bukan konstanta. Aksi konsol
        SA memakai operator aktif di sidebar; aksi panel CS memakai operator CS yang ditetapkan di
        halaman Role. Tanpa auth, penetapan itu memang pengganti sesi, dan itu ditulis di layarnya,
        bukan disembunyikan.
      </p>

      <h3 className="doc-h3">Banding punya jalur pengajuan</h3>
      <p className="doc-p">
        Sebelumnya antrean banding SA hanya berisi data contoh: tidak ada cara bagi customer atau
        merchant untuk mengajukan banding, jadi SA bisa memutus banding yang tidak pernah diajukan
        siapa pun. Sekarang jalurnya ada di layar order, di bagian Sengketa:
      </p>
      <DocCode lang="text">
        {`customer/merchant ajukan sengketa   → panel CS putuskan level-1
layar order pihak pengaju            → tombol "Banding" (muncul setelah ada putusan)
konsol SA /superadmin/appeals        → perkuat, atau ubah jadi resolusi lain
layar order lagi                     → "Banding ditinjau SA: diperkuat / diubah"`}
      </DocCode>
      <p className="doc-p">
        Satu banding per sengketa, sama seperti satu sengketa per order, dan tombolnya hilang
        setelah dipakai. Putusan CS tetap berlaku selama banding menunggu. Mengubah putusan
        menambah satu entry ledger baru, bukan menimpa yang lama.
      </p>
      <p className="doc-p">
        Dua hal sengaja tidak dikarang karena belum diputuskan: <strong>siapa</strong> yang boleh
        mengajukan (kode saat ini hanya pihak pengaju sengketa) dan apakah ada <strong>window/SLA
        banding</strong> (kode saat ini tanpa batas waktu). Keduanya ditandai{' '}
        <code className="doc-inline">UNRESOLVED</code> di flow <code className="doc-inline">F8</code>.
      </p>

      <h3 className="doc-h3">Yang belum ada, dan itu ditulis</h3>
      <p className="doc-p">
        Dua hal yang sering disangka ada di konsol seperti ini, tapi memang tidak dibangun. Keduanya
        dicatat di <code className="doc-inline">docs/product/prd/decision-irbid-mvp.md</code>, bukan
        disembunyikan:
      </p>
      <ul className="doc-list">
        <li>
          <strong>Tanpa auth.</strong> Tidak ada login di <code className="doc-inline">/superadmin</code>:
          siapa pun yang membuka URL-nya bisa mengubah kill switch dan menarik saldo keuntungan.
          Ini mengikuti pola repo (autentikasi sungguhan di luar lingkup, panel CS juga tanpa auth),
          tapi konsekuensinya lebih berat karena konsol ini memegang kontrol platform. Penggantinya
          di demo hanya pemilih <em>Bertindak sebagai</em>, yang menentukan izin dan nama di audit
          trail, bukan mengamankan akses. Di produksi wajib ada auth + audit login
          (<code className="doc-inline">UNRESOLVED-by-absence</code>).
        </li>
        <li>
          <strong>Tanpa export laporan pajak.</strong> Cakupan PO menyebut "laporan pajak aplikasi"
          tanpa format ekspor, periode fiskal, atau penerimanya. Layarnya menampilkan laporan per
          periode; ekspor tidak dikarang (<code className="doc-inline">UNRESOLVED</code>).
        </li>
      </ul>

      <h3 className="doc-h3">Catatan demo &amp; yang belum final</h3>
      <p className="doc-p">
        Kanvas zona digambar sebagai <strong>SVG inline</strong>, bukan peta ber-tile: tile peta
        selalu URL eksternal dan repo ini melarang aset gambar eksternal (AGENTS.md §6). Kanvas itu
        satu-satunya SVG inline baru di repo ini, dan sengaja dicatat sebagai pengecualian di{' '}
        <code className="doc-inline">docs/design/legacy-debt.json</code>, ia grafik data yang diedit
        SA, bukan ikon; ikon fungsional tetap lucide. Geometri asli milik backend, layar SA hanya
        menggeser titik lalu menyimpan. Kill switch dan penarikan keuntungan mengubah state demo;
        tidak ada uang bergerak.
      </p>
      <p className="doc-p">
        Karena coverage kini bisa gagal karena poligon, bukan hanya jarak, pesan blokir di layar
        customer tidak lagi menyebut "maksimal 2 km" (itu klaim yang tidak selalu benar). Sekarang
        bunyinya <strong>Di luar area antar</strong>, dengan keterangan bahwa poligon atau jarak
        yang tidak lolos.
      </p>
      <p className="doc-p">
        Yang tetap <code className="doc-inline">UNRESOLVED</code> dan karena itu tidak dikarang di
        layar: tarif pajak final (OQ-2/3/4, OQ-17/18, angka di sini placeholder berlabel),
        jumlah admin/operator konkret (OQ-30 sudah dijawab: akun dibuat SA, role per kebutuhan),
        dan jadwal settlement liability.
      </p>
    </DocSection>
  )
}
