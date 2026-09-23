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
