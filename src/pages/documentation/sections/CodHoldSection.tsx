import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function CodHoldSection() {
  return (
    <DocSection id="cod-hold" num="25" title="Hold COD via Wallet">
      <p className="doc-p">
        Lifecycle hold COD (milestone M4, flow <code className="doc-inline">F2</code>) tampil di
        detail order — layar yang sama dipakai lima rute order — tapi hanya untuk pesanan COD.
        Metodenya dibaca dari store, jadi detail order tidak menampilkan hold yang tidak berlaku.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Dipicu oleh</th>
              <th>Efek saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">held</code>
              </td>
              <td>Order COD dibuat</td>
              <td>
                <strong>available</strong> turun, <strong>pending</strong> naik
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">cut</code>
              </td>
              <td>Kurir ditugaskan (status order live: siap/diantar)</td>
              <td>Tak berubah — potongan dikunci sampai OTP</td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">settled</code>
              </td>
              <td>Order selesai (OTP terverifikasi, live)</td>
              <td>
                Dana keluar dari <strong>pending</strong>
              </td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">released</code>
              </td>
              <td>Order dibatalkan sebelum kurir ditugaskan</td>
              <td>Kembali ke <strong>available</strong>, tanpa potongan</td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">reversed</code>
              </td>
              <td>Order dibatalkan sesudah kurir ditugaskan</td>
              <td>Dikembalikan lewat entry reversal</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">Satu transisi, satu entry</h3>
      <p className="doc-p">
        Setiap perpindahan menambah satu entry append-only di{' '}
        <code className="doc-inline">cart.holdLedger</code>, dengan nama event yang sama seperti
        kontrak BE (<code className="doc-inline">hold_created</code>,{' '}
        <code className="doc-inline">hold_cut</code>, <code className="doc-inline">hold_settled</code>,{' '}
        <code className="doc-inline">hold_released</code>,{' '}
        <code className="doc-inline">hold_reversed</code>) dan waktu kejadiannya. Entry lama tidak
        pernah diubah; pembatalan sesudah match bukan penghapusan, melainkan entry baru.
      </p>
      <DocCode lang="typescript">
        {`createOrderHold({ amountIdr })  // none → held   (saat order COD dibuat)
matchCourier()                  // held → cut    (status order → siap/diantar)
settleOrderHold()               // cut  → settled(status order → selesai)
cancelOrder()                   // held → released / cut → reversed (batal)`}
      </DocCode>
      <p className="doc-p">
        Di layar customer, transisi hold mengikuti status order yang live (realtime{' '}
        <code className="doc-inline">orders.status</code>): kurir ditugaskan →{' '}
        <code className="doc-inline">cut</code>, order selesai → <code className="doc-inline">settled</code>.
        Customer tetap punya satu aksi sendiri, <strong>Batalkan pesanan</strong> (F1/F2): sebelum
        kurir ditugaskan → <code className="doc-inline">released</code>, sesudahnya →{' '}
        <code className="doc-inline">reversed</code>, sekaligus menulis{' '}
        <code className="doc-inline">orders.status = canceled</code> lewat jalur tulis yang sama
        dengan merchant/kurir. Gema realtime menandai terminal ini di layar customer (tahap BE tak
        punya nilai batal untuk customer, jadi ditandai terpisah, bukan ditebak).
      </p>
      <h3 className="doc-h3">Hold butuh saldo, bukan cuma gate</h3>
      <p className="doc-p">
        Gate 3,5 JOD cuma ambang akun baru. Karena COD mengambil dana dari wallet, tombol bayar
        juga mati kalau saldo tersedia kurang dari total order, dengan keterangan berapa yang
        perlu di-hold. Kalau tidak, hold akan menabrak saldo dan mock menampilkan angka yang
        mustahil.
      </p>
      <p className="doc-p">
        Ledger hold ini murni state demo — di produksi tiap entry jadi baris{' '}
        <code className="doc-inline">ledger_entries</code> double-entry dan reversal dibuat oleh
        backend, bukan UI (R-LEDGER-01).
      </p>
    </DocSection>
  )
}
