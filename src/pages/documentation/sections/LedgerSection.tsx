import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function LedgerSection() {
  return (
    <DocSection id="ledger" num="30" title="Ledger & Liability">
      <p className="doc-p">
        R-LEDGER-01 (milestone M9, flow <code className="doc-inline">F7</code>) punya dua sisi di
        panel CS: <strong>ledger</strong> (<code className="doc-inline">/admin/ledger</code>) dan{' '}
        <strong>agregat kewajiban</strong> (<code className="doc-inline">/admin</code>).
      </p>
      <h3 className="doc-h3">Agregat yang ikut bergerak</h3>
      <p className="doc-p">
        Kewajiban platform = saldo wallet customer + merchant + tips kurir yang belum di-payout.
        Porsi customer-nya diselaraskan dengan wallet demo yang sedang aktif lewat{' '}
        <code className="doc-inline">aggregateLiability</code>: top-up, hold, settlement, dan
        payout menggeser angkanya dengan selisih yang sama seperti yang terlihat di layar wallet.
        Sebelumnya angka itu statis, sehingga Ringkasan bisa bilang <em>&ldquo;Xendit
        cukup&rdquo;</em> sementara saldo demo sudah berubah — bentuk kebohongan yang sama seperti
        tombol yang tidak melakukan apa-apa.
      </p>
      <DocCode lang="typescript">
        {`aggregateLiability(base, liveWalletIdr)
  // customerWallets = base + (wallet demo − saldo awal demo)
  // totalLiability = customer + merchant + tips kurir
  // liabilityGap  = saldo Xendit − total; negatif → flag kurang dana`}
      </DocCode>
      <p className="doc-p">
        Flag-nya tetap perbandingan biasa: kalau saldo Xendit mock di bawah total kewajiban,
        Ringkasan menandai kekurangannya beserta nominalnya. Gaji kurir tidak dihitung di sini —
        kurir digaji merchant, yang lewat platform hanya tips (C-06).
      </p>
      <h3 className="doc-h3">Append-only, tanpa tombol sunting</h3>
      <p className="doc-p">
        Layar ledger tidak punya aksi ubah atau hapus sama sekali — koreksi dilakukan dengan
        menambah entry baru (reversal), bukan menyunting yang lama. Putusan sengketa yang mengubah
        saldo menambah satu entry di sini (M6), dan transisi hold order yang sedang berjalan
        ditampilkan sebagai daftar terpisah dengan nominal + waktu.
      </p>
      <p className="doc-p">
        Untuk hold sengaja <strong>tidak</strong> digambar arah debit-credit-nya: pasangan
        double-entry-nya belum diputuskan, dan mengarang arah di layar akuntansi lebih berbahaya
        daripada menampilkan faktanya. Yang ditampilkan: setiap transisi memang satu entry, dan
        entry itu tidak bisa disunting.
      </p>
      <p className="doc-p">
        Belum ada di repo ini: rekonsiliasi harian Xendit vs ledger (butuh backend) dan pemisahan
        akun e-money (<code className="doc-inline">OQ-15</code>,{' '}
        <code className="doc-inline">OQ-19</code>).
      </p>
    </DocSection>
  )
}
