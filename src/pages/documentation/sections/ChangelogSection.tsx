import { DocSection } from '../DocSection'

/**
 * Catatan perbaikan integrasi rute & CRUD (2026-09-23). Ditulis sebagai satu
 * section supaya daftar "apa yang dulu mati / setengah jadi" bisa diaudit tanpa
 * memburu riwayat commit.
 */
export function ChangelogSection() {
  return (
    <DocSection id="changelog" num="36" title="Perbaikan Integrasi Rute & CRUD (2026-09-23)">
      <p className="doc-p">
        Audit rute menemukan sejumlah layar yang terdaftar di{' '}
        <code className="doc-inline">src/App.tsx</code> tetapi tidak pernah dituju, tombol yang
        hanya memunculkan toast tanpa mengubah state, dan satu tautan yang salah alamat. Tabel di
        bawah merangkum apa yang diperbaiki.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Area</th>
              <th>Sebelum</th>
              <th>Sesudah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kartu saldo di <code className="doc-inline">/profile</code></td>
              <td>
                Baris "Saldo Sa7tein" cuma baris teks biasa 350x60 tanpa nominal, terselip di antara setelan lain. Blok avatar+nama di atasnya ditulis dengan <code className="doc-inline">color: var(--on-brand)</code> untuk latar oranye yang tidak ada, jadi namanya putih di atas krem dan praktis hilang; surelnya tanpa aturan <code className="doc-inline">color</code> sama sekali sehingga mewarisi biru tautan bawaan peramban
              </td>
              <td>
                Varian ringkas <code className="doc-inline">.wallet-balance-card--compact</code> dari kartu saldo yang sudah ada, ditempatkan paling atas di bawah header, latar oranye merek penuh dengan tombol Top-up putih 44px. Nama dan surel kembali ke <code className="doc-inline">--text-primary</code> / <code className="doc-inline">--text-secondary</code> lewat partial baru <code className="doc-inline">system/_profile.scss</code>. Seluruh label setelan jadi Bahasa Indonesia. Gate 2/2 PASS
              </td>
            </tr>
            <tr>
              <td>Empat layar auth terakhir pindah ke kerangka bersama</td>
              <td>
                <code className="doc-inline">ForgotPassword</code>, <code className="doc-inline">ForgotPasswordOtp</code>,{' '}
                <code className="doc-inline">CreatePassword</code>, dan <code className="doc-inline">Verification</code> masih memakai markup Bootstrap hasil porting (<code className="doc-inline">.container</code>/<code className="doc-inline">.row</code>/<code className="doc-inline">.col-12</code>) dengan gutter 24px, penggulung bersarang, copy campur Inggris, dan penampil sandi berupa{' '}
                <code className="doc-inline">&lt;span role="button"&gt;</code> yang tidak bisa dinyalakan Enter
              </td>
              <td>
                Keempatnya memakai <code className="doc-inline">AuthLayout</code> yang sama dengan lima layar auth lain. Copy jadi Indonesia, penampil sandi jadi <code className="doc-inline">&lt;button&gt;</code> dengan <code className="doc-inline">aria-pressed</code>, kotak OTP masuk <code className="doc-inline">system/_auth-2.scss</code>, dan tombol verifikasi nonaktif sampai enam digit terisi. Gate 8/8 PASS
              </td>
            </tr>
            <tr>
              <td>Skala judul layar (16 kelas jadi 1 aturan)</td>
              <td>
                39 halaman punya <code className="doc-inline">&lt;h1&gt;</code>, tetapi ada 16 kelas berbeda untuk judul yang sama: 4 ukuran, 3 bobot (600/700/800), dan satu tanpa bobot. Judul layar yang sama beratnya bisa 600 di satu halaman dan 800 di halaman lain
              </td>
              <td>
                Dua aturan menurut markup, bukan selera: <code className="doc-inline">.page-title</code> (27,85px/800) untuk judul hero yang tidak ada tombol kembali di barisnya, dan{' '}
                <code className="doc-inline">.page-title--header</code> (16,73px/700) untuk judul yang berdampingan tombol kembali 44px. Terukur di 25 rute customer: dari 4 ukuran/3 bobot jadi 2 kelompok (19 kecil + 6 besar). Lihat partial <code className="doc-inline">system/_type.scss</code>
              </td>
            </tr>
            <tr>
              <td>Hierarki huruf onboarding</td>
              <td>
                Judul terukur 20,68px dengan bobot 500 — lebih kecil dari label tombolnya sendiri (16,73px tapi bobot 700), jadi aksi terlihat lebih penting daripada pesan. Isi pecah dengan baris terakhir hanya dua kata
              </td>
              <td>
                Judul naik ke langkah terbesar (<code className="doc-inline">--text-2xl</code>, terukur 27,85px) dengan bobot 800 dan jarak huruf -0,02em. Isi dapat jarak ke judul dan{' '}
                <code className="doc-inline">text-wrap: balance</code> supaya barisnya terbagi rata. Manrope tetap dipakai; yang salah ukurannya, bukan jenis hurufnya
              </td>
            </tr>
            <tr>
              <td>Onboarding: foto asli, tanpa ikon pengganti</td>
              <td>
                Dua dari tiga slide memakai ilustrasi ikon sebagai pengganti foto, jadi perpindahan slide terasa berpindah bahasa visual — gambar lalu simbol
              </td>
              <td>
                Ketiga slide memakai foto makanan dari <code className="doc-inline">public/assets/img/menu/</code>, mengisi penuh section atas. Tidak ada ikon dekoratif di area foto. Isi dan dimensi slide pindah ke{' '}
                <code className="doc-inline">data/onboarding.ts</code> supaya dimensi aset tercatat di satu tempat
              </td>
            </tr>
            <tr>
              <td>Onboarding customer (carousel)</td>
              <td>
                Layar pengenalan berupa strip foto pendek lalu panel putih: tidak ada titik fokus, dan tidak ada cara berpindah selain tombol. Foto hanya dipakai di slide pertama
              </td>
              <td>
                Foto mengisi penuh section atas (full-bleed) dengan badge merek di atasnya, carousel tiga slide dengan titik navigasi, geser kiri-kanan, dan transisi silang. Tombol aksi jadi pill putih berisi label + bulatan oranye, ikonnya berganti per slide (panah naik, panah kanan, centang) sebagai penanda posisi. Isi slide tetap dari PRD
              </td>
            </tr>
            <tr>
              <td>Layar daftar toko (spesifisitas &amp; ukuran target)</td>
              <td>
                Badge merek di panel foto melebar 234×104 karena{' '}
                <code className="doc-inline">.auth-photo img</code> (0-1-1) menang atas{' '}
                <code className="doc-inline">.auth-brand-mark</code> (0-1-0), jadi logo 26px
                terukur 96px. Radio zona 169×42 karena{' '}
                <code className="doc-inline">inset: 0</code> mengisi padding box, bukan border
                box. Atribut dimensi foto <code className="doc-inline">860×645</code> padahal
                asetnya portrait 800×1422
              </td>
              <td>
                <code className="doc-inline">.auth-photo &gt; img</code> supaya hanya foto
                besar yang kena, <code className="doc-inline">inset: -1px</code> supaya radio
                menutup tepi label jadi 44px penuh, dan dimensi aset pindah ke{' '}
                <code className="doc-inline">data/auth.ts</code> lewat tipe{' '}
                <code className="doc-inline">AuthPhoto</code>. Gate{' '}
                <code className="doc-inline">/merchant/signup</code> 2/2 PASS
              </td>
            </tr>
            <tr>
              <td>Alur kerja &amp; aturan testing</td>
              <td>
                Urutan kerja tidak tertulis, jadi tiap tugas dimulai dari kode. Akibatnya
                bolak-balik: tombol "tenggelam" diukur berkali-kali padahal tinggi fotonya
                sudah terbaca di CSS, dan <code className="doc-inline">.app-shell</code> baru
                ketahuan sebagai kontrak shell setelah gerbang mengeluh "kolom 0px". Beberapa
                <code className="doc-inline">browser-gate</code> dijalankan bersamaan padahal
                klon 9359 cuma punya satu tab, sehingga proses menumpuk
              </td>
              <td>
                Empat langkah wajib di AGENTS.md §0 (peta → scan → ubah → verifikasi), plus
                tabel pembagian mana yang butuh browser dan mana yang cukup dari berkas. Aturan
                satu gate pada satu waktu. <code className="doc-inline">npm run scan</code> jadi
                langkah 2 yang bisa dijalankan ulang. Lihat section Styling System &amp; §0 AGENTS
              </td>
            </tr>
            <tr>
              <td>Token &amp; kelas CSS yang hilang (surface scan)</td>
              <td>
                <code className="doc-inline">--pin</code> dan dua variabel Bootstrap
                (<code className="doc-inline">bs-btn-active</code>) tidak pernah didefinisikan,
                jadi deklarasinya batal dan pin peta muncul tanpa warna. Kelas{' '}
                <code className="doc-inline">sheet-textarea</code>,{' '}
                <code className="doc-inline">chart-spark-area</code>,{' '}
                <code className="doc-inline">quantity-plus/minus</code> dipakai di TSX tanpa aturan CSS
                sama sekali, jadi elemennya tampil sebagai kontrol peramban polos
              </td>
              <td>
                Pin memakai <code className="doc-inline">--sa7tein-orange</code>, dua baris Bootstrap
                dibuang, dan kelas yang hilang diberi aturannya. Semuanya ditemukan lewat{' '}
                <code className="doc-inline">npm run scan</code> (statik, tanpa browser), bukan lewat
                pengukuran DOM
              </td>
            </tr>
            <tr>
              <td>Kontrol mati: Keluar, hamburger dokumentasi, numpad</td>
              <td>
                Tombol "Keluar" di Setelan toko tidak punya handler sama sekali.
                Hamburger di /documentation juga, padahal di layar sempit hanya kelas .open
                yang memunculkan sidebar, jadi daftar isi tidak bisa dibuka di ponsel. Spacer
                numpad jadi elemen &lt;button&gt; yang bisa difokus tapi tidak melakukan apa pun
              </td>
              <td>
                "Keluar" membuka BottomSheet konfirmasi lalu logout() + kembali ke
                /merchant/signin, pola sama dengan Profile.tsx. Hamburger menyalakan .open,
                overlay menutupnya. Spacer numpad jadi &lt;span aria-hidden&gt;
              </td>
            </tr>
            <tr>
              <td>Layar masuk &amp; daftar (customer + merchant)</td>
              <td>
                Lima layar menyalin markup Bootstrap hasil porting: gutter 24px, tombol pill 9999px,
                field 56px, penggulung bersarang, 3 dari 5 layar berbahasa Inggris. Tombol submit
                terukur di y=933/957 sedangkan viewport berhenti di 844, jadi aksi utama tenggelam
              </td>
              <td>
                Satu <code className="doc-inline">AuthLayout</code>: dua panel (foto aset repo + panel
                form <code className="doc-inline">--surface</code>), gutter 20px, radius 10px, field
                44px, dokumen satu-satunya penggulung, copy Indonesia. Tombol Google/Apple/Facebook
                dan dua tautan <code className="doc-inline">href=&quot;#&quot;</code> dibuang sebagai
                kontrol palsu. Lihat section Layar Masuk &amp; Daftar
              </td>
            </tr>
            <tr>
              <td>Journey Line di order merchant</td>
              <td>
                Kartu order hanya menampilkan pil status ("Diterima"/"Dimasak"). Posisi pesanan di
                perjalanannya tidak terlihat, jadi memantau antrean berarti menebak
              </td>
              <td>
                <code className="doc-inline">JourneyLine</code> yang sama dengan layar customer dan
                kurir, dipasang di tiap kartu order aktif lewat pemetaan status→stage yang eksplisit.
                Order <em>masuk</em> belum punya tahap; ditolak/batal sudah keluar dari rel
              </td>
            </tr>
            <tr>
              <td>Kartu statistik beranda dapur</td>
              <td>
                Empat kartu seragam di grid 2×2: Antrean · Diproses · Selesai · Pendapatan. Terukur
                73/73/99/99 px dan <strong>semua nilai 17,01 px</strong>, jadi "Rp256.000" tercetak
                sama besar dengan "2 order". Uang tidak menonjol, dan dua angkanya mengulang pil
                merah di tab Order
              </td>
              <td>
                Satu kartu pendapatan lebar penuh: angka <code className="doc-inline">--text-2xl</code>{' '}
                + sparkline tujuh hari. Tiga angka antrean turun pangkat jadi baris teks 44 px.
                Ember 182 px → <strong>167 px + 44 px</strong>, dan yang dibaca pertama adalah uangnya
              </td>
            </tr>
            <tr>
              <td>Beranda tidak punya data keputusan</td>
              <td>
                Semua angka di beranda melaporkan <em>apa yang sedang terjadi</em> (antrean, diproses,
                selesai). Tidak ada satu pun yang memberi tahu <em>menu mana yang layak
                diperhatikan</em>, padahal itu yang mengubah keputusan dapur
              </td>
              <td>
                Blok <strong>Menu terjual</strong>: peringkat menu + bar 8 px + omzet IDR, diturunkan
                dari <code className="doc-inline">CartItem</code> di order yang sudah ada (nol mock
                baru). Rentangnya disebut jujur: "8 order terakhir"
              </td>
            </tr>
            <tr>
              <td>Grafik beranda dapur</td>
              <td>
                Beranda hanya punya angka: empat kartu statistik + kartu insentif. Tidak ada satu pun
                grafik, jadi pemilik toko tidak bisa melihat bentuk harinya — sibuk di hari apa,
                berapa order yang benar-benar jadi uang
              </td>
              <td>
                Dua bar chart tren (order &amp; pendapatan per hari, tujuh hari) plus donut komposisi
                status dan bar perbandingan COD vs transfer. Primitif{' '}
                <code className="doc-inline">BarChart</code>/
                <code className="doc-inline">DonutChart</code> yang sudah ada, tanpa library baru.
                Angka dijaga sama dengan kartu di atasnya
              </td>
            </tr>
            <tr>
              <td>Insentif: tombol bayar cashback</td>
              <td>
                Beranda dapur menaruh tombol <em>Bayar cashback Rp345.000 · ±15,00 JOD</em> (183×56
                px) sejajar dengan tombol demo 44 px, di dalam kartu 539 px yang juga memuat
                riwayat dan catatan I-3…I-6. Pelakunya salah: PRD menyebut cashback sebagai arus
                kas keluar <strong>platform</strong>, dan tidak ada jalur pencairan
              </td>
              <td>
                Beranda tinggal ringkasan 186 px + tautan <em>Lihat rincian &amp; riwayat</em>;
                rincian pindah ke <code className="doc-inline">/merchant/insentif</code>. Aksi yang
                tersisa berlabel <strong>Simulasi</strong> dan hanya memicu state demo
              </td>
            </tr>
            <tr>
              <td>Kelola kurir merchant</td>
              <td>
                <code className="doc-inline">/merchant/couriers</code> hanya daftar baca-saja:
                tidak ada tambah/hapus, padahal <code className="doc-inline">plan-merchant.md</code>{' '}
                M5 menjanjikan "tambah/hapus kurir" dan flow F12 punya edge{' '}
                <code className="doc-inline">:assign → hold_cut</code> "merchant pilih kurir
                sendiri"
              </td>
              <td>
                Halaman jadi pengelola penuh (tambah lewat <code className="doc-inline">BottomSheet</code>,
                jam tugas, hapus + konfirmasi; kuota dari{' '}
                <code className="doc-inline">MAX_COURIERS_PER_MERCHANT</code>), dan order berstatus
                diterima/dimasak dapat pemilih kurir yang mengisi{' '}
                <code className="doc-inline">courierId</code> + menambah{' '}
                <code className="doc-inline">activeOrderCount</code>
              </td>
            </tr>
            <tr>
              <td>Scroll: sticky &amp; roda mouse</td>
              <td>
                Body ber-<code className="doc-inline">overflow</code> selain <code className="doc-inline">visible</code>{' '}
                (warisan <code className="doc-inline">app/part-01.scss</code>) menjadikannya scroll container.
                Dua akibat: header sticky tidak pernah menempel (terukur <code className="doc-inline">top: -299</code>{' '}
                setelah scroll 320) dan roda mouse berhenti di body — dokumen tidak bisa digulir dengan mouse
                sama sekali, sementara tombol keyboard tetap jalan
              </td>
              <td>
                <code className="doc-inline">body {'{'} overflow: clip {'}'}</code> — memotong overflow tanpa
                menjadikan body scroll container. Sticky hidup lagi, roda mouse jalan, dan bilah{' '}
                <code className="doc-inline">fixed</code> tetap utuh karena elemen fixed lolos dari clip
              </td>
            </tr>
            <tr>
              <td>Pantulan overscroll</td>
              <td>
                Dokumen memantul di ujung gulir dan pull-to-refresh memuat ulang app — terasa
                seperti tab peramban, padahal tidak ada URL bar di app-mode
              </td>
              <td>
                <code className="doc-inline">overscroll-behavior-y: none</code> di dokumen.
                Momentum gulir dan safe area tetap hidup; yang mati cuma pantulan (keputusan
                2026-09-24, membalik catatan 2026-09-13)
              </td>
            </tr>
            <tr>
              <td>Checkout: baris item</td>
              <td>
                Harga satuan dan total baris dicetak tanpa label; di kuantitas 1 angkanya
                sama persis, jadi tampil dua kali
              </td>
              <td>
                Harga satuan hanya muncul saat kuantitas &gt; 1 dan ditulis sebagai
                <code className="doc-inline">Rp28.000 × 2</code>
              </td>
            </tr>
            <tr>
              <td>Checkout: target sentuh &amp; fokus</td>
              <td>
                &quot;Ubah&quot; 29×14 dan &quot;Top-up sekarang&quot; 103×20 (jauh di bawah 44px);
                ring fokus biru bawaan peramban
              </td>
              <td>
                Keduanya 44px tanpa menggeser tepi teks; ring fokus merek 2px di tombol kembali,
                stepper, tautan Ubah, dan tautan gate
              </td>
            </tr>
            <tr>
              <td>Checkout: kode mati &amp; bilah aksi</td>
              <td>
                Tiga toast penolakan di handler CTA tak pernah tercapai karena tombol disabled pada
                kondisi yang sama; ruang bawah 100px kalah dari bilah ~110px saat safe-area aktif
              </td>
              <td>
                Cabang mati dibuang, alasan hidup di label tombol; jarak dari bilah dihitung dari
                tinggi bilah + safe-area, dan baris Diskon Rp0 yang tak pernah berubah dihapus
              </td>
            </tr>
            <tr>
              <td>Checkout: gutter banner</td>
              <td>Gate saldo memakai padding 16px sementara halaman lain 20px</td>
              <td>
                Seragam <code className="doc-inline">--space-5</code> (20px)
              </td>
            </tr>
            <tr>
              <td>Service worker (offline)</td>
              <td>
                <code className="doc-inline">includeAssets</code> tumpang tindih dengan{' '}
                <code className="doc-inline">globPatterns</code> → workbox melempar{' '}
                <code className="doc-inline">add-to-cache-list-conflicting-entries</code>, precache batal
                diam-diam, offline mati total
              </td>
              <td>
                Tumpang tindih dibuang, <code className="doc-inline">webp</code> masuk globPatterns;
                precache 30 entri / 2,5 MB, offline jalan
              </td>
            </tr>
            <tr>
              <td>Simulator perangkat desktop</td>
              <td>
                Frame 462px di ≥701px: mode layout kedua yang hanya hidup di laptop, menuntut pengecualian
                &quot;scroll bersarang di dalam bezel&quot;
              </td>
              <td>
                Dihapus. Satu mode, murni PWA: kolom 430px ditengahkan dan dokumen jadi satu-satunya
                penggulung di lebar berapa pun
              </td>
            </tr>
            <tr>
              <td>Alamat pengantaran</td>
              <td>Tambah saja; hapus hanya toast; tak ada peta; rute tak terjangkau</td>
              <td>CRUD penuh + pin peta + alamat utama; dibuka dari Profil dan tombol Ubah di Checkout</td>
            </tr>
            <tr>
              <td>Rute order legacy</td>
              <td>
                <code className="doc-inline">/order-tracking</code>,{' '}
                <code className="doc-inline">/order-delivery</code>,{' '}
                <code className="doc-inline">/order-delivered</code>,{' '}
                <code className="doc-inline">/order-success</code> terdaftar tapi tak dituju
              </td>
              <td>Dihapus — satu <code className="doc-inline">OrderStageScreen</code> + <code className="doc-inline">OrderArrived</code></td>
            </tr>
            <tr>
              <td>Kartu lama</td>
              <td>
                <code className="doc-inline">/add-card</code>,{' '}
                <code className="doc-inline">/add-card-address</code> mati
              </td>
              <td>Dihapus; alur kartu lewat <code className="doc-inline">/add-new-card</code></td>
            </tr>
            <tr>
              <td>Tautan kartu</td>
              <td>
                <code className="doc-inline">/profile/add-new-card</code> → wildcard redirect ke /home
              </td>
              <td><code className="doc-inline">/add-new-card</code></td>
            </tr>
            <tr>
              <td>Rating kurir</td>
              <td>Tak terjangkau — <code className="doc-inline">OrderArrived</code> tak dibuka siapa pun</td>
              <td>Dibuka setelah OTP pengiriman, menyalurkan ke <code className="doc-inline">/rating-driver</code></td>
            </tr>
            <tr>
              <td>Filter &amp; Search</td>
              <td>“Clear All” hanya toast; harga tak tersimpan; query tak memfilter</td>
              <td>State nyata; filter diteruskan ke Search lewat <code className="doc-inline">location.state</code> dan memfilter katalog</td>
            </tr>
            <tr>
              <td>Metode bayar</td>
              <td>Remove / Connect hanya toast</td>
              <td>Mengubah daftar metode (state lokal)</td>
            </tr>
            <tr>
              <td>Foto profil</td>
              <td>Upload hanya toast</td>
              <td>Memilih berkas + pratinjau lokal (tanpa unggah)</td>
            </tr>
            <tr>
              <td>Daftar alamat kosong</td>
              <td>
                <code className="doc-inline">stored?.length ? stored : mockUser.addresses</code> —
                hapus alamat terakhir dan daftarnya <em>balik</em> ke 3 alamat mock
              </td>
              <td>
                Fallback hanya saat nilai bukan array; daftar kosong kini menampilkan ajakan tambah,
                dan Checkout bilang "Tambah alamat dulu"
              </td>
            </tr>
            <tr>
              <td>Kartu alamat (layout)</td>
              <td>
                Tiga tombol ikon 28px (di bawah <code className="doc-inline">--touch-min</code>)
                bersarang di dalam <code className="doc-inline">role="radio"</code>; kolom teks 100px
                di lebar 390px; kapsul zona + kapsul "Utama" menumpuk
              </td>
              <td>
                Satu radio asli + <code className="doc-inline">&lt;label&gt;</code> + satu tombol opsi
                44px ke bottom sheet; kolom teks 242px; maksimum satu badge per kartu; meta zona jadi
                satu baris teks
              </td>
            </tr>
            <tr>
              <td>Hover kartu alamat</td>
              <td>
                Hover mengecat <code className="doc-inline">--bg-warm</code> di atas{' '}
                <code className="doc-inline">--surface</code> (beda 4 satuan, tak terlihat) dan
                menghapus latar kartu terpilih; teks abu di atas oranye 1,7:1
              </td>
              <td>
                Hover = tint oranye + tepi merek; kartu terpilih tetap oranye saat di-hover; teks
                memakai <code className="doc-inline">--text-primary</code> (4,86:1, lolos AA)
              </td>
            </tr>
            <tr>
              <td>Galat &amp; offline</td>
              <td>Layar ada, tidak dipasang</td>
              <td>
                <code className="doc-inline">AppErrorBoundary</code> + listener{' '}
                <code className="doc-inline">offline</code> per role customer
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>
  )
}
