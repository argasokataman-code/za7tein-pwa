import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function ConsistencySection() {
  return (
    <DocSection id="consistency" num="32" title="Konsistensi Lintas Role & Kontrak BE">
      <p className="doc-p">
        Milestone M11 menutup rangkaian v2: satu order yang sama harus terlihat masuk akal dari
        empat role, dan seluruh kontrak BE M0–M10 dikonsolidasikan sebagai bahan handoff.
      </p>
      <h3 className="doc-h3">Satu order, empat sudut pandang</h3>
      <p className="doc-p">
        Order demo memakai satu kode di semua role: <strong>SA-1041</strong> (
        <code className="doc-inline">mockOrder.code</code>). Sebelumnya layar customer memakai kode
        sendiri (<code className="doc-inline">S7-772292</code>) sementara merchant, kurir, dan
        ledger CS memakai <code className="doc-inline">SA-10xx</code> — jadi &ldquo;order yang
        sama&rdquo; sebenarnya tiga order berbeda. Sekarang: customer{' '}
        <code className="doc-inline">orderStage</code> dimulai dari <code className="doc-inline">diterima</code>,
        merchant melihat SA-1041 di tab <em>masuk</em> (<code className="doc-inline">merchantOrders</code>),
        kurir melihat tugas SA-1041 pada checkpoint <code className="doc-inline">masuk</code>{' '}
        (<code className="doc-inline">courierTasks</code> ct-1), dan ledger CS memuat{' '}
        <code className="doc-inline">cod_hold</code> untuk SA-1041.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Layar</th>
              <th>Sudut pandang</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Customer</td>
              <td>
                <code className="doc-inline">/order-placed</code>
              </td>
              <td>Journey Line (diterima → dimasak → diantar → tiba) + hold COD + checkpoint</td>
            </tr>
            <tr>
              <td>Merchant</td>
              <td>
                <code className="doc-inline">/merchant/orders</code>
              </td>
              <td>Antrean dapur (masuk → diproses → selesai) + modal &amp; insentif</td>
            </tr>
            <tr>
              <td>Kurir</td>
              <td>
                <code className="doc-inline">/courier/task/ct-1</code>
              </td>
              <td>Stepper checkpoint (Ambil → Berangkat → Tiba → OTP) + SLA</td>
            </tr>
            <tr>
              <td>CS</td>
              <td>
                <code className="doc-inline">/admin</code> +{' '}
                <code className="doc-inline">/admin/ledger</code> +{' '}
                <code className="doc-inline">/admin/disputes</code>
              </td>
              <td>Kewajiban platform, entry ledger append-only, antrean sengketa</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        Yang memindahkan uang selalu satu jalur: <code className="doc-inline">walletSlice.applyHoldEvent</code>{' '}
        untuk hold COD, <code className="doc-inline">merchantSlice</code> untuk modal &amp;
        cashback, dan <code className="doc-inline">adminSlice</code> untuk putusan sengketa.
        Agregat di panel CS mengikuti wallet demo lewat{' '}
        <code className="doc-inline">aggregateLiability</code>, jadi angkanya tidak bisa basi.
      </p>

      <h3 className="doc-h3">Kontrak BE yang dikonsolidasikan (M0–M10)</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Endpoint / event</th>
              <th>State machine</th>
              <th>Pemilik validasi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>M2/M3</td>
              <td>
                <code className="doc-inline">POST /topups</code>,{' '}
                <code className="doc-inline">POST /v3/payouts</code>, webhook{' '}
                <code className="doc-inline">top_up_completed</code>
              </td>
              <td>
                <code className="doc-inline">pending → completed | failed</code>
              </td>
              <td>Backend (idempotency-key wajib)</td>
            </tr>
            <tr>
              <td>M4</td>
              <td>
                <code className="doc-inline">hold_created</code>, <code className="doc-inline">hold_cut</code>,{' '}
                <code className="doc-inline">hold_settled</code>, <code className="doc-inline">hold_released</code>,{' '}
                <code className="doc-inline">hold_reversed</code>
              </td>
              <td>
                <code className="doc-inline">none → held → cut → settled</code>
              </td>
              <td>Backend (saldo) + UI (gerbang aksi)</td>
            </tr>
            <tr>
              <td>M5</td>
              <td>
                <code className="doc-inline">checkpoint{'{type,timestamp,evidence}'}</code>,{' '}
                <code className="doc-inline">otp{'{code,verifiedAt}'}</code>
              </td>
              <td>
                <code className="doc-inline">masuk → ambil → berangkat → tiba → selesai</code> + auto-settle 10 mnt
              </td>
              <td>UI (kode OTP) → backend menandai settle</td>
            </tr>
            <tr>
              <td>M6</td>
              <td>
                <code className="doc-inline">dispute_filed</code>, <code className="doc-inline">dispute_resolved</code>
              </td>
              <td>
                <code className="doc-inline">open → investigating → resolved_* | rejected</code>
              </td>
              <td>Tim CS; window &amp; kategori menunggu OQ-29</td>
            </tr>
            <tr>
              <td>M7</td>
              <td>
                <code className="doc-inline">gst_amount</code>, <code className="doc-inline">platform_gst</code>
              </td>
              <td>—</td>
              <td>Konsultan pajak (belum final)</td>
            </tr>
            <tr>
              <td>M8</td>
              <td>
                <code className="doc-inline">subscription{'{endpoint,keys,platform,expiresAt}'}</code>, fallback{' '}
                <code className="doc-inline">wa.me</code>
              </td>
              <td>—</td>
              <td>Device + backend push; nomor divalidasi UI (E.164)</td>
            </tr>
            <tr>
              <td>M9</td>
              <td>
                <code className="doc-inline">ledger_entries</code> (append-only, reversal = entry baru)
              </td>
              <td>—</td>
              <td>Backend; rekonsiliasi harian Xendit vs ledger</td>
            </tr>
            <tr>
              <td>M10</td>
              <td>
                <code className="doc-inline">merchant_credit_granted</code>,{' '}
                <code className="doc-inline">merchant_credit_debited</code>,{' '}
                <code className="doc-inline">rebate_tier_reached</code>,{' '}
                <code className="doc-inline">rebate_paid</code>
              </td>
              <td>
                <code className="doc-inline">tier 500 → 1.000 → 1.250</code> per periode{' '}
                <code className="doc-inline">YYYY-MM</code>
              </td>
              <td>Backend (kuota &amp; periode menunggu I-3..I-6)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <DocCode lang="typescript">
        {`// Satu sumber uang, tiga slice — jangan dicampur:
walletSlice.applyHoldEvent({ event, amountIdr })   // uang customer (IDR)
merchantSlice.credit                               // modal & cashback merchant (JOD)
adminSlice.resolveDispute({ id, resolution })      // putusan CS → 1 entry ledger`}
      </DocCode>

      <h3 className="doc-h3">Hasil ukur 390px &amp; 1440px</h3>
      <p className="doc-p">
        Dua belas layar (customer, merchant, kurir, CS, dokumentasi) diukur di kedua breakpoint:
        kolom aplikasi 430px saat jendela lebar (kiri 505px dari 1440px), jarak tepi 20px, dan
        overflow horizontal 0 di semuanya. Di 1440px ada satu elemen <code className="doc-inline">fixed</code>{' '}
        selebar 462px: itu bezel simulator ponsel (
        <code className="doc-inline">.mobile-device-frame</code>) yang memang membungkus kolom 430px
        — bukan bilah aplikasi yang menyeberang. Halaman <code className="doc-inline">/documentation</code>{' '}
        sengaja lebar penuh karena ia halaman dokumen, bukan layar aplikasi.
      </p>
      <p className="doc-p">
        Yang masih terbuka setelah M0–M11: model ongkir (PRD v2 memakai{' '}
        <code className="doc-inline">deliveryConfig</code> per-merchant, kode masih zona A/B/C),
        cakupan Super Admin sebagai role terpisah, dan seluruh daftar{' '}
        <code className="doc-inline">UNRESOLVED</code> yang tidak boleh diisi dengan tebakan.
      </p>
    </DocSection>
  )
}
