import { DocSection } from '../DocSection'

/**
 * Dua detail konsol merchant yang sebelumnya tidak punya permukaan:
 * jam operasional per hari (Setelan) dan bukti transfer di detail order.
 * Ditulis 2026-10-25 bersama implementasinya.
 */
export function MerchantFlowDetailSection() {
  return (
    <DocSection id="merchant-flow-detail" num="39" title="Jam Operasional & Bukti Transfer">
      <p className="doc-p">
        Konsol merchant punya dua tempat yang sebelumnya hanya menampilkan nilai tanpa cara mengubah
        atau memeriksanya: jam operasional di Setelan dan bukti transfer di detail order. Keduanya
        sekarang punya permukaan, dengan batas yang ditulis apa adanya.
      </p>

      <h3 className="doc-h3">Jam operasional per hari</h3>
      <p className="doc-p">
        Kartu Setelan menampilkan jam <strong>hari ini</strong> lalu membuka panel berisi tujuh baris
        (Senin sampai Minggu). Tiap baris punya dua input jam native dan tombol{' '}
        <code className="doc-inline">Libur</code>; jam yang tutupnya sebelum jam buka ditolak dengan
        pesan yang menyebut harinya. Aturan murninya di{' '}
        <code className="doc-inline">src/data/operatingHours.ts</code> (
        <code className="doc-inline">hoursForDay</code>, <code className="doc-inline">hoursLabel</code>,{' '}
        <code className="doc-inline">invalidHoursRows</code>), dengan self-check{' '}
        <code className="doc-inline">scripts/hours-check.mjs</code>.
      </p>
      <p className="doc-p">
        Batasnya: server hanya punya satu pasang kolom{' '}
        <code className="doc-inline">merchants.open_time</code>/
        <code className="doc-inline">close_time</code>, jadi jadwal tujuh hari hidup di state sesi.
        Saat disimpan, jam hari berjalan ikut ditulis lewat{' '}
        <code className="doc-inline">setStoreHours</code> supaya sisi pelanggan tidak membaca jam
        yang bertentangan. Jadwal penuh per hari masih <strong>UNRESOLVED</strong>: butuh kolom
        jadwal di BE.
      </p>

      <h3 className="doc-h3">Bukti transfer di detail order</h3>
      <p className="doc-p">
        Order metode <code className="doc-inline">transfer</code> kini menampilkan bagian{' '}
        <em>Bukti transfer</em> di sheet detail: thumbnail yang bisa dibuka penuh lewat{' '}
        <code className="doc-inline">EvidencePhotos</code> (komponen yang sama dengan sengketa CS,
        dipindah ke <code className="doc-inline">components/ui/</code>). Kalau buktinya tidak ada,
        kotak kuning menulis bahwa pelanggan belum melampirkan bukti, dan label tombol berubah
        menjadi <em>Terima tanpa bukti</em> supaya merchant tidak mengira sudah memeriksa sesuatu.
        Gerbang <code className="doc-inline">paymentGate</code> pindah ke{' '}
        <code className="doc-inline">src/data/merchantOrders.ts</code> karena dipakai dua tempat.
      </p>
      <p className="doc-p">
        <strong>UNRESOLVED:</strong> PRD aktif (R-CUS-PAY,{' '}
        <code className="doc-inline">analysis.md:24</code>) meminta metode{' '}
        <code className="doc-inline">transfer</code> dibuang atau dibatasi, jadi permukaan ini
        melayani order legacy. Tabel <code className="doc-inline">orders</code> juga belum punya
        kolom bukti, sehingga <code className="doc-inline">paymentProof</code> hanya terisi kalau BE
        menyediakan <code className="doc-inline">payment_proof_url</code>. Keputusan tercatat di{' '}
        <code className="doc-inline">
          docs/product/prd/versions/sa7tein-mvp-2026-10-11/decision-legacy-transfer-proof.md
        </code>
        .
      </p>
    </DocSection>
  )
}
