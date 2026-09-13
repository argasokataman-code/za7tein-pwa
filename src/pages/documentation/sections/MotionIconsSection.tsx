import {
  Bell,
  ChevronLeft,
  Clock,
  Heart,
  Home,
  MapPin,
  Search,
  ShoppingBag,
  Star,
  User,
} from 'lucide-react'

import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

const MOTION_TOKENS = [
  { token: '--motion-fast', value: '140ms', use: 'Hover, warna, opacity' },
  { token: '--motion-standard', value: '200ms', use: 'Perubahan state kecil' },
  { token: '--motion-emphasis', value: '380ms', use: 'Masuk/keluar elemen' },
  { token: '--motion-journey', value: '650ms', use: 'Journey line, progres' },
]

const EASINGS = [
  { token: '--ease-out', value: 'cubic-bezier(0, 0, 0.2, 1)' },
  { token: '--ease-in', value: 'cubic-bezier(0.4, 0, 1, 1)' },
  { token: '--ease-inout', value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
]

const KEYFRAMES = [
  { name: 'journey-fill', anim: 'scaleX(0 → 1) garis progres', use: 'journey-fill 620ms var(--ease-out) both' },
  { name: 'journey-pulse', anim: 'denyut box-shadow pada node aktif', use: 'journey-pulse 2s var(--ease-out) infinite' },
  { name: 'sa7tein-pin-pulse', anim: 'ripple hijau pada pin peta', use: 'sa7tein-pin-pulse 1.8s var(--ease-out) infinite' },
  { name: 'sa7tein-route-draw', anim: 'stroke-dashoffset pada path rute (SVG)', use: 'sa7tein-route-draw 1200ms var(--ease-out) forwards' },
  { name: 'chat-typing', anim: 'opacity + translateY titik mengetik', use: 'chat-typing 1.2s var(--ease-inout) infinite' },
  { name: 'sa-pin-rise', anim: 'translateY mengambang', use: 'sa-pin-rise 2.8s ease-in-out infinite' },
]

const ICONS = [
  { name: 'Home', Icon: Home },
  { name: 'Search', Icon: Search },
  { name: 'ShoppingBag', Icon: ShoppingBag },
  { name: 'Heart', Icon: Heart },
  { name: 'Star', Icon: Star },
  { name: 'MapPin', Icon: MapPin },
  { name: 'Bell', Icon: Bell },
  { name: 'Clock', Icon: Clock },
  { name: 'User', Icon: User },
  { name: 'ChevronLeft', Icon: ChevronLeft },
]

export function MotionIconsSection() {
  return (
    <DocSection id="motion-svg" num="19" title="Motion & Icons">
      <p className="doc-p">
        Gerak memakai durasi dan easing dari token, tidak pernah nilai bebas. Transisi standar
        tombol dan kontrol berasal dari <code className="doc-inline">s-btn-shape</code>:
        <code className="doc-inline"> background var(--motion-fast) var(--ease-out)</code>.
      </p>

      <h3 className="doc-h3">Token motion</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Nilai</th>
              <th>Dipakai untuk</th>
            </tr>
          </thead>
          <tbody>
            {MOTION_TOKENS.map((m) => (
              <tr key={m.token}>
                <td><code className="doc-inline">{m.token}</code></td>
                <td>{m.value}</td>
                <td>{m.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="doc-h3">Durasi & easing — hover kotak di bawah</h3>
      <div className="doc-preview doc-preview--grid">
        <div className="doc-duration doc-duration--fast">--motion-fast</div>
        <div className="doc-duration doc-duration--standard">--motion-standard</div>
        <div className="doc-duration doc-duration--emphasis">--motion-emphasis</div>
        <div className="doc-duration doc-duration--journey">--motion-journey</div>
        <div className="doc-duration doc-duration--ease-out">--ease-out</div>
        <div className="doc-duration doc-duration--ease-in">--ease-in</div>
        <div className="doc-duration doc-duration--ease-inout">--ease-inout</div>
      </div>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Easing</th>
              <th>Nilai</th>
            </tr>
          </thead>
          <tbody>
            {EASINGS.map((e) => (
              <tr key={e.token}>
                <td><code className="doc-inline">{e.token}</code></td>
                <td><code className="doc-inline">{e.value}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="doc-h3">Keyframes</h3>
      <div className="doc-motion-grid">
        <div className="doc-motion-cell">
          <code className="doc-motion-name">journey-fill</code>
          <div className="doc-motion-stage">
            <span className="doc-motion-chip doc-motion-chip--fill" />
          </div>
          <span className="doc-motion-caption">scaleX 0 → 1, garis progres</span>
        </div>
        <div className="doc-motion-cell">
          <code className="doc-motion-name">journey-pulse</code>
          <div className="doc-motion-stage">
            <span className="doc-motion-chip doc-motion-chip--pulse" />
          </div>
          <span className="doc-motion-caption">denyut box-shadow node aktif</span>
        </div>
        <div className="doc-motion-cell">
          <code className="doc-motion-name">sa7tein-pin-pulse</code>
          <div className="doc-motion-stage">
            <span className="doc-motion-chip doc-motion-chip--pin" />
          </div>
          <span className="doc-motion-caption">ripple pin peta</span>
        </div>
        <div className="doc-motion-cell">
          <code className="doc-motion-name">sa-pin-rise</code>
          <div className="doc-motion-stage">
            <span className="doc-motion-chip doc-motion-chip--float" />
          </div>
          <span className="doc-motion-caption">mengambang naik-turun</span>
        </div>
      </div>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Keyframes</th>
              <th>Menganimasikan</th>
              <th>Pemakaian</th>
            </tr>
          </thead>
          <tbody>
            {KEYFRAMES.map((k) => (
              <tr key={k.name}>
                <td><code className="doc-inline">{k.name}</code></td>
                <td>{k.anim}</td>
                <td><code className="doc-inline">{k.use}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        Keyframe milik app tinggal di partial domainnya (<code className="doc-inline">system/_tracking.scss</code>,
        <code className="doc-inline"> _map.scss</code>, <code className="doc-inline">_cart.scss</code>).
        Pakai ulang yang ada; jangan mendefinisikan keyframe baru untuk gerak yang sudah punya nama.
      </p>

      <h3 className="doc-h3">Reduced motion — wajib</h3>
      <p className="doc-p">
        Setiap animasi dimatikan saat pengguna meminta gerak minimal. Kill switch global ada di
        <code className="doc-inline"> system/_motion.scss</code>; spinner tetap berputar sebagai
        satu-satunya pengecualian.
      </p>
      <DocCode lang="scss">
        {`@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .spinner, .loader, [class*='spinner'] {
    animation-duration: 1.2s !important;
    animation-iteration-count: infinite !important;
  }
}`}
      </DocCode>

      <h3 className="doc-h3">Ikon — lucide-react saja</h3>
      <p className="doc-p">
        Satu bahasa ikon untuk seluruh aplikasi: <code className="doc-inline">lucide-react</code>,
        selalu <code className="doc-inline">strokeWidth={'{'}1.75{'}'}</code>. Tanpa emoji, tanpa
        paket ikon lain. Ikon fungsional tidak memakai SVG inline.
      </p>
      <div className="doc-icon-grid">
        {ICONS.map(({ name, Icon }) => (
          <div key={name} className="doc-icon-cell">
            <Icon size={22} strokeWidth={1.75} />
            <code className="doc-icon-name">{name}</code>
          </div>
        ))}
      </div>
      <DocCode lang="tsx">
        {`import { Heart, MapPin } from 'lucide-react'

<Heart size={20} strokeWidth={1.75} />
<MapPin size={18} strokeWidth={1.75} />`}
      </DocCode>

      <h3 className="doc-h3">SVG dekoratif — aturan ketat</h3>
      <ul className="doc-list">
        <li>SVG inline hanya untuk ornamen dan ilustrasi. Jumlahnya dibatasi dan dicatat di <code className="doc-inline">docs/design/legacy-debt.json</code>; hanya boleh berkurang. Menambah/mengubah butuh keputusan desain + update daftar.</li>
        <li>Selalu <code className="doc-inline">preserveAspectRatio="xMidYMid slice"</code>. <code className="doc-inline">none</code> dilarang — meregang tidak seragam, lingkaran jadi lonjong.</li>
        <li>Opasitas dekorasi di atas latar oranye: 4–14%. Di atasnya oranye merek bergeser ke pink/salmon.</li>
        <li>Tanpa ilustrasi stok, tanpa URL gambar eksternal. Aset dari <code className="doc-inline">public/assets/</code>.</li>
      </ul>
      <DocCode lang="tsx">
        {`\u003csvg
  viewBox="0 0 200 120"
  preserveAspectRatio="xMidYMid slice"
  aria-hidden="true"
  style={{ opacity: 0.1 }}   // 4-14% di atas oranye
>
  {/* ornamen saja, bukan ikon fungsional */}
\u003c/svg>`}
      </DocCode>
    </DocSection>
  )
}
