import { DocSection } from '../DocSection'

/**
 * Catatan perbaikan integrasi rute & CRUD (2026-09-23). Ditulis sebagai satu
 * section supaya daftar "apa yang dulu mati / setengah jadi" bisa diaudit tanpa
 * memburu riwayat commit.
 */
export function ChangelogSection() {
  return (
    <DocSection id="changelog" num="35" title="Perbaikan Integrasi Rute & CRUD (2026-09-23)">
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
