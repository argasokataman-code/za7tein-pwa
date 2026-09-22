import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function WalletSection() {
  return (
    <DocSection id="wallet" num="24" title="Wallet — Saldo, Top-up, Tarik">
      <p className="doc-p">
        Tiga layar wallet customer (milestone M3, flow <code className="doc-inline">F3</code>{' '}
        top-up &amp; <code className="doc-inline">F6</code> penarikan):{' '}
        <code className="doc-inline">/wallet</code> (saldo),{' '}
        <code className="doc-inline">/wallet/top-up</code>,{' '}
        <code className="doc-inline">/wallet/payout</code>. Masuknya dari baris{' '}
        <em>Saldo Sa7tein</em> di <code className="doc-inline">/profile</code>, dan kartu gate di
        checkout punya tombol ke sini — gate tanpa jalan keluar cuma memblokir.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Layar</th>
              <th>Isi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">WalletBalance</code>
              </td>
              <td>
                Saldo <strong>tersedia</strong> + <strong>hold order berjalan</strong>, catatan
                gate kalau di bawah ambang, pintu ke top-up dan penarikan
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">WalletTopUp</code>
              </td>
              <td>
                Preset 3,5 / 5 / 10 JOD (diturunkan ke IDR), kanal Xendit VA atau QRIS, riwayat
                top-up + tombol simulasi webhook
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">WalletPayout</code>
              </td>
              <td>
                Preset penarikan dalam IDR + &ldquo;Semua saldo&rdquo;, riwayat penarikan,
                tempat fee yang belum final
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">Alurnya sengaja dua langkah</h3>
      <p className="doc-p">
        Top-up mengikuti state PRD, bukan langsung menambah saldo: request membuat baris{' '}
        <code className="doc-inline">pending</code>, dan saldo baru naik saat webhook{' '}
        <code className="doc-inline">top_up_completed</code> datang. Karena Xendit tidak nyata,
        langkah itu diwakili tombol <em>Simulasi webhook</em> yang memanggil aksi{' '}
        <code className="doc-inline">settleTopUp</code>.
      </p>
      <DocCode lang="typescript">
        {`requestTopUp({ amount, channel })  // → TopUp status "pending", saldo belum naik
settleTopUp({ id })               // pengganti webhook → status "completed" + saldo naik
requestPayout({ amount })         // → Payout "pending", nominal ditahan dari available`}
      </DocCode>
      <p className="doc-p">
        Ini yang membuat gate M2 bisa dilewati: top-up 3,5 JOD yang sudah{' '}
        <code className="doc-inline">completed</code> menaikkan saldo di atas ambang, dan tombol
        checkout hidup lagi.
      </p>
      <h3 className="doc-h3">Yang belum diputuskan tidak diisi</h3>
      <p className="doc-p">
        Fee penarikan masih <code className="doc-inline">UNRESOLVED</code> (
        <code className="doc-inline">OQ-22</code>), jadi layar penarikan <strong>tidak</strong>{' '}
        memotong apa pun dan hanya menandai tempatnya (<em>&ldquo;fee menyusul&rdquo;</em>).
        Regulasi e-money dan segregated account (<code className="doc-inline">OQ-15</code>,{' '}
        <code className="doc-inline">OQ-19</code>) juga masih terbuka. Nominal ditahan begitu
        permintaan penarikan dibuat — penyederhanaan mock, bukan aturan settling produksi.
      </p>
    </DocSection>
  )
}
