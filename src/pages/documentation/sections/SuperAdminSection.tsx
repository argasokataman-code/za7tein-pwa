import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function SuperAdminSection() {
  return (
    <DocSection id="superadmin" num="34" title="Konsol Super Admin (SA) — Website Penuh">
      <p className="doc-p">
        <strong>Super Admin adalah role terpisah</strong>, bukan halaman di dalam panel CS.
        Keputusan PO 2026-09-23 (<code className="doc-inline">decision-irbid-mvp.md</code>)
        menetapkannya sebagai <strong>website penuh non-PWA</strong> dengan prefix{' '}
        <code className="doc-inline">/superadmin</code>, dipakai owner &amp; team dari desktop.
        Flow-nya <code className="doc-inline">F22</code>.
      </p>

      <h3 className="doc-h3">Pengecualian lebar yang disengaja</h3>
      <p className="doc-p">
        Konsol ini <strong>tidak</strong> memakai kolom 430px seperti keempat role PWA. Itu
        keputusan sadar, bukan kebocoran: SA memakai dashboard bertabel dan matriks izin, yang
        tidak terbaca di kolom ponsel. Shell-nya{' '}
        <code className="doc-inline">.sa-root</code> (sidebar 248px + konten sampai 1180px), dan
        aturan lama yang mengunci <code className="doc-inline">body &gt; div</code> ke{' '}
        <code className="doc-inline">--shell-max</code> dibatalkan khusus saat{' '}
        <code className="doc-inline">#root</code> memuat <code className="doc-inline">.sa-root</code>{' '}
        — pola yang sama dengan <code className="doc-inline">.doc-root</code>. Di bawah 900px
        sidebar berubah jadi bilah atas yang bisa digeser mendatar, jadi konsol tetap terpakai di
        layar sempit.
      </p>
      <DocCode lang="text">
        {`/superadmin          konsol SA — sidebar + konten penuh, tanpa MobileDeviceFrame
/admin               panel CS  — PWA 430px, tetap seperti role lain
manifest             dilepas di /superadmin (non-PWA, tidak ditawarkan untuk install)`}
      </DocCode>

      <h3 className="doc-h3">Batas CS dan SA</h3>
      <p className="doc-p">
        CS <strong>menjalankan</strong> operasi harian: approval tenant, putusan sengketa level-1,
        dan blacklist COD — semuanya di <code className="doc-inline">/admin/*</code>. SA{' '}
        <strong>mengonfigurasi platform dan mengawasi</strong>: master zona, role &amp; permission,
        audit trail, laporan pajak, saldo keuntungan, kill switch, dan banding sengketa. Top-up
        dan payout customer/merchant berjalan <em>self-service</em> oleh sistem — SA hanya
        memantau ledger-nya, tidak mengesahkan.
      </p>

      <h3 className="doc-h3">Dua angka uang yang paling mudah tertukar</h3>
      <p className="doc-p">
        <strong>Saldo keuntungan platform</strong> = fee terkumpul (0,37 JOD/order) dikurangi
        biaya operasional, PPh final 0,5%, dan penarikan sebelumnya. Hanya dana ini yang boleh
        ditarik SA. <strong>Kewajiban platform</strong> = saldo wallet customer + merchant + tips
        kurir yang belum di-payout — itu uang user, tidak pernah bisa ditarik SA. Keduanya
        ditampilkan berdampingan di Ringkasan supaya tidak tertukar.
      </p>
      <DocCode lang="typescript">
        {`profitBalance(profit)   // fee − biaya − PPh final − withdrawn  → boleh ditarik
totalLiability(liab)    // customer + merchant + tips kurir        → tidak boleh disentuh
feeGrossFor(orders)     // orders × PLATFORM_FEE_JOD (0,37)
pphFinalFor(fee)        // 0,5% — PPH_FINAL_PERCENT (placeholder, OQ-17/18)`}
      </DocCode>

      <h3 className="doc-h3">Audit trail menjangkau kerja CS</h3>
      <p className="doc-p">
        Semua aksi konsol tercatat append-only: aksi SA lewat reducer{' '}
        <code className="doc-inline">superAdminSlice</code>, aksi CS lewat jembatan audit berupa
        satu middleware di <code className="doc-inline">src/store/index.ts</code>. Jembatan itu
        memetakan tiap aksi <code className="doc-inline">admin/*</code> yang sudah ada ke satu
        baris audit, jadi delapan halaman CS tidak perlu disentuh satu per satu dan tidak ada aksi
        CS yang lolos dari pengawasan.
      </p>

      <h3 className="doc-h3">Catatan demo &amp; yang belum final</h3>
      <p className="doc-p">
        Master zona digambar di <strong>kanvas SVG skematik</strong> (koordinat 0..100), bukan peta
        ber-tile: tile peta selalu URL eksternal dan repo ini melarang aset gambar eksternal
        (AGENTS.md §6). Geometri asli milik backend — layar SA hanya menggeser titik lalu
        menyimpan. Kill switch dan penarikan keuntungan mengubah state demo; tidak ada uang
        bergerak.
      </p>
      <p className="doc-p">
        Yang tetap <code className="doc-inline">UNRESOLVED</code> dan karena itu tidak dikarang di
        layar: tarif pajak final (OQ-2/3/4, OQ-17/18 — angka di sini placeholder berlabel),
        jumlah admin/operator konkret (OQ-30 sudah dijawab: akun dibuat SA, role per kebutuhan),
        dan jadwal settlement liability.
      </p>
    </DocSection>
  )
}
