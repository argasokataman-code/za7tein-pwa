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
              <td>Kredit sistem — non-tunai, <strong>non-withdrawal</strong></td>
              <td>Dompet deposit merchant</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        Modal sengaja <strong>terpisah</strong> dari deposit COD 3,50 JOD dan dari wallet customer:
        yang satu kredit sistem yang tidak bisa ditarik, yang lain uang yang harus disetor. Menaruh
        semuanya di satu slice akan membuat layar customer bisa membaca uang merchant.
      </p>
      <DocCode lang="typescript">
        {`grantCredit()          // modal 5 JOD   → event merchant_credit_granted
debitCredit()          // fee 0,15 JOD   → event merchant_credit_debited
recordSettledOrder()   // +1 order settled; ambang lewat → rebate_tier_reached
payRebate()            // cashback ke dompet deposit → rebate_paid`}
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
        berikutnya, bukan dari nol — jadi bar-nya tidak melompat turun saat tier naik. Data demo
        sengaja diletakkan satu order di bawah ambang Tier 2, supaya tombol{' '}
        <em>+1 order settled</em> benar-benar menunjukkan tier berganti dan{' '}
        <code className="doc-inline">rebate_tier_reached</code> tercatat.
      </p>
      <p className="doc-p">
        Yang belum final dan karena itu tidak dikarang di UI: apakah cashback bisa ditarik (
        <code className="doc-inline">I-3</code>), definisi periode &amp; naik tier di tengah bulan (
        <code className="doc-inline">I-4</code>), kuota Founding merchant (
        <code className="doc-inline">I-5</code>), dan perlakuan sisa modal kalau merchant berhenti (
        <code className="doc-inline">I-6</code>).
      </p>
    </DocSection>
  )
}
