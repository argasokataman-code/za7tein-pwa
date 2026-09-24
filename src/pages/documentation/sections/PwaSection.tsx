import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function PwaSection() {
  return (
    <DocSection id="pwa" num="08" title="PWA Setup">
      <p className="doc-p">
        Halaman promosi berada di <code>/</code>; tiap peran punya prefix URL sendiri:
        <code> /customer/*</code> (pelanggan), <code>/merchant/*</code> (merchant),
        <code> /courier/*</code> (kurir), dan <code>/admin/*</code> (panel admin, dikelola CS). Tiap prefix
        memuat manifest sendiri lewat script kecil di <code>index.html</code>, jadi
        tiap peran bisa diinstall sebagai aplikasi terpisah. Tautan lama seperti
        <code> /home</code>, <code>/app/home</code>, dan{' '}
        <code>/app/merchant/menu</code> dialihkan ke prefix peran yang benar agar
        tidak jatuh ke halaman promosi.
      </p>
      <p className="doc-p">
        Layar pembuka ringan di <code>index.html</code> muncul hanya untuk prefix peran
        sampai React siap, lalu dihapus oleh <code>App</code>. Ikon instalasi,
        favicon, dan layar pembuka memakai tanda Sa7tein yang sama dari
        <code> public/icons/sa7tein-mark.svg</code>. Jangan menambahkan jeda buatan
        atau spinner untuk navigasi antarhalaman yang langsung tersedia.
      </p>
      <p className="doc-p">
        Scroll vertikal dimiliki dokumen, memakai momentum dan perilaku tepi
        bawaan perangkat. Bottom navigation tetap berada dalam shell 430px;
        konten memiliki ruang di bawahnya. Uji scroll dengan gestur pada
        <code> /customer/home</code> dan <code>/merchant/menu</code>, bukan hanya
        melihat tinggi halaman.
      </p>
      <p className="doc-p">
        Tombol Pasang memakai prompt browser saat tersedia; bila browser tidak
        menyediakannya, pengguna mendapat petunjuk memasang dari menu Bagikan.
        Logikanya satu tempat (<code>useInstallPrompt</code>) dan kartunya satu
        komponen (<code>InstallAppCard</code>) yang dipasang di keempat peran:
        onboarding, Profil customer, Setelan merchant, Profil kurir, dan dasbor
        CS. Kartu menyembunyikan dirinya sendiri saat aplikasi sudah terpasang
        (<code>appinstalled</code>) atau dibuka sebagai aplikasi
        (<code>display-mode: standalone</code>). Uji instalasi dan offline pada
        hasil <code>npm run build</code> lalu <code>npm run preview</code>.
      </p>

      <h3 className="doc-h3">Service Worker</h3>
      <p className="doc-p">
        Service worker tidak ada di repositori. Plugin <code>vite-plugin-pwa</code>
        dengan strategi <code>generateSW</code> membuat <code>dist/sw.js</code> saat
        build. Tidak ada impor <code>virtual:pwa-register</code> atau komponen
        pendaftaran manual &mdash; <code>injectRegister: 'auto'</code> menyuntikkan
        kode registrasi secara otomatis. SW tidak aktif pada dev server
        (<code>devOptions.enabled: false</code>).
      </p>
      <DocCode lang="typescript">{`// vite.config.ts — ringkasan VitePWA
VitePWA({
  strategies: 'generateSW',
  registerType: 'autoUpdate',
  scope: '/',               // satu worker, semua prefix peran
  injectRegister: 'auto',
  manifest: false,          // pakai public/manifest*.json milik sendiri
  includeAssets: ['favicon.ico', 'icons/*.png', 'assets/**/*'],
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\\/api\\//, /^\\/$/, /^\\/documentation/],
    runtimeCaching: [
      { urlPattern: /^https:\\/\\/[abc]\\.tile\\.openstreetmap\\.org\\/.*/i,
        handler: 'CacheFirst' },   // OSM tiles, 7 hari
      { urlPattern: ({ request }) =>
          request.destination === 'image' || request.destination === 'font',
        handler: 'CacheFirst' },   // aset statis, 30 hari
    ],
  },
  devOptions: { enabled: false },
})`}</DocCode>

      <h3 className="doc-h3">Scope dan Registrasi</h3>
      <p className="doc-p">
        Satu worker memakai <code>scope: &apos;/&apos;</code> supaya mencakup keempat
        prefix peran. Halaman promosi di <code>/</code> dan{' '}
        <code>/documentation</code> dikecualikan dari <code>navigateFallback</code>.
        Registrasi bersifat <code>autoUpdate</code> &mdash; worker baru diaktifkan
        tanpa prompt pengguna saat file service worker berubah.
      </p>
      <p className="doc-p">
        Build lama pernah mendaftarkan worker berskala <code>/app/</code>. Di
        <code> src/main.tsx</code>, aplikasi melepaskan registrasi lama itu agar
        tidak ada dua worker yang saling menimpa:</p>
      <DocCode lang="typescript">{`// src/main.tsx — bersihkan worker /app/ lama
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const item of registrations) {
      if (item.scope === \`\${location.origin}/app/\`) void item.unregister()
    }
  })
}`}</DocCode>

      <h3 className="doc-h3">Manifest per Peran</h3>
      <p className="doc-p">
        Plugin diatur <code>manifest: false</code>. Manifest dikirim langsung dari
        <code> public/</code>, bukan dihasilkan plugin. Tiap peran punya file sendiri
        dengan <code>id</code>, <code>start_url</code>, dan <code>scope</code> berbeda,
        sehingga Chromium memperlakukannya sebagai aplikasi terpisah:
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Manifest</th>
              <th>start_url</th>
              <th>scope / id</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code className="doc-inline">/manifest.json</code></td>
              <td><code className="doc-inline">/</code> (landing)</td>
              <td><code className="doc-inline">/</code></td>
            </tr>
            <tr>
              <td><code className="doc-inline">/manifest-customer.json</code></td>
              <td><code className="doc-inline">/customer/home</code></td>
              <td><code className="doc-inline">/customer/</code></td>
            </tr>
            <tr>
              <td><code className="doc-inline">/manifest-merchant.json</code></td>
              <td><code className="doc-inline">/merchant</code></td>
              <td><code className="doc-inline">/merchant/</code></td>
            </tr>
            <tr>
              <td><code className="doc-inline">/manifest-courier.json</code></td>
              <td><code className="doc-inline">/courier</code></td>
              <td><code className="doc-inline">/courier/</code></td>
            </tr>
            <tr>
              <td><code className="doc-inline">/manifest-admin.json</code></td>
              <td><code className="doc-inline">/admin</code></td>
              <td><code className="doc-inline">/admin/</code></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        Pemilihan manifest dilakukan inline di <code>index.html</code> berdasarkan
        <code> location.pathname</code>:</p>
      <DocCode lang="html">{`<link rel="manifest" id="app-manifest" href="/manifest.json" />
<script>
  (function () {
    var roles = ['customer', 'merchant', 'courier', 'admin'];
    for (var i = 0; i < roles.length; i++) {
      var role = roles[i];
      if (location.pathname === '/' + role ||
          location.pathname.indexOf('/' + role + '/') === 0) {
        document.getElementById('app-manifest')
          .setAttribute('href', '/manifest-' + role + '.json');
        break;
      }
    }
  })();
</script>`}</DocCode>
      <p className="doc-p">
        Ikon tersedia di <code>public/icons/</code> (sa7tein-72 hingga sa7tein-512
        png, sa7tein-cloche.svg, sa7tein-mark.svg) dan dipakai ulang oleh semua
        manifest.
      </p>

      <h3 className="doc-h3">Cek Sebelum Kirim</h3>
      <p className="doc-p">
        Service worker hanya aktif pada hasil build, bukan <code>npm run dev</code>.
        Untuk menguji perilaku offline, jalankan <code>npm run build</code> lalu
        <code> npm run preview</code> dan verifikasi di DevTools &gt; Application
        &gt; Service Workers. Pastikan <code>scope</code> terdaftar di{' '}
        <code>/</code>, dan tiap prefix peran memuat manifest yang benar
        (DevTools &gt; Application &gt; Manifest).
      </p>
    </DocSection>
  )
}
