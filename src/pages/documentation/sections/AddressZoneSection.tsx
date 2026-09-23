import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function AddressZoneSection() {
  return (
    <DocSection id="address-zone" num="33" title="Alamat & Zona — Hijazi / Syimali">
      <p className="doc-p">
        Model zona PRD aktif (`C-13`, flow <code className="doc-inline">F20</code>) hanya punya{' '}
        <strong>dua kawasan</strong>: <strong>Hijazi</strong> (pemukiman barat) dan{' '}
        <strong>Syimali</strong> (utara kampus). Alamat lolos coverage kalau{' '}
        <em>tiga</em> syarat terpenuhi bersamaan — di poligon Hijazi/Syimali, ≤2 km Haversine dari
        dapur merchant, dan merchant mengaktifkan zona itu
        (<code className="doc-inline">is_active_hijazi</code> /{' '}
        <code className="doc-inline">is_active_syimali</code>). Di luar itu checkout diblokir
        sebelum pembayaran.
      </p>
      <p className="doc-p">
        Pita radius <strong>A/B/C 600 m / 1,5 km / 2 km + tarif 5.000 / 9.000 / 13.000</strong>{' '}
        adalah model <code className="doc-inline">radius-mvp-legacy</code> yang sudah{' '}
        <code className="doc-inline">superseded</code>. Kode repo sudah tidak memakainya lagi;
        kalau menemukan sisa penyebutan “Zona A/B/C” di layar, itu bug, bukan aturan.
      </p>
      <DocCode lang="typescript">
        {`ZoneId = 'hijazi' | 'syimali'        // bukan lagi 'A' | 'B' | 'C'
DELIVERY_ZONES                        // { id, label, area }
merchantDeliveryConfig                // mode, maxKm, isActiveHijazi/Syimali, ongkirIdr
zoneFor(address) / deliveryFeeFor(address) / isDeliverable(address)`}
      </DocCode>
      <h3 className="doc-h3">Zona dihitung server, layar hanya menampilkan</h3>
      <p className="doc-p">
        <code className="doc-inline">Address.zone</code> adalah <em>snapshot</em> hasil validasi
        server (poligon + jarak + flag merchant); <code className="doc-inline">null</code> berarti
        di luar coverage. Layar tidak menghitung ulang zona dari jarak — helper di{' '}
        <code className="doc-inline">src/data/merchant.ts</code> hanya membaca snapshot itu dan
        memeriksa flag merchant. Ini menjaga aturan flow F20: perhitungan di luar repo, JSX tidak
        mengarang angka.
      </p>
      <p className="doc-p">
        <strong>Ongkir 100% milik merchant</strong> (<code className="doc-inline">C-07</code>) —
        platform tidak mengambil bagian. Nilainya satu angka per merchant
        (<code className="doc-inline">merchantDeliveryConfig.ongkirIdr</code>); tier{' '}
        <code className="doc-inline">feeByDistance</code> /{' '}
        <code className="doc-inline">feeByArea</code> masih{' '}
        <code className="doc-inline">UNRESOLVED</code> di flow F20, jadi angka mock di repo ini
        adalah placeholder dan bukan tarif aktif.
      </p>
      <h3 className="doc-h3">CRUD alamat lengkap</h3>
      <p className="doc-p">
        Layar <code className="doc-inline">/customer/address-selection</code> menangani{' '}
        <strong>tambah, ubah, hapus, dan penunjukan alamat utama</strong>, plus peta pemilih titik
        (<code className="doc-inline">AddressMapPicker</code>, mode <code className="doc-inline">picker</code>)
        yang menghitung ulang coverage lewat <code className="doc-inline">resolveCoverage()</code>{' '}
        setiap pin digeser. Alamat utama (<code className="doc-inline">Address.isDefault</code>)
        dipilih otomatis saat checkout dan tidak bisa dicabut tanpa menunjuk pengganti. Layar ini
        bisa dibuka dari Profil → <em>Alamat Pengantaran</em> dan dari tombol <em>Ubah</em> di
        Checkout — sebelumnya rutenya hanya bisa dijangkau lewat URL langsung.
      </p>
      <p className="doc-p">
        <strong>Catatan demo:</strong> alamat <em>Rumah Orang Tua</em> sengaja di luar coverage
        (2,4 km) supaya jalur blokir “di luar area antar” bisa diperiksa, dan{' '}
        <em>Tambah Alamat</em> mulai dari <code className="doc-inline">DEFAULT_NEW_ADDRESS_PIN</code>{' '}
        yang sudah berada di dalam zona Hijazi — geser pinnya untuk melihat status coverage berubah.
      </p>
    </DocSection>
  )
}
