import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

interface Badge {
  label: string
  bg: string
  fg: string
}

const BADGES: Badge[] = [
  { label: 'Aktif', bg: '--green-soft', fg: '--success-ink' },
  { label: 'Menunggu', bg: '--warning-soft', fg: '--warning-ink' },
  { label: 'Dibatalkan', bg: '--red-soft', fg: '--danger-ink' },
  { label: 'Promo', bg: '--orange-soft', fg: '--orange-ink' },
  { label: 'Draft', bg: '--bg-warm', fg: '--text-secondary' },
]

export function ElementsSection() {
  return (
    <DocSection id="elements" num="18" title="UI Elements">
      <p className="doc-p">
        Elemen dasar yang dipakai berulang. Aturannya sama seperti token: permukaan memakai
        <code className="doc-inline"> --surface</code>, tepi dan garis dari
        <code className="doc-inline"> --border</code> / <code className="doc-inline">--border-strong</code>,
        dan latar baru tidak dibuat kalau tokennya sudah ada.
      </p>

      <h3 className="doc-h3">Badge & status</h3>
      <p className="doc-p">
        Semua badge berbagi satu bentuk pill (radius <code className="doc-inline">--radius-pill</code>,
        font <code className="doc-inline">--text-xs</code>, padding 4px 12px). Kelas seperti
        <code className="doc-inline"> .status-badge</code> <strong>hanya mendefinisikan bentuk</strong> —
        tidak ada preset warna. Layar memilih token per peran; contoh di bawah memakai kombinasi
        latar <code className="doc-inline">-soft</code> + teks <code className="doc-inline">-ink</code>.
      </p>
      <div className="doc-preview">
        <span className="doc-preview-caption">Live — bentuk pill, warna per peran</span>
        {BADGES.map((b) => (
          <span
            key={b.label}
            className="status-badge"
            style={{ background: `var(${b.bg})`, color: `var(${b.fg})` }}
          >
            {b.label}
          </span>
        ))}
      </div>
      <DocCode lang="tsx">
        {`<span
  className="status-badge"
  style={{ background: 'var(--green-soft)', color: 'var(--success-ink)' }}
>
  Aktif
</span>`}
      </DocCode>

      <h3 className="doc-h3">Kartu & permukaan</h3>
      <p className="doc-p">
        Permukaan kartu memakai mixin <code className="doc-inline">card-surface</code>:
        <code className="doc-inline"> --surface</code>, tepi <code className="doc-inline">--border</code>,
        radius <code className="doc-inline">--radius-lg</code>, dan bayangan
        <code className="doc-inline"> --shadow-sm</code>.
      </p>
      <div className="doc-preview doc-preview--grid">
        <div className="doc-card">
          <div className="doc-card-title">Warung Bu Tini</div>
          <div className="doc-card-sub">1,2 km · 15-20 menit · Buka</div>
        </div>
        <div className="doc-card">
          <div className="doc-card-title">Ayam Geprek Mas Bud</div>
          <div className="doc-card-sub">800 m · 10-15 menit · Tutup</div>
        </div>
      </div>
      <DocCode lang="scss">
        {`.my-card {
  @include card-surface;
  padding: var(--space-5);
}`}
      </DocCode>

      <h3 className="doc-h3">List</h3>
      <ul className="doc-list">
        <li>Target sentuh setiap baris minimal <code className="doc-inline">--touch-min</code> (44px).</li>
        <li>Satu aksi utama per layar; aksi sekunder jadi teks, bukan tombol penuh.</li>
        <li>Gunakan komponen bersama sebelum menggambar ulang elemen yang sama.</li>
      </ul>

      <h3 className="doc-h3">Callout & tag</h3>
      <div className="doc-info">
        <strong>Info:</strong> callout memakai latar <code>--orange-soft</code> dengan tepi kiri
        oranye. Dipakai untuk peringatan singkat, bukan untuk paragraf panjang.
      </div>
      <div className="doc-preview">
        <span className="doc-preview-caption">Tag</span>
        <span className="doc-hero-tag">React 19</span>
        <span className="doc-hero-tag">SCSS</span>
        <span className="doc-hero-tag">PWA</span>
      </div>
      <p className="doc-p">
        Kode inline memakai <code className="doc-inline">.doc-inline</code>, versi monospace dengan
        latar <code className="doc-inline">--surface2</code>.
      </p>

      <h3 className="doc-h3">Referensi kelas elemen</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Elemen</th>
              <th>Kelas</th>
              <th>Kebutuhan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badge pill</td>
              <td><code className="doc-inline">.status-badge</code></td>
              <td>Bentuk pill; warna diisi per peran token</td>
            </tr>
            <tr>
              <td>Kartu</td>
              <td><code className="doc-inline">@include card-surface</code></td>
              <td>Permukaan + tepi + bayangan, bukan kelas jadi</td>
            </tr>
            <tr>
              <td>Input</td>
              <td><code className="doc-inline">.form-control</code></td>
              <td>Geometri dari <code className="doc-inline">field-shape</code></td>
            </tr>
            <tr>
              <td>Info box</td>
              <td><code className="doc-inline">.doc-info</code></td>
              <td>Hanya untuk halaman dokumentasi</td>
            </tr>
            <tr>
              <td>Tag</td>
              <td><code className="doc-inline">.doc-hero-tag</code></td>
              <td>Label ringkas, bukan tombol</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>
  )
}
