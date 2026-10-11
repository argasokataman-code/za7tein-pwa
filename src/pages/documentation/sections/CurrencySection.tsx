import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function CurrencySection() {
  return (
    <DocSection id="currency" num="22" title="Mata Uang — IDR + JOD">
      <p className="doc-p">
        Satu aturan menutup seluruh tampilan nominal (<code className="doc-inline">R-CURR-01</code>,
        flow <code className="doc-inline">F10</code>): <strong>IDR adalah source of truth</strong>,
        JOD <strong>hanya untuk tampilan</strong>. Semua nominal di state, mock, dan ledger
        disimpan IDR; keputusan produk yang membatalkan Wise itu menegaskan tidak ada uang
        menyentuh JOD. Jangan pernah menyimpan nominal JOD sebagai nilai transaksi — di situ
        pembulatan mulai menumpuk.
      </p>
      <p className="doc-p">
        Padanannya dipasang di layer tampilan saja, 2 desimal, lewat dua formatter di{' '}
        <code className="doc-inline">src/data/currency.ts</code>:
      </p>
      <DocCode lang="typescript">
        {`money(25000)      // "Rp25.000 · ±1,09 JOD"  — pasangan IDR + JOD
moneyPlain(25000) // "Rp25.000"                — IDR saja, tempat sempit
moneyFromJod(3.5) // "Rp80.500 · ±3,50 JOD"    — dari angka yang disimpan JOD
jod(1.09)         // "1,09 JOD"`}
      </DocCode>
      <p className="doc-p">
        Helper pasangan di <code className="doc-inline">data/currency.ts</code> kini dipakai{' '}
        <strong>konsol Super Admin</strong> (tabel pajak/ledger) dan untuk hitungan murni{' '}
        <code className="doc-inline">jod()</code> / <code className="doc-inline">idrToJod()</code>.{' '}
        Layar peran lain memakai hook <code className="doc-inline">useMoney()</code> (di bawah),
        yang menampilkan satu mata uang, bukan pasangan. Nol tetap dilewatkan tanpa padanan di
        helper pasangan.
      </p>
      <p className="doc-p">
        Konsol CS juga menampilkan pasangan IDR + JOD sejak 2026-09-23. Angka mock-nya memang
        ditulis dalam JOD (liability, deposit, nilai order sengketa), jadi konversinya lewat{' '}
        <code className="doc-inline">moneyFromJod()</code> — sekali di{' '}
        <code className="doc-inline">currency.ts</code>, bukan diulang di tiap layar. Sebelumnya
        konsol ini JOD-only, yang menyalahi <code className="doc-inline">R-CURR-01</code>: IDR
        adalah source of truth dan JOD cuma tampilan.
      </p>
      <h3 className="doc-h3">Sakelar mata uang (IDR/JOD)</h3>
      <p className="doc-p">
        Layar customer, merchant, dan kurir menampilkan <strong>satu mata uang
        saja</strong> sesuai pilihan pengguna, bukan pasangan IDR + JOD. Pilihannya{' '}
        <strong>per peran</strong> (kunci <code className="doc-inline">auth.role</code>) dan
        disimpan di <code className="doc-inline">localStorage</code> lewat slice{' '}
        <code className="doc-inline">preferences</code> (preferensi klien, tidak ada
        padanannya di DB). Default <strong>JOD</strong>; peran yang belum memilih tetap JOD.
      </p>
      <p className="doc-p">
        Formatnya lewat hook <code className="doc-inline">useMoney()</code> (
        <code className="doc-inline">src/hooks/useMoney.ts</code>) yang mengembalikan{' '}
        <code className="doc-inline">money</code>, <code className="doc-inline">moneyPlain</code>,
        dan <code className="doc-inline">moneyFromJod</code> dengan nama sama seperti helper data,
        jadi call-site cukup menukar impor + satu baris hook, bukan tiap pemanggilan.
      </p>
      <p className="doc-p">
        Tombolnya komponen <code className="doc-inline">CurrencyToggle</code>, dan{' '}
        <strong>hanya dipasang di hero beranda tiap peran</strong> (customer/merchant/kurir) —
        satu sakelar mengatur semua halaman peran itu, karena nilainya dibaca lewat{' '}
        <code className="doc-inline">useMoney()</code> di mana-mana. Jangan menanamnya di header
        atau layar lain (dulu tersebar di ~30 titik, salah penempatan). Tiap perubahan memunculkan
        toast konfirmasi bahwa pilihan tersimpan.
      </p>
      <h3 className="doc-h3">Kurs live, sehari sekali</h3>
      <p className="doc-p">
        Rate IDR↔JOD tidak lagi mock tetap. Sumber live:{' '}
        <code className="doc-inline">fawazahmed0/exchange-api</code> — JSON statis di CDN
        jsDelivr (mirror: <code className="doc-inline">latest.currency-api.pages.dev</code>),
        tanpa API key dan tanpa backend. Ini menutup <code className="doc-inline">OQ-26</code>{' '}
        (provider kurs). Sync berjalan <strong>sehari sekali</strong> (TTL 24 jam): hook{' '}
        <code className="doc-inline">useLiveRate()</code> memicu{' '}
        <code className="doc-inline">refreshLiveRate()</code> sekali per sesi; rate basi → fetch,
        rate segar → tidak ada permintaan. Gagal fetch → <strong>rate terakhir dipakai</strong>{' '}
        (cache <code className="doc-inline">localStorage</code> atau mock 1 JOD = Rp23.000),
        transaksi tidak diblokir. Umur maksimal fallback masih{' '}
        <code className="doc-inline">UNRESOLVED</code> (<code className="doc-inline">OQ-28</code>).
      </p>
      <p className="doc-p">
        Tombol <code className="doc-inline">LiveCurrencyButton</code> (ikon koin) dan sakelar
        IDR/JOD duduk di <strong>kaki hero</strong> tiap beranda (
        <code className="doc-inline">.hero-currency-row</code>, dipisah garis tipis, berlabel
        &ldquo;Mata uang tampilan&rdquo;), bukan di baris atas dan bukan baris mengambang di
        tengah hero — baris atas tetap avatar · lokasi · lonceng. Menekan tombol koin membuka
        bottom sheet <strong>&ldquo;Detail Kurs Live&rdquo;</strong>: pasangan IDR↔JOD, sumber,
        waktu sync terakhir, jadwal pembaruan (otomatis tiap 24 jam), disclaimer, dan tombol{' '}
        <strong>&ldquo;Perbarui sekarang&rdquo;</strong> untuk memaksa sync (memutar ikon + toast
        hasil). Label di layar uang (checkout) menampilkan rate terkini + sync terakhir +{' '}
        <code className="doc-inline">kurs estimasi, mengikuti kurs harian</code>.
      </p>
      <p className="doc-p">
        <strong>Konsol Super Admin tetap pasangan dua baris</strong> (
        <code className="doc-inline">MoneyPair</code> + <code className="doc-inline">money</code>{' '}
        dari <code className="doc-inline">data/currency.ts</code>): tabel pajak dan ledger butuh
        kedua mata uang berdampingan, jadi sengaja tidak ikut sakelar.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Berkas</th>
              <th>Isi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">data/currency.ts</code>
              </td>
              <td>
                Satu-satunya sumber kurs + formatter (<code className="doc-inline">money</code>,{' '}
                <code className="doc-inline">moneyPlain</code>,{' '}
                <code className="doc-inline">moneyFromJod</code>,{' '}
                <code className="doc-inline">jod</code>,{' '}
                <code className="doc-inline">idrToJod</code>) + disclaimer. Juga rate aktif live:{' '}
                <code className="doc-inline">getExchangeRate</code>,{' '}
                <code className="doc-inline">refreshLiveRate</code>,{' '}
                <code className="doc-inline">fetchLiveRate</code>,{' '}
                <code className="doc-inline">isRateStale</code> (fallback{' '}
                <code className="doc-inline">MOCK_EXCHANGE_RATE</code>)
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">components/ui/ExchangeRateNote.tsx</code>
              </td>
              <td>
                Widget kurs: rate terkini, waktu sync terakhir, disclaimer — dipasang di
                Checkout, Payment Amount, dan layar uang panel CS (Ringkasan, Ledger, Sengketa,
                Merchant, Onboarding)
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">data/admin.ts</code>
              </td>
              <td>
                Nominal panel admin (CS) lewat hook <code className="doc-inline">useMoney()</code>{' '}
                (satu mata uang sesuai sakelar, default JOD), plus widget disclaimer di tiap
                layar uang
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">hooks/useMoney.ts</code> +{' '}
                <code className="doc-inline">components/ui/CurrencyToggle.tsx</code>
              </td>
              <td>
                Sakelar IDR/JOD per peran: hook memformat satu mata uang, tombol di{' '}
                <strong>hero beranda</strong> (customer/merchant/kurir) mengubahnya + toast
                konfirmasi. Slice <code className="doc-inline">preferences</code> menyimpan
                pilihannya di localStorage.
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">hooks/useLiveRate.ts</code> +{' '}
                <code className="doc-inline">components/ui/LiveCurrencyButton.tsx</code>
              </td>
              <td>
                Sync kurs live: hook berlangganan rate + memicu sync harian sekali per sesi,
                tombol koin di hero beranda membuka bottom sheet detail kurs + tombol &ldquo;Perbarui
                sekarang&rdquo;. Kontrak provider dicek{' '}
                <code className="doc-inline">scripts/live-rate-check.mjs</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">Disclaimer wajib, dan yang masih UNRESOLVED</h3>
      <p className="doc-p">
        Setiap tempat yang menampilkan JOD wajib dekat dengan kalimat{' '}
        <em>&ldquo;kurs estimasi, mengikuti kurs harian&rdquo;</em> — itulah isi{' '}
        <code className="doc-inline">RATE_DISCLAIMER</code>. Rate kini live (sumber{' '}
        <code className="doc-inline">fawazahmed0/exchange-api</code>, update harian), tapi tetap
        ditandai sebagai <strong>estimasi</strong>: sync harian, bukan realtime, dan jangan
        diperlakukan sebagai rate transaksi. Provider kurs kini{' '}
        <strong>diputuskan</strong> (<code className="doc-inline">OQ-26</code> tertutup). Yang
        masih terbuka dan <strong>tidak boleh ditebak</strong>: umur maksimal fallback rate (
        <code className="doc-inline">OQ-28</code>). Perilaku fallback yang sudah pasti: kalau
        fetch gagal, pakai rate terakhir (cache/mock), jangan blokir transaksi.
      </p>
    </DocSection>
  )
}
