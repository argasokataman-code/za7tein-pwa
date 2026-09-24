import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function IncentiveSection() {
  return (
    <DocSection id="incentive" num="31" title="Insentif Merchant — Modal & Cashback Tier">
      <p className="doc-p">
        R-INCENTIVE-01 (milestone M10, flow <code className="doc-inline">F9</code>) punya dua
        mekanisme yang mudah tertukar. Keduanya tampil di Ringkasan dashboard merchant.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th></th>
              <th>Modal</th>
              <th>Cashback tier</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Besar</td>
              <td>5 JOD, sekali di awal</td>
              <td>15 / 40 / 62,5 JOD per bulan</td>
            </tr>
            <tr>
              <td>Dipakai untuk</td>
              <td>Memotong fee merchant 0,15 JOD per order (≈33 order)</td>
              <td>Dibayar akhir bulan kalau ambang order settled terlewati</td>
            </tr>
            <tr>
              <td>Masuk ke</td>
              <td>Kredit sistem — non-tunai, <strong>non-withdrawal</strong>; sisa <strong>hangus</strong> kalau merchant berhenti</td>
              <td>Dompet deposit merchant — juga <strong>non-withdrawal</strong>, hanya untuk pemakaian in-app</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        Modal sengaja <strong>terpisah</strong> dari deposit COD 3,50 JOD dan dari wallet customer:
        yang satu kredit sistem yang tidak bisa ditarik, yang lain uang yang harus disetor. Menaruh
        semuanya di satu slice akan membuat layar customer bisa membaca uang merchant.
      </p>
      <h3 className="doc-h3">Angka insentif tinggal di kode, bukan di konsol SA</h3>
      <p className="doc-p">
        Angka insentif (modal, fee dari modal, ambang tier, nilai cashback) adalah konstanta di{' '}
        <code className="doc-inline">src/data/incentive.ts</code>, dan{' '}
        <strong>sengaja tidak dijadikan konfigurasi yang bisa diubah dari konsol Super Admin</strong>.
        Percobaan memindahkannya ke <code className="doc-inline">/superadmin/incentive</code> pernah
        dibuat lalu dicabut, karena membalik arah dependensinya: PWA merchant (role yang menghadap
        pemilik warung) jadi membaca <code className="doc-inline">state.superAdmin</code> — slice
        milik konsol owner.
      </p>
      <p className="doc-p">
        Alasannya juga soal proses. <code className="doc-inline">I-4</code> (periode tier +
        perlakuan naik tier di tengah periode) dan <code className="doc-inline">I-5</code> (kuota
        &amp; durasi Founding) masih <code className="doc-inline">UNRESOLVED</code> di PRD aktif,
        dan flow <code className="doc-inline">F9</code> tidak punya node "operator mengubah
        parameter" — node-nya murni perjalanan dana:{' '}
        <code className="doc-inline">grant → debit → volume → tier → pay → deposit</code>. Kalau
        nanti PO memutuskan I-4/I-5, jawabannya masuk PRD <em>dan</em> flow dulu, baru berubah di
        kode. Layar konfigurasi yang bisa diubah kapan saja justru menyediakan jalan pintas untuk
        melewati proses itu.
      </p>
      <p className="doc-p">
        Di PWA merchant, kedua pertanyaan itu ditulis apa adanya sebagai "belum final" di{' '}
        <code className="doc-inline">/merchant/insentif</code> — bukan dijawab dengan tebakan.
      </p>
      <DocCode lang="typescript">
        {`grantCredit()          // modal 5 JOD   → event merchant_credit_granted
debitCredit()          // fee 0,15 JOD   → event merchant_credit_debited
recordSettledOrder()   // +1 order settled; ambang lewat → rebate_tier_reached
payRebate()            // cashback ke dompet deposit → rebate_paid (simulasi platform)`}
      </DocCode>
      <h3 className="doc-h3">Kenapa state-nya di merchantSlice</h3>
      <p className="doc-p">
        Milestone M10 menuliskan <code className="doc-inline">walletSlice</code> sebagai tempat
        mock-nya. Di kode ini modal dan cashback hidup di{' '}
        <code className="doc-inline">merchant.credit</code>, bersama order dan kuota merchant,
        karena <code className="doc-inline">walletSlice</code> adalah wallet customer (M3) dan
        alasannya sama seperti di atas: satu slice untuk dua pemilik uang yang berbeda membuat
        batas aktornya kabur. Bentuk field-nya tetap mengikuti kontrak BE (
        <code className="doc-inline">merchant_credit_balance</code>,{' '}
        <code className="doc-inline">rebate_period</code>,{' '}
        <code className="doc-inline">rebate_amount_jod</code>,{' '}
        <code className="doc-inline">rebate_paid_at</code>), jadi pemindahannya di backend nanti
        tidak mengubah nama apa pun.
      </p>
      <h3 className="doc-h3">Tier dan progresnya</h3>
      <p className="doc-p">
        Ambang 500 / 1.000 / 1.250 order settled menentukan tier tertinggi yang tercapai, dan
        cashbacknya 15 / 40 / 62,5 JOD. Progres dihitung dari ambang sebelumnya ke ambang
        berikutnya, bukan dari nol — jadi bar-nya tidak melompat turun saat tier naik.
      </p>
      <h3 className="doc-h3">Ringkas di beranda, rinci di /merchant/insentif</h3>
      <p className="doc-p">
        Beranda dapur hanya memuat ringkasan 186&nbsp;px: sisa modal, progres tier, dan status
        cashback periode ini, dengan satu tautan <em>Lihat rincian &amp; riwayat</em>. Riwayat
        append-only, daftar ambang, catatan <code className="doc-inline">I-4</code>/
        <code className="doc-inline">I-5</code>, dan blok simulasi pindah ke{' '}
        <code className="doc-inline">/merchant/insentif</code> (
        <code className="doc-inline">MerchantRebate.tsx</code>, layar yang memang sudah disebut
        <code className="doc-inline">analysis.md:131</code>).
      </p>
      <p className="doc-p">
        <strong>Kenapa tidak ada tombol "bayar cashback" di beranda.</strong> Menurut PRD, cashback
        adalah <em>arus kas keluar platform</em> yang dibayar di akhir bulan ke dompet deposit
        merchant, dan tidak ada jalur pencairan untuk modal maupun cashback (I-3
        non-withdrawal). Jadi pelakunya platform, bukan merchant: tombol yang menggambarkan
        merchant membayar atau menarik akan salah aktor. Kedua aksi yang tersisa di layar insentif
        diberi label <strong>Simulasi</strong> dan hanya memicu state demo (penanda tier,
        event <code className="doc-inline">rebate_paid</code>).
      </p>
      <p className="doc-p">
        Sebelumnya keduanya menumpuk di beranda: tombol <em>Bayar cashback Rp345.000 ·
        ±15,00 JOD</em> selebar 183&nbsp;px dan tinggi 56&nbsp;px berdiri sejajar dengan tombol
        demo 44&nbsp;px, di dalam kartu 539&nbsp;px (30% tinggi halaman). Beranda kini
        1.431&nbsp;px dari 1.784&nbsp;px.
      </p>
      <p className="doc-p">
        PO 2026-09-23 menutup dua pertanyaan insentif: <strong>cashback non-withdrawal</strong> (
        <code className="doc-inline">I-3</code>) — masuk dompet deposit tapi hanya bisa dipakai di
        dalam aplikasi — dan <strong>sisa modal hangus</strong> kalau merchant berhenti (
        <code className="doc-inline">I-6</code>), karena modal adalah kredit digital yang memang
        tidak bisa dicairkan. Jadi tidak ada jalur pencairan untuk modal maupun cashback; yang
        belum final tinggal definisi periode &amp; naik tier di tengah bulan (
        <code className="doc-inline">I-4</code>) dan kuota Founding merchant (
        <code className="doc-inline">I-5</code>).
      </p>
    </DocSection>
  )
}
