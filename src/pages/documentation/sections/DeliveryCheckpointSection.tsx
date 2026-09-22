import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function DeliveryCheckpointSection() {
  return (
    <DocSection id="delivery-checkpoint" num="26" title="Checkpoint Pengiriman, SLA & Auto-settle">
      <p className="doc-p">
        Verifikasi pengiriman (milestone M5, flow <code className="doc-inline">F5</code>) menambah
        stepper checkpoint, timer SLA, dan form OTP ke detail order. Komponennya{' '}
        <code className="doc-inline">DeliveryStepper</code> +{' '}
        <code className="doc-inline">DeliveryActionCard</code> dipakai <strong>dua peran</strong> —
        layar kurir (F13) dan detail order customer — supaya urutan langkah dan copy OTP tidak
        pernah berbeda antar sisi.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Langkah</th>
              <th>SLA</th>
              <th>Bukti</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ambil — merchant konfirmasi 2 arah</td>
              <td>15 menit</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Berangkat — kurir jalan</td>
              <td>30 menit</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Tiba — sampai lokasi</td>
              <td>10 menit (window OTP)</td>
              <td>GPS snapshot sekali + foto (mock)</td>
            </tr>
            <tr>
              <td>OTP 4 digit → Selesai</td>
              <td>—</td>
              <td>Kode demo tersimpan di data, validator di layar</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">Timer dihitung dari kejadian, bukan angka karangan</h3>
      <p className="doc-p">
        Saat checkpoint maju, waktu mulainya disimpan ISO di{' '}
        <code className="doc-inline">cart.deliveryCheckpointAt</code>; hitung mundurnya berasal dari
        selisih waktu nyata (<code className="doc-inline">useTick</code>), jadi halaman yang dibuka
        lama benar-benar menunjukkan sisa waktu yang menyusut, dan lewat batas ditandai{' '}
        <em>&ldquo;Lewat SLA — tim CS ditandai otomatis&rdquo;</em>. Tidak ada timer yang diputar
        ulang tiap render.
      </p>
      <DocCode lang="typescript">
        {`advanceDelivery({ gps })   // masuk → ambil → berangkat → tiba (GPS disimpan sekali)
completeDelivery()         // tiba → selesai, hanya setelah OTP benar`}
      </DocCode>
      <h3 className="doc-h3">Auto-settle: order tidak boleh menggantung</h3>
      <p className="doc-p">
        F5 menyebut skenario terburuknya: saldo beku karena order pending selamanya. Karena itu
        saat langkah <code className="doc-inline">tiba</code> melewati window OTP 10 menit,
        halaman menandai <strong>auto-settle aktif</strong> — bukan diam saja. OTP yang benar juga
        menutup hold COD yang sudah <code className="doc-inline">cut</code>, karena serah terima
        fisiknya cuma satu.
      </p>
      <p className="doc-p">
        Angka 15/30/10 masih sementara (PO 2026-09-22) dan menunggu data rute Irbid —{' '}
        <code className="doc-inline">OQ-13</code>; penalti customer lalai juga belum final (
        <code className="doc-inline">OQ-14</code>), jadi tidak ada angka penalti yang dikarang.
        Tombol checkpoint di sisi customer adalah <strong>aksi demo</strong>; di produksi aksi itu
        milik kurir.
      </p>
    </DocSection>
  )
}
