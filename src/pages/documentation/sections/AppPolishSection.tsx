import { DocSection } from '../DocSection'

/**
 * Perbaikan bentuk layar yang sudah ada: antrean merchant, form sengketa, dan
 * layar pasca-order. Dipisah dari ChangelogSection (audit rute & CRUD
 * 2026-09-23) supaya tiap bagian punya satu topik dan tidak ada yang melewati
 * batas 700 baris — ChangelogSection sempat 716 baris waktu catatan ini
 * ditumpuk ke tabelnya.
 */
export function AppPolishSection() {
  return (
    <DocSection id="app-polish" num="37" title="Perbaikan Bentuk App (2026-09-24)">
      <p className="doc-p">
        Bukan fitur baru: layar yang sudah jalan diberi bentuk app. Tiga baris di bawah adalah
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
          </tbody>
        </table>
      </div>
    </DocSection>
  )
}
