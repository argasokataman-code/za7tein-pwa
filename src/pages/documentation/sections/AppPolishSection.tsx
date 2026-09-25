import { DocSection } from '../DocSection'

/**
 * Perbaikan bentuk layar yang sudah ada: antrean merchant, form sengketa,
 * layar pasca-order, dan checkout customer. Dipisah dari ChangelogSection
 * (audit rute & CRUD 2026-09-23) supaya tiap bagian punya satu topik dan
 * tidak ada yang melewati batas 700 baris — ChangelogSection sempat 716 baris
 * waktu catatan ini ditumpuk ke tabelnya.
 */
export function AppPolishSection() {
  return (
    <DocSection id="app-polish" num="37" title="Perbaikan Bentuk App (2026-09-24)">
      <p className="doc-p">
        Bukan fitur baru: layar yang sudah jalan diberi bentuk app. Tujuh belas baris di bawah adalah
        perubahan yang bisa diperiksa angkanya, semuanya diukur di kolom 390px dan diverifikasi
        lewat <code className="doc-inline">npm run scan</code> plus gate{' '}
        <code className="doc-inline">browser-gate</code> per rute.
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
              <td>Antrean order: satu kartu tinggi → baris ringkas + sheet detail</td>
              <td>
                Tiap order satu kartu yang menampung journey, item, alamat, total, dan kontrolnya:
                terukur 526px di tab Diproses (satu kartu nyaris satu layar) dan 291px di Antrean,
                jadi hanya ~1 order terlihat
              </td>
              <td>
                Baris antrean ringkas: avatar, kode, pembeli·waktu, ringkasan item (elipsis), badge,
                total. Terukur 95px di Diproses (dari 526) dan 163px di Antrean termasuk Terima/Tolak
                (dari 291), jadi ~4 order terlihat. Detail lengkap (journey, item + harga, alamat,
                total) plus kontrol masak/kurir dibuka lewat{' '}
                <code className="doc-inline">BottomSheet</code>. Panel sheet dibatasi{' '}
                <code className="doc-inline">max-height: 90vh</code> + gulir internal supaya isi
                panjang tidak meluber keluar layar. Terverifikasi klik: set 25 menit, pilih kurir,
                lalu "Siap diantar" mengubah baris jadi "Diantar". Gate role merchant 24/24 PASS
              </td>
            </tr>
            <tr>
              <td>Form Ajukan Sengketa &amp; isian form repo-wide</td>
              <td>
                Kategori <code className="doc-inline">&lt;select&gt;</code> peramban; foto bukti{' '}
                <code className="doc-inline">&lt;input type="file"&gt;</code> bertombol "Choose
                Files" tanpa pratinjau/hapus; validasi hanya toast. Isian 14,83px (iOS zoom saat
                fokus) dan textarea 56px walau <code className="doc-inline">rows={'{4}'}</code>{' '}
                karena stylesheet lama memaku <code className="doc-inline">.form-control</code>
              </td>
              <td>
                Kategori jadi baris <code className="doc-inline">.dispute-picker</code> yang membuka{' '}
                <code className="doc-inline">BottomSheet</code>; <strong>alasan wajib hanya untuk
                kategori Lainnya</strong>; foto jadi petak 96px (pratinjau, hapus 44px, tambah, maks
                3); validasi inline + <code className="doc-inline">aria-invalid</code>. Akarnya di{' '}
                <code className="doc-inline">system/</code>: token{' '}
                <code className="doc-inline">--text-field</code> 16px &amp; textarea{' '}
                <code className="doc-inline">height: auto</code>, jadi seluruh repo ikut. Terukur:
                isian 16px, Alasan 122px (dari 56). Gate{' '}
                <code className="doc-inline">/merchant/dispute</code> &amp;{' '}
                <code className="doc-inline">/customer/dispute</code> PASS
              </td>
            </tr>
            <tr>
              <td>Layar pesanan tiba &amp; rating kurir</td>
              <td>
                Perayaan tanpa gerakan dan tanpa kontras: centang putih di lingkaran krem
                (1,02:1), pesan ber-alpha 6% di atas oranye (praktis hilang), tombol CTA
                berlatar oranye yang sama dengan latar halaman, nol keyframes. Layar rating:
                header menyusut 84px (judul 0px), bintang
                40×46, prompt Inggris, kode order &ldquo;012345&rdquo;, tanpa tip sama sekali
                sehingga alur PRD §Tips putus
              </td>
              <td>
                Perayaan diberi gerakan: lingkaran pop, centang masuk, konfeti mekar dari tengah
                lalu mengapung, teks dan tombol naik berurutan (
                <code className="doc-inline">prefers-reduced-motion</code> sudah ditangani global
                di <code className="doc-inline">system/_motion.scss</code>). Warna dari token,
                teks lolos AA (4,81:1); CTA jadi permukaan terang berteks oranye, lebar penuh.
                Header rating kembali selebar kolom, bintang 44px, prompt Indonesia, kode order
                dari query (pola <code className="doc-inline">/dispute</code>). Tip: chip
                nominal (Tanpa tip / Rp3rb / 5rb / 10rb) memakai pola{' '}
                <code className="doc-inline">.wallet-preset</code>, dipotong dari wallet customer
                lewat <code className="doc-inline">tipCourier</code> — terverifikasi Rp5.000:
                saldo Rp40.000 → Rp35.000 di <code className="doc-inline">/wallet</code>. Gate
                kedua rute 2/2 PASS (<code className="doc-inline">--strict --click</code> 11/11)
              </td>
            </tr>
            <tr>
              <td>Checkout customer (audit 005, 10 temuan)</td>
              <td>
                Kartu gate top-up full-bleed (terukur x=0 w=390 di 390 dan w=430 di 1440:
                satu-satunya permukaan tanpa gutter 20px); enam peran teks berbagi 14,34px/600;
                teks isi 14,34px dan catatan pajak 11,56px di bawah lantai mobile; dua sistem
                kartu (item border 10px vs ringkasan border-strong 12px); top-up disebut empat
                kali; pasangan Rp·JOD dua belas baris sehingga kolom nominal item 141px
                menyisakan nama 107px; judul &ldquo;Ringkasan Pesanan&rdquo; beda casing; hex
                mentah warisan; sisa hover desktop; CTA empty 260px vs terisi 350px
              </td>
              <td>
                Gate pindah ke dalam <code className="doc-inline">.checkout-content</code> (kembali
                x=20 w=350); judul seksi turun jadi label --text-sm/700 sekunder sementara isi
                tetap --text-base/600 (empat tingkat: 16,73 / 16 / 13 / 12); token root naik —{' '}
                <code className="doc-inline">--text-base</code> lantai 16px dan{' '}
                <code className="doc-inline">--text-xs</code> 12px, jadi seluruh repo ikut
                (lebar ≥667px tak berubah karena angka atas clamp sama); kartu item ikut
                border-strong + radius-lg; pesan top-up jadi satu paragraf + label tombol; pasangan
                JOD tinggal di Total Bayar, catatan kurs, dan gate (baris lain moneyPlain);
                &ldquo;Ringkasan pesanan&rdquo; sentence case; hex checkout di stylesheet warisan
                ganti token (nilai identik); hover translateY(-2px) di tombol lanjut dihapus; CTA
                empty kini 350×44 seperti CTA terisi
              </td>
            </tr>
            <tr>
              <td>Panel admin · CS (audit 006, 6 temuan)</td>
              <td>
                Kartu liability solid oranye: baris rincian putih 13px = 3,36:1 dan note/kurs
                abu di atas oranye = 1,67:1 (keduanya di bawah AA); 11 em dash di copy UI plus 4
                di data; isi baca 12&ndash;13px sementara repo sudah berlantai 16 (dispute reason
                13, data deposit 12, nominal ledger 13, judul kartu cuma 1px di atas label); aksi
                jalur uang (putusan sengketa, blacklist COD, batal order) 1 ketuk langsung eksekusi;
                3 literal warna di luar token; danger-ink BF423C di red-soft cuma 4,40:1
              </td>
              <td>
                Kartu liability jadi tint --orange-soft, total tetap --orange-ink
                (4,15:1 large, label 4,71:1), note + kurs
                keluar kartu ke --bg-warm (5,38:1), baris rincian label sekunder + nilai 600; copy
                dibersihkan dari em dash (15 string, koma/titik/dua-titik); huruf isi naik ke
                --text-base (dispute reason, detail rows, memo, nominal ledger, judul kartu) jadi
                tingkat 27,85 / 20,68 / 16 / 13 / 12; ConfirmSheet baru (BottomSheet + .sheet-actions)
                menjaga 3 aksi jalur uang dengan ketuk kedua, tombol Batal netral .sheet-cancel;
                literal ganti --overlay-strong (token baru) + --on-brand + --border; temuan #6:
                --danger-ink B93D37 (4,72:1 terukur di red-soft)
              </td>
            </tr>
            <tr>
              <td>Dashboard panel CS: visualisasi detail (2026-09-24)</td>
              <td>
                Ringkasan cuma kartu teks: baris rincian liability datar, dua kartu statistik
                kotak, nol chart; angka tersedia tapi bentuk komposisi dan arusnya tak terbaca
                sekali lihat
              </td>
              <td>
                Tujuh bagian diturunkan dari adminSlice tanpa mock baru: (1) kartu liability
                kembali --surface sesuai DNA baris 15, donut komposisi + legenda JOD lewat
                liabilitySegments yang dipakai konsol SA juga; (2) statline 4 angka tanpa kotak
                (tenant/sengketa/investigasi/riskFlag), tiap angka membuka halamannya; (3) kartu
                Eksposur sengketa: donut nominal per status (fungsi murni disputeExposure) dengan
                empty state; (4) Buku besar: kv masuk/keluar/bersih + BarChart per jenis entry
                (ledgerFlow/ledgerTypeBars); (5) feed Mutasi terbaru 5 entry, markup baris yang
                sama dengan layar Ledger; (6) Alert SLA tetap dengan konfirmasi; (7) kartu Master
                tenant tetap singkat. Yang bukan milik CS (pajak, profit, audit trail, kill switch)
                tidak ditampilkan sama sekali
              </td>
            </tr>
            <tr>
              <td>Top bar: satu tinggi untuk semua halaman, tombol kembali satu bentuk</td>
              <td>
                Tiap partial menulis tingginya sendiri: 76px (merchant/kurir/admin), 60px (favorit,
                saldo, order tiba), padding 16px (alamat, pembayaran, ulasan), 70px (cari) &mdash;
                halaman yang sama-sama &ldquo;judul + tombol kembali&rdquo; tampil beda. Tombol
                kembali 36px (part-07), 40px (part-14/15), 48px (part-08) dengan empat bentuk (radius-xs,
                radius-md, pill, 50%) dan tiga permukaan; ikonnya 22px di layar order dan 24px di
                tempat lain. Satu jalur juga mengabaikan ukurannya: <code className="doc-inline">.back-btn-profile</code>{' '}
                (13 halaman profil) terukur 24&times;24, hanya sebesar ikonnya
              </td>
              <td>
                Partial baru <code className="doc-inline">system/_topbar.scss</code>, diimpor terakhir
                lewat facade <code className="doc-inline">_system.scss</code> (16 kelas bar). Kontraknya:
                <code className="doc-inline">min-height: var(--nav-height)</code> 64px, padding vertikal 0
                (pada border-box <code className="doc-inline">min-height</code> sudah mencakup padding,
                jadi kontrol 44px yang diberi padding 10px tetap terukur 44px terlihat), lantai naik
                sebesar <code className="doc-inline">env(safe-area-inset-top)</code> di app-mode. Tombol
                kembali: 44px, <code className="doc-inline">--radius-md</code>, permukaan + tepi
                <code className="doc-inline">--border-strong</code>, ikon 24px/<code className="doc-inline">stroke-width</code>{' '}
                1.75 dipatok lewat CSS. Judul hero di bar role dipatok ke token baru{' '}
                <code className="doc-inline">--text-bar-title</code> 28px: <code className="doc-inline">--text-2xl</code>{' '}
                memakai <code className="doc-inline">clamp(vw)</code> sehingga judul yang sama 32px di
                jendela 390px dan 37px di 1440px &mdash; cukup untuk mendorong tingginya, dan itu satu-satunya
                bar yang masih berbeda. Terukur gate <code className="doc-inline">--role all --pwa</code>:
                <strong> 134/134 PASS, 10 kelas bar semuanya 123px</strong> (= 64px terlihat + 59px inset)
                di 390px dan 1440px
              </td>
            </tr>
            <tr>
              <td>Manifest PWA bocor ke rute non-app</td>
              <td>
                <code className="doc-inline">index.html</code> memasang{' '}
                <code className="doc-inline">&lt;link rel=&quot;manifest&quot; href=&quot;/manifest.json&quot;&gt;</code>{' '}
                statis di <strong>semua</strong> rute. Skrip di bawahnya hanya mengganti href untuk
                empat prefix peran dan menghapus untuk <code className="doc-inline">/superadmin</code>,
                jadi <code className="doc-inline">/</code> dan{' '}
                <code className="doc-inline">/documentation</code> tetap memakai manifest umum itu
                (id <code className="doc-inline">&quot;/&quot;</code>, scope{' '}
                <code className="doc-inline">&quot;/&quot;</code>, start_url{' '}
                <code className="doc-inline">&quot;/&quot;</code>) dan benar-benar bisa diinstal
                sebagai app kelima. Scope-nya menelan seluruh prefix peran, jadi tiga app terpasang
                dengan scope bertumpuk
              </td>
              <td>
                Elemen manifest <strong>dibuat</strong> hanya saat pathname cocok salah satu dari
                empat prefix peran, dan <code className="doc-inline">public/manifest.json</code>{' '}
                dihapus supaya tidak ada manifest yatim ber-scope{' '}
                <code className="doc-inline">&quot;/&quot;</code>. Terukur di build:{' '}
                <code className="doc-inline">/</code>, <code className="doc-inline">/documentation</code>,{' '}
                <code className="doc-inline">/superadmin</code>, dan rute tak dikenal melaporkan{' '}
                <code className="doc-inline">hasManifest false</code>; empat rute peran tetap
                memakai manifest sendiri dan tetap <code className="doc-inline">standalone</code>.
                Dua pengaman: <code className="doc-inline">npm run scan</code> menolak{' '}
                <code className="doc-inline">rel=manifest</code> statis dan manifest di luar empat
                itu, <code className="doc-inline">browser-gate</code> menolak rute yang mengukur
                manifest yang bukan miliknya (dibuktikan dengan menyuntik ulang bug-nya). Gate{' '}
                <code className="doc-inline">--role all --pwa</code> 134/134 lolos
              </td>
            </tr>
            <tr>
              <td>Gerak &amp; umpan balik tekan (satu berkas: <code className="doc-inline">_interaction.scss</code>)</td>
              <td>
                Sebagian besar kontrol tak punya reaksi saat ditekan, jadi di layar sentuh tak ada
                bedanya menyentuh tombol atau kertas. Arah halaman (maju/mundur) juga tidak terbaca,
                dan daftar muncul sekaligus tanpa urutan. Durasinya pun tersebar sebagai angka mentah
                (terukur 59 nilai durasi ad-hoc) alih-alih skala yang satu bahasa
              </td>
              <td>
                Skala tekan 0.97 pada daftar selector eksplisit (bukan selektor generik, karena{' '}
                <code className="doc-inline">.nav-item</code>/<code className="doc-inline">.food-card</code>{' '}
                bukan <code className="doc-inline">button</code>). Transisi halaman pindah-peran
                memakai satu kelas dari <code className="doc-inline">usePageTransition()</code>.
                Baris masuk berurutan lewat <code className="doc-inline">--stagger-step</code>{' '}
                (terukur tunda 0s / 0.045s / 0.09s, dibatasi 8 lewat <code className="doc-inline">min()</code>).
                Durasinya kini token: <code className="doc-inline">--motion-enter/exit/page</code> +{' '}
                <code className="doc-inline">--ease-*</code>. Terverifikasi:{' '}
                <code className="doc-inline">matrix(0.97)</code> saat <code className="doc-inline">:active</code>,
                animasi halaman 0.26s, <code className="doc-inline">stagger-rise</code> 0.38s
              </td>
            </tr>
            <tr>
              <td>Bilah bawah dipindah ke portal (<code className="doc-inline">BottomNav</code>)</td>
              <td>
                <code className="doc-inline">position: fixed</code> di dalam pohon halaman yang
                dianimasikan: begitu ada <code className="doc-inline">transform</code> pada leluhur,
                bilah ikut melayang &mdash; terukur turun ke y=1479 selama 260ms dan area bawah layar
                kosong. Gejalanya terbaca sebagai &quot;navigation bar bisa discroll&quot;
              </td>
              <td>
                <code className="doc-inline">createPortal</code> ke{' '}
                <code className="doc-inline">document.body</code>: bilah keluar dari pohon halaman,
                jadi tak ada animasi halaman yang bisa menggesernya. Terukur{' '}
                <code className="doc-inline">nav.parentElement === BODY</code> dan{' '}
                <code className="doc-inline">bottom: 0</code> sebelum <em>dan</em> selama transisi.
                Context router tetap lewat portal, jadi status rute aktif benar
              </td>
            </tr>
            <tr>
              <td>Parallax gulir beranda (scroll-driven CSS)</td>
              <td>
                Seluruh halaman bergerak 1:1 sebagai satu bidang kaku: hero, judul bagian, dan
                kartu promo semuanya berhenti bersamaan, jadi tidak ada kedalaman. Terukur sebelum:
                hero bergeser 0px relatif gulir di posisi 0/150/300/450, judul bagian ikut persis
                1:1
              </td>
              <td>
                Empat lapisan bergerak berbeda lewat <code className="doc-inline">animation-timeline:
                view()</code> / <code className="doc-inline">scroll(root block)</code> — digerakkan
                kompositor, bukan listener <code className="doc-inline">scroll</code>, jadi tetap
                mulus saat utas utama sibuk. Terukur pada 0/120/240/360/480/600/692px: hero 32→0px,
                judul bagian 14.5→0, kartu promo 20.5→1.3, dekorasi kartu punya delta sendiri.
                Jarak antar-judul tetap (113→111px, goyang &lt;2px dari judul yang masih dalam
                jangkauan) karena semua pakai <code className="doc-inline">cover 100%</code>. Aman:
                hanya properti <code className="doc-inline">translate</code> (tidak membuat
                containing block untuk <code className="doc-inline">fixed</code>), amplitudo 14-32px,
                dan <code className="doc-inline">overflow-x</code> terukur 0px di semua posisi.
                Tanpa penopang <code className="doc-inline">view()</code>, halaman kembali 1:1 —
                tanpa galat
              </td>
            </tr>
            <tr>
              <td>Parallax diperluas ke delapan layar + scroller mati dibuang</td>
              <td>
                Parallax hanya ada di beranda. Tiga layar lain (<code className="doc-inline">menu-detail</code>,{' '}
                <code className="doc-inline">checkout</code>, <code className="doc-inline">search</code>) menyimpan
                sisa pola lama: wadah <code className="doc-inline">overflow-y: auto</code> di dalam halaman
                yang <strong>tingginya sama dengan isinya</strong> (terukur 1352px = 1352px) — scroller
                mati yang tetap menjadi acuan terdekat untuk <code className="doc-inline">view()</code>,
                sehingga animasinya dihitung terhadap wadah yang tak pernah bergerak dan semua lapisan
                beku (terukur <code className="doc-inline">-2.8/4.7/13.5</code> konstan di seluruh posisi gulir)
              </td>
              <td>
                <code className="doc-inline">menu-detail-screen</code> dan{' '}
                <code className="doc-inline">checkout-screen</code> ditambahkan ke daftar override di
                <code className="doc-inline">_menu.scss</code> yang sudah menampung{' '}
                <code className="doc-inline">home/search/filter/address/reviews</code> — satu kontrak
                "satu penggulung, yaitu dokumen". Setelah itu terukur{' '}
                <code className="doc-inline">nestedScrollers: 0</code> di delapan layar dan semuanya
                bergerak. Ikut beres di akar yang sama: gutter <code className="doc-inline">menu-detail</code>{' '}
                dipulihkan ke <code className="doc-inline">--space-5</code> (16px &rarr; 20px di dua
                tempat: konten dan bilah CTA — bilah fixed-nya tadinya 4px lebih lebar dari teks di
                atasnya), dan kontrol bersarang di <code className="doc-inline">Search</code> dipecah
                jadi dua tombol bersaudara (satu <code className="doc-inline">&lt;button&gt;</code> berisi{' '}
                <code className="doc-inline">&lt;span role="button"&gt;</code> sebelumnya, dan tombol
                hapusnya cuma 7&times;18px)
              </td>
            </tr>
            <tr>
              <td>Tarik-untuk-menyegarkan (keempat peran)</td>
              <td>
                Keputusan 2026-09-24 mematikan <code className="doc-inline">overscroll-behavior-y</code>{' '}
                di dokumen karena pantulan bawaan membuat app terinstal terasa seperti tab peramban.
                Konsekuensinya pull-to-refresh bawaan ikut mati &mdash; dan itu memang tidak diinginkan,
                sebab <code className="doc-inline">location.reload()</code> memuat ulang seluruh aplikasi.
                Sebelum ini, menarik di puncak halaman tidak menghasilkan apa pun sama sekali
              </td>
              <td>
                Versi native-nya: tarik ke bawah, indikator muncul, lalu selesai &mdash; halaman tidak
                dimuat ulang. Dipasang sekali di <code className="doc-inline">PageTransition</code>,
                jadi keempat peran mendapatkannya tanpa perubahan di tiap halaman. Lingkupnya sengaja
                gestur + indikator saja: repo ini tidak punya backend, jadi &ldquo;memuat ulang data&rdquo;
                tak bisa mengambil apa pun, dan menambahnya berarti mengosongkan katalog/dompet yang
                sudah diisi dari layar merchant dan admin. Gestur dibaca dari <code className="doc-inline">touchmove</code>{' '}
                mentah, karena <code className="doc-inline">overscroll-behavior-y: none</code> memblokir
                rantai overscroll sehingga tak ada peristiwa bawaan yang bisa ditangkap. Hanya aktif
                saat <code className="doc-inline">scrollY &le; 0</code>; tarikan di bawah ambang 64px
                kembali ke nol tanpa berputar. Gerakannya lewat satu properti{' '}
                <code className="doc-inline">translate</code> (bukan <code className="doc-inline">transform</code>)
                supaya tidak menjadi containing block untuk <code className="doc-inline">fixed</code>,
                dan indikatornya <code className="doc-inline">aria-hidden</code> &mdash; tidak ada kontrol
                yang bisa dijalankan pembaca layar, jadi tidak dijadikan tombol. PRD aktif tak menyebut
                pull-to-refresh (<code className="doc-inline">UNRESOLVED-by-absence</code>), jadi ini
                keputusan UX, bukan requirement
              </td>
            </tr>
            <tr>
              <td>Denyut pengalih perhatian di kartu promo</td>
              <td>
                Permintaannya &ldquo;bergerak terus supaya orang menoleh&rdquo;. Gerakan yang tak
                pernah berhenti ditolak: mata beradaptasi dalam ~3 detik, lalu banner justru lebih
                mudah diabaikan karena berubah jadi bagian latar &mdash; dan GPU di app-mode yang
                selalu nyala tak punya alasan bekerja abadi
              </td>
              <td>
                Tiga lingkaran sepusat yang sudah ada bernapas (skala 1 &rarr; 1.07 &rarr; 1),
                gelombangnya menjalar dari dalam ke luar dengan jeda 0/60/120ms, dan angka{' '}
                <code className="doc-inline">30%</code> berdenyut sekali. <strong>Dua siklus lalu
                diam</strong> &mdash; setelah ~1.5s tak ada apa pun yang berjalan selama halaman
                terbuka. Motif lama dipakai, nol elemen baru; hanya{' '}
                <code className="doc-inline">transform</code>/<code className="doc-inline">opacity</code>{' '}
                yang dianimasikan (compositor), tanpa <code className="doc-inline">will-change</code>{' '}
                permanen, <code className="doc-inline">overflow-x</code> tetap 0. Sumbu putar sempat
                ditulis <code className="doc-inline">calc(100% + 72px)</code> untuk menaruh origin di
                pusat lingkaran &mdash; salah, persentase di{' '}
                <code className="doc-inline">transform-origin</code> dihitung terhadap kotak elemen itu
                sendiri, dan terukur originnya mendarat 182px di kanan pusat sebenarnya. Origin bawaan{' '}
                <code className="doc-inline">50% 50%</code> sudah tepat karena lingkarannya{' '}
                <code className="doc-inline">border-radius: 50%</code>.{' '}
                <code className="doc-inline">prefers-reduced-motion</code> mematikannya, dan itu
                terverifikasi struktural dari bundel: rule{' '}
                <code className="doc-inline">animation: none</code> berada di dalam media query dan
                setelah rule animasinya (188146 &rarr; 189673), jadi menang pada kekhususan sama
              </td>
            </tr>
            <tr>
              <td>Parallax beranda menabrak chip kategori</td>
              <td>
                Header beranda bergerak dengan amplitudo 34px dan <code className="doc-inline">from 34px</code>,
                jadi ia ada di simpangan terjauhnya tepat saat halaman di puncak.
                <code className="doc-inline">translate</code> tidak menggeser kotak layout: kotak hero berakhir
                di 293.2px sementara kotak pencariannya tampil di 303.2px, menabrak{' '}
                <code className="doc-inline">.home-content</code> yang mulai di 293.2px — terukur tumpang 10px,
                chip Makanan/Minuman/Camilan menempel ke kotak pencarian
              </td>
              <td>
                Akarnya amplitudo yang lebih besar dari celah, bukan arahnya: jarak search-ke-isi terukur
                24px (269.2 &rarr; 293.2), jadi header tak boleh bergeser lebih dari itu. Mengarahkan ke atas
                (<code className="doc-inline">to -34px</code>) menghapus tumpang tapi menaruh header di{' '}
                <code className="doc-inline">top: -34px</code>, menembus tepi atas kolom. Amplitudo diturunkan
                ke 20px + <code className="doc-inline">animation-direction: reverse</code>, jadi di puncak
                halaman header duduk di tempat dan simpangan 4px tersisa di akhir gulir. Terukur di gulir
                0/80/160/240/320px: celah 24/19/14/9/4px &mdash; tak pernah negatif di posisi mana pun, dan{' '}
                <code className="doc-inline">overflow-x</code> tetap 0
              </td>
            </tr>
            <tr>
              <td>Carousel promo: gelombang, dan dot yang benar-benar bisa ditekan</td>
              <td>
                Kartu promo hanya satu, dan dekorasinya tiga lingkaran sepusat yang tidak
                terhubung ke apa pun di aplikasi ini. Titik penunjuk carousel sempat dibuat
                24&times;24px dengan alasan &ldquo;cukup untuk jari&rdquo; &mdash; gate menolaknya
                dengan benar, karena batasnya <code className="doc-inline">--touch-min</code> 44px
              </td>
              <td>
                Kartu jadi tiga, isinya dari data yang ada: klaim diskon 30% dari notifikasi
                promo, sisanya item katalog yang <code className="doc-inline">discountPercent</code>-nya
                memang terisi &mdash; PRD aktif tidak punya fitur promo, jadi tak ada klaim baru.
                Latar diganti tiga gelombang SVG dari bawah plus tekstur titik, motif yang sama
                dengan hero beranda; jumlah lapisan yang memberi kedalaman, bukan gradient pada
                bentuknya, opasitas <code className="doc-inline">6/9/14%</code> di dalam batas
                dekorasi. Titik penunjuk jadi 44px, lalu <strong>pindah ke baris CTA</strong>:
                ditaruh di kanan atas ia bertabrakan dengan judul (3 &times; 44px = 132px, terukur
                mulai di x=230 sementara kotak judul berakhir di 350), sementara di baris CTA
                hanya label tombol yang perlu dihindari dan itu digeser lewat{' '}
                <code className="doc-inline">padding-right</code>. Diuji dengan klik nyata lewat{' '}
                <code className="doc-inline">Input.dispatchMouseEvent</code>: jalur bergeser{' '}
                <code className="doc-inline">translate3d(0%)</code> &rarr;{' '}
                <code className="doc-inline">translate3d(-100%)</code>, kartu aktif 0 &rarr; 1.
                Dua angka kontras juga hasil ukur: angka promo memakai{' '}
                <code className="doc-inline">background-clip: text</code> dengan ujung putih{' '}
                <code className="doc-inline">#fffaf3</code> (3.23:1) setelah krem{' '}
                <code className="doc-inline">#ffe9b8</code> terukur 2.81:1 &mdash; di bawah ambang
                3:1; dan keterangan 12px wajib gelap, sebab di atas oranye putih hanya 3.36:1 dan{' '}
                <code className="doc-inline">--orange-soft-ink</code> 2.12:1, keduanya gagal AA,
                sementara <code className="doc-inline">--text-primary</code> 4.86:1
              </td>
            </tr>
            <tr>
              <td>Saran pencarian bergantian di kolom hero</td>
              <td>
                Kolom pencarian cuma diam dengan placeholder statis, tak ada petunjuk apa
                yang bisa dicari. Menganimasikan atribut{' '}
                <code className="doc-inline">placeholder</code> langsung tidak mungkin:
                ia bukan elemen, jadi tak bisa di-<code className="doc-inline">overflow: hidden</code>{' '}
                per-kata, dan tetap terlihat saat <code className="doc-inline">value</code>{' '}
                terisi sehingga dua teks bertumpuk
              </td>
              <td>
                Kata bergantian tiap 2.6s, naik dari bawah, isinya dari katalog yang ada
                (nama menu populer) &mdash; bukan daftar karangan, karena yang dijanjikan
                di kolom pencarian harus benar-benar ada di dalamnya. Dipasang sebagai
                elemen overlay bersaudara dengan input (
                <code className="doc-inline">placeholder=&quot;&quot;</code>), disembunyikan
                begitu ada isi, dan <code className="doc-inline">pointer-events: none</code>{' '}
                &mdash; diuji klik nyata, ketukan di atasnya tetap memfokuskan{' '}
                <code className="doc-inline">INPUT[name=q]</code>. Satu cacat ditemukan saat
                mengukur: keyframe sempat memakai{' '}
                <code className="doc-inline">translateY(100%)</code> dan{' '}
                <code className="doc-inline">opacity: 0</code> dengan{' '}
                <code className="doc-inline">fill-mode: both</code>, jadi keadaan awalnya
                adalah &ldquo;kata di luar kotak&rdquo;. Terukur di klon headless (waktu
                animasi beku di frame 0) hasilnya kotak kosong &mdash; saran hilang total,
                bukan sekadar tak bergerak. Sekarang geser 9px (kotak 44px, kata 24px,
                ruang bebas (44&minus;24)/2 = 10px), <code className="doc-inline">fill-mode: none</code>,
                dan <code className="doc-inline">opacity</code> tidak dianimasikan: kata tetap
                terbaca di posisi mana pun animasinya berhenti. Terukur saat beku:
                kata 232.2&ndash;256.2 di dalam kotak 213.2&ndash;257.2, dan rotasi
                terverifikasi berganti (Ayam Geprek &rarr; Nasi Uduk Komplit).
                <code className="doc-inline">prefers-reduced-motion</code> mematikan
                luncurannya; rotasinya tetap jalan karena itu informasi, bukan dekorasi
              </td>
            </tr>
            <tr>
              <td>Super Deals · kartu promo, badge diskon, overlay Pasang aplikasi</td>
              <td>
                Section cuma 2 kartu karena hanya 2 item katalog punya{' '}
                <code className="doc-inline">discountPercent</code>; badge{' '}
                <code className="doc-inline">10% Off</code> statis tanpa pembeda; dan{' '}
                <strong>seluruh halaman tak bisa diklik</strong> di peramban yang tak pernah
                menembakkan <code className="doc-inline">beforeinstallprompt</code> &mdash;
                terukur <code className="doc-inline">.install-prompt</code> 390&times;844 dengan{' '}
                <code className="doc-inline">z-index: 1200</code> menutupi layar dengan isi
                kosong, dan hit-test di titik tengah badge mendarat di elemen itu, bukan
                badge-nya
              </td>
              <td>
                Kartu jadi 8 (empat item katalog &amp; empat item merchant diberi{' '}
                <code className="doc-inline">discountPercent</code> 5&ndash;25%), semua bergambar.
                Badge jadi pil kaca: angka 16px/800 di atas label 12px/600, miring{' '}
                <code className="doc-inline">-3deg</code>, berdenyut{' '}
                <code className="doc-inline">infinite</code> &mdash; terukur lintas waktu{' '}
                <code className="doc-inline">1 &rarr; 1.13776 &rarr; 1.0299</code>. Sempat
                berdenyut sekali (<code className="doc-inline">iteration-count: 1</code>,{' '}
                <code className="doc-inline">fill: none</code>) sehingga selesai di detik ~0,3
                sebelum mata mendarat di kartu: tak terasa ada animasi. Angka persennya juga
                sempat <code className="doc-inline">--surface</code> putih di atas badge putih
                &mdash; rasio 1:1, yang terbaca cuma kata &ldquo;Off&rdquo;; kini charcoal
                (4,86:1, terukur <code className="doc-inline">rgb(32,32,32)</code> di atas{' '}
                <code className="doc-inline">rgb(255,249,244)</code>). Kartu ikut bernafas sangat
                halus (puncak 1.015, terukur <code className="doc-inline">1.00012 &rarr;
                1.01497</code>); <code className="doc-inline">animation-timeline: view(inline)</code>{' '}
                sempat dicoba supaya hanya kartu terlihat yang berdenyut, tapi terukur{' '}
                <code className="doc-inline">scale: none</code> (beku) dan scroll-timeline di
                dalam strip horizontal bersarang adalah hal yang paling sering gagal
                diam-diam. Section dapat latar{' '}
                <code className="doc-inline">--orange-soft</code> dan garis{' '}
                <code className="doc-inline">box-shadow</code> inset sebagai ganti{' '}
                <code className="doc-inline">border</code> (border menggeser isi 1px relatif
                terhadap foto kartu sebelahnya). Overlay Pasang aplikasi: akarnya{' '}
                <strong>dua instance</strong> <code className="doc-inline">useInstallPrompt</code>{' '}
                &mdash; sheet bilang tampil, kartu di dalamnya bilang sembunyi, jadi lapisan
                gelapnya dirender tanpa isi. Kini satu keputusan di sheet (prop{' '}
                <code className="doc-inline">forceVisible</code>) plus{' '}
                <code className="doc-inline">.install-prompt[hidden]</code>{' '}
                (<code className="doc-inline">display: flex</code> mementahkan atribut{' '}
                <code className="doc-inline">hidden</code>). Terukur sesudahnya: elemen tak
                dirender, hit-test badge kembali ke{' '}
                <code className="doc-inline">discount-badge__pct</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>
  )
}
