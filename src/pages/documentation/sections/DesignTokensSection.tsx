import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

interface Swatch {
  token: string
  role: string
}

const COLOR_GROUPS: { label: string; swatches: Swatch[] }[] = [
  {
    label: 'Brand & action',
    swatches: [
      { token: '--sa7tein-orange', role: 'Aksi merek: tombol utama, aksen, ikon aktif' },
      { token: '--orange-deep', role: 'Oranye saat hover / pressed' },
      { token: '--on-brand', role: 'Teks & ikon di atas oranye' },
      { token: '--orange-soft', role: 'Latar oranye tipis: badge, callout' },
      { token: '--orange-ink', role: 'Teks oranye di latar terang (kontras AA)' },
      { token: '--orange-soft-ink', role: 'Teks oranye sekunder' },
      { token: '--navy', role: 'Latar gelap navy (panel/hero)' },
      { token: '--on-navy', role: 'Teks & ikon di atas navy' },
    ],
  },
  {
    label: 'Surface & text',
    swatches: [
      { token: '--bg-warm', role: 'Latar halaman' },
      { token: '--surface', role: 'Permukaan kartu & panel' },
      { token: '--text-primary', role: 'Teks utama (navy/700)' },
      { token: '--text-secondary', role: 'Teks sekunder / muted' },
      { token: '--text-disabled', role: 'Teks kontrol nonaktif' },
      { token: '--icon-decor', role: 'Ikon dekoratif (bukan teks penting)' },
      { token: '--border', role: 'Garis di dalam kartu' },
      { token: '--border-strong', role: 'Tepi kartu & input' },
    ],
  },
  {
    label: 'Status',
    swatches: [
      { token: '--success', role: 'Status sukses' },
      { token: '--success-ink', role: 'Teks sukses di latar terang' },
      { token: '--green-soft', role: 'Latar sukses tipis' },
      { token: '--warning', role: 'Status peringatan' },
      { token: '--warning-ink', role: 'Teks peringatan' },
      { token: '--warning-soft', role: 'Latar peringatan tipis' },
      { token: '--danger', role: 'Status bahaya / error' },
      { token: '--danger-ink', role: 'Teks bahaya' },
      { token: '--red-soft', role: 'Latar bahaya tipis' },
      { token: '--info', role: 'Status informasi' },
      { token: '--info-ink', role: 'Teks informasi di latar terang' },
      { token: '--info-soft', role: 'Latar informasi tipis' },
      { token: '--star', role: 'Bintang rating' },
      { token: '--overlay', role: 'Latar gelap di belakang sheet & modal' },
      { token: '--overlay-strong', role: 'Overlay pekat elemen kecil di atas foto' },
    ],
  },
]

const SPACING = [
  { token: '--space-1', px: '4px' },
  { token: '--space-2', px: '8px' },
  { token: '--space-3', px: '12px' },
  { token: '--space-4', px: '16px' },
  { token: '--space-5', px: '20px' },
  { token: '--space-6', px: '24px' },
  { token: '--space-7', px: '28px' },
  { token: '--space-8', px: '32px' },
  { token: '--space-9', px: '48px' },
  { token: '--space-10', px: '64px' },
]

const RADIUS = [
  { token: '--radius-xs', px: '6px', use: 'Badge, kontrol rapat' },
  { token: '--radius-sm', px: '8px', use: 'Input, kontrol kecil' },
  { token: '--radius-md', px: '10px', use: 'Tombol' },
  { token: '--radius-lg', px: '12px', use: 'Kartu, list item' },
  { token: '--radius-xl', px: '12px', use: 'Sheet, modal (langit-langit 12px)' },
  { token: '--radius-pill', px: '9999px', use: 'Kontrol pill' },
]

const TYPE = [
  { token: '--text-xs', value: '12px' },
  { token: '--text-sm', value: '13px' },
  { token: '--text-base', value: '16px' },
  { token: '--text-lg', value: '17px' },
  { token: '--text-xl', value: '21px' },
  { token: '--text-2xl', value: '28px' },
]

const SHADOWS = [
  { token: '--shadow-subtle', use: 'Kontrol aktif (bukan kartu)' },
  { token: '--shadow-sm', use: 'Elemen terangkat: pin peta, pil onboarding' },
  { token: '--shadow-md', use: 'Elemen mengambang, sheet' },
  { token: '--shadow-brand', use: 'Aksen oranye mengangkat' },
]

export function DesignTokensSection() {
  return (
    <DocSection id="design-tokens" num="16" title="Design Tokens">
      <p className="doc-p">
        Semua nilai desain tinggal di <code className="doc-inline">src/styles/_tokens.scss</code>.
        Jangan pernah menulis nilai mentah saat tokennya ada: <code className="doc-inline">color: #RRGGBB</code>
        salah, <code className="doc-inline">color: var(--sa7tein-orange)</code> benar. Satu warna
        satu peran — jangan menambah warna kelima ke palet yang sedang dirapikan.
        Palet, tipografi, dan elevasi mengikuti <strong>EDISI 01</strong> (Figma
        <code className="doc-inline">sa7tein / Foundations</code>); tipografi memakai Inter.
      </p>

      {COLOR_GROUPS.map((group) => (
        <div key={group.label}>
          <h3 className="doc-h3">{group.label}</h3>
          <div className="doc-swatches">
            {group.swatches.map((s) => (
              <div key={s.token} className="doc-swatch">
                <div className="doc-swatch-chip" style={{ background: `var(${s.token})` }} />
                <div className="doc-swatch-body">
                  <code className="doc-swatch-name">{s.token}</code>
                  <span className="doc-swatch-role">{s.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h3 className="doc-h3">Spacing — --space-1..10</h3>
      <div className="doc-scale">
        {SPACING.map((s) => (
          <div key={s.token} className="doc-scale-row">
            <code className="doc-scale-label">{s.token}</code>
            <div className="doc-scale-bar" style={{ width: `var(${s.token})` }} />
            <span className="doc-scale-note">{s.px}</span>
          </div>
        ))}
      </div>

      <h3 className="doc-h3">Radius — berhenti di 12px</h3>
      <div className="doc-scale">
        {RADIUS.map((r) => (
          <div key={r.token} className="doc-scale-row">
            <code className="doc-scale-label">{r.token}</code>
            <div
              className="doc-scale-bar"
              style={{ width: 'var(--touch-min)', height: 'var(--touch-min)', borderRadius: `var(${r.token})` }}
            />
            <span className="doc-scale-note">{r.px} — {r.use}</span>
          </div>
        ))}
      </div>
      <div className="doc-info">
        <strong>Catatan:</strong> butuh lebih bulat dari 12px untuk sebuah kontainer berarti
        desainnya salah, bukan tokennya kurang. <code>--radius-xl</code> sengaja ditahan di 12px.
      </div>

      <h3 className="doc-h3">Typography — --text-xs..2xl</h3>
      <div>
        {TYPE.map((t) => (
          <div key={t.token} className="doc-specimen-row">
            <code className="doc-specimen-label">{t.token}</code>
            <span style={{ fontSize: `var(${t.token})`, color: 'var(--text)' }}>
              Sa7tein nasi box
            </span>
            <span className="doc-scale-note">{t.value}</span>
          </div>
        ))}
        <div className="doc-specimen-row">
          <code className="doc-specimen-label">--font-sans</code>
          <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>
            Inter, Manrope, system-ui
          </span>
        </div>
      </div>

      <h3 className="doc-h3">Shadow</h3>
      <div className="doc-shadow-grid">
        {SHADOWS.map((s) => (
          <div key={s.token} className="doc-shadow-box" style={{ boxShadow: `var(${s.token})` }}>
            {s.use}
          </div>
        ))}
      </div>

      <h3 className="doc-h3">Cara pakai</h3>
      <DocCode lang="scss">
        {`background: var(--surface);
border: 1px solid var(--border-strong);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-sm);
padding: var(--space-5);
color: var(--text-primary);
font-size: var(--text-sm);`}
      </DocCode>
      <div className="doc-info">
        <strong>Periksa dulu:</strong> <code>var(--…)</code> yang belum terdefinisi membatalkan
        <em> seluruh</em> deklarasi shorthand. Satu token hilang bisa menghapus padding kiri-kanan
        sekaligus. Cek di <code>_tokens.scss</code> sebelum memakai.
      </div>
    </DocSection>
  )
}
