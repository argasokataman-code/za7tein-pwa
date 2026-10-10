import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function PushSection() {
  return (
    <DocSection id="push" num="29" title="Nomor WA & Push (VAPID)">
      <p className="doc-p">
        R-PUSH-01 (milestone M8) menetapkan dua hal: identitas nomor WA yang tervalidasi, dan
        notifikasi push dengan fallback WhatsApp. Repo ini kini mengerjakan keduanya — nomor WA
        tervalidasi dan <strong>Web Push VAPID yang benar-benar berlangganan & diantar</strong>,
        dengan pengirim demo di sisi server (aplikasi ini tetap front-end; pengirimannya lewat
        skrip dev, bukan backend produksi).
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
      <h3 className="doc-h3">Push VAPID: berlangganan sungguhan, diantar service worker</h3>
      <p className="doc-p">
        Di Pengaturan Notifikasi ada baris <strong>Notifikasi push</strong> dengan sakelar. Saat
        dinyalakan, aplikasi meminta izin lalu memanggil{' '}
        <code className="doc-inline">PushManager.subscribe</code> dengan kunci publik VAPID
        (<code className="doc-inline">applicationServerKey</code>, default di{' '}
        <code className="doc-inline">src/api/push.ts</code>, ditimpa{' '}
        <code className="doc-inline">VITE_VAPID_PUBLIC_KEY</code>). Endpoint yang keluar datang
        dari push service peramban, dan kuncinya (<code className="doc-inline">p256dh</code>,{' '}
        <code className="doc-inline">auth</code>) disimpan sebagai baris tabel{' '}
        <code className="doc-inline">push_subscriptions</code>, lalu dibaca kembali saat halaman
        dimuat, jadi status aktif bertahan lintas refresh.
      </p>
      <p className="doc-p">
        Penerimaan ditangani service worker. <code className="doc-inline">vite.config.ts</code>{' '}
        memakai strategi <code className="doc-inline">generateSW</code> (workbox) yang tak bisa
        menambah listener sendiri, jadi berkas <code className="doc-inline">public/push-sw.js</code>{' '}
        diimpor lewat <code className="doc-inline">workbox.importScripts</code> dan menangani dua
        event: <code className="doc-inline">push</code> (memunculkan notifikasi dari payload JSON{' '}
        <code className="doc-inline">{'{title, body, url}'}</code>) dan{' '}
        <code className="doc-inline">notificationclick</code> (memfokuskan jendela app atau membuka
        tautan). Berkas itu di-<code className="doc-inline">globIgnores</code> supaya tidak
        ter-precache ganda.
      </p>
      <p className="doc-p">
        Pengiriman ada di <code className="doc-inline">scripts/send-push.mjs</code> (dev tool,
        dependency <code className="doc-inline">web-push</code>): membaca{' '}
        <code className="doc-inline">push_subscriptions</code> dengan sesi demo, menandatangani
        payload dengan kunci privat VAPID, lalu mengantarnya. Kunci privat{' '}
        <strong>tidak ada di bundle</strong> — hanya di <code className="doc-inline">.env.local</code>{' '}
        (di-gitignore) yang dibaca skrip. Berlangganan butuh service worker aktif, jadi baru jalan
        pada build/preview, bukan <code className="doc-inline">npm run dev</code>.
      </p>
      <DocCode lang="bash">
        {`# kunci di .env.local: VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
npm run build && npm run preview
npm run push:send -- --title "Pesanan siap" --body "Sate Ayam sedang dimasak" --url /customer/orders`}
      </DocCode>
      <h3 className="doc-h3">Fallback WA saat lawan offline</h3>
      <p className="doc-p">
        Di chat pesanan, tombol <em>Chat WhatsApp</em> muncul hanya ketika lawannya offline —
        sekaligus balasan otomatisnya dimatikan, supaya aplikasi tidak berpura-pura kurirnya masih
        membaca pesan. Deep link-nya membawa nomor E.164 dan teks yang menyebut kode pesanan, jadi
        percakapan di WA tidak mulai dari nol. Di prototipe ini presence-nya diubah lewat tombol{' '}
        <em>Simulasi: kurir offline</em>, karena tidak ada soket presence sungguhan.
      </p>
      <p className="doc-p">
        Yang belum final: pengiriman dari backend produksi (bukan skrip dev), kebijakan retensi
        subscription, dan validasi di perangkat fisik. Semuanya masih terbuka.
      </p>
    </DocSection>
  )
}
