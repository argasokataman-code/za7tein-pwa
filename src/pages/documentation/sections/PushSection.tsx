import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function PushSection() {
  return (
    <DocSection id="push" num="29" title="Nomor WA & Push (Mock)">
      <p className="doc-p">
        R-PUSH-01 (milestone M8) menetapkan dua hal: identitas nomor WA yang tervalidasi, dan
        notifikasi push dengan fallback WhatsApp. Repo ini mengerjakan bentuknya —{' '}
        <strong>tidak ada push yang benar-benar dikirim</strong>, karena tidak ada service worker
        push di sini (lihat batas repo di bagian atas dokumen ini).
      </p>
      <h3 className="doc-h3">Satu aturan nomor, satu tempat</h3>
      <p className="doc-p">
        Validasi E.164 hidup di <code className="doc-inline">data/phone.ts</code>, bukan diulang di
        tiap form: <code className="doc-inline">isE164</code> menerima <code className="doc-inline">+962…</code>{' '}
        (Jordan) dan <code className="doc-inline">+62…</code> (Indonesia),{' '}
        <code className="doc-inline">toE164</code> menormalkan nomor lokal{' '}
        <code className="doc-inline">08xx</code> (jadi input lama tetap lolos), dan{' '}
        <code className="doc-inline">waLink</code> membentuk deep link yang dipakai tombol fallback.
        Skema <code className="doc-inline">phoneField</code> memakai fungsi yang sama, sehingga
        registrasi, masuk, dan lupa sandi tidak bisa berbeda aturan.
      </p>
      <DocCode lang="typescript">
        {`isE164('+962 79 123 4567')        // true
toE164('0812 3456 7890')          // '+6281234567890'
waLink('+962791234567', 'Halo…')  // https://wa.me/962791234567?text=Halo…`}
      </DocCode>
      <h3 className="doc-h3">Registrasi push: kontraknya yang ditampilkan</h3>
      <p className="doc-p">
        Di Pengaturan Notifikasi ada kartu <strong>Notifikasi push</strong>. Tombolnya menyimpan
        subscription mock ke store — <code className="doc-inline">endpoint</code>,{' '}
        <code className="doc-inline">keys</code> (dipotong, karena bukan kunci nyata),{' '}
        <code className="doc-inline">platform</code>, dan <code className="doc-inline">expiresAt</code> —
        lalu menampilkannya kembali bersama ketentuan payload dari PRD: maks{' '}
        {4} KB, TTL wajib, dan <code className="doc-inline">userVisibleOnly</code>.
      </p>
      <p className="doc-p">
        Alasannya sederhana: menyembunyikan bahwa push belum berjalan akan membuat layar ini
        berbohong. Yang diuji di sini adalah bentuk data dan janji kontraknya, sedangkan
        pengirimannya menunggu backend.
      </p>
      <h3 className="doc-h3">Fallback WA saat lawan offline</h3>
      <p className="doc-p">
        Di chat pesanan, tombol <em>Chat WhatsApp</em> muncul hanya ketika lawannya offline —
        sekaligus balasan otomatisnya dimatikan, supaya aplikasi tidak berpura-pura kurirnya masih
        membaca pesan. Deep link-nya membawa nomor E.164 dan teks yang menyebut kode pesanan, jadi
        percakapan di WA tidak mulai dari nol. Di prototipe ini presence-nya diubah lewat tombol{' '}
        <em>Simulasi: kurir offline</em>, karena tidak ada soket presence sungguhan.
      </p>
      <p className="doc-p">
        Yang belum final: validasi push di perangkat nyata (butuh device + service worker) dan
        kebijakan retensi subscription — keduanya masih terbuka.
      </p>
    </DocSection>
  )
}
