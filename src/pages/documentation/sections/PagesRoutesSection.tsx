import { DocSection } from '../DocSection'
import {
  ADMIN_GROUP,
  COURIER_GROUP,
  CUSTOMER_GROUPS,
  DOC_SHELLS,
  MERCHANT_GROUP,
  SUPERADMIN_GROUP,
  WEB_ROUTES,
  type DocRoute,
  type DocRouteGroup,
} from '../routes'

function routeHref(base: string, row: DocRoute) {
  return `${base}${row.sample ?? row.path}`
}

function RouteLink({ base, row }: { base: string; row: DocRoute }) {
  return (
    <a
      className="doc-inline doc-link"
      href={routeHref(base, row)}
      target="_blank"
      rel="noreferrer"
    >
      {base}
      {row.path}
    </a>
  )
}

function RouteTable({ group }: { group: DocRouteGroup }) {
  return (
    <>
      <h3 className="doc-h3">{group.title}</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>URL (klik untuk buka)</th>
              <th>Component</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map((r) => (
              <tr key={r.path}>
                <td><RouteLink base={group.base} row={r} /></td>
                <td><code className="doc-inline">{r.component}</code></td>
                <td>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function PagesRoutesSection() {
  return (
    <DocSection id="pages" num="03" title="Pages, Routes & Live Links">
      <div className="doc-info">
        Tiap URL di bawah bisa diklik dan langsung membuka layarnya di tab baru —
        dipakai untuk <strong>uji UX</strong> tanpa menavigasi manual, sekaligus jadi
        <strong> peta rute</strong> untuk tim BE saat menyambungkan endpoint. Halaman ini
        tidak memverifikasi login: semua data mock, jadi rute bisa dibuka langsung.
      </div>
      <h3 className="doc-h3">Akses cepat per role</h3>
      <div className="doc-cta-grid">
        {DOC_SHELLS.map((s) => (
          <a key={s.role} className="doc-cta" href={s.url} target="_blank" rel="noreferrer">
            <span className="doc-cta-role">{s.role}</span>
            <span className="doc-cta-url">{s.url}</span>
            <span className="doc-card-sub">{s.desc}</span>
          </a>
        ))}
      </div>
      <p className="doc-p">
        Routes live in <code className="doc-inline">src/App.tsx</code> as flat{' '}
        <code className="doc-inline">[path, Component]</code> tuples. No route
        groups, no layout wrappers, no <code className="doc-inline">&lt;Outlet&gt;</code>.
        Daftar di halaman ini mengikuti tabel rute di file itu — perbarui keduanya bersamaan.
      </p>
      <p className="doc-p">
        Empat router berbagi file ini. Mount-time, <code className="doc-inline">App</code>
        {' '}membaca pathname dan memilih router: <code className="doc-inline">/customer</code>
        {' '}(<code className="doc-inline">RoleRouter</code>, home <code className="doc-inline">/home</code>),
        {' '}<code className="doc-inline">/merchant</code> (<code className="doc-inline">RoleRouter</code>,
        home <code className="doc-inline">/</code>), <code className="doc-inline">/courier</code>
        {' '}dan <code className="doc-inline">/admin</code>{' '}
        (<code className="doc-inline">RoleRouter</code>, home <code className="doc-inline">/</code>),
        {' '}plus <code className="doc-inline">/superadmin</code>{' '}
        (<code className="doc-inline">SuperAdminRouter</code>, website penuh non-PWA). Selain itu,
        {' '}<code className="doc-inline">WebsiteRouter</code> melayani web routes dan
        mengalihkan jalur lama lewat <code className="doc-inline">LegacyAppRedirect</code>.
      </p>

      <h3 className="doc-h3">Website Routes</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>URL (klik untuk buka)</th>
              <th>Component</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {WEB_ROUTES.map((r) => (
              <tr key={r.path}>
                <td><RouteLink base="" row={r} /></td>
                <td><code className="doc-inline">{r.component}</code></td>
                <td>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {CUSTOMER_GROUPS.map((group) => (
        <RouteTable key={group.id} group={group} />
      ))}

      <RouteTable group={MERCHANT_GROUP} />
      <p className="doc-p">
        Merchant auth (<code className="doc-inline">/merchant/signin</code> dan{' '}
        <code className="doc-inline">/merchant/signup</code>) terpisah dari auth customer.
        Memakai <code className="doc-inline">MerchantBottomNav</code> dan sepenuhnya mock.
        Menu &amp; Stock mengelola slice Redux bersama{' '}
        <code className="doc-inline">catalog</code> (juga tampil ke customer). Data seed:{' '}
        <code className="doc-inline">src/data/catalog.ts</code>,{' '}
        <code className="doc-inline">src/data/merchant.ts</code>,{' '}
        <code className="doc-inline">src/data/merchantOrders.ts</code>.
      </p>

      <RouteTable group={COURIER_GROUP} />
      <p className="doc-p">
        Tanpa layar login: PRD aktif tidak punya requirement auth kurir — kurir adalah
        karyawan merchant (C-06), dikelola merchant. Memakai{' '}
        <code className="doc-inline">CourierBottomNav</code> (tiga tab). Checkpoint mengikuti
        urutan <code className="doc-inline">masuk → ambil → berangkat → tiba → (OTP) → selesai</code>,
        dengan <code className="doc-inline">batal</code> sebagai cabang kesalahan customer.
        Data seed: <code className="doc-inline">src/data/courier.ts</code>; state:{' '}
        <code className="doc-inline">src/store/slices/courierSlice.ts</code>. SLA 15/30/10 menit
        masih sementara (PO 2026-09-22, OQ-13); penalti kesalahan customer{' '}
        <code className="doc-inline">UNRESOLVED</code> (OQ-14) dan ditampilkan sebagai state, bukan tebakan.
      </p>

      <RouteTable group={ADMIN_GROUP} />
      <p className="doc-p">
        Shell keempat (<code className="doc-inline">/admin</code>), dijalankan <strong>CS</strong> —
        bukan Super Admin. Dibangun dari flow <code className="doc-inline">F15</code> +{' '}
        <code className="doc-inline">F8</code> dan milestone M6/M9. Form sengketa adalah satu
        halaman bersama yang dipasang di <code className="doc-inline">/customer/dispute</code> dan{' '}
        <code className="doc-inline">/merchant/dispute</code>, sehingga customer dan merchant
        bermuara ke queue yang sama. Data seed:{' '}
        <code className="doc-inline">src/data/admin.ts</code>; state:{' '}
        <code className="doc-inline">src/store/slices/adminSlice.ts</code> (tidak dipersist).
      </p>

      <RouteTable group={SUPERADMIN_GROUP} />
      <p className="doc-p">
        Role terpisah sejak keputusan PO 2026-09-23 — website penuh non-PWA, bukan bagian dari
        empat shell 430px. Konsol CS tetap menjalankan approval tenant, putusan sengketa level-1,
        dan blacklist COD; SA mengaudit + menangani banding. Kontrak BE per milestone
        dikonsolidasikan di bagian <strong>Konsistensi Lintas Role &amp; Kontrak BE</strong>.
      </p>
    </DocSection>
  )
}
