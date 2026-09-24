import { Heart } from 'lucide-react'

import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

interface ButtonRow {
  role: string
  sample: string
  aliases: string
}

const BUTTON_ROWS: ButtonRow[] = [
  {
    role: 'Primary (merek)',
    sample: '.btn-primary',
    aliases: '.proceed-btn, .pay-btn, .apply-btn, .buy-now-btn, .add-to-cart-btn, .continue-btn, .add-form-save-btn, .rating-submit-btn, .delivered-home-btn, .voucher-apply-btn, .btn-profile-primary, .btn-verify, .btn-auth, .wallet-footer-btn, .order-arrived-rate-btn',
  },
  {
    role: 'Secondary (outline)',
    sample: '.btn-social',
    aliases: '.category-btn, .add-address-btn, .add-payment-btn, .btn-profile-outline, .btn-upload-photo, .btn-logout, .numpad-btn',
  },
  {
    role: 'Link / ghost',
    sample: '.link-btn',
    aliases: '.read-more-btn, .clear-btn, .select-all-btn, .payment-change-btn',
  },
  {
    role: 'Danger',
    sample: '.address-delete-btn',
    aliases: '.remove-item-btn',
  },
  {
    role: 'Ikon bulat',
    sample: '.qty-btn',
    aliases: '.camera-icon-btn, .profile-edit-btn, .avatar-edit-btn, .recenter-btn, .driver-action-btn, .btn-current-location-map, .location-picker-gps-icon, .quantity-btn',
  },
  {
    role: 'Tombol kembali',
    sample: '.btn-back',
    aliases: '.back-btn, .back-btn-profile, .back-button, .track-back, .courier-back, .admin-back',
  },
  {
    role: 'Overlay peta',
    sample: '.favorite-btn',
    aliases: '.btn-back-map, .back-btn-map, .btn-more, .btn-options-map, .btn-location-map, .map-header .btn-back, .add-form-cancel-btn',
  },
]

export function ButtonsSection() {
  return (
    <DocSection id="buttons" num="17" title="Buttons & Controls">
      <p className="doc-p">
        Tidak ada komponen <code className="doc-inline">&lt;Button&gt;</code>. Semua tombol adalah
        elemen dengan kelas CSS yang memakai satu mixin geometri,
        <code className="doc-inline"> @include s-btn-shape</code> di
        <code className="doc-inline"> src/styles/system/_mixins.scss</code>. Geometrinya seragam:
        min-height 44px (<code className="doc-inline">--touch-min</code>), radius 10px
        (<code className="doc-inline">--radius-md</code>), gap 8px, transisi dari token motion.
        <strong> Tidak ada varian ukuran</strong> — jangan bikin <code className="doc-inline">.btn-sm</code>.
      </p>
      <p className="doc-p">
        Tombol kembali berdiri sebagai perannya sendiri (baris terakhir tabel di bawah): 44px,{' '}
        <code className="doc-inline">--radius-md</code>, permukaan <code className="doc-inline">--surface</code>{' '}
        + tepi <code className="doc-inline">--border-strong</code>, ikon 24px/{' '}
        <code className="doc-inline">stroke-width</code> 1.75. Kontraknya ditulis sekali di{' '}
        <code className="doc-inline">system/_topbar.scss</code> untuk tujuh kelas aliasnya — sebelum
        itu terukur 36/40/44/48px dengan empat bentuk berbeda, dan{' '}
        <code className="doc-inline">.back-btn-profile</code> bahkan 24&times;24 (hanya sebesar
        ikonnya). Pengecualiannya sadar dan tetap dikunci ukurannya:{' '}
        <code className="doc-inline">.auth-back</code> (hantu tanpa permukaan) serta varian di atas
        peta/foto (<code className="doc-inline">.back-btn-map</code>,{' '}
        <code className="doc-inline">.btn-back-map</code>,{' '}
        <code className="doc-inline">.map-header .btn-back</code>) yang transparannya punya alasan
        kontras.
      </p>

      <div className="doc-preview">
        <span className="doc-preview-caption">Live — primary / secondary / link / danger</span>
        <button className="btn-primary">Tambah ke keranjang</button>
        <button className="btn-social">Lanjut dengan Google</button>
        <button className="link-btn">Baca selengkapnya</button>
        <button className="address-delete-btn">Hapus</button>
      </div>

      <div className="doc-preview">
        <span className="doc-preview-caption">State — disabled + ikon overlay peta</span>
        <button className="btn-primary" disabled>Nonaktif</button>
        <button className="favorite-btn" aria-label="Simpan">
          <Heart size={18} strokeWidth={1.75} />
        </button>
      </div>

      <h3 className="doc-h3">Peta kelas per peran</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Peran</th>
              <th>Kelas contoh</th>
              <th>Alias</th>
            </tr>
          </thead>
          <tbody>
            {BUTTON_ROWS.map((row) => (
              <tr key={row.sample}>
                <td>{row.role}</td>
                <td><code className="doc-inline">{row.sample}</code></td>
                <td>{row.aliases}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        Alias adalah nama kelas lama per layar yang berbagi aturan yang sama; daftar ini disalin
        langsung dari <code className="doc-inline">system/_buttons.scss</code>. Satu entri,
        <code className="doc-inline"> .map-header .btn-back</code>, butuh ancestor
        <code className="doc-inline"> .map-header</code>. Untuk peran baru, tambahkan selector ke
        blok yang sesuai — jangan menyalin geometri, dan jangan menyentuh
        <code className="doc-inline"> app/</code>.
      </p>

      <h3 className="doc-h3">Tombol — markup & mixin</h3>
      <DocCode lang="tsx">
        {`<button className="btn-primary">Tambah ke keranjang</button>
<button className="btn-social">Lanjut dengan Google</button>
<button className="link-btn">Baca selengkapnya</button>
<button className="address-delete-btn">Hapus</button>
<button className="btn-primary" disabled>Nonaktif</button>`}
      </DocCode>
      <DocCode lang="scss">
        {`.btn-primary {
  @include s-btn-shape;              // 44px, radius-md, gap-2, focus ring
  background: var(--sa7tein-orange);
  color: var(--on-brand);
}
.btn-primary:hover { background: var(--orange-deep); }`}
      </DocCode>

      <h3 className="doc-h3">Kontrol form</h3>
      <p className="doc-p">
        Input, textarea, dan select memakai <code className="doc-inline">@include field-shape</code>:
        min-height 44px, radius 8px, dan focus ring oranye. Pakai kelas
        <code className="doc-inline"> .form-control</code>; tambahkan
        <code className="doc-inline"> .error</code> atau <code className="doc-inline">aria-invalid</code>
        untuk state error.
      </p>
      <div className="doc-preview doc-preview--stack">
        <span className="doc-preview-caption">Live — default / error / textarea</span>
        <input className="form-control" type="text" placeholder="Nama lengkap" />
        <input className="form-control error" type="email" placeholder="Email tidak valid" />
        <textarea className="form-control" rows={3} placeholder="Catatan untuk kurir" />
      </div>
      <DocCode lang="tsx">
        {`<input className="form-control" type="text" placeholder="Nama lengkap" />
<input className="form-control error" type="email" placeholder="Email tidak valid" />
<textarea className="form-control" rows={3} placeholder="Catatan" />`}
      </DocCode>
      <div className="doc-info">
        <strong>Aturan kontrol:</strong> target sentuh minimal <code>--touch-min</code> (44px),
        setiap input punya label, dan error ditampilkan sebagai teks — bukan hanya warna tepi.
      </div>
    </DocSection>
  )
}
