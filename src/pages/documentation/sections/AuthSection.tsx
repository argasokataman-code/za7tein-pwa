import { DocSection } from '../DocSection'

export function AuthSection() {
  return (
    <DocSection id="auth" num="36" title="Layar Masuk & Daftar (Customer + Merchant)">
      <p className="doc-p">
        Lima layar auth (<code className="doc-inline">/customer/signin</code>,{' '}
        <code className="doc-inline">/customer/signup</code>,{' '}
        <code className="doc-inline">/merchant/signin</code>,{' '}
        <code className="doc-inline">/merchant/signup</code>,{' '}
        <code className="doc-inline">/merchant/pending</code>) sekarang memakai satu kerangka:{' '}
        <code className="doc-inline">src/components/ui/AuthLayout.tsx</code>. Sebelumnya kelimanya
        menyalin markup Bootstrap hasil porting di lima tempat.
      </p>

      <h3 className="doc-h3">Kenapa diubah</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Yang diukur</th>
              <th>Sebelum</th>
              <th>Sesudah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gutter halaman</td>
              <td>
                24px (<code className="doc-inline">.screen .container</code>)
              </td>
              <td>
                <code className="doc-inline">--space-5</code> 20px
              </td>
            </tr>
            <tr>
              <td>Radius tombol</td>
              <td>
                <code className="doc-inline">--radius-pill</code> 9999px
              </td>
              <td>
                <code className="doc-inline">--radius-md</code> 10px
              </td>
            </tr>
            <tr>
              <td>Tinggi field & tombol</td>
              <td>56px (bukan token)</td>
              <td>
                <code className="doc-inline">--touch-min</code> 44px
              </td>
            </tr>
            <tr>
              <td>Penggulung</td>
              <td>
                <code className="doc-inline">overflow-y: auto</code> di{' '}
                <code className="doc-inline">.auth-content</code>
              </td>
              <td>dokumen saja (DNA §5)</td>
            </tr>
            <tr>
              <td>Copy</td>
              <td>3 dari 5 layar berbahasa Inggris</td>
              <td>Bahasa Indonesia</td>
            </tr>
            <tr>
              <td>Tombol submit di 390×844</td>
              <td>
                y=933 (<em>Buat akun</em>) & y=957 (<em>Kirim pendaftaran</em>), viewport berhenti di
                844
              </td>
              <td>y=827 dan y=838, di atas lipatan</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="doc-h3">Bentuknya dua panel</h3>
      <p className="doc-p">
        Bidang foto dari aset yang sudah ada di repo (<code className="doc-inline">public/assets/img/menu/</code>)
        lalu panel form <code className="doc-inline">--surface</code>. Tidak ada aset baru, tidak ada
        ilustrasi stok, tidak ada emoji. Tinggi foto <code className="doc-inline">clamp(132px, 18dvh, 184px)</code>{' '}
        — angka ini diturunkan dari pengukuran: pada 228px tombol submit tenggelam di bawah
        lipatan, dan foto ini dekorasi, jadi ia tidak boleh memakan tempat aksi utama. Layar status{' '}
        <code className="doc-inline">/merchant/pending</code> memakai varian polos (
        <code className="doc-inline">photo</code> kosong), bukan kerangka terpisah.
      </p>

      <h3 className="doc-h3">Kontrol palsu yang dibuang</h3>
      <p className="doc-p">
        Repo ini showcase front-end tanpa autentikasi sungguhan, jadi beberapa kontrol di layar lama
        tidak melakukan transaksi apa pun:
      </p>
      <ul className="doc-list">
        <li>
          <strong>Tombol Google/Apple/Facebook</strong> di <code className="doc-inline">/customer/signin</code>{' '}
          hanya memanggil toast &ldquo;Mode demo&rdquo; lalu pindah halaman. Logo asli di samping
          janji &ldquo;Masuk dengan Google&rdquo; tanpa backend = klaim palsu (senior-fe HG-04). Dibuang,
          tanpa pengganti.
        </li>
        <li>
          <strong>Tautan Syarat &amp; Ketentuan dan Pemberitahuan Privasi</strong> menuju{' '}
          <code className="doc-inline">href="#"</code> — dua tautan mati (HG-06). Sekarang jadi satu
          baris teks yang jujur menyebut isinya belum tersedia.
        </li>
        <li>
          <strong>Checkbox persetujuan</strong> dulu <code className="doc-inline">display: none</code>{' '}
          dengan centang tiruan, jadi tidak bisa dijangkau keyboard. Sekarang checkbox asli,
          terukur bisa difokus dan dicentang dengan Spasi.
        </li>
        <li>
          <strong>&ldquo;Lihat dashboard contoh&rdquo;</strong> di <code className="doc-inline">/merchant/pending</code>{' '}
          menuju beranda merchant asli, bukan contoh. Diganti tiga jalur yang benar-benar berfungsi.
        </li>
      </ul>

      <h3 className="doc-h3">Catatan implementasi</h3>
      <p className="doc-p">
        <strong>Shell.</strong> Kerangkanya memakai <code className="doc-inline">.app-shell</code>{' '}
        yang sama dengan seluruh aplikasi, bukan kelas baru. <code className="doc-inline">.auth</code>{' '}
        hanya penanda bentuk. Ini bukan selera: versi porting membuang kontrak shell, dan gerbang
        browser mengukur kolom dari <code className="doc-inline">.app-shell</code> — saat tidak ada,
        gerbang jatuh ke pembungkus <code className="doc-inline">#root</code> dan membaca kolom{' '}
        <strong>0px</strong>.
      </p>
      <p className="doc-p">
        <strong>Kontrol di bawah 44px.</strong> Radio zona dan checkbox persetujuan tidak lagi
        disembunyikan jadi 13×13/20×20; keduanya diberi ukuran <code className="doc-inline">--touch-min</code>{' '}
        penuh. Tautan yang hidup <em>di dalam kalimat</em> (&ldquo;Masuk&rdquo;/&ldquo;Daftar&rdquo;)
        terukur 28px dan itu pengecualian sadar: memaksanya 44px akan memecah paragraf, sedangkan
        kontrol berdiri sendiri (&ldquo;Lupa kata sandi?&rdquo;, 112×44) memakai penuh.
      </p>
      <p className="doc-p">
        <strong>Verifikasi.</strong> <code className="doc-inline">browser-gate --pwa --strict --click</code>{' '}
        lolos 10/10 di 390px dan 1440px; 11 klik nyata lewat <code className="doc-inline">Input.dispatchMouseEvent</code>{' '}
        lolos 11/11 (submit, toggle sandi, tautan, validasi, checkbox dengan keyboard, radio zona,
        tombol pending); mode offline lolos; nol tautan mati; nol exception.
      </p>
    </DocSection>
  )
}
