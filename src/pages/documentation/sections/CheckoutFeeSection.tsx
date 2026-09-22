import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function CheckoutFeeSection() {
  return (
    <DocSection id="checkout-fee" num="23" title="Fee Checkout & Gate Saldo">
      <p className="doc-p">
        Fee platform bersifat <strong>flat, bukan persen</strong>, dan PRD menetapkannya dalam
        JOD (<code className="doc-inline">R-FEE-01</code>, flow <code className="doc-inline">F4</code>):
        merchant <strong>0,15 JOD</strong> + customer <strong>0,22 JOD</strong> ={' '}
        <strong>0,37 JOD</strong> per order. Keduanya berlaku untuk <em>semua</em> metode,
        termasuk COD cash dan transfer manual legacy (<code className="doc-inline">OQ-25</code>,
        PO 2026-09-22).
      </p>
      <p className="doc-p">
        Karena state dan perhitungan repo ini IDR (lihat bagian Mata Uang), dua konstanta JOD itu
        diturunkan ke IDR sekali di <code className="doc-inline">src/data/merchant.ts</code>,
        bukan ditulis dua kali:
      </p>
      <DocCode lang="typescript">
        {`PLATFORM_FEE_CUSTOMER_JOD   = 0.22            // kontrak PRD
PLATFORM_FEE_CUSTOMER_IDR   = jodToIdr(0.22)  // Rp5.060 — yang dipakai UI
MIN_TOPUP_NEW_ACCOUNT_IDR   = jodToIdr(3.5)   // Rp80.500 — ambang gate`}
      </DocCode>
      <p className="doc-p">
        Checkout dan Payment Amount menampilkan baris <strong>Biaya Layanan</strong> di antara
        ongkir dan diskon, dan total selalu{' '}
        <code className="doc-inline">subtotal + ongkir + fee customer</code>. Fee merchant
        dipotong saat settle, bukan di checkout — layarnya menyusul di M4.
      </p>
      <h3 className="doc-h3">Gate saldo awal menahan langkah, bukan cuma memberi pesan</h3>
      <p className="doc-p">
        Aturan PRD: akun wajib punya minimal <strong>3,5 JOD</strong> sebelum bisa order
        (<code className="doc-inline">R-TOPUP-01</code>), berlaku semua metode — bukan hanya
        kalau bayar pakai saldo. Predikatnya satu fungsi murni,{' '}
        <code className="doc-inline">needsTopUpGate(availableIdr)</code>, dan di layar ia
        mematikan tombol: <em>Lanjut Bayar</em> di Checkout dan <em>Pesan/Bayar</em> di Payment
        Amount, dengan kartu peringatan <code className="doc-inline">WalletTopUpGate</code> yang
        menyebut saldo sekarang dan ambangnya. Saldo tepat di ambang dinyatakan lolos
        (<code className="doc-inline">&gt;=</code>).
      </p>
      <p className="doc-p">
        <strong>Catatan demo:</strong> saldo mock sengaja ditaruh di bawah ambang (Rp40.000 ≈
        1,74 JOD) supaya gate ini benar-benar terlihat — itu memang keadaan akun baru. Layar
        top-up yang membuka gate-nya ada di M3; sebelum itu, gate hanya menjelaskan kenapa
        pembayaran tertahan.
      </p>
    </DocSection>
  )
}
