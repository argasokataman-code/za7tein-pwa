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
        Bukan fitur baru: layar yang sudah jalan diberi bentuk app. Lima baris di bawah adalah
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
          </tbody>
        </table>
      </div>
    </DocSection>
  )
}
